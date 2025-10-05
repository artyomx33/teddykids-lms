-- =====================================================
-- MIGRATION: Auto-Generate Timeline on Query
-- Created: 2025-10-06
-- Purpose: Generate timeline for any employee on-demand
-- =====================================================

BEGIN;

-- =====================================================
-- 1. GENERATE TIMELINE FOR ALL EMPLOYEES
-- =====================================================

DO $$
DECLARE
  v_employee_id UUID;
  v_total INTEGER := 0;
  v_events INTEGER;
BEGIN
  RAISE NOTICE 'Generating timeline for ALL employees...';
  
  -- Process ALL employees with changes (not just 5)
  FOR v_employee_id IN 
    SELECT DISTINCT employee_id::UUID
    FROM employes_changes
    WHERE is_duplicate = false
  LOOP
    v_events := generate_timeline_v2(v_employee_id);
    v_total := v_total + v_events;
    
    IF v_events > 0 THEN
      RAISE NOTICE 'Employee %: % events', v_employee_id, v_events;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Complete! Generated % total events', v_total;
END $$;

-- =====================================================
-- 2. CREATE AUTO-TRIGGER FOR NEW CHANGES
-- =====================================================

CREATE OR REPLACE FUNCTION auto_generate_timeline_on_change()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new change is inserted, regenerate timeline for that employee
  IF NEW.is_duplicate = false THEN
    PERFORM generate_timeline_v2(NEW.employee_id::UUID);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_auto_generate_timeline ON employes_changes;

-- Create trigger
CREATE TRIGGER trigger_auto_generate_timeline
  AFTER INSERT ON employes_changes
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_timeline_on_change();

COMMIT;

-- =====================================================
-- SUCCESS!
-- =====================================================
