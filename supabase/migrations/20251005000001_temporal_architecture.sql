-- 🚀 TEMPORAL ARCHITECTURE - Complete History Tracking
-- Created: 2025-10-05
-- Purpose: Enable full temporal tracking of salary/contract/hours changes
-- Architecture: Solution #1 - Temporal-First Microservices

-- ============================================================================
-- STEP 1: DROP EXISTING STRUCTURES (Clean slate)
-- ============================================================================

DROP VIEW IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS employes_raw_data CASCADE;

-- ============================================================================
-- STEP 2: CREATE ENHANCED RAW DATA TABLE WITH TEMPORAL SUPPORT
-- ============================================================================

CREATE TABLE employes_raw_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core identifiers
  employee_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,  -- '/employee', '/employments', '/salary-history', '/contracts', '/hours', etc.
  
  -- Data storage
  api_response JSONB NOT NULL,
  data_hash TEXT NOT NULL,
  
  -- Temporal tracking (THE KEY FEATURE!)
  collected_at TIMESTAMPTZ DEFAULT NOW(),
  effective_from TIMESTAMPTZ,  -- When this data became true in reality
  effective_to TIMESTAMPTZ,    -- When this data stopped being true (NULL = still current)
  is_latest BOOLEAN DEFAULT true,
  
  -- Versioning chain
  superseded_by UUID,  -- Will add foreign key after table creation
  supersedes UUID,     -- Will add foreign key after table creation
  
  -- Sync metadata
  sync_session_id UUID,  -- Group all records from same sync run
  confidence_score DECIMAL(3,2) DEFAULT 1.00,  -- How confident we are (0.00-1.00)
  
  -- Ensure only one "latest" per employee+endpoint
  CONSTRAINT unique_latest_endpoint UNIQUE(employee_id, endpoint, is_latest) DEFERRABLE INITIALLY DEFERRED
);

-- Add foreign keys for versioning chain (after table exists)
ALTER TABLE employes_raw_data 
  ADD CONSTRAINT fk_superseded_by 
  FOREIGN KEY (superseded_by) REFERENCES employes_raw_data(id) ON DELETE SET NULL;

ALTER TABLE employes_raw_data 
  ADD CONSTRAINT fk_supersedes 
  FOREIGN KEY (supersedes) REFERENCES employes_raw_data(id) ON DELETE SET NULL;

-- ============================================================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Primary lookup patterns
CREATE INDEX idx_raw_employee_endpoint ON employes_raw_data(employee_id, endpoint);
CREATE INDEX idx_raw_latest ON employes_raw_data(is_latest) WHERE is_latest = true;
CREATE INDEX idx_raw_collected ON employes_raw_data(collected_at DESC);
CREATE INDEX idx_raw_hash ON employes_raw_data(data_hash);

-- Temporal queries
CREATE INDEX idx_raw_effective_from ON employes_raw_data(effective_from) WHERE effective_from IS NOT NULL;
CREATE INDEX idx_raw_effective_to ON employes_raw_data(effective_to) WHERE effective_to IS NOT NULL;
CREATE INDEX idx_raw_temporal_range ON employes_raw_data(employee_id, effective_from, effective_to);

-- Sync tracking
CREATE INDEX idx_raw_sync_session ON employes_raw_data(sync_session_id);
CREATE INDEX idx_raw_confidence ON employes_raw_data(confidence_score) WHERE confidence_score < 1.00;

-- ============================================================================
-- STEP 4: ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE employes_raw_data IS 'Complete temporal storage of ALL Employes.nl API data with full history. Every change is tracked with effective dates.';
COMMENT ON COLUMN employes_raw_data.employee_id IS 'Employes.nl employee UUID';
COMMENT ON COLUMN employes_raw_data.endpoint IS 'API endpoint: /employee, /employments, /salary-history, /contracts, /hours';
COMMENT ON COLUMN employes_raw_data.api_response IS 'Complete unmodified JSON response from API';
COMMENT ON COLUMN employes_raw_data.data_hash IS 'SHA hash of api_response for deduplication';
COMMENT ON COLUMN employes_raw_data.collected_at IS 'When we fetched this data from API';
COMMENT ON COLUMN employes_raw_data.effective_from IS 'When this data became true in real world (from API start_date fields)';
COMMENT ON COLUMN employes_raw_data.effective_to IS 'When this data stopped being true (NULL = still current)';
COMMENT ON COLUMN employes_raw_data.is_latest IS 'True for current version, false for historical records';
COMMENT ON COLUMN employes_raw_data.superseded_by IS 'Link to the record that replaced this one';
COMMENT ON COLUMN employes_raw_data.supersedes IS 'Link to the record this one replaced';
COMMENT ON COLUMN employes_raw_data.sync_session_id IS 'Groups all records from same sync operation';
COMMENT ON COLUMN employes_raw_data.confidence_score IS 'AI confidence in data accuracy (1.00 = certain, <1.00 = needs review)';

-- ============================================================================
-- STEP 5: CREATE CHANGES TRACKING TABLE
-- ============================================================================

CREATE TABLE employes_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What changed
  employee_id TEXT NOT NULL,
  change_type TEXT NOT NULL,  -- 'salary_change', 'hours_change', 'contract_change', 'position_change', etc.
  effective_date TIMESTAMPTZ NOT NULL,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Change details
  field_name TEXT,  -- Specific field: 'hourly_wage', 'hours_per_week', 'contract_type', etc.
  old_value JSONB,
  new_value JSONB,
  diff JSONB,  -- Detailed field-by-field comparison
  
  -- Change magnitude (for numeric changes)
  change_amount NUMERIC,  -- Absolute difference
  change_percent NUMERIC, -- Percentage change
  
  -- Context
  change_source TEXT,  -- Which endpoint detected this: '/salary-history', '/employments', etc.
  confidence_score DECIMAL(3,2) DEFAULT 1.00,
  validation_status TEXT DEFAULT 'detected',  -- 'detected', 'confirmed', 'suspicious', 'false_positive'
  
  -- Human review
  reviewed_by UUID,  -- Will add FK to auth.users later if needed
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  -- Links to raw data
  raw_data_before UUID REFERENCES employes_raw_data(id),
  raw_data_after UUID REFERENCES employes_raw_data(id),
  
  -- Business impact flags
  requires_contract_update BOOLEAN DEFAULT false,
  requires_payroll_adjustment BOOLEAN DEFAULT false,
  requires_manager_notification BOOLEAN DEFAULT false,
  
  -- Tags for filtering
  tags TEXT[]
);

-- ============================================================================
-- STEP 6: CREATE INDEXES ON CHANGES TABLE
-- ============================================================================

CREATE INDEX idx_changes_employee ON employes_changes(employee_id, effective_date DESC);
CREATE INDEX idx_changes_type ON employes_changes(change_type, effective_date DESC);
CREATE INDEX idx_changes_type_employee ON employes_changes(change_type, employee_id);
CREATE INDEX idx_changes_detected ON employes_changes(detected_at DESC);
CREATE INDEX idx_changes_validation ON employes_changes(validation_status) WHERE validation_status != 'confirmed';
CREATE INDEX idx_changes_review ON employes_changes(reviewed_by, reviewed_at) WHERE reviewed_by IS NOT NULL;
CREATE INDEX idx_changes_business_impact ON employes_changes(requires_contract_update, requires_payroll_adjustment) 
  WHERE requires_contract_update = true OR requires_payroll_adjustment = true;

-- GIN index for tags array
CREATE INDEX idx_changes_tags ON employes_changes USING GIN(tags);

-- ============================================================================
-- STEP 7: ADD COMMENTS ON CHANGES TABLE
-- ============================================================================

COMMENT ON TABLE employes_changes IS 'Detected changes in salary, hours, contracts over time with validation tracking';
COMMENT ON COLUMN employes_changes.change_type IS 'Type of change: salary_change, hours_change, contract_change, position_change, location_change, etc.';
COMMENT ON COLUMN employes_changes.effective_date IS 'When the change took effect in real world';
COMMENT ON COLUMN employes_changes.detected_at IS 'When our system detected this change';
COMMENT ON COLUMN employes_changes.confidence_score IS 'AI confidence (1.00 = certain, 0.50 = needs review)';
COMMENT ON COLUMN employes_changes.validation_status IS 'detected=new, confirmed=verified, suspicious=needs review, false_positive=ignore';
COMMENT ON COLUMN employes_changes.change_amount IS 'Numeric difference (e.g., salary increased by €200)';
COMMENT ON COLUMN employes_changes.change_percent IS 'Percentage change (e.g., 5.5% increase)';

-- ============================================================================
-- STEP 8: CREATE TIMELINE MATERIALIZED VIEW
-- ============================================================================

CREATE MATERIALIZED VIEW employes_timeline AS
SELECT 
  employee_id,
  
  -- Complete timeline as JSON array
  jsonb_agg(
    jsonb_build_object(
      'id', id,
      'date', effective_date,
      'type', change_type,
      'field', field_name,
      'old_value', old_value,
      'new_value', new_value,
      'change_amount', change_amount,
      'change_percent', change_percent,
      'source', change_source,
      'confidence', confidence_score,
      'validation', validation_status
    ) ORDER BY effective_date DESC
  ) as timeline,
  
  -- Summary statistics
  COUNT(*) as total_changes,
  COUNT(*) FILTER (WHERE change_type = 'salary_change') as salary_changes,
  COUNT(*) FILTER (WHERE change_type = 'hours_change') as hours_changes,
  COUNT(*) FILTER (WHERE change_type = 'contract_change') as contract_changes,
  COUNT(*) FILTER (WHERE change_type = 'position_change') as position_changes,
  
  -- Date range
  MIN(effective_date) as earliest_change,
  MAX(effective_date) as latest_change,
  
  -- Data quality
  AVG(confidence_score) as avg_confidence,
  COUNT(*) FILTER (WHERE validation_status = 'confirmed') as confirmed_changes,
  COUNT(*) FILTER (WHERE validation_status = 'suspicious') as suspicious_changes,
  
  -- Last updated
  MAX(detected_at) as last_updated
  
FROM employes_changes
WHERE validation_status != 'false_positive'
GROUP BY employee_id;

-- Index for fast employee lookups
CREATE UNIQUE INDEX idx_timeline_employee ON employes_timeline(employee_id);

-- ============================================================================
-- STEP 9: CREATE TIMELINE REFRESH FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION refresh_employes_timeline()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY employes_timeline;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_employes_timeline IS 'Refresh the timeline materialized view (call after bulk changes)';
COMMENT ON MATERIALIZED VIEW employes_timeline IS 'Fast access to complete change history per employee';

-- ============================================================================
-- STEP 10: CREATE TEMPORAL QUERY FUNCTIONS
-- ============================================================================

-- Get salary at specific date (time-travel query!)
CREATE OR REPLACE FUNCTION get_salary_at_date(
  p_employee_id TEXT,
  p_date TIMESTAMPTZ DEFAULT NOW()
) RETURNS JSONB AS $$
  SELECT new_value
  FROM employes_changes
  WHERE employee_id = p_employee_id
    AND change_type = 'salary_change'
    AND effective_date <= p_date
    AND validation_status IN ('confirmed', 'detected')
  ORDER BY effective_date DESC, detected_at DESC
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Get contract at specific date
CREATE OR REPLACE FUNCTION get_contract_at_date(
  p_employee_id TEXT,
  p_date TIMESTAMPTZ DEFAULT NOW()
) RETURNS JSONB AS $$
  SELECT new_value
  FROM employes_changes
  WHERE employee_id = p_employee_id
    AND change_type = 'contract_change'
    AND effective_date <= p_date
    AND validation_status IN ('confirmed', 'detected')
  ORDER BY effective_date DESC, detected_at DESC
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Get hours at specific date
CREATE OR REPLACE FUNCTION get_hours_at_date(
  p_employee_id TEXT,
  p_date TIMESTAMPTZ DEFAULT NOW()
) RETURNS JSONB AS $$
  SELECT new_value
  FROM employes_changes
  WHERE employee_id = p_employee_id
    AND change_type = 'hours_change'
    AND effective_date <= p_date
    AND validation_status IN ('confirmed', 'detected')
  ORDER BY effective_date DESC, detected_at DESC
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Get complete employee timeline within date range
CREATE OR REPLACE FUNCTION get_employee_timeline(
  p_employee_id TEXT,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NOW()
) RETURNS JSONB AS $$
  SELECT jsonb_agg(
    jsonb_build_object(
      'date', effective_date,
      'type', change_type,
      'field', field_name,
      'old_value', old_value,
      'new_value', new_value,
      'change_amount', change_amount,
      'change_percent', change_percent,
      'confidence', confidence_score
    ) ORDER BY effective_date ASC
  )
  FROM employes_changes
  WHERE employee_id = p_employee_id
    AND (p_start_date IS NULL OR effective_date >= p_start_date)
    AND effective_date <= p_end_date
    AND validation_status IN ('confirmed', 'detected');
$$ LANGUAGE sql STABLE;

-- Get salary progression (all salary changes)
CREATE OR REPLACE FUNCTION get_salary_progression(
  p_employee_id TEXT
) RETURNS TABLE(
  effective_date TIMESTAMPTZ,
  hourly_wage NUMERIC,
  monthly_wage NUMERIC,
  change_amount NUMERIC,
  change_percent NUMERIC
) AS $$
  SELECT 
    effective_date,
    (new_value->>'hourly_wage')::NUMERIC as hourly_wage,
    (new_value->>'monthly_wage')::NUMERIC as monthly_wage,
    change_amount,
    change_percent
  FROM employes_changes
  WHERE employee_id = p_employee_id
    AND change_type = 'salary_change'
    AND validation_status IN ('confirmed', 'detected')
  ORDER BY effective_date ASC;
$$ LANGUAGE sql STABLE;

-- ============================================================================
-- STEP 11: ADD COMMENTS ON FUNCTIONS
-- ============================================================================

COMMENT ON FUNCTION get_salary_at_date IS 'TIME-TRAVEL: What was this employees salary on a specific date?';
COMMENT ON FUNCTION get_contract_at_date IS 'TIME-TRAVEL: What contract did employee have on a specific date?';
COMMENT ON FUNCTION get_hours_at_date IS 'TIME-TRAVEL: How many hours was employee working on a specific date?';
COMMENT ON FUNCTION get_employee_timeline IS 'Get complete change history for employee within date range';
COMMENT ON FUNCTION get_salary_progression IS 'Get all salary changes over time with amounts and percentages';

-- ============================================================================
-- STEP 12: SET UP PERMISSIONS
-- ============================================================================

-- Grant access to authenticated users (read-only for most)
GRANT SELECT ON employes_raw_data TO authenticated;
GRANT SELECT ON employes_changes TO authenticated;
GRANT SELECT ON employes_timeline TO authenticated;

-- Grant full access to service role (for edge functions)
GRANT ALL ON employes_raw_data TO service_role;
GRANT ALL ON employes_changes TO service_role;
GRANT ALL ON employes_timeline TO service_role;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION get_salary_at_date TO authenticated;
GRANT EXECUTE ON FUNCTION get_contract_at_date TO authenticated;
GRANT EXECUTE ON FUNCTION get_hours_at_date TO authenticated;
GRANT EXECUTE ON FUNCTION get_employee_timeline TO authenticated;
GRANT EXECUTE ON FUNCTION get_salary_progression TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_employes_timeline TO service_role;

-- ============================================================================
-- STEP 13: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE employes_raw_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE employes_changes ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users (read access)
CREATE POLICY "authenticated_read_raw_data" ON employes_raw_data
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "authenticated_read_changes" ON employes_changes
  FOR SELECT TO authenticated
  USING (true);

-- Policies for service role (full access)
CREATE POLICY "service_role_all_raw_data" ON employes_raw_data
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_all_changes" ON employes_changes
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- STEP 14: RECREATE STAFF VIEW (Compatible with new structure)
-- ============================================================================

CREATE VIEW staff AS
SELECT
  -- Generate deterministic UUID from employee_id
  md5('employes_employee:' || employee_id)::uuid as id,
  
  -- Link to Employes.nl
  employee_id as employes_id,
  
  -- Extract personal data from latest snapshot
  TRIM(CONCAT(
    api_response->>'first_name',
    ' ',
    api_response->>'surname'
  )) as full_name,
  
  -- Contact information
  api_response->>'email' as email,
  COALESCE(api_response->>'mobile', api_response->>'phone') as phone_number,
  
  -- Personal details
  (api_response->>'date_of_birth')::date as birth_date,
  api_response->>'gender' as gender,
  api_response->>'nationality' as nationality,
  
  -- Address
  CONCAT_WS(' ',
    api_response->>'street_name',
    api_response->>'house_number'
  ) as address,
  api_response->>'zipcode' as zipcode,
  api_response->>'city' as city,
  api_response->>'country_code' as country,
  
  -- Employment basics
  api_response->>'department' as department,
  api_response->>'position' as role,
  api_response->>'status' as status,
  api_response->>'location' as location,
  
  -- Temporal tracking
  effective_from,
  effective_to,
  collected_at as last_sync_at,
  collected_at as created_at,
  collected_at as updated_at

FROM employes_raw_data
WHERE endpoint = '/employee'
  AND is_latest = true
ORDER BY full_name;

-- Grant access to staff view
GRANT SELECT ON staff TO authenticated;
GRANT SELECT ON staff TO service_role;

COMMENT ON VIEW staff IS 'Staff view pulling from employes_raw_data - automatically reflects latest synced data';

-- ============================================================================
-- STEP 15: CREATE DATA QUALITY MONITORING VIEW
-- ============================================================================

CREATE VIEW data_quality_metrics AS
SELECT
  'employes_raw_data' as table_name,
  COUNT(DISTINCT employee_id) as unique_employees,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE is_latest = true) as latest_records,
  COUNT(*) FILTER (WHERE effective_from IS NOT NULL) as records_with_effective_from,
  COUNT(*) FILTER (WHERE confidence_score < 1.0) as low_confidence_records,
  MIN(collected_at) as earliest_collection,
  MAX(collected_at) as latest_collection
FROM employes_raw_data

UNION ALL

SELECT
  'employes_changes' as table_name,
  COUNT(DISTINCT employee_id) as unique_employees,
  COUNT(*) as total_records,
  COUNT(*) FILTER (WHERE validation_status = 'confirmed') as confirmed_records,
  COUNT(*) FILTER (WHERE validation_status = 'suspicious') as suspicious_records,
  COUNT(*) FILTER (WHERE confidence_score < 1.0) as low_confidence_records,
  MIN(detected_at) as earliest_detection,
  MAX(detected_at) as latest_detection
FROM employes_changes;

GRANT SELECT ON data_quality_metrics TO authenticated;
COMMENT ON VIEW data_quality_metrics IS 'Monitor data quality and completeness';

-- ============================================================================
-- MIGRATION COMPLETE! 🎉
-- ============================================================================

-- Verification queries you can run:
-- SELECT * FROM data_quality_metrics;
-- SELECT * FROM staff LIMIT 5;
-- SELECT COUNT(*) FROM employes_raw_data;
-- SELECT COUNT(*) FROM employes_changes;


