-- ============================================================================
-- Investigation: What is employes_current_state?
-- ============================================================================

-- 1. Show table structure (all columns)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'employes_current_state'
ORDER BY ordinal_position;

-- 2. Show sample data (first 3 employees)
SELECT * FROM employes_current_state LIMIT 3;

-- 3. Check when table was last updated
SELECT 
  MIN(created_at) as oldest_record,
  MAX(updated_at) as last_updated,
  MAX(last_sync_at) as last_sync,
  COUNT(*) as total_employees,
  COUNT(*) FILTER (WHERE is_active = true) as active_employees
FROM employes_current_state;

-- 4. What data quality looks like
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE full_name IS NOT NULL) as has_name,
  COUNT(*) FILTER (WHERE email IS NOT NULL) as has_email,
  COUNT(*) FILTER (WHERE current_salary IS NOT NULL) as has_salary,
  COUNT(*) FILTER (WHERE current_hours_per_week IS NOT NULL) as has_hours,
  COUNT(*) FILTER (WHERE position IS NOT NULL) as has_position,
  COUNT(*) FILTER (WHERE department IS NOT NULL) as has_department,
  AVG(data_completeness_score) as avg_completeness_score
FROM employes_current_state;

-- 5. Check if ANY views reference it
SELECT 
  dependent_view.relname as dependent_view,
  source_table.relname as source_table
FROM pg_depend 
JOIN pg_rewrite ON pg_depend.objid = pg_rewrite.oid 
JOIN pg_class as dependent_view ON pg_rewrite.ev_class = dependent_view.oid 
JOIN pg_class as source_table ON pg_depend.refobjid = source_table.oid 
WHERE source_table.relname = 'employes_current_state'
AND dependent_view.relkind = 'v';

-- 6. Check if staff view uses it
SELECT 
  view_definition 
FROM information_schema.views 
WHERE table_name = 'staff';

-- 7. Compare staff view vs employes_current_state
-- Do they have same employee_ids?
SELECT 
  'In current_state but NOT in staff view' as check_type,
  COUNT(*) as count
FROM employes_current_state ecs
WHERE NOT EXISTS (
  SELECT 1 FROM staff s 
  WHERE s.employes_id = ecs.employee_id::TEXT
)
UNION ALL
SELECT 
  'In staff view but NOT in current_state',
  COUNT(*)
FROM staff s
WHERE NOT EXISTS (
  SELECT 1 FROM employes_current_state ecs
  WHERE ecs.employee_id::TEXT = s.employes_id
);

-- 8. Check what tables have foreign keys TO employes_current_state
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND ccu.table_name = 'employes_current_state';

-- 9. Sample comparison: What data is ACTUALLY in use?
SELECT 
  ecs.employee_id,
  ecs.full_name as current_state_name,
  s.full_name as staff_view_name,
  ecs.current_salary,
  ecs.current_hours_per_week,
  ecs.position,
  ecs.employment_status,
  ecs.is_active,
  s.id as staff_view_uuid
FROM employes_current_state ecs
LEFT JOIN staff s ON s.employes_id = ecs.employee_id::TEXT
LIMIT 5;

-- 10. CRITICAL: Check if staff view is actually built from employes_raw_data or employes_current_state
-- This will show us the actual dependency

