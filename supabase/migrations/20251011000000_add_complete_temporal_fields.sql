-- =====================================================
-- ADD COMPLETE TEMPORAL STATE FIELDS
-- =====================================================
-- Extends employes_timeline_v2 to store complete employment
-- state at each event (not just salary and hours)
-- =====================================================

-- Add ALL complete state fields
ALTER TABLE employes_timeline_v2 
ADD COLUMN IF NOT EXISTS role_at_event TEXT,
ADD COLUMN IF NOT EXISTS department_at_event TEXT,
ADD COLUMN IF NOT EXISTS contract_type_at_event TEXT,
ADD COLUMN IF NOT EXISTS employment_type_at_event TEXT,
ADD COLUMN IF NOT EXISTS contract_start_date DATE,
ADD COLUMN IF NOT EXISTS contract_end_date DATE,
ADD COLUMN IF NOT EXISTS contract_phase TEXT;

-- Add helpful comments
COMMENT ON COLUMN employes_timeline_v2.role_at_event IS 'Job title/function at this event (e.g., Pedagogisch medewerker)';
COMMENT ON COLUMN employes_timeline_v2.department_at_event IS 'Department/location at this event (e.g., Teddy Ouderkerk)';
COMMENT ON COLUMN employes_timeline_v2.contract_type_at_event IS 'Contract type: definite (fixed-term) or indefinite (permanent)';
COMMENT ON COLUMN employes_timeline_v2.employment_type_at_event IS 'Employment type: fulltime, parttime, or on_call';
COMMENT ON COLUMN employes_timeline_v2.contract_start_date IS 'Contract start date';
COMMENT ON COLUMN employes_timeline_v2.contract_end_date IS 'Contract end date (NULL for indefinite contracts)';
COMMENT ON COLUMN employes_timeline_v2.contract_phase IS 'Contract phase: active, ended, pending';

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_timeline_contract_type ON employes_timeline_v2(contract_type_at_event);
CREATE INDEX IF NOT EXISTS idx_timeline_employment_type ON employes_timeline_v2(employment_type_at_event);
CREATE INDEX IF NOT EXISTS idx_timeline_role ON employes_timeline_v2(role_at_event);
CREATE INDEX IF NOT EXISTS idx_timeline_department ON employes_timeline_v2(department_at_event);
CREATE INDEX IF NOT EXISTS idx_timeline_contract_end ON employes_timeline_v2(contract_end_date) WHERE contract_end_date IS NOT NULL;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Complete temporal state fields added to employes_timeline_v2!';
  RAISE NOTICE '   - role_at_event';
  RAISE NOTICE '   - department_at_event';
  RAISE NOTICE '   - contract_type_at_event';
  RAISE NOTICE '   - employment_type_at_event';
  RAISE NOTICE '   - contract_start_date';
  RAISE NOTICE '   - contract_end_date';
  RAISE NOTICE '   - contract_phase';
  RAISE NOTICE ' ';
  RAISE NOTICE '📋 7 columns added successfully!';
END $$;

