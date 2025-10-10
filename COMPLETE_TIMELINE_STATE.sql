-- =====================================================
-- COMPLETE TIMELINE STATE - Fill NULL Values
-- =====================================================
-- Purpose: Carry forward salary and hours values to create
--          complete employment state snapshots at each event
-- 
-- This script fills NULL salary/hours fields by looking back
-- to the most recent event that had those values
-- =====================================================

DO $$
DECLARE
  v_employee_id UUID;
  v_event RECORD;
  v_latest_salary NUMERIC;
  v_latest_hours NUMERIC;
  v_updated_count INTEGER := 0;
  v_employee_count INTEGER := 0;
BEGIN
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔄 COMPLETING TIMELINE STATE';
  RAISE NOTICE '========================================';
  RAISE NOTICE ' ';
  
  -- Process each employee
  FOR v_employee_id IN 
    SELECT DISTINCT employee_id
    FROM employes_timeline_v2
    ORDER BY employee_id
  LOOP
    -- Reset tracking for this employee
    v_latest_salary := NULL;
    v_latest_hours := NULL;
    
    -- Process events chronologically for this employee
    FOR v_event IN
      SELECT id, event_date, salary_at_event, hours_at_event
      FROM employes_timeline_v2
      WHERE employee_id = v_employee_id
      ORDER BY event_date ASC, created_at ASC
    LOOP
      
      -- Update salary if NULL (carry forward from previous)
      IF v_event.salary_at_event IS NULL AND v_latest_salary IS NOT NULL THEN
        UPDATE employes_timeline_v2
        SET salary_at_event = v_latest_salary
        WHERE id = v_event.id;
        
        v_updated_count := v_updated_count + 1;
      END IF;
      
      -- Update hours if NULL (carry forward from previous)
      IF v_event.hours_at_event IS NULL AND v_latest_hours IS NOT NULL THEN
        UPDATE employes_timeline_v2
        SET hours_at_event = v_latest_hours
        WHERE id = v_event.id;
        
        v_updated_count := v_updated_count + 1;
      END IF;
      
      -- Track latest values for next iteration
      IF v_event.salary_at_event IS NOT NULL THEN
        v_latest_salary := v_event.salary_at_event;
      END IF;
      
      IF v_event.hours_at_event IS NOT NULL THEN
        v_latest_hours := v_event.hours_at_event;
      END IF;
      
    END LOOP;
    
    v_employee_count := v_employee_count + 1;
    
  END LOOP;
  
  RAISE NOTICE ' ';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ COMPLETION COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Employees processed: %', v_employee_count;
  RAISE NOTICE 'Fields updated: %', v_updated_count;
  RAISE NOTICE ' ';
  
END $$;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Check completeness
DO $$
DECLARE
  v_total_events INTEGER;
  v_events_with_salary INTEGER;
  v_events_with_hours INTEGER;
  v_events_with_both INTEGER;
  v_salary_pct NUMERIC;
  v_hours_pct NUMERIC;
  v_both_pct NUMERIC;
BEGIN
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 VERIFICATION';
  RAISE NOTICE '========================================';
  
  SELECT COUNT(*) INTO v_total_events FROM employes_timeline_v2;
  
  SELECT COUNT(*) INTO v_events_with_salary 
  FROM employes_timeline_v2 
  WHERE salary_at_event IS NOT NULL;
  
  SELECT COUNT(*) INTO v_events_with_hours 
  FROM employes_timeline_v2 
  WHERE hours_at_event IS NOT NULL;
  
  SELECT COUNT(*) INTO v_events_with_both
  FROM employes_timeline_v2
  WHERE salary_at_event IS NOT NULL AND hours_at_event IS NOT NULL;
  
  v_salary_pct := ROUND(100.0 * v_events_with_salary / NULLIF(v_total_events, 0), 1);
  v_hours_pct := ROUND(100.0 * v_events_with_hours / NULLIF(v_total_events, 0), 1);
  v_both_pct := ROUND(100.0 * v_events_with_both / NULLIF(v_total_events, 0), 1);
  
  RAISE NOTICE ' ';
  RAISE NOTICE '📊 COMPLETENESS STATS:';
  RAISE NOTICE '   Total events: %', v_total_events;
  RAISE NOTICE '   Events with salary: % (%)', v_events_with_salary, v_salary_pct || '%';
  RAISE NOTICE '   Events with hours: % (%)', v_events_with_hours, v_hours_pct || '%';
  RAISE NOTICE '   Events with BOTH: % (%)', v_events_with_both, v_both_pct || '%';
  RAISE NOTICE ' ';
  
  IF v_both_pct >= 80 THEN
    RAISE NOTICE '✅ SUCCESS! Timeline state is % complete!', v_both_pct || '%';
  ELSE
    RAISE NOTICE '⚠️  WARNING: Only % of events have complete state', v_both_pct || '%';
  END IF;
  
END $$;

-- Sample data check
SELECT 
  'SAMPLE COMPLETE EVENTS' as report,
  event_type,
  TO_CHAR(event_date, 'YYYY-MM-DD') as date,
  salary_at_event as salary,
  hours_at_event as hours
FROM employes_timeline_v2
WHERE salary_at_event IS NOT NULL 
  AND hours_at_event IS NOT NULL
ORDER BY event_date DESC
LIMIT 10;

-- Final message
DO $$
BEGIN
  RAISE NOTICE ' ';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🎉 STATE COMPLETION FINISHED!';
  RAISE NOTICE '========================================';
END $$;

