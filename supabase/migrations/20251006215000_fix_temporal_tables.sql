-- =====================================================
-- FIX TEMPORAL TABLES - Drop and recreate properly
-- Created: 2025-10-06
-- Purpose: Fix schema mismatches from previous attempts
-- =====================================================

BEGIN;

-- Drop existing tables and recreate with correct schema
DROP TABLE IF EXISTS employes_timeline_v2 CASCADE;
DROP TABLE IF EXISTS employes_changes CASCADE;

-- 1. CHANGES TABLE - Track all field-level changes
CREATE TABLE employes_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  field_path TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  change_type TEXT CHECK (change_type IN ('created', 'updated', 'deleted')),
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  sync_session_id UUID,
  is_duplicate BOOLEAN DEFAULT false,
  is_significant BOOLEAN DEFAULT true,
  metadata JSONB
);

-- Create indexes for employes_changes
CREATE INDEX idx_changes_employee ON employes_changes(employee_id);
CREATE INDEX idx_changes_detected ON employes_changes(detected_at DESC);
CREATE INDEX idx_changes_field ON employes_changes(field_path);
CREATE INDEX idx_changes_not_duplicate ON employes_changes(is_duplicate) WHERE is_duplicate = false;

-- 2. TIMELINE TABLE - Event-based history
CREATE TABLE employes_timeline_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  event_title TEXT NOT NULL,
  event_description TEXT,
  event_data JSONB,
  change_id UUID REFERENCES employes_changes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for employes_timeline_v2
CREATE INDEX idx_timeline_employee ON employes_timeline_v2(employee_id);
CREATE INDEX idx_timeline_date ON employes_timeline_v2(event_date DESC);
CREATE INDEX idx_timeline_type ON employes_timeline_v2(event_type);
CREATE INDEX idx_timeline_change ON employes_timeline_v2(change_id);

-- 3. CURRENT STATE VIEW (drop table if exists, then create as view)
DROP TABLE IF EXISTS employes_current_state CASCADE;
CREATE OR REPLACE VIEW employes_current_state AS
SELECT DISTINCT ON (employee_id)
  employee_id,
  api_response->>'first_name' as first_name,
  api_response->>'surname' as surname,
  api_response->>'email' as email,
  api_response->>'status' as status,
  api_response->>'phone_number' as phone_number,
  api_response->'employment' as employment_data,
  (api_response->'employment'->>'start_date')::date as employment_start,
  (api_response->'employment'->'salary'->>'hour_wage')::numeric as hourly_wage,
  (api_response->'employment'->'contract'->>'hours_per_week')::numeric as hours_per_week,
  collected_at as last_updated,
  last_verified_at
FROM employes_raw_data
WHERE endpoint = '/employee' AND is_latest = true
ORDER BY employee_id, collected_at DESC;

-- 4. Add comments
COMMENT ON TABLE employes_changes IS 'Field-level change tracking for all employee data';
COMMENT ON TABLE employes_timeline_v2 IS 'Event-based timeline of employee history';
COMMENT ON VIEW employes_current_state IS 'Current state of all employees (latest data only)';

-- 5. Enable RLS
ALTER TABLE employes_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE employes_timeline_v2 ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access on changes" ON employes_changes
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on timeline" ON employes_timeline_v2
  FOR ALL USING (true) WITH CHECK (true);

COMMIT;
