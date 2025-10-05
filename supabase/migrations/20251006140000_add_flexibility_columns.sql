-- =====================================================
-- MIGRATION: Add Flexibility Columns
-- Created: 2025-10-06
-- Purpose: Track collection issues and enable retries
-- Philosophy: Never fail, always store, flag issues
-- =====================================================

BEGIN;

-- =====================================================
-- 1. ADD FLEXIBILITY COLUMNS TO RAW DATA
-- =====================================================

ALTER TABLE employes_raw_data
ADD COLUMN IF NOT EXISTS collection_issues JSONB,
ADD COLUMN IF NOT EXISTS is_partial BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_retry_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS retry_succeeded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS http_status_code INTEGER,
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- =====================================================
-- 2. CREATE INDEXES FOR RETRY LOGIC
-- =====================================================

-- Find records that need retry
CREATE INDEX IF NOT EXISTS idx_raw_needs_retry 
  ON employes_raw_data(employee_id, last_retry_at) 
  WHERE is_partial = true AND retry_count < 3;

-- Find failed records
CREATE INDEX IF NOT EXISTS idx_raw_partial 
  ON employes_raw_data(is_partial, collected_at DESC) 
  WHERE is_partial = true;

-- Track retry success
CREATE INDEX IF NOT EXISTS idx_raw_retry_success 
  ON employes_raw_data(retry_succeeded_at DESC) 
  WHERE retry_succeeded_at IS NOT NULL;

-- =====================================================
-- 3. CREATE HELPER VIEWS
-- =====================================================

-- View for records that need retry
CREATE OR REPLACE VIEW v_raw_data_needs_retry AS
SELECT 
  id,
  employee_id,
  endpoint,
  retry_count,
  last_retry_at,
  collection_issues,
  http_status_code,
  error_message,
  collected_at,
  -- Time since last retry
  EXTRACT(EPOCH FROM (NOW() - COALESCE(last_retry_at, collected_at))) / 3600 as hours_since_retry
FROM employes_raw_data
WHERE is_partial = true
  AND retry_count < 3
  AND (
    last_retry_at IS NULL 
    OR last_retry_at < NOW() - INTERVAL '1 hour'
  )
ORDER BY retry_count ASC, last_retry_at ASC NULLS FIRST
LIMIT 50;

-- View for collection health
CREATE OR REPLACE VIEW v_collection_health AS
SELECT 
  endpoint,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE is_partial = false) as successful,
  COUNT(*) FILTER (WHERE is_partial = true) as partial,
  COUNT(*) FILTER (WHERE is_partial = true AND retry_count >= 3) as failed,
  ROUND(100.0 * COUNT(*) FILTER (WHERE is_partial = false) / COUNT(*), 2) as success_rate,
  MAX(collected_at) as last_collection,
  AVG(retry_count) FILTER (WHERE is_partial = true) as avg_retries
FROM employes_raw_data
WHERE collected_at > NOW() - INTERVAL '7 days'
GROUP BY endpoint
ORDER BY success_rate ASC;

-- Grant permissions
GRANT SELECT ON v_raw_data_needs_retry TO authenticated;
GRANT SELECT ON v_collection_health TO authenticated;

-- =====================================================
-- 4. CREATE RETRY TRACKING TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS employes_retry_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What was retried
  raw_data_id UUID REFERENCES employes_raw_data(id),
  employee_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  
  -- Retry details
  retry_attempt INTEGER NOT NULL,
  retry_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Result
  success BOOLEAN NOT NULL,
  http_status_code INTEGER,
  error_message TEXT,
  response_time_ms INTEGER,
  
  -- Context
  triggered_by TEXT -- 'manual', 'scheduled', 'orchestrator'
);

-- Create indexes separately
CREATE INDEX IF NOT EXISTS idx_retry_log_employee 
  ON employes_retry_log(employee_id, retry_at DESC);
CREATE INDEX IF NOT EXISTS idx_retry_log_success 
  ON employes_retry_log(success, retry_at DESC);

-- Grant permissions
GRANT SELECT, INSERT ON employes_retry_log TO authenticated;

-- =====================================================
-- 5. STATISTICS
-- =====================================================

DO $$
DECLARE
  total_records INTEGER;
  partial_records INTEGER;
  needs_retry INTEGER;
  failed_records INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_records FROM employes_raw_data;
  SELECT COUNT(*) INTO partial_records FROM employes_raw_data WHERE is_partial = true;
  SELECT COUNT(*) INTO needs_retry FROM v_raw_data_needs_retry;
  SELECT COUNT(*) INTO failed_records FROM employes_raw_data 
    WHERE is_partial = true AND retry_count >= 3;
  
  RAISE NOTICE 'FLEXIBILITY COLUMNS ADDED';
  RAISE NOTICE 'Total raw records: %', total_records;
  RAISE NOTICE 'Partial records: %', partial_records;
  RAISE NOTICE 'Needs retry: %', needs_retry;
  RAISE NOTICE 'Failed (max retries): %', failed_records;
END $$;

COMMIT;

-- =====================================================
-- SUCCESS!
-- =====================================================
