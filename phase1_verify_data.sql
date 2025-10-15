-- =====================================================
-- VERIFY: Is there ANY data in employes_changes?
-- =====================================================

-- 1. Count total rows
SELECT COUNT(*) as total_rows
FROM employes_changes;

-- 2. Count by change_type (to see what types exist)
SELECT 
  change_type, 
  COUNT(*) as count
FROM employes_changes
GROUP BY change_type
ORDER BY count DESC;

-- 3. Get FIRST row (any row)
SELECT *
FROM employes_changes
LIMIT 1;

-- 4. Check if table exists and is accessible
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE tablename = 'employes_changes';

