-- =====================================================
-- COMPLETE FIX EXECUTION SCRIPT
-- Run this in Supabase SQL Editor after change detector
-- =====================================================

-- STEP 1: Verify employes_changes has data
-- Expected: 244 total rows
SELECT 
  '📊 STEP 1: Verify employes_changes population' as step,
  COUNT(*) as total_changes,
  COUNT(CASE WHEN change_type = 'salary_change' THEN 1 END) as salary_changes,
  COUNT(CASE WHEN change_type = 'hours_change' THEN 1 END) as hours_changes,
  COUNT(CASE WHEN change_type = 'contract_change' THEN 1 END) as contract_changes
FROM employes_changes;

-- If total_changes = 0, STOP and re-run change detector!
-- If total_changes = 244, continue below:

-- =====================================================
-- STEP 2: Regenerate ALL timelines
-- =====================================================

DO $$
DECLARE
  v_employee_id UUID;
  v_total_events INTEGER := 0;
  v_events INTEGER;
  v_employee_count INTEGER := 0;
BEGIN
  RAISE NOTICE ' ';
  RAISE NOTICE '🚀 =====================================================';
  RAISE NOTICE '🚀 REGENERATING TIMELINES FOR ALL EMPLOYEES';
  RAISE NOTICE '🚀 =====================================================';
  RAISE NOTICE ' ';
  
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
      RAISE NOTICE '  ✅ Processed % employees, % events generated...', v_employee_count, v_total_events;
    END IF;
  END LOOP;
  
  RAISE NOTICE ' ';
  RAISE NOTICE '🎉 =====================================================';
  RAISE NOTICE '🎉 TIMELINE REGENERATION COMPLETE!';
  RAISE NOTICE '🎉 =====================================================';
  RAISE NOTICE '  📊 Employees processed: %', v_employee_count;
  RAISE NOTICE '  📊 Total events generated: %', v_total_events;
  RAISE NOTICE ' ';
END $$;

-- =====================================================
-- STEP 3: DATA QUALITY REPORT
-- =====================================================

-- 3.1: Overall timeline statistics
SELECT 
  '📊 STEP 3.1: Overall timeline statistics' as report_section,
  COUNT(*) as total_events,
  COUNT(salary_at_event) as events_with_salary,
  COUNT(hours_at_event) as events_with_hours,
  ROUND(100.0 * COUNT(salary_at_event) / NULLIF(COUNT(*), 0), 1) as salary_pct,
  ROUND(100.0 * COUNT(hours_at_event) / NULLIF(COUNT(*), 0), 1) as hours_pct
FROM employes_timeline_v2;

-- 3.2: Breakdown by event type
SELECT 
  '📊 STEP 3.2: Breakdown by event type' as report_section,
  event_type,
  COUNT(*) as total,
  COUNT(salary_at_event) as has_salary,
  COUNT(hours_at_event) as has_hours,
  ROUND(100.0 * COUNT(salary_at_event) / COUNT(*), 1) as salary_pct,
  ROUND(100.0 * COUNT(hours_at_event) / COUNT(*), 1) as hours_pct
FROM employes_timeline_v2
GROUP BY event_type
ORDER BY total DESC;

-- 3.3: Sample data check (first 5 events with salary/hours)
SELECT 
  '📊 STEP 3.3: Sample events with data' as report_section,
  event_type,
  event_date,
  salary_at_event,
  hours_at_event,
  previous_value->>'monthly_wage' as prev_monthly,
  new_value->>'monthly_wage' as new_monthly
FROM employes_timeline_v2
WHERE salary_at_event IS NOT NULL OR hours_at_event IS NOT NULL
ORDER BY event_date DESC
LIMIT 5;

-- =====================================================
-- SUCCESS CRITERIA CHECK
-- =====================================================

DO $$
DECLARE
  v_total_changes INTEGER;
  v_total_events INTEGER;
  v_salary_pct NUMERIC;
  v_hours_pct NUMERIC;
  v_success BOOLEAN := true;
BEGIN
  -- Check 1: employes_changes has data
  SELECT COUNT(*) INTO v_total_changes FROM employes_changes;
  IF v_total_changes = 0 THEN
    RAISE WARNING '❌ FAIL: employes_changes is empty! Need to run change detector.';
    v_success := false;
  ELSE
    RAISE NOTICE '✅ PASS: employes_changes has % rows', v_total_changes;
  END IF;
  
  -- Check 2: timeline has events
  SELECT COUNT(*) INTO v_total_events FROM employes_timeline_v2;
  IF v_total_events = 0 THEN
    RAISE WARNING '❌ FAIL: employes_timeline_v2 is empty!';
    v_success := false;
  ELSE
    RAISE NOTICE '✅ PASS: employes_timeline_v2 has % events', v_total_events;
  END IF;
  
  -- Check 3: salary data populated
  SELECT ROUND(100.0 * COUNT(salary_at_event) / NULLIF(COUNT(*), 0), 1) 
  INTO v_salary_pct FROM employes_timeline_v2;
  IF v_salary_pct < 10 THEN
    RAISE WARNING '❌ FAIL: Only %.1% of events have salary data', v_salary_pct;
    v_success := false;
  ELSE
    RAISE NOTICE '✅ PASS: %.1% of events have salary data', v_salary_pct;
  END IF;
  
  -- Check 4: hours data populated
  SELECT ROUND(100.0 * COUNT(hours_at_event) / NULLIF(COUNT(*), 0), 1) 
  INTO v_hours_pct FROM employes_timeline_v2;
  IF v_hours_pct < 5 THEN
    RAISE WARNING '❌ FAIL: Only %.1% of events have hours data', v_hours_pct;
    v_success := false;
  ELSE
    RAISE NOTICE '✅ PASS: %.1% of events have hours data', v_hours_pct;
  END IF;
  
  -- Final verdict
  IF v_success THEN
    RAISE NOTICE ' ';
    RAISE NOTICE '🎉 =====================================================';
    RAISE NOTICE '🎉 ALL CHECKS PASSED! TIMELINE FIX COMPLETE!';
    RAISE NOTICE '🎉 =====================================================';
    RAISE NOTICE '  📋 Next step: Test in browser (hard refresh: Cmd+Shift+R)';
    RAISE NOTICE ' ';
  ELSE
    RAISE WARNING ' ';
    RAISE WARNING '❌ =====================================================';
    RAISE WARNING '❌ SOME CHECKS FAILED - REVIEW ABOVE';
    RAISE WARNING '❌ =====================================================';
    RAISE WARNING ' ';
  END IF;
END $$;

