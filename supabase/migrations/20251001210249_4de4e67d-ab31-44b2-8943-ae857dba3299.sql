-- ============================================================================
-- PHASE 3: AUTO-SYNC & CHANGE DETECTION SYSTEM
-- ============================================================================

-- Enable necessary extensions for background jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================================================
-- 1. CHANGE DETECTION TRIGGER FUNCTION
-- ============================================================================

-- Function to notify when employes_raw_data changes
CREATE OR REPLACE FUNCTION notify_employes_data_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log that new data was detected
  INSERT INTO employes_sync_logs (
    action,
    status,
    message,
    employes_employee_id
  ) VALUES (
    'data_change_detected',
    'info',
    'New data detected in ' || NEW.endpoint || ' for employee ' || NEW.employee_id,
    NEW.employee_id
  );
  
  -- Schedule a background job to process the change
  INSERT INTO employes_background_jobs (
    job_type,
    config,
    priority
  ) VALUES (
    'process_data_change',
    jsonb_build_object(
      'employee_id', NEW.employee_id,
      'endpoint', NEW.endpoint,
      'data_id', NEW.id
    ),
    3
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger on employes_raw_data
DROP TRIGGER IF EXISTS employes_data_change_trigger ON employes_raw_data;
CREATE TRIGGER employes_data_change_trigger
  AFTER INSERT ON employes_raw_data
  FOR EACH ROW
  WHEN (NEW.is_latest = true)
  EXECUTE FUNCTION notify_employes_data_change();

-- ============================================================================
-- 2. AUTO-SYNC SCHEDULER FUNCTION
-- ============================================================================

-- Function to trigger auto-sync via edge function
CREATE OR REPLACE FUNCTION schedule_auto_sync()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  supabase_url text;
  supabase_key text;
BEGIN
  -- Get Supabase credentials from secrets
  supabase_url := current_setting('app.settings.supabase_url', true);
  supabase_key := current_setting('app.settings.supabase_service_role_key', true);
  
  -- Call the edge function via pg_net
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/employes-integration',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || supabase_key
    ),
    body := jsonb_build_object(
      'action', 'auto_sync_all'
    )
  );
  
  -- Log the scheduled sync
  INSERT INTO employes_sync_logs (
    action,
    status,
    message
  ) VALUES (
    'scheduled_auto_sync',
    'info',
    'Triggered daily auto-sync at ' || now()
  );
END;
$$;

-- Schedule auto-sync to run daily at 2 AM
-- Note: User will need to configure this manually in Supabase dashboard
-- SELECT cron.schedule(
--   'employes-daily-sync',
--   '0 2 * * *',  -- 2 AM every day
--   $$SELECT schedule_auto_sync()$$
-- );

-- ============================================================================
-- 3. COMPLIANCE MONITORING VIEWS
-- ============================================================================

-- View for expiring contracts (next 90 days)
CREATE OR REPLACE VIEW contracts_expiring_soon AS
SELECT 
  s.id,
  s.full_name,
  s.employment_end_date,
  s.employment_start_date,
  s.contract_type,
  s.location,
  s.role,
  (s.employment_end_date - CURRENT_DATE) as days_until_expiry,
  CASE 
    WHEN s.employment_end_date - CURRENT_DATE <= 30 THEN 'critical'
    WHEN s.employment_end_date - CURRENT_DATE <= 60 THEN 'warning'
    ELSE 'info'
  END as urgency_level
FROM staff s
WHERE s.employment_end_date IS NOT NULL
  AND s.employment_end_date >= CURRENT_DATE
  AND s.employment_end_date <= CURRENT_DATE + INTERVAL '90 days'
  AND s.status = 'active'
ORDER BY s.employment_end_date ASC;

-- View for staff needing reviews
CREATE OR REPLACE VIEW staff_reviews_needed AS
SELECT 
  s.id,
  s.full_name,
  s.employment_start_date,
  s.location,
  s.role,
  s.is_intern,
  (CURRENT_DATE - s.employment_start_date) as days_employed,
  CASE 
    WHEN (CURRENT_DATE - s.employment_start_date) >= 365 THEN 'yearly_review'
    WHEN (CURRENT_DATE - s.employment_start_date) >= 180 THEN '6month_review'
    WHEN (CURRENT_DATE - s.employment_start_date) >= 30 THEN '1month_review'
    ELSE 'no_review_needed'
  END as review_type,
  COALESCE(
    (SELECT MAX(review_date) FROM staff_reviews WHERE staff_id = s.id),
    NULL
  ) as last_review_date
FROM staff s
WHERE s.status = 'active'
  AND (
    (CURRENT_DATE - s.employment_start_date) >= 30
    AND NOT EXISTS (
      SELECT 1 FROM staff_reviews sr 
      WHERE sr.staff_id = s.id 
        AND sr.review_date >= CURRENT_DATE - INTERVAL '6 months'
    )
  )
ORDER BY s.employment_start_date ASC;

-- View for employment data changes
CREATE OR REPLACE VIEW recent_employment_changes AS
SELECT 
  seh.id,
  seh.staff_id,
  s.full_name,
  seh.change_type,
  seh.effective_date,
  seh.employes_employee_id,
  seh.created_at,
  seh.new_data,
  seh.previous_data
FROM staff_employment_history seh
JOIN staff s ON s.id = seh.staff_id
WHERE seh.created_at >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY seh.created_at DESC;

-- View for sync conflicts requiring resolution
CREATE OR REPLACE VIEW unresolved_sync_conflicts AS
SELECT 
  ssc.id,
  ssc.staff_id,
  s.full_name,
  ssc.employes_employee_id,
  ssc.conflict_type,
  ssc.resolution_status,
  ssc.created_at,
  ssc.lms_data,
  ssc.employes_data
FROM staff_sync_conflicts ssc
LEFT JOIN staff s ON s.id = ssc.staff_id
WHERE ssc.resolution_status = 'pending'
ORDER BY ssc.created_at DESC;

-- ============================================================================
-- 4. BACKGROUND JOB PROCESSOR FUNCTION
-- ============================================================================

-- Function to process pending background jobs
CREATE OR REPLACE FUNCTION process_background_jobs()
RETURNS TABLE (
  processed_count integer,
  failed_count integer,
  job_results jsonb[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  job_record RECORD;
  result_array jsonb[] := ARRAY[]::jsonb[];
  processed int := 0;
  failed int := 0;
BEGIN
  -- Get pending jobs ordered by priority and schedule
  FOR job_record IN
    SELECT * FROM employes_background_jobs
    WHERE status = 'pending'
      AND scheduled_for <= NOW()
    ORDER BY priority DESC, scheduled_for ASC
    LIMIT 10
  LOOP
    BEGIN
      -- Mark job as running
      UPDATE employes_background_jobs
      SET status = 'running', started_at = NOW()
      WHERE id = job_record.id;
      
      -- Process based on job type
      CASE job_record.job_type
        WHEN 'process_data_change' THEN
          -- Log that data change was acknowledged
          INSERT INTO employes_sync_logs (
            action, status, message, employes_employee_id
          ) VALUES (
            'background_job_processed',
            'success',
            'Processed data change for ' || (job_record.config->>'employee_id'),
            job_record.config->>'employee_id'
          );
        
        ELSE
          -- Unknown job type
          RAISE NOTICE 'Unknown job type: %', job_record.job_type;
      END CASE;
      
      -- Mark job as completed
      UPDATE employes_background_jobs
      SET 
        status = 'completed',
        completed_at = NOW(),
        progress = jsonb_build_object('completed', true)
      WHERE id = job_record.id;
      
      processed := processed + 1;
      result_array := array_append(result_array, 
        jsonb_build_object('job_id', job_record.id, 'status', 'success')
      );
      
    EXCEPTION WHEN OTHERS THEN
      -- Mark job as failed
      UPDATE employes_background_jobs
      SET 
        status = 'failed',
        completed_at = NOW(),
        error_message = SQLERRM
      WHERE id = job_record.id;
      
      failed := failed + 1;
      result_array := array_append(result_array,
        jsonb_build_object('job_id', job_record.id, 'status', 'failed', 'error', SQLERRM)
      );
    END;
  END LOOP;
  
  RETURN QUERY SELECT processed, failed, result_array;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION schedule_auto_sync() TO authenticated;
GRANT EXECUTE ON FUNCTION process_background_jobs() TO authenticated;

-- Grant select on views
GRANT SELECT ON contracts_expiring_soon TO authenticated;
GRANT SELECT ON staff_reviews_needed TO authenticated;
GRANT SELECT ON recent_employment_changes TO authenticated;
GRANT SELECT ON unresolved_sync_conflicts TO authenticated;

-- ============================================================================
-- 5. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for compliance queries
CREATE INDEX IF NOT EXISTS idx_staff_employment_end_date 
  ON staff(employment_end_date) 
  WHERE employment_end_date IS NOT NULL AND status = 'active';

CREATE INDEX IF NOT EXISTS idx_staff_employment_start_date 
  ON staff(employment_start_date) 
  WHERE status = 'active';

-- Index for change detection
CREATE INDEX IF NOT EXISTS idx_employes_raw_data_latest 
  ON employes_raw_data(employee_id, endpoint, is_latest) 
  WHERE is_latest = true;

-- Index for background jobs
CREATE INDEX IF NOT EXISTS idx_background_jobs_pending 
  ON employes_background_jobs(status, scheduled_for, priority) 
  WHERE status = 'pending';