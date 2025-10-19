-- =====================================================
-- RUN STAFF MANAGEMENT FIXES MIGRATIONS
-- =====================================================
-- Run this in Supabase SQL Editor
-- Combines both migrations for easy execution
-- =====================================================

-- MIGRATION 1: Create employee_info table
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

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON employee_info TO authenticated;

-- Trigger
CREATE TRIGGER update_employee_info_updated_at
  BEFORE UPDATE ON employee_info
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create VIEW
CREATE OR REPLACE VIEW staff_with_lms_data AS
SELECT 
  s.*,
  ei.assigned_location as lms_location,
  ei.is_intern,
  ei.intern_year,
  ei.custom_role,
  ei.notes as lms_notes,
  ei.tags as lms_tags,
  ei.updated_at as lms_updated_at
FROM staff s
LEFT JOIN employee_info ei ON s.id = ei.staff_id;

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 1: employee_info table created';
END $$;

-- MIGRATION 2: Add manual timeline event support
-- =====================================================

ALTER TABLE employes_timeline_v2 
ADD COLUMN IF NOT EXISTS is_manual BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS manual_notes TEXT,
ADD COLUMN IF NOT EXISTS contract_pdf_path TEXT,
ADD COLUMN IF NOT EXISTS created_by UUID;

DO $$ BEGIN
  RAISE NOTICE '✅ Migration 2: Manual timeline columns added';
END $$;

-- MIGRATION 3: Add RLS policies for manual timeline events
-- =====================================================
-- Note: PostgreSQL doesn't support IF NOT EXISTS for policies
-- Using DO blocks with exception handling instead

DO $$ 
BEGIN
  -- Allow authenticated users to insert manual events
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'employes_timeline_v2' 
    AND policyname = 'Allow authenticated users to insert manual timeline events'
  ) THEN
    CREATE POLICY "Allow authenticated users to insert manual timeline events"
    ON employes_timeline_v2
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
  END IF;
  
  -- Allow authenticated users to read timeline events
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'employes_timeline_v2' 
    AND policyname = 'Allow authenticated users to read timeline events'
  ) THEN
    CREATE POLICY "Allow authenticated users to read timeline events"
    ON employes_timeline_v2
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
  
  -- Allow authenticated users to update their manual events
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'employes_timeline_v2' 
    AND policyname = 'Allow authenticated users to update manual timeline events'
  ) THEN
    CREATE POLICY "Allow authenticated users to update manual timeline events"
    ON employes_timeline_v2
    FOR UPDATE
    TO authenticated
    USING (is_manual = true)
    WITH CHECK (is_manual = true);
  END IF;

  RAISE NOTICE '✅ Migration 3: RLS policies configured (skipped if already exist)';
END $$;

-- VERIFICATION
-- =====================================================

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 ALL MIGRATIONS COMPLETE!';
  RAISE NOTICE '';
  RAISE NOTICE '✅ employee_info table ready';
  RAISE NOTICE '✅ staff_with_lms_data VIEW ready';
  RAISE NOTICE '✅ Manual timeline events ready';
  RAISE NOTICE '✅ RLS policies configured';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 Test with:';
  RAISE NOTICE '   SELECT * FROM staff_with_lms_data LIMIT 5;';
  RAISE NOTICE '   SELECT COUNT(*) FROM employee_info;';
  RAISE NOTICE '   SELECT * FROM employes_timeline_v2 WHERE is_manual = true;';
END $$;

