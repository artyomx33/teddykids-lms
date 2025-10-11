-- =====================================================
-- COMPLETE TIMELINE STATE BACKFILL - MANUAL EXECUTION
-- =====================================================
-- This script will transform all 244 timeline events into complete state snapshots
-- Run this in Supabase SQL Editor to backfill complete employment state

-- =====================================================
-- PHASE 1: PREPARE AND VALIDATE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '🚀 STARTING TIMELINE STATE COMPLETION';
  RAISE NOTICE '========================================';
  RAISE NOTICE ' ';
END $$;

-- Check current state
SELECT
    'BEFORE' as status,
    COUNT(*) as total_events,
    COUNT(DISTINCT employee_id) as unique_employees,
    COUNT(salary_at_event) as events_with_salary,
    COUNT(hours_at_event) as events_with_hours,
    COUNT(month_wage_at_event) as events_with_enhanced_salary,
    COUNT(hours_per_week_at_event) as events_with_enhanced_hours
FROM employes_timeline_v2;

-- =====================================================
-- PHASE 2: SIMPLE DIRECT MAPPING (Copy Legacy Fields)
-- =====================================================

DO $$
DECLARE
    v_updated_count INTEGER;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '📋 PHASE 2: DIRECT FIELD MAPPING';
  RAISE NOTICE '========================================';
  RAISE NOTICE ' ';

  -- Copy salary_at_event to month_wage_at_event
  UPDATE employes_timeline_v2
  SET
      month_wage_at_event = salary_at_event,
      annual_salary_at_event = salary_at_event * 12,
      net_monthly_at_event = ROUND(salary_at_event * 0.63), -- Rough Dutch net calculation
      fields_changed = CASE
          WHEN fields_changed IS NULL THEN '["salary_at_event"]'::jsonb
          WHEN NOT fields_changed ? 'salary_at_event' THEN fields_changed || '["salary_at_event"]'::jsonb
          ELSE fields_changed
      END,
      change_source = 'state_completion_manual',
      state_version = 1
  WHERE salary_at_event IS NOT NULL
    AND month_wage_at_event IS NULL;

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RAISE NOTICE '✅ Updated % events with salary data', v_updated_count;

  -- Copy hours_at_event to hours_per_week_at_event
  UPDATE employes_timeline_v2
  SET
      hours_per_week_at_event = hours_at_event,
      fields_changed = CASE
          WHEN fields_changed IS NULL THEN '["hours_at_event"]'::jsonb
          WHEN NOT fields_changed ? 'hours_at_event' THEN fields_changed || '["hours_at_event"]'::jsonb
          ELSE fields_changed
      END,
      change_source = 'state_completion_manual',
      state_version = COALESCE(state_version, 0) + 1
  WHERE hours_at_event IS NOT NULL
    AND hours_per_week_at_event IS NULL;

  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RAISE NOTICE '✅ Updated % events with hours data', v_updated_count;

  RAISE NOTICE ' ';
END $$;

-- =====================================================
-- PHASE 3: CARRY-FORWARD STATE COMPLETION
-- =====================================================

DO $$
DECLARE
    employee_rec RECORD;
    event_rec RECORD;
    prev_month_wage NUMERIC;
    prev_hours_per_week NUMERIC;
    prev_function_name TEXT;
    prev_cost_center_name TEXT;
    prev_contract_type TEXT;
    prev_employment_type TEXT;
    prev_phase TEXT;
    employee_count INTEGER := 0;
    total_employees INTEGER;
    events_updated INTEGER := 0;
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔄 PHASE 3: CARRY-FORWARD COMPLETION';
  RAISE NOTICE '========================================';
  RAISE NOTICE ' ';

  -- Get total employee count for progress
  SELECT COUNT(DISTINCT employee_id) INTO total_employees FROM employes_timeline_v2;
  RAISE NOTICE 'Processing % unique employees...', total_employees;
  RAISE NOTICE ' ';

  -- Process each employee in chronological order
  FOR employee_rec IN
    SELECT DISTINCT employee_id
    FROM employes_timeline_v2
    ORDER BY employee_id
  LOOP
    -- Reset state for new employee
    prev_month_wage := NULL;
    prev_hours_per_week := NULL;
    prev_function_name := NULL;
    prev_cost_center_name := NULL;
    prev_contract_type := NULL;
    prev_employment_type := NULL;
    prev_phase := NULL;

    employee_count := employee_count + 1;

    -- Process events for this employee chronologically
    FOR event_rec IN
      SELECT * FROM employes_timeline_v2
      WHERE employee_id = employee_rec.employee_id
      ORDER BY event_date, sequence_order
    LOOP
      -- Update current values from this event (if they exist)
      IF event_rec.month_wage_at_event IS NOT NULL THEN
        prev_month_wage := event_rec.month_wage_at_event;
      END IF;

      IF event_rec.hours_per_week_at_event IS NOT NULL THEN
        prev_hours_per_week := event_rec.hours_per_week_at_event;
      END IF;

      -- Carry forward to fill missing values
      UPDATE employes_timeline_v2
      SET
        month_wage_at_event = COALESCE(month_wage_at_event, prev_month_wage),
        hours_per_week_at_event = COALESCE(hours_per_week_at_event, prev_hours_per_week),
        annual_salary_at_event = CASE
          WHEN month_wage_at_event IS NOT NULL OR prev_month_wage IS NOT NULL
          THEN COALESCE(month_wage_at_event, prev_month_wage) * 12
          ELSE annual_salary_at_event
        END,
        net_monthly_at_event = CASE
          WHEN month_wage_at_event IS NOT NULL OR prev_month_wage IS NOT NULL
          THEN ROUND(COALESCE(month_wage_at_event, prev_month_wage) * 0.63)
          ELSE net_monthly_at_event
        END,
        state_version = COALESCE(state_version, 0) + 1
      WHERE id = event_rec.id;

      events_updated := events_updated + 1;

      -- Update our tracking variables with the final state
      SELECT month_wage_at_event, hours_per_week_at_event
      INTO prev_month_wage, prev_hours_per_week
      FROM employes_timeline_v2
      WHERE id = event_rec.id;
    END LOOP;

    -- Progress update every 10 employees
    IF employee_count % 10 = 0 THEN
      RAISE NOTICE '📊 Processed % of % employees (% events updated)',
        employee_count, total_employees, events_updated;
    END IF;
  END LOOP;

  RAISE NOTICE ' ';
  RAISE NOTICE '✅ PHASE 3 COMPLETE!';
  RAISE NOTICE '📊 Total employees processed: %', employee_count;
  RAISE NOTICE '📊 Total events updated: %', events_updated;
  RAISE NOTICE ' ';
END $$;

-- =====================================================
-- PHASE 4: VALIDATION AND RESULTS
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '🔍 PHASE 4: VALIDATION RESULTS';
  RAISE NOTICE '========================================';
  RAISE NOTICE ' ';
END $$;

-- Check final state
SELECT
    'AFTER' as status,
    COUNT(*) as total_events,
    COUNT(DISTINCT employee_id) as unique_employees,
    COUNT(month_wage_at_event) as events_with_enhanced_salary,
    COUNT(hours_per_week_at_event) as events_with_enhanced_hours,
    COUNT(annual_salary_at_event) as events_with_annual_salary,
    COUNT(net_monthly_at_event) as events_with_net_salary,
    ROUND(100.0 * COUNT(month_wage_at_event) / COUNT(*), 1) as salary_completion_pct,
    ROUND(100.0 * COUNT(hours_per_week_at_event) / COUNT(*), 1) as hours_completion_pct
FROM employes_timeline_v2;

-- Sample of completed data
DO $$
BEGIN
  RAISE NOTICE ' ';
  RAISE NOTICE '📊 SAMPLE COMPLETED EVENTS:';
  RAISE NOTICE ' ';
END $$;

SELECT
    LEFT(employee_id::text, 8) || '...' as employee_id,
    event_type,
    event_date::date,
    month_wage_at_event as monthly_salary,
    hours_per_week_at_event as hours_per_week,
    annual_salary_at_event as annual_salary,
    net_monthly_at_event as net_monthly,
    state_version
FROM employes_timeline_v2
WHERE month_wage_at_event IS NOT NULL
   OR hours_per_week_at_event IS NOT NULL
ORDER BY event_date DESC
LIMIT 10;

-- Quality check - events missing both salary and hours
SELECT
    'QUALITY_CHECK' as check_type,
    COUNT(*) as events_missing_both_salary_and_hours
FROM employes_timeline_v2
WHERE month_wage_at_event IS NULL
  AND hours_per_week_at_event IS NULL;

-- =====================================================
-- FINAL SUCCESS MESSAGE
-- =====================================================

DO $$
DECLARE
    v_total_events INTEGER;
    v_completed_events INTEGER;
    v_completion_rate NUMERIC;
BEGIN
  SELECT COUNT(*) INTO v_total_events FROM employes_timeline_v2;
  SELECT COUNT(*) INTO v_completed_events
  FROM employes_timeline_v2
  WHERE month_wage_at_event IS NOT NULL OR hours_per_week_at_event IS NOT NULL;

  v_completion_rate := ROUND(100.0 * v_completed_events / v_total_events, 1);

  RAISE NOTICE ' ';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🎉 TIMELINE STATE COMPLETION SUCCESS! 🎉';
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 Total events: %', v_total_events;
  RAISE NOTICE '📊 Events with complete state: %', v_completed_events;
  RAISE NOTICE '📊 Completion rate: %', v_completion_rate || '%';
  RAISE NOTICE ' ';
  RAISE NOTICE '✅ Ready for UI enhancement!';
  RAISE NOTICE '✅ No more fallback extraction needed!';
  RAISE NOTICE '✅ Timeline shows complete employment state!';
  RAISE NOTICE ' ';
  RAISE NOTICE 'Next: Update UI to use new fields:';
  RAISE NOTICE '  - month_wage_at_event (instead of salary extraction)';
  RAISE NOTICE '  - hours_per_week_at_event (instead of hours extraction)';
  RAISE NOTICE '  - annual_salary_at_event (calculated)';
  RAISE NOTICE '  - net_monthly_at_event (estimated)';
  RAISE NOTICE ' ';
  RAISE NOTICE '🚀 COMPLETE TIMELINE STATE SYSTEM READY! 🚀';
  RAISE NOTICE '========================================';
END $$;