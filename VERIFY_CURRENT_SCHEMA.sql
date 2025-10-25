-- ============================================================================
-- Complete Schema Verification Script
-- Run this in Supabase to understand CURRENT database state
-- ============================================================================

-- 1. CHECK IF CONTRACTS TABLE EXISTS
SELECT 
  'CONTRACTS TABLE CHECK' as check_name,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'contracts'
  ) as table_exists;

-- 2. IF CONTRACTS EXISTS, SHOW ITS STRUCTURE
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'contracts'
ORDER BY ordinal_position;

-- 3. CHECK IF CONTRACTS HAS DATA
SELECT 
  'contracts' as table_name,
  COUNT(*) as row_count,
  COUNT(DISTINCT staff_id) as unique_staff,
  MIN(created_at) as oldest_record,
  MAX(created_at) as newest_record
FROM contracts;

-- 4. VERIFY EMPLOYES_CURRENT_STATE EXISTS AND HAS DATA
SELECT 
  'employes_current_state' as table_name,
  COUNT(*) as row_count,
  COUNT(*) FILTER (WHERE is_active = true) as active_employees,
  AVG(data_completeness_score) as avg_completeness,
  COUNT(*) FILTER (WHERE current_salary IS NOT NULL) as has_salary_data,
  COUNT(*) FILTER (WHERE current_hours_per_week IS NOT NULL) as has_hours_data
FROM employes_current_state;

-- 5. VERIFY STAFF VIEW WORKS
SELECT 
  'staff (VIEW)' as object_name,
  COUNT(*) as row_count,
  COUNT(DISTINCT employes_id) as unique_employes_ids,
  COUNT(*) FILTER (WHERE email IS NOT NULL) as has_email,
  COUNT(*) FILTER (WHERE role IS NOT NULL) as has_role
FROM staff;

-- 6. CHECK STAFF_REVIEWS TABLE
SELECT 
  'staff_reviews' as table_name,
  COUNT(*) as row_count,
  COUNT(DISTINCT staff_id) as unique_staff_reviewed,
  AVG(overall_score) as avg_score,
  MAX(review_date) as latest_review,
  COUNT(*) FILTER (WHERE star_rating >= 5) as five_star_count
FROM staff_reviews;

-- 7. CHECK TIMELINE_V2
SELECT 
  'employes_timeline_v2' as table_name,
  COUNT(*) as row_count,
  COUNT(DISTINCT employee_id) as unique_employees,
  COUNT(*) FILTER (WHERE is_milestone = true) as milestone_events,
  MIN(event_date) as earliest_event,
  MAX(event_date) as latest_event
FROM employes_timeline_v2;

-- 8. VERIFY EMPLOYES_CHANGES (AUDIT TABLE)
SELECT 
  'employes_changes' as table_name,
  COUNT(*) as row_count,
  COUNT(DISTINCT employee_id) as unique_employees,
  COUNT(*) FILTER (WHERE change_type = 'salary_change') as salary_changes,
  COUNT(*) FILTER (WHERE change_type = 'hours_change') as hours_changes,
  COUNT(*) FILTER (WHERE is_duplicate = false) as non_duplicate_changes
FROM employes_changes;

-- 9. CHECK IF OLD VIEWS EXIST
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND (
  table_name LIKE '%enriched%' OR
  table_name LIKE '%contract%' OR
  table_name = 'staff_with_lms_data' OR
  table_name = 'overdue_reviews' OR
  table_name = 'staff_document_compliance'
)
ORDER BY table_name;

-- 10. CHECK ALL MATERIALIZED VIEWS
SELECT 
  schemaname,
  matviewname,
  hasindexes,
  ispopulated
FROM pg_matviews
WHERE schemaname = 'public';

-- 11. SAMPLE DATA FROM KEY TABLES
-- Sample from employes_current_state
SELECT 
  employee_id,
  full_name,
  employment_status,
  start_date,
  current_salary,
  current_hours_per_week,
  position,
  department,
  location,
  is_active,
  data_completeness_score
FROM employes_current_state
LIMIT 3;

-- Sample from staff view
SELECT 
  id,
  employes_id,
  full_name,
  email,
  role,
  department,
  location,
  status
FROM staff
LIMIT 3;

-- 12. CHECK ID TYPE COMPATIBILITY
-- This is CRITICAL - old code uses TEXT, new uses UUID
SELECT 
  'ID Type Check' as check_name,
  pg_typeof(employee_id) as current_state_id_type,
  (SELECT pg_typeof(employes_id) FROM staff LIMIT 1) as staff_view_id_type,
  (SELECT pg_typeof(employee_id) FROM employes_changes LIMIT 1) as changes_id_type
FROM employes_current_state
LIMIT 1;

-- 13. SUMMARY - WHAT TABLES ARE ACTIVELY USED?
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  (SELECT reltuples::BIGINT FROM pg_class WHERE relname = tablename) as approx_rows
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'employes_raw_data',
  'employes_current_state',
  'employes_changes',
  'employes_timeline_v2',
  'staff_reviews',
  'contracts'
)
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================================================
-- RESULTS INTERPRETATION
-- ============================================================================

/*
WHAT TO LOOK FOR:

1. contracts table:
   - If EXISTS and HAS DATA → Include in new view
   - If EXISTS but EMPTY → May be deprecated, check with team
   - If DOES NOT EXIST → Skip contract-specific fields

2. employes_current_state:
   - Should have ~110 rows (one per employee)
   - Should have high completeness scores
   - Should have salary/hours data

3. staff view:
   - Should have same # of rows as employes_current_state
   - employes_id should be TEXT type
   - Used for backward compatibility

4. ID types:
   - employes_current_state.employee_id: UUID
   - staff.employes_id: TEXT
   - employes_changes.employee_id: TEXT
   - Need to handle TEXT ↔ UUID conversion in joins

5. Materialized views:
   - Should show 0 (confirming contracts_enriched_v2 doesn't exist)
   - If shows employes_timeline, check if it's used

*/

