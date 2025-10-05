-- =====================================================
-- MIGRATION: Complete Analytics System (Phase 5 & 6)
-- Created: 2025-10-06
-- Purpose: Deep analytics + monitoring dashboard
-- Philosophy: Track everything, visualize everything
-- =====================================================

BEGIN;

-- =====================================================
-- PHASE 5: COMPLETE CHANGE LOG
-- =====================================================

-- Enhanced change log view with analytics
CREATE OR REPLACE VIEW v_change_analytics AS
SELECT 
  ec.id,
  ec.employee_id,
  ec.change_type,
  ec.field_name,
  ec.effective_date,
  ec.old_value,
  ec.new_value,
  ec.change_amount,
  ec.change_percent,
  ec.business_impact,
  ec.detected_at,
  ec.sync_session_id,
  -- Employee info
  ecs.full_name as employee_name,
  ecs.department,
  ecs.position,
  -- Time analytics
  DATE_PART('year', ec.effective_date) as change_year,
  DATE_PART('month', ec.effective_date) as change_month,
  DATE_PART('quarter', ec.effective_date) as change_quarter,
  -- Change classification
  CASE 
    WHEN ec.change_type = 'salary_change' AND ec.change_amount > 0 THEN 'salary_increase'
    WHEN ec.change_type = 'salary_change' AND ec.change_amount < 0 THEN 'salary_decrease'
    WHEN ec.change_type = 'hours_change' THEN 'hours_adjustment'
    WHEN ec.change_type = 'contract_change' THEN 'contract_modification'
    ELSE ec.change_type
  END as change_category,
  -- Significance
  CASE 
    WHEN ec.change_percent > 10 THEN 'major'
    WHEN ec.change_percent > 5 THEN 'moderate'
    WHEN ec.change_percent > 0 THEN 'minor'
    ELSE 'neutral'
  END as change_significance
FROM employes_changes ec
LEFT JOIN employes_current_state ecs ON ecs.employee_id = ec.employee_id::UUID
WHERE ec.is_duplicate = false;

GRANT SELECT ON v_change_analytics TO authenticated;

-- Department-level analytics
CREATE OR REPLACE VIEW v_department_change_summary AS
SELECT 
  department,
  COUNT(*) as total_changes,
  COUNT(DISTINCT employee_id) as employees_affected,
  COUNT(*) FILTER (WHERE change_type = 'salary_change') as salary_changes,
  AVG(change_percent) FILTER (WHERE change_type = 'salary_change' AND change_amount > 0) as avg_salary_increase_pct,
  SUM(change_amount) FILTER (WHERE change_type = 'salary_change' AND change_amount > 0) as total_salary_increases,
  MAX(effective_date) as last_change_date
FROM v_change_analytics
GROUP BY department
ORDER BY total_changes DESC;

GRANT SELECT ON v_department_change_summary TO authenticated;

-- Monthly change trends
CREATE OR REPLACE VIEW v_monthly_change_trends AS
SELECT 
  change_year,
  change_month,
  DATE_TRUNC('month', effective_date) as month_start,
  COUNT(*) as total_changes,
  COUNT(*) FILTER (WHERE change_category = 'salary_increase') as salary_increases,
  COUNT(*) FILTER (WHERE change_category = 'salary_decrease') as salary_decreases,
  COUNT(*) FILTER (WHERE change_category = 'hours_adjustment') as hours_changes,
  COUNT(*) FILTER (WHERE change_category = 'contract_modification') as contract_changes,
  AVG(change_percent) FILTER (WHERE change_type = 'salary_change') as avg_change_pct,
  COUNT(DISTINCT employee_id) as unique_employees
FROM v_change_analytics
GROUP BY change_year, change_month, DATE_TRUNC('month', effective_date)
ORDER BY change_year DESC, change_month DESC;

GRANT SELECT ON v_monthly_change_trends TO authenticated;

-- =====================================================
-- PHASE 6: MONITORING DASHBOARD
-- =====================================================

-- Sync health monitoring
CREATE OR REPLACE VIEW v_sync_health_dashboard AS
SELECT 
  -- Recent sync status
  (SELECT COUNT(*) FROM employes_sync_sessions WHERE started_at > NOW() - INTERVAL '24 hours') as syncs_last_24h,
  (SELECT COUNT(*) FROM employes_sync_sessions WHERE status = 'completed' AND started_at > NOW() - INTERVAL '24 hours') as successful_syncs_24h,
  (SELECT COUNT(*) FROM employes_sync_sessions WHERE status = 'failed' AND started_at > NOW() - INTERVAL '24 hours') as failed_syncs_24h,
  
  -- Data freshness
  (SELECT MAX(last_sync_at) FROM employes_current_state) as last_successful_sync,
  (SELECT COUNT(*) FROM employes_current_state WHERE last_sync_at > NOW() - INTERVAL '7 days') as fresh_records,
  (SELECT COUNT(*) FROM employes_current_state WHERE last_sync_at < NOW() - INTERVAL '7 days') as stale_records,
  
  -- Data quality
  (SELECT AVG(data_completeness_score) FROM employes_current_state) as avg_data_completeness,
  (SELECT COUNT(*) FROM employes_current_state WHERE data_completeness_score >= 0.8) as complete_profiles,
  (SELECT COUNT(*) FROM employes_current_state WHERE data_completeness_score < 0.5) as incomplete_profiles,
  
  -- Partial data & retries
  (SELECT COUNT(*) FROM employes_raw_data WHERE is_partial = true) as partial_records,
  (SELECT COUNT(*) FROM employes_raw_data WHERE is_partial = true AND retry_count < 3) as needs_retry,
  (SELECT COUNT(*) FROM employes_raw_data WHERE is_partial = true AND retry_count >= 3) as failed_records,
  
  -- Recent changes
  (SELECT COUNT(*) FROM employes_changes WHERE detected_at > NOW() - INTERVAL '7 days' AND is_duplicate = false) as changes_last_7d,
  (SELECT COUNT(*) FROM employes_timeline_v2 WHERE created_at > NOW() - INTERVAL '7 days') as timeline_events_7d,
  
  -- System totals
  (SELECT COUNT(*) FROM employes_current_state) as total_employees,
  (SELECT COUNT(*) FROM employes_current_state WHERE is_active = true) as active_employees,
  (SELECT COUNT(*) FROM employes_raw_data) as total_raw_records,
  (SELECT COUNT(*) FROM employes_changes WHERE is_duplicate = false) as total_changes,
  (SELECT COUNT(*) FROM employes_timeline_v2) as total_timeline_events;

GRANT SELECT ON v_sync_health_dashboard TO authenticated;

-- Detailed sync session history
CREATE OR REPLACE VIEW v_sync_session_history AS
SELECT 
  id,
  session_type,
  status,
  started_at,
  completed_at,
  EXTRACT(EPOCH FROM (completed_at - started_at)) as duration_seconds,
  total_records,
  successful_records,
  failed_records,
  CASE 
    WHEN total_records > 0 THEN ROUND(100.0 * successful_records / total_records, 2)
    ELSE 0
  END as success_rate,
  sync_details
FROM employes_sync_sessions
ORDER BY started_at DESC
LIMIT 50;

GRANT SELECT ON v_sync_session_history TO authenticated;

-- Collection health by endpoint
CREATE OR REPLACE VIEW v_collection_health_by_endpoint AS
SELECT 
  endpoint,
  COUNT(*) as total_collections,
  COUNT(*) FILTER (WHERE is_partial = false) as successful,
  COUNT(*) FILTER (WHERE is_partial = true) as partial,
  COUNT(*) FILTER (WHERE is_partial = true AND retry_count >= 3) as permanently_failed,
  ROUND(100.0 * COUNT(*) FILTER (WHERE is_partial = false) / COUNT(*), 2) as success_rate,
  MAX(collected_at) as last_collection,
  AVG(retry_count) FILTER (WHERE is_partial = true) as avg_retries_on_failure
FROM employes_raw_data
WHERE collected_at > NOW() - INTERVAL '30 days'
GROUP BY endpoint
ORDER BY success_rate ASC;

GRANT SELECT ON v_collection_health_by_endpoint TO authenticated;

-- Data completeness by field
CREATE OR REPLACE VIEW v_data_completeness_by_field AS
SELECT 
  'full_name' as field_name,
  COUNT(*) FILTER (WHERE full_name IS NOT NULL) as populated,
  COUNT(*) as total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE full_name IS NOT NULL) / COUNT(*), 2) as completeness_pct
FROM employes_current_state
UNION ALL
SELECT 
  'email',
  COUNT(*) FILTER (WHERE email IS NOT NULL),
  COUNT(*),
  ROUND(100.0 * COUNT(*) FILTER (WHERE email IS NOT NULL) / COUNT(*), 2)
FROM employes_current_state
UNION ALL
SELECT 
  'date_of_birth',
  COUNT(*) FILTER (WHERE date_of_birth IS NOT NULL),
  COUNT(*),
  ROUND(100.0 * COUNT(*) FILTER (WHERE date_of_birth IS NOT NULL) / COUNT(*), 2)
FROM employes_current_state
UNION ALL
SELECT 
  'current_salary',
  COUNT(*) FILTER (WHERE current_salary IS NOT NULL),
  COUNT(*),
  ROUND(100.0 * COUNT(*) FILTER (WHERE current_salary IS NOT NULL) / COUNT(*), 2)
FROM employes_current_state
UNION ALL
SELECT 
  'current_hours_per_week',
  COUNT(*) FILTER (WHERE current_hours_per_week IS NOT NULL),
  COUNT(*),
  ROUND(100.0 * COUNT(*) FILTER (WHERE current_hours_per_week IS NOT NULL) / COUNT(*), 2)
FROM employes_current_state
UNION ALL
SELECT 
  'department',
  COUNT(*) FILTER (WHERE department IS NOT NULL),
  COUNT(*),
  ROUND(100.0 * COUNT(*) FILTER (WHERE department IS NOT NULL) / COUNT(*), 2)
FROM employes_current_state
UNION ALL
SELECT 
  'bsn',
  COUNT(*) FILTER (WHERE bsn IS NOT NULL),
  COUNT(*),
  ROUND(100.0 * COUNT(*) FILTER (WHERE bsn IS NOT NULL) / COUNT(*), 2)
FROM employes_current_state
ORDER BY completeness_pct ASC;

GRANT SELECT ON v_data_completeness_by_field TO authenticated;

-- =====================================================
-- HELPER FUNCTION: Get System Health Score
-- =====================================================

CREATE OR REPLACE FUNCTION get_system_health_score()
RETURNS TABLE (
  category TEXT,
  score INTEGER,
  status TEXT,
  details TEXT
) AS $$
BEGIN
  -- Sync Health (0-100)
  RETURN QUERY
  SELECT 
    'Sync Health'::TEXT,
    CASE 
      WHEN sync_success_rate >= 95 THEN 100
      WHEN sync_success_rate >= 80 THEN 80
      WHEN sync_success_rate >= 60 THEN 60
      ELSE 40
    END as score,
    CASE 
      WHEN sync_success_rate >= 95 THEN 'Excellent'
      WHEN sync_success_rate >= 80 THEN 'Good'
      WHEN sync_success_rate >= 60 THEN 'Fair'
      ELSE 'Poor'
    END::TEXT as status,
    sync_success_rate::TEXT || '% success rate' as details
  FROM (
    SELECT COALESCE(
      ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'completed') / NULLIF(COUNT(*), 0), 2),
      0
    ) as sync_success_rate
    FROM employes_sync_sessions
    WHERE started_at > NOW() - INTERVAL '7 days'
  ) s;
  
  -- Data Freshness (0-100)
  RETURN QUERY
  SELECT 
    'Data Freshness'::TEXT,
    CASE 
      WHEN fresh_pct >= 90 THEN 100
      WHEN fresh_pct >= 70 THEN 80
      WHEN fresh_pct >= 50 THEN 60
      ELSE 40
    END as score,
    CASE 
      WHEN fresh_pct >= 90 THEN 'Excellent'
      WHEN fresh_pct >= 70 THEN 'Good'
      WHEN fresh_pct >= 50 THEN 'Fair'
      ELSE 'Poor'
    END::TEXT as status,
    fresh_pct::TEXT || '% fresh (< 7 days)' as details
  FROM (
    SELECT COALESCE(
      ROUND(100.0 * COUNT(*) FILTER (WHERE last_sync_at > NOW() - INTERVAL '7 days') / NULLIF(COUNT(*), 0), 2),
      0
    ) as fresh_pct
    FROM employes_current_state
  ) f;
  
  -- Data Completeness (0-100)
  RETURN QUERY
  SELECT 
    'Data Completeness'::TEXT,
    ROUND(avg_completeness * 100)::INTEGER as score,
    CASE 
      WHEN avg_completeness >= 0.8 THEN 'Excellent'
      WHEN avg_completeness >= 0.6 THEN 'Good'
      WHEN avg_completeness >= 0.4 THEN 'Fair'
      ELSE 'Poor'
    END::TEXT as status,
    ROUND(avg_completeness * 100)::TEXT || '% average' as details
  FROM (
    SELECT COALESCE(AVG(data_completeness_score), 0) as avg_completeness
    FROM employes_current_state
  ) c;
END;
$$ LANGUAGE plpgsql;

COMMIT;

-- =====================================================
-- SUCCESS!
-- =====================================================
