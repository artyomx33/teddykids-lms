-- =====================================================
-- MIGRATION: Fix Duplicate Changes
-- Created: 2025-10-06
-- Purpose: Add tracking columns and mark duplicates
-- Philosophy: Never delete, only mark
-- =====================================================

BEGIN;

-- =====================================================
-- 1. ADD TRACKING COLUMNS
-- =====================================================

ALTER TABLE employes_changes 
ADD COLUMN IF NOT EXISTS sync_session_id UUID REFERENCES employes_sync_sessions(id),
ADD COLUMN IF NOT EXISTS is_duplicate BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS duplicate_of UUID REFERENCES employes_changes(id),
ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_sync_session_id UUID;

-- =====================================================
-- 2. MARK DUPLICATES (Keep First, Mark Rest)
-- =====================================================

-- Create temporary table with row numbers
CREATE TEMP TABLE duplicate_analysis AS
SELECT 
  id,
  employee_id,
  effective_date,
  change_type,
  field_name,
  COALESCE(old_value::text, '') as old_val,
  COALESCE(new_value::text, '') as new_val,
  detected_at,
  ROW_NUMBER() OVER (
    PARTITION BY 
      employee_id, 
      effective_date, 
      change_type, 
      field_name,
      COALESCE(old_value::text, ''),
      COALESCE(new_value::text, '')
    ORDER BY detected_at ASC
  ) as rn
FROM employes_changes;

-- Mark duplicates (keep first occurrence)
UPDATE employes_changes ec
SET 
  is_duplicate = true,
  duplicate_of = first_record.id
FROM duplicate_analysis da
JOIN duplicate_analysis first_record 
  ON first_record.employee_id = da.employee_id
  AND first_record.effective_date = da.effective_date
  AND first_record.change_type = da.change_type
  AND first_record.field_name = da.field_name
  AND first_record.old_val = da.old_val
  AND first_record.new_val = da.new_val
  AND first_record.rn = 1
WHERE ec.id = da.id 
  AND da.rn > 1;

-- =====================================================
-- 3. CREATE INDEXES
-- =====================================================

-- Index for filtering out duplicates
CREATE INDEX IF NOT EXISTS idx_changes_not_duplicate 
  ON employes_changes(employee_id, effective_date DESC) 
  WHERE is_duplicate = false;

-- Index for finding duplicates (admin/debugging)
CREATE INDEX IF NOT EXISTS idx_changes_duplicate 
  ON employes_changes(duplicate_of) 
  WHERE is_duplicate = true;

-- Index for session tracking
CREATE INDEX IF NOT EXISTS idx_changes_session 
  ON employes_changes(sync_session_id);

-- =====================================================
-- 4. CREATE HELPER VIEW
-- =====================================================

-- View for clean changes (no duplicates)
CREATE OR REPLACE VIEW v_employes_changes_clean AS
SELECT 
  id,
  employee_id,
  change_type,
  field_name,
  effective_date,
  old_value,
  new_value,
  change_amount,
  change_percent,
  business_impact,
  metadata,
  detected_at,
  sync_session_id
FROM employes_changes
WHERE is_duplicate = false
ORDER BY employee_id, effective_date DESC;

-- Grant permissions
GRANT SELECT ON v_employes_changes_clean TO authenticated;

-- =====================================================
-- 5. STATISTICS
-- =====================================================

DO $$
DECLARE
  total_changes INTEGER;
  duplicate_count INTEGER;
  clean_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_changes FROM employes_changes;
  SELECT COUNT(*) INTO duplicate_count FROM employes_changes WHERE is_duplicate = true;
  SELECT COUNT(*) INTO clean_count FROM employes_changes WHERE is_duplicate = false;
  
  RAISE NOTICE 'DUPLICATE FIX COMPLETE';
  RAISE NOTICE 'Total changes: %', total_changes;
  RAISE NOTICE 'Duplicates marked: %', duplicate_count;
  RAISE NOTICE 'Clean changes: %', clean_count;
  IF total_changes > 0 THEN
    RAISE NOTICE 'Duplicate rate: % percent', ROUND(100.0 * duplicate_count / total_changes, 2);
  END IF;
END $$;

COMMIT;

-- =====================================================
-- SUCCESS!
-- =====================================================
