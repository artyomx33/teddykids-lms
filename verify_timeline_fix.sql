-- =====================================================
-- VERIFICATION SCRIPT: Timeline Data Fix
-- Run this AFTER applying the migration
-- =====================================================

-- 1. Check overall data quality
SELECT 
  '=== OVERALL DATA QUALITY ===' as section,
  COUNT(*) as total_events,
  COUNT(salary_at_event) as events_with_salary,
  COUNT(hours_at_event) as events_with_hours,
  COUNT(previous_value) as events_with_previous,
  COUNT(new_value) as events_with_new,
  ROUND(100.0 * COUNT(salary_at_event) / NULLIF(COUNT(*), 0), 1) || '%' as salary_coverage,
  ROUND(100.0 * COUNT(hours_at_event) / NULLIF(COUNT(*), 0), 1) || '%' as hours_coverage
FROM employes_timeline_v2;

-- 2. Check data quality by event type
SELECT 
  '=== DATA BY EVENT TYPE ===' as section,
  event_type,
  COUNT(*) as total,
  COUNT(salary_at_event) as has_salary,
  COUNT(hours_at_event) as has_hours,
  ROUND(100.0 * COUNT(salary_at_event) / COUNT(*), 1) || '%' as salary_pct,
  ROUND(100.0 * COUNT(hours_at_event) / COUNT(*), 1) || '%' as hours_pct
FROM employes_timeline_v2
GROUP BY event_type
ORDER BY total DESC;

-- 3. Check Adéla's timeline specifically
SELECT 
  '=== ADÉLA JAROŠOVÁ TIMELINE ===' as section,
  et.event_type,
  et.event_date,
  et.event_description,
  et.salary_at_event,
  et.hours_at_event,
  jsonb_pretty(et.previous_value) as previous_value,
  jsonb_pretty(et.new_value) as new_value
FROM employes_timeline_v2 et
WHERE et.employee_id = 'ee6427c2-39eb-4129-a090-1a3cca81af4e'
ORDER BY et.event_date DESC
LIMIT 5;

-- 4. Sample a few events to see JSONB structure
SELECT 
  '=== SAMPLE JSONB STRUCTURE ===' as section,
  event_type,
  event_date,
  salary_at_event,
  hours_at_event,
  jsonb_pretty(previous_value) as previous_value_structure,
  jsonb_pretty(new_value) as new_value_structure
FROM employes_timeline_v2
WHERE salary_at_event IS NOT NULL 
  AND hours_at_event IS NOT NULL
LIMIT 3;

-- =====================================================
-- EXPECTED RESULTS:
-- ✅ Overall coverage should be >50% for salary and hours
-- ✅ salary_change events should have 100% salary coverage
-- ✅ hours_change events should have 100% hours coverage
-- ✅ Adéla should have populated salary_at_event and hours_at_event
-- ✅ JSONB should have "monthly_wage" and "hours_per_week" keys
-- =====================================================


