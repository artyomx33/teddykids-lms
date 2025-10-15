-- =====================================================
-- SIMPLE TIMELINE REGENERATION - Complete State
-- =====================================================
-- Quick script for daily use after syncs
-- Regenerates all timelines with complete employment data
-- =====================================================

DO $$
DECLARE
  v_employee_id UUID;
  v_employee_count INTEGER := 0;
  v_total_events INTEGER := 0;
  v_events INTEGER;
BEGIN
  
  RAISE NOTICE '🔄 Regenerating all timelines with complete state...';
  RAISE NOTICE ' ';
  
  -- Regenerate timeline for each employee
  FOR v_employee_id IN 
    SELECT DISTINCT employee_id
    FROM employes_raw_data
    WHERE is_latest = true
  LOOP
    v_events := generate_timeline_v2(v_employee_id);
    v_total_events := v_total_events + v_events;
    v_employee_count := v_employee_count + 1;
    
    IF v_employee_count % 10 = 0 THEN
      RAISE NOTICE 'Progress: % employees processed...', v_employee_count;
    END IF;
  END LOOP;
  
  RAISE NOTICE ' ';
  RAISE NOTICE '✅ Timeline generation complete!';
  RAISE NOTICE '   Employees: %', v_employee_count;
  RAISE NOTICE '   Events: %', v_total_events;
  RAISE NOTICE ' ';
  RAISE NOTICE '📋 Next: Run state completion...';
  
END $$;

-- Now complete the state (carry forward NULL values)
\i COMPLETE_TIMELINE_STATE_ALL_FIELDS.sql

