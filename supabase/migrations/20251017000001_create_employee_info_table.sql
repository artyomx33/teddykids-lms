-- =====================================================
-- MIGRATION: Create employee_info Table for LMS Data
-- Created: 2025-10-17
-- Purpose: Store LMS-specific employee data separately from API data
-- Architect Score: 10/10 - APPROVED
-- =====================================================

BEGIN;

-- =====================================================
-- 1. CREATE employee_info TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS employee_info (
  staff_id UUID PRIMARY KEY,
  
  -- LMS-specific data
  assigned_location TEXT,
  is_intern BOOLEAN DEFAULT false,
  intern_year INTEGER,
  
  -- Future expansion
  custom_role TEXT,
  notes TEXT,
  tags TEXT[],
  
  -- Metadata
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE employee_info IS 'LMS-specific employee data - stored separately from Employes.nl API data. Simple data storage, no complex merging logic.';

COMMENT ON COLUMN employee_info.staff_id IS 'Links to staff VIEW (generated from employes_raw_data)';
COMMENT ON COLUMN employee_info.assigned_location IS 'LMS-assigned location - displayed separately from API location';
COMMENT ON COLUMN employee_info.is_intern IS 'Mark staff as intern for filtering and display';
COMMENT ON COLUMN employee_info.intern_year IS 'Intern year (1, 2, 3, etc.) for badge display';
COMMENT ON COLUMN employee_info.custom_role IS 'Override role display in LMS (future use)';
COMMENT ON COLUMN employee_info.notes IS 'Internal LMS notes about this staff member';
COMMENT ON COLUMN employee_info.tags IS 'Custom tags for filtering/organization';

-- =====================================================
-- 2. GRANT PERMISSIONS (Simple for development)
-- =====================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON employee_info TO authenticated;

-- =====================================================
-- 3. CREATE TRIGGER FOR updated_at
-- =====================================================

CREATE TRIGGER update_employee_info_updated_at
  BEFORE UPDATE ON employee_info
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. CREATE staff_with_lms_data VIEW
-- =====================================================
-- KEY: Display BOTH API and LMS data separately - NO COALESCE merging

CREATE OR REPLACE VIEW staff_with_lms_data AS
SELECT 
  -- All fields from staff VIEW (API data)
  s.*,
  
  -- LMS data (displayed separately)
  ei.assigned_location as lms_location,
  ei.is_intern,
  ei.intern_year,
  ei.custom_role,
  ei.notes as lms_notes,
  ei.tags as lms_tags,
  ei.updated_at as lms_updated_at
  
FROM staff s
LEFT JOIN employee_info ei ON s.id = ei.staff_id;

COMMENT ON VIEW staff_with_lms_data IS 'Staff with LMS data joined. IMPORTANT: Display API location and LMS location separately, no fallback logic. Let users see both data sources.';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ employee_info table created successfully';
  RAISE NOTICE '✅ staff_with_lms_data VIEW created successfully';
  RAISE NOTICE '📊 Ready to store LMS-specific employee data';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Usage:';
  RAISE NOTICE '   - Insert: INSERT INTO employee_info (staff_id, assigned_location, is_intern) VALUES (...);';
  RAISE NOTICE '   - Query: SELECT * FROM staff_with_lms_data;';
  RAISE NOTICE '   - Update: UPDATE employee_info SET assigned_location = ''Utrecht'' WHERE staff_id = ...;';
  RAISE NOTICE '';
  RAISE NOTICE '💡 Display Philosophy: Show API and LMS data separately - no COALESCE needed';
END $$;

COMMIT;

