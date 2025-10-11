-- =====================================================
-- FIX CHANGE TYPE CONSTRAINT
-- =====================================================
-- The employes_changes table has a constraint that only allows
-- 'created', 'updated', 'deleted' but the change detector uses
-- 'salary_change', 'hours_change', 'contract_change'
-- This migration updates the constraint to accept both sets
-- =====================================================

-- Drop the old constraint
ALTER TABLE employes_changes 
DROP CONSTRAINT IF EXISTS employes_changes_change_type_check;

-- Add new constraint with both old and new values
ALTER TABLE employes_changes
ADD CONSTRAINT employes_changes_change_type_check 
CHECK (change_type = ANY (ARRAY[
  'created'::text,
  'updated'::text,
  'deleted'::text,
  'salary_change'::text,
  'hours_change'::text,
  'contract_change'::text,
  'position_change'::text,
  'location_change'::text
]));

-- Add helpful comment
COMMENT ON CONSTRAINT employes_changes_change_type_check ON employes_changes IS 
'Allows both generic change types (created/updated/deleted) and specific employment change types (salary_change, hours_change, contract_change, etc.)';

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '✅ Change type constraint updated to accept salary_change, hours_change, contract_change';
END $$;

