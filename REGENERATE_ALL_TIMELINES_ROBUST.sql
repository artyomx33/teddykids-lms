-- =====================================================
-- BULLETPROOF TIMELINE REGENERATION SCRIPT
-- =====================================================
-- Combined best practices from both analysis:
-- ✅ Transaction safety (rollback on failure)
-- ✅ NULL-safe metadata extraction
-- ✅ Pre-flight validation
-- ✅ Continue-on-failure error handling
-- ✅ Enhanced progress reporting
-- ✅ Comprehensive quality checks
-- =====================================================

-- =====================================================
-- PHASE 1: PRE-FLIGHT VALIDATION
-- =====================================================

DO $$
DECLARE
  v_changes_count INTEGER;
  v_metadata_valid INTEGER;
  v_function_exists BOOLEAN;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '🚀 PHASE 1: PRE-FLIGHT VALIDATION';
  RAISE NOTICE '========================================';
  
  -- Check 1: Verify employes_changes has data
  SELECT COUNT(*) INTO v_changes_count FROM employes_changes WHERE is_duplicate = false;
  
  IF v_changes_count = 0 THEN
    RAISE EXCEPTION '❌ FAILED: employes_changes table is empty!';
  END IF;
  
  RAISE NOTICE '✅ CHECK 1: employes_changes has % rows', v_changes_count;
  
  -- Check 2: Verify metadata fields have valid data
  SELECT COUNT(*) INTO v_metadata_valid 
  FROM employes_changes
  WHERE is_duplicate = false
    AND metadata IS NOT NULL
    AND (
      (metadata->>'new_monthly' IS NOT NULL AND metadata->>'new_monthly' ~ '^\d+(\.\d+)?$')
      OR (metadata->>'new_hours' IS NOT NULL AND metadata->>'new_hours' ~ '^\d+(\.\d+)?$')
      OR change_type = 'contract_change'
    );
  
  RAISE NOTICE '✅ CHECK 2: % changes have valid metadata', v_metadata_valid;
  
  -- Check 3: Verify generate_timeline_v2 function exists
  SELECT EXISTS(
    SELECT 1 FROM pg_proc 
    WHERE proname = 'generate_timeline_v2'
  ) INTO v_function_exists;
  
  IF NOT v_function_exists THEN
    RAISE EXCEPTION '❌ FAILED: generate_timeline_v2 function does not exist!';
  END IF;
  
  RAISE NOTICE '✅ CHECK 3: generate_timeline_v2 function exists';
  
  -- Check 4: Verify employes_timeline_v2 table is accessible
  PERFORM 1 FROM employes_timeline_v2 LIMIT 1;
  
  RAISE NOTICE '✅ CHECK 4: employes_timeline_v2 table is accessible';
  RAISE NOTICE ' ';
  RAISE NOTICE '🎯 All pre-flight checks PASSED!';
  RAISE NOTICE '========================================';
  RAISE NOTICE ' ';
  
END $$;

-- =====================================================
-- PHASE 2: REGENERATE TIMELINES (WITH TRANSACTION)
-- =====================================================

DO $$
DECLARE
  v_employee_id UUID;
  v_total_events INTEGER := 0;
  v_events INTEGER;
  v_employee_count INTEGER := 0;
  v_failed_count INTEGER := 0;
  v_start_time TIMESTAMP := clock_timestamp();
  v_failed_employees UUID[] := ARRAY[]::UUID[];
  v_salary_count INTEGER := 0;
  v_hours_count INTEGER := 0;
BEGIN
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔄 PHASE 2: REGENERATING TIMELINES';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Starting timeline regeneration...';
  RAISE NOTICE ' ';
  
  -- Process each employee with error handling
  FOR v_employee_id IN 
    SELECT DISTINCT employee_id
    FROM employes_changes
    WHERE is_duplicate = false
    ORDER BY employee_id
  LOOP
    BEGIN
      -- Call the timeline generator for this employee
      v_events := generate_timeline_v2(v_employee_id);
      v_total_events := v_total_events + v_events;
      v_employee_count := v_employee_count + 1;
      
      -- Count salary/hours coverage (quick sample check)
      IF v_events > 0 THEN
        SELECT 
          COUNT(CASE WHEN salary_at_event IS NOT NULL THEN 1 END),
          COUNT(CASE WHEN hours_at_event IS NOT NULL THEN 1 END)
        INTO v_salary_count, v_hours_count
        FROM employes_timeline_v2
        WHERE employee_id = v_employee_id;
      END IF;
      
      -- Progress update every 5 employees
      IF v_employee_count % 5 = 0 THEN
        DECLARE
          v_elapsed INTERVAL := clock_timestamp() - v_start_time;
          v_rate NUMERIC := ROUND(v_employee_count::NUMERIC / EXTRACT(EPOCH FROM v_elapsed), 1);
        BEGIN
          RAISE NOTICE '📊 Progress: % employees processed, % events generated (% employees/sec)', 
            v_employee_count, v_total_events, v_rate;
        END;
      END IF;
      
    EXCEPTION WHEN OTHERS THEN
      -- Log error but continue processing
      v_failed_count := v_failed_count + 1;
      v_failed_employees := array_append(v_failed_employees, v_employee_id);
      RAISE WARNING '⚠️  Failed to process employee %: %', v_employee_id, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE ' ';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ PHASE 2 COMPLETE!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 Employees processed: %', v_employee_count;
  RAISE NOTICE '📊 Total events generated: %', v_total_events;
  RAISE NOTICE '📊 Failed employees: %', v_failed_count;
  
  IF v_failed_count > 0 THEN
    RAISE NOTICE '⚠️  Failed employee IDs: %', v_failed_employees;
  END IF;
  
  -- Calculate success rate
  DECLARE
    v_success_rate NUMERIC := ROUND(100.0 * (v_employee_count - v_failed_count) / NULLIF(v_employee_count, 0), 1);
  BEGIN
    RAISE NOTICE '📊 Success rate: %', v_success_rate || '%';
    
    -- Fail if success rate too low
    IF v_success_rate < 80 THEN
      RAISE EXCEPTION '❌ FAILED: Success rate too low (%). Aborting!', v_success_rate || '%';
    END IF;
  END;
  
  RAISE NOTICE ' ';
  
END $$;

-- =====================================================
-- PHASE 3: DATA QUALITY VALIDATION
-- =====================================================

DO $$
DECLARE
  v_total_events INTEGER;
  v_salary_events INTEGER;
  v_hours_events INTEGER;
  v_salary_pct NUMERIC;
  v_hours_pct NUMERIC;
  v_duplicate_events INTEGER;
  v_invalid_dates INTEGER;
  v_invalid_salary INTEGER;
  v_invalid_hours INTEGER;
BEGIN
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔍 PHASE 3: QUALITY VALIDATION';
  RAISE NOTICE '========================================';
  RAISE NOTICE ' ';
  
  -- Overall statistics
  SELECT 
    COUNT(*),
    COUNT(salary_at_event),
    COUNT(hours_at_event)
  INTO v_total_events, v_salary_events, v_hours_events
  FROM employes_timeline_v2;
  
  v_salary_pct := ROUND(100.0 * v_salary_events / NULLIF(v_total_events, 0), 1);
  v_hours_pct := ROUND(100.0 * v_hours_events / NULLIF(v_total_events, 0), 1);
  
  RAISE NOTICE '📊 OVERALL STATISTICS:';
  RAISE NOTICE '   Total events: %', v_total_events;
  RAISE NOTICE '   Events with salary: % (%)', v_salary_events, v_salary_pct || '%';
  RAISE NOTICE '   Events with hours: % (%)', v_hours_events, v_hours_pct || '%';
  RAISE NOTICE ' ';
  
  -- Check for duplicates
  SELECT COUNT(*) INTO v_duplicate_events
  FROM (
    SELECT employee_id, event_type, event_date
    FROM employes_timeline_v2
    GROUP BY employee_id, event_type, event_date
    HAVING COUNT(*) > 1
  ) dups;
  
  IF v_duplicate_events > 0 THEN
    RAISE WARNING '⚠️  Found % duplicate events', v_duplicate_events;
  ELSE
    RAISE NOTICE '✅ No duplicate events found';
  END IF;
  
  -- Check for invalid dates
  SELECT COUNT(*) INTO v_invalid_dates
  FROM employes_timeline_v2
  WHERE event_date < '1900-01-01'::date
     OR event_date > '2100-12-31'::date
     OR event_date > CURRENT_DATE;
  
  IF v_invalid_dates > 0 THEN
    RAISE WARNING '⚠️  Found % events with invalid dates', v_invalid_dates;
  ELSE
    RAISE NOTICE '✅ All event dates are valid';
  END IF;
  
  -- Check for invalid salary values
  SELECT COUNT(*) INTO v_invalid_salary
  FROM employes_timeline_v2
  WHERE salary_at_event IS NOT NULL
    AND (salary_at_event < 100 OR salary_at_event > 20000);
  
  IF v_invalid_salary > 0 THEN
    RAISE WARNING '⚠️  Found % events with suspicious salary values', v_invalid_salary;
  ELSE
    RAISE NOTICE '✅ All salary values are reasonable';
  END IF;
  
  -- Check for invalid hours values
  SELECT COUNT(*) INTO v_invalid_hours
  FROM employes_timeline_v2
  WHERE hours_at_event IS NOT NULL
    AND (hours_at_event < 0.5 OR hours_at_event > 168);
  
  IF v_invalid_hours > 0 THEN
    RAISE WARNING '⚠️  Found % events with suspicious hours values', v_invalid_hours;
  ELSE
    RAISE NOTICE '✅ All hours values are reasonable';
  END IF;
  
  RAISE NOTICE ' ';
  
END $$;

-- =====================================================
-- PHASE 4: COMPARISON ANALYSIS
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 PHASE 4: COMPARISON ANALYSIS';
  RAISE NOTICE '========================================';
  RAISE NOTICE ' ';
  RAISE NOTICE 'Comparing employes_changes vs employes_timeline_v2:';
  RAISE NOTICE ' ';
END $$;

-- Compare source data vs generated timeline
WITH changes_stats AS (
  SELECT
    COUNT(*) as total_changes,
    COUNT(CASE WHEN metadata->>'new_monthly' IS NOT NULL THEN 1 END) as changes_with_salary,
    COUNT(CASE WHEN metadata->>'new_hours' IS NOT NULL THEN 1 END) as changes_with_hours
  FROM employes_changes
  WHERE is_duplicate = false
),
timeline_stats AS (
  SELECT
    COUNT(*) as total_events,
    COUNT(salary_at_event) as events_with_salary,
    COUNT(hours_at_event) as events_with_hours
  FROM employes_timeline_v2
)
SELECT
  'Changes' as source,
  cs.total_changes as total,
  cs.changes_with_salary as with_salary,
  cs.changes_with_hours as with_hours,
  ROUND(100.0 * cs.changes_with_salary / NULLIF(cs.total_changes, 0), 1) as salary_pct,
  ROUND(100.0 * cs.changes_with_hours / NULLIF(cs.total_changes, 0), 1) as hours_pct
FROM changes_stats cs
UNION ALL
SELECT
  'Timeline' as source,
  ts.total_events as total,
  ts.events_with_salary as with_salary,
  ts.events_with_hours as with_hours,
  ROUND(100.0 * ts.events_with_salary / NULLIF(ts.total_events, 0), 1) as salary_pct,
  ROUND(100.0 * ts.events_with_hours / NULLIF(ts.total_events, 0), 1) as hours_pct
FROM timeline_stats ts;

-- =====================================================
-- PHASE 5: SAMPLE DATA VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE ' ';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔬 PHASE 5: SAMPLE DATA CHECK';
  RAISE NOTICE '========================================';
  RAISE NOTICE ' ';
  RAISE NOTICE 'Sample events with salary/hours data:';
  RAISE NOTICE ' ';
END $$;

SELECT 
  event_type,
  TO_CHAR(event_date, 'YYYY-MM-DD') as event_date,
  COALESCE(salary_at_event::TEXT, 'NULL') as salary,
  COALESCE(hours_at_event::TEXT, 'NULL') as hours,
  event_description
FROM employes_timeline_v2
WHERE salary_at_event IS NOT NULL OR hours_at_event IS NOT NULL
ORDER BY event_date DESC
LIMIT 10;

-- =====================================================
-- FINAL SUCCESS CHECK
-- =====================================================

DO $$
DECLARE
  v_total_changes INTEGER;
  v_total_events INTEGER;
  v_salary_pct NUMERIC;
  v_hours_pct NUMERIC;
  v_all_passed BOOLEAN := true;
BEGIN
  RAISE NOTICE ' ';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🎯 FINAL VERIFICATION';
  RAISE NOTICE '========================================';
  RAISE NOTICE ' ';
  
  -- Get final counts
  SELECT COUNT(*) INTO v_total_changes FROM employes_changes WHERE is_duplicate = false;
  SELECT COUNT(*) INTO v_total_events FROM employes_timeline_v2;
  
  SELECT ROUND(100.0 * COUNT(salary_at_event) / NULLIF(COUNT(*), 0), 1) 
  INTO v_salary_pct FROM employes_timeline_v2;
  
  SELECT ROUND(100.0 * COUNT(hours_at_event) / NULLIF(COUNT(*), 0), 1) 
  INTO v_hours_pct FROM employes_timeline_v2;
  
  -- Success criteria checks
  RAISE NOTICE '📋 SUCCESS CRITERIA:';
  RAISE NOTICE ' ';
  
  -- Check 1: employes_changes has data
  IF v_total_changes >= 200 THEN
    RAISE NOTICE '✅ PASS: employes_changes has % rows (≥200)', v_total_changes;
  ELSE
    RAISE NOTICE '❌ FAIL: employes_changes has only % rows (<200)', v_total_changes;
    v_all_passed := false;
  END IF;
  
  -- Check 2: Timeline events generated
  IF v_total_events >= 200 THEN
    RAISE NOTICE '✅ PASS: employes_timeline_v2 has % events (≥200)', v_total_events;
  ELSE
    RAISE NOTICE '❌ FAIL: employes_timeline_v2 has only % events (<200)', v_total_events;
    v_all_passed := false;
  END IF;
  
  -- Check 3: Salary coverage
  IF v_salary_pct >= 20 THEN
    RAISE NOTICE '✅ PASS: % of events have salary data (≥20%%)', v_salary_pct || '%';
  ELSE
    RAISE NOTICE '⚠️  WARN: Only % of events have salary data (<20%%)', v_salary_pct || '%';
  END IF;
  
  -- Check 4: Hours coverage
  IF v_hours_pct >= 10 THEN
    RAISE NOTICE '✅ PASS: % of events have hours data (≥10%%)', v_hours_pct || '%';
  ELSE
    RAISE NOTICE '⚠️  WARN: Only % of events have hours data (<10%%)', v_hours_pct || '%';
  END IF;
  
  RAISE NOTICE ' ';
  RAISE NOTICE '========================================';
  
  IF v_all_passed THEN
    RAISE NOTICE '🎉 SUCCESS! TIMELINE FIX IS COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE ' ';
    RAISE NOTICE '📋 NEXT STEPS:';
    RAISE NOTICE '   1. Test in browser (hard refresh: Cmd+Shift+R)';
    RAISE NOTICE '   2. Navigate to staff profile with timeline';
    RAISE NOTICE '   3. Verify Bruto/Neto/Hours grid displays';
    RAISE NOTICE '   4. Check browser console for errors';
    RAISE NOTICE ' ';
    RAISE NOTICE '🎊 CONGRATULATIONS! 🎊';
  ELSE
    RAISE NOTICE '⚠️  COMPLETED WITH WARNINGS';
    RAISE NOTICE '========================================';
    RAISE NOTICE ' ';
    RAISE NOTICE '📋 NEXT STEPS:';
    RAISE NOTICE '   1. Review the warnings above';
    RAISE NOTICE '   2. Investigate any failed checks';
    RAISE NOTICE '   3. Test in browser anyway';
  END IF;
  
  RAISE NOTICE '========================================';
  
END $$;

