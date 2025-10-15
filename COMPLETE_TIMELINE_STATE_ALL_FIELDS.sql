-- =====================================================
-- COMPLETE TIMELINE STATE - ALL FIELDS
-- =====================================================
-- Carries forward ALL employment fields (not just salary/hours)
-- to create complete temporal state snapshots
-- =====================================================

DO $$
DECLARE
  v_employee_id UUID;
  v_event RECORD;
  v_latest_salary NUMERIC;
  v_latest_hours NUMERIC;
  v_latest_role TEXT;
  v_latest_department TEXT;
  v_latest_contract_type TEXT;
  v_latest_employment_type TEXT;
  v_latest_contract_start DATE;
  v_latest_contract_end DATE;
  v_latest_contract_phase TEXT;
  v_updated_count INTEGER := 0;
  v_employee_count INTEGER := 0;
BEGIN
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔄 COMPLETING TIMELINE STATE (ALL FIELDS)';
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
    v_latest_role := NULL;
    v_latest_department := NULL;
    v_latest_contract_type := NULL;
    v_latest_employment_type := NULL;
    v_latest_contract_start := NULL;
    v_latest_contract_end := NULL;
    v_latest_contract_phase := NULL;
    
    -- Process events chronologically for this employee
    FOR v_event IN
      SELECT id, event_date, 
             salary_at_event, hours_at_event,
             role_at_event, department_at_event,
             contract_type_at_event, employment_type_at_event,
             contract_start_date, contract_end_date, contract_phase
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
      
      -- Update role if NULL (carry forward from previous)
      IF v_event.role_at_event IS NULL AND v_latest_role IS NOT NULL THEN
        UPDATE employes_timeline_v2
        SET role_at_event = v_latest_role
        WHERE id = v_event.id;
        v_updated_count := v_updated_count + 1;
      END IF;
      
      -- Update department if NULL (carry forward from previous)
      IF v_event.department_at_event IS NULL AND v_latest_department IS NOT NULL THEN
        UPDATE employes_timeline_v2
        SET department_at_event = v_latest_department
        WHERE id = v_event.id;
        v_updated_count := v_updated_count + 1;
      END IF;
      
      -- Update contract type if NULL (carry forward from previous)
      IF v_event.contract_type_at_event IS NULL AND v_latest_contract_type IS NOT NULL THEN
        UPDATE employes_timeline_v2
        SET contract_type_at_event = v_latest_contract_type
        WHERE id = v_event.id;
        v_updated_count := v_updated_count + 1;
      END IF;
      
      -- Update employment type if NULL (carry forward from previous)
      IF v_event.employment_type_at_event IS NULL AND v_latest_employment_type IS NOT NULL THEN
        UPDATE employes_timeline_v2
        SET employment_type_at_event = v_latest_employment_type
        WHERE id = v_event.id;
        v_updated_count := v_updated_count + 1;
      END IF;
      
      -- Update contract start date if NULL (carry forward from previous)
      IF v_event.contract_start_date IS NULL AND v_latest_contract_start IS NOT NULL THEN
        UPDATE employes_timeline_v2
        SET contract_start_date = v_latest_contract_start
        WHERE id = v_event.id;
        v_updated_count := v_updated_count + 1;
      END IF;
      
      -- Update contract end date if NULL (carry forward from previous)
      IF v_event.contract_end_date IS NULL AND v_latest_contract_end IS NOT NULL THEN
        UPDATE employes_timeline_v2
        SET contract_end_date = v_latest_contract_end
        WHERE id = v_event.id;
        v_updated_count := v_updated_count + 1;
      END IF;
      
      -- Update contract phase if NULL (carry forward from previous)
      IF v_event.contract_phase IS NULL AND v_latest_contract_phase IS NOT NULL THEN
        UPDATE employes_timeline_v2
        SET contract_phase = v_latest_contract_phase
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
      
      IF v_event.role_at_event IS NOT NULL THEN
        v_latest_role := v_event.role_at_event;
      END IF;
      
      IF v_event.department_at_event IS NOT NULL THEN
        v_latest_department := v_event.department_at_event;
      END IF;
      
      IF v_event.contract_type_at_event IS NOT NULL THEN
        v_latest_contract_type := v_event.contract_type_at_event;
      END IF;
      
      IF v_event.employment_type_at_event IS NOT NULL THEN
        v_latest_employment_type := v_event.employment_type_at_event;
      END IF;
      
      IF v_event.contract_start_date IS NOT NULL THEN
        v_latest_contract_start := v_event.contract_start_date;
      END IF;
      
      IF v_event.contract_end_date IS NOT NULL THEN
        v_latest_contract_end := v_event.contract_end_date;
      END IF;
      
      IF v_event.contract_phase IS NOT NULL THEN
        v_latest_contract_phase := v_event.contract_phase;
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
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
  v_total_events INTEGER;
  v_events_with_salary INTEGER;
  v_events_with_hours INTEGER;
  v_events_with_role INTEGER;
  v_events_with_department INTEGER;
  v_events_with_contract INTEGER;
  v_events_complete INTEGER;
BEGIN
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 COMPLETENESS VERIFICATION';
  RAISE NOTICE '========================================';
  RAISE NOTICE ' ';
  
  SELECT COUNT(*) INTO v_total_events FROM employes_timeline_v2;
  
  SELECT COUNT(*) INTO v_events_with_salary 
  FROM employes_timeline_v2 WHERE salary_at_event IS NOT NULL;
  
  SELECT COUNT(*) INTO v_events_with_hours 
  FROM employes_timeline_v2 WHERE hours_at_event IS NOT NULL;
  
  SELECT COUNT(*) INTO v_events_with_role 
  FROM employes_timeline_v2 WHERE role_at_event IS NOT NULL;
  
  SELECT COUNT(*) INTO v_events_with_department 
  FROM employes_timeline_v2 WHERE department_at_event IS NOT NULL;
  
  SELECT COUNT(*) INTO v_events_with_contract 
  FROM employes_timeline_v2 WHERE contract_type_at_event IS NOT NULL;
  
  SELECT COUNT(*) INTO v_events_complete
  FROM employes_timeline_v2
  WHERE salary_at_event IS NOT NULL
    AND hours_at_event IS NOT NULL
    AND role_at_event IS NOT NULL
    AND department_at_event IS NOT NULL
    AND contract_type_at_event IS NOT NULL;
  
  RAISE NOTICE '📊 FIELD COVERAGE:';
  RAISE NOTICE '   Total events: %', v_total_events;
  RAISE NOTICE '   With salary: % (%)', v_events_with_salary, ROUND(100.0 * v_events_with_salary / v_total_events, 1) || '%';
  RAISE NOTICE '   With hours: % (%)', v_events_with_hours, ROUND(100.0 * v_events_with_hours / v_total_events, 1) || '%';
  RAISE NOTICE '   With role: % (%)', v_events_with_role, ROUND(100.0 * v_events_with_role / v_total_events, 1) || '%';
  RAISE NOTICE '   With department: % (%)', v_events_with_department, ROUND(100.0 * v_events_with_department / v_total_events, 1) || '%';
  RAISE NOTICE '   With contract: % (%)', v_events_with_contract, ROUND(100.0 * v_events_with_contract / v_total_events, 1) || '%';
  RAISE NOTICE ' ';
  RAISE NOTICE '🎯 COMPLETE SNAPSHOTS: % (%)', v_events_complete, ROUND(100.0 * v_events_complete / v_total_events, 1) || '%';
  RAISE NOTICE ' ';
  
END $$;

-- Sample complete events
SELECT 
  'SAMPLE COMPLETE EVENTS' as report,
  event_type,
  TO_CHAR(event_date, 'YYYY-MM-DD') as date,
  salary_at_event,
  hours_at_event,
  role_at_event,
  department_at_event,
  contract_type_at_event,
  employment_type_at_event
FROM employes_timeline_v2
WHERE salary_at_event IS NOT NULL
  AND role_at_event IS NOT NULL
ORDER BY event_date DESC
LIMIT 5;

DO $$
BEGIN
  RAISE NOTICE ' ';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🎉 COMPLETE TEMPORAL STATE READY!';
  RAISE NOTICE '========================================';
  RAISE NOTICE ' ';
  RAISE NOTICE '📋 Next: Check UI to see complete data!';
END $$;

