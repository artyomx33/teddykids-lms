-- Quick verification that employes_changes has data
SELECT 
  '✅ VERIFICATION: employes_changes populated!' as status,
  COUNT(*) as total_changes,
  COUNT(CASE WHEN change_type = 'salary_change' THEN 1 END) as salary_changes,
  COUNT(CASE WHEN change_type = 'hours_change' THEN 1 END) as hours_changes,
  COUNT(CASE WHEN change_type = 'contract_change' THEN 1 END) as contract_changes
FROM employes_changes;

-- Sample of the data
SELECT 
  '📋 Sample changes:' as section,
  employee_id,
  change_type,
  field_path,
  detected_at,
  metadata->>'new_monthly' as new_monthly_salary,
  metadata->>'new_hours' as new_hours
FROM employes_changes
LIMIT 5;


