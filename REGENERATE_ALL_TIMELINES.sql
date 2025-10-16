-- =====================================================
-- REGENERATE ALL TIMELINES - Clean Version
-- =====================================================

DO $$
DECLARE
  v_employee_id UUID;
  v_total_events INTEGER := 0;
  v_events INTEGER;
  v_employee_count INTEGER := 0;
BEGIN
  
  RAISE NOTICE 'Starting timeline regeneration for all employees...';
  
  FOR v_employee_id IN 
    SELECT DISTINCT employee_id
    FROM employes_changes
    WHERE is_duplicate = false
    ORDER BY employee_id
  LOOP
    v_events := generate_timeline_v2(v_employee_id);
    v_total_events := v_total_events + v_events;
    v_employee_count := v_employee_count + 1;
    
    -- Progress update every 10 employees
    IF v_employee_count % 10 = 0 THEN
      RAISE NOTICE 'Processed % employees, % events generated so far...', v_employee_count, v_total_events;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'COMPLETE! Processed % employees and generated % total events', v_employee_count, v_total_events;
END $$;

-- =====================================================
-- DATA QUALITY REPORT
-- =====================================================

-- Overall statistics
SELECT 
  'OVERALL STATS' as report_section,
  COUNT(*) as total_events,
  COUNT(salary_at_event) as events_with_salary,
  COUNT(hours_at_event) as events_with_hours,
  ROUND(100.0 * COUNT(salary_at_event) / NULLIF(COUNT(*), 0), 1) as salary_pct,
  ROUND(100.0 * COUNT(hours_at_event) / NULLIF(COUNT(*), 0), 1) as hours_pct
FROM employes_timeline_v2;

-- Breakdown by event type
SELECT 
  'BY EVENT TYPE' as report_section,
  event_type,
  COUNT(*) as total,
  COUNT(salary_at_event) as has_salary,
  COUNT(hours_at_event) as has_hours,
  ROUND(100.0 * COUNT(salary_at_event) / COUNT(*), 1) as salary_pct,
  ROUND(100.0 * COUNT(hours_at_event) / COUNT(*), 1) as hours_pct
FROM employes_timeline_v2
GROUP BY event_type
ORDER BY total DESC;

-- Sample data check
SELECT 
  'SAMPLE EVENTS' as report_section,
  event_type,
  event_date,
  salary_at_event,
  hours_at_event
FROM employes_timeline_v2
WHERE salary_at_event IS NOT NULL OR hours_at_event IS NOT NULL
ORDER BY event_date DESC
LIMIT 10;

-- =====================================================
-- SUCCESS CHECK
-- =====================================================

DO $$
DECLARE
  v_total_changes INTEGER;
  v_total_events INTEGER;
  v_salary_pct NUMERIC;
  v_hours_pct NUMERIC;
BEGIN
  SELECT COUNT(*) INTO v_total_changes FROM employes_changes;
  SELECT COUNT(*) INTO v_total_events FROM employes_timeline_v2;
  
  SELECT ROUND(100.0 * COUNT(salary_at_event) / NULLIF(COUNT(*), 0), 1) 
  INTO v_salary_pct FROM employes_timeline_v2;
  
  SELECT ROUND(100.0 * COUNT(hours_at_event) / NULLIF(COUNT(*), 0), 1) 
  INTO v_hours_pct FROM employes_timeline_v2;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICATION RESULTS:';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Changes in employes_changes: %', v_total_changes;
  RAISE NOTICE 'Events in employes_timeline_v2: %', v_total_events;
  RAISE NOTICE 'Events with salary: %%', v_salary_pct;
  RAISE NOTICE 'Events with hours: %%', v_hours_pct;
  RAISE NOTICE '========================================';
  
  IF v_total_events > 0 AND v_salary_pct > 10 THEN
    RAISE NOTICE 'SUCCESS! Timeline fix is complete!';
    RAISE NOTICE 'Next step: Test in browser (hard refresh: Cmd+Shift+R)';
  ELSE
    RAISE WARNING 'WARNING: Data quality below expected thresholds';
  END IF;
END $$;


