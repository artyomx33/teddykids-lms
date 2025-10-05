-- =====================================================
-- Processing Queue Table
-- Created: 2025-10-06
-- Purpose: Resilient async processing with retry logic
-- =====================================================

BEGIN;

-- Create processing queue table
CREATE TABLE IF NOT EXISTS processing_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type text NOT NULL, -- 'timeline_processing', 'change_detection', etc.
  payload jsonb NOT NULL,  -- Job-specific data
  status text DEFAULT 'pending', -- pending|processing|completed|failed
  priority int DEFAULT 0, -- Higher = more urgent (0-10)
  attempts int DEFAULT 0,
  max_attempts int DEFAULT 3,
  created_at timestamptz DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  error_details jsonb,
  result jsonb,
  processing_time_ms int, -- Track performance
  created_by text -- 'sync', 'manual', 'scheduled'
);

-- Create indexes for efficient queue processing
CREATE INDEX idx_queue_status_priority ON processing_queue (status, priority DESC, created_at);
CREATE INDEX idx_queue_job_type ON processing_queue (job_type, status);
CREATE INDEX idx_queue_created ON processing_queue (created_at);

-- Enable RLS
ALTER TABLE processing_queue ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access to queue" 
  ON processing_queue 
  FOR ALL 
  USING (auth.role() = 'service_role');

-- Authenticated users can read their jobs
CREATE POLICY "Users can view queue status" 
  ON processing_queue 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Function to claim a job atomically
CREATE OR REPLACE FUNCTION claim_next_job(
  p_job_type text DEFAULT NULL
)
RETURNS processing_queue AS $$
DECLARE
  v_job processing_queue;
BEGIN
  -- Atomically claim the next pending job
  UPDATE processing_queue
  SET 
    status = 'processing',
    started_at = now(),
    attempts = attempts + 1
  WHERE id = (
    SELECT id 
    FROM processing_queue
    WHERE status = 'pending'
      AND attempts < max_attempts
      AND (p_job_type IS NULL OR job_type = p_job_type)
    ORDER BY priority DESC, created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED -- Skip if another process is claiming
  )
  RETURNING * INTO v_job;
  
  RETURN v_job;
END;
$$ LANGUAGE plpgsql;

-- Function to retry failed jobs
CREATE OR REPLACE FUNCTION retry_failed_jobs(
  older_than interval DEFAULT '5 minutes'
)
RETURNS int AS $$
DECLARE
  v_count int;
BEGIN
  UPDATE processing_queue
  SET 
    status = 'pending',
    error_message = error_message || ' [Retrying]'
  WHERE status = 'processing'
    AND started_at < now() - older_than
    AND attempts < max_attempts;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

COMMIT;
