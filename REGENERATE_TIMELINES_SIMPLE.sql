-- =====================================================
-- SIMPLE TIMELINE REGENERATION
-- =====================================================
-- Clean, simple 50-line script for daily use
-- No complex validation, just regenerate timelines!
-- =====================================================

DO $$
DECLARE
  v_employee_id UUID;
  v_total_events INTEGER := 0;
  v_events INTEGER;
  v_employee_count INTEGER := 0;
BEGIN
  
  RAISE NOTICE 'Regenerating timelines for all employees...';
  
  -- Process all employees
  FOR v_employee_id IN 
    SELECT DISTINCT employee_id
    FROM employes_changes
    WHERE is_duplicate = false
    ORDER BY employee_id
  LOOP
    -- Generate timeline for this employee
    v_events := generate_timeline_v2(v_employee_id);
    v_total_events := v_total_events + v_events;
    v_employee_count := v_employee_count + 1;
  END LOOP;
  
  RAISE NOTICE 'Done! Processed % employees, generated % events', 
    v_employee_count, v_total_events;
    
END $$;

-- Quick stats
SELECT 
  COUNT(*) as total_events,
  COUNT(DISTINCT employee_id) as employees,
  COUNT(salary_at_event) as events_with_salary,
  COUNT(hours_at_event) as events_with_hours
FROM employes_timeline_v2;

