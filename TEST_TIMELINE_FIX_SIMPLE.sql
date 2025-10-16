-- =====================================================
-- SIMPLE TEST: Regenerate Timeline for ONE Employee
-- =====================================================

-- Step 1: Pick one employee with changes
DO $$
DECLARE
  v_test_employee_id UUID;
  v_events INTEGER;
BEGIN
  -- Get first employee with changes
  SELECT DISTINCT employee_id INTO v_test_employee_id
  FROM employes_changes
  WHERE is_duplicate = false
  LIMIT 1;
  
  RAISE NOTICE 'Testing with employee: %', v_test_employee_id;
  
  -- Generate timeline
  v_events := generate_timeline_v2(v_test_employee_id);
  
  RAISE NOTICE 'Generated % events for test employee', v_events;
  
  -- Check results
  IF v_events > 0 THEN
    RAISE NOTICE 'SUCCESS - Timeline generator working!';
  ELSE
    RAISE WARNING 'WARNING - No events generated!';
  END IF;
END $$;

-- Step 2: Verify the data
SELECT 
  'Test Results' as status,
  COUNT(*) as total_events,
  COUNT(salary_at_event) as has_salary,
  COUNT(hours_at_event) as has_hours
FROM employes_timeline_v2
WHERE employee_id = (
  SELECT DISTINCT employee_id
  FROM employes_changes
  WHERE is_duplicate = false
  LIMIT 1
);


