-- =====================================================
-- PHASE 1: DIAGNOSE SCHEMA
-- Run these queries to understand the actual structure
-- =====================================================

-- 1.1: Get complete schema of employes_changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'employes_changes'
ORDER BY ordinal_position;

-- 1.2: Get sample data to see structure
-- Let's just get everything and see what we have!
SELECT *
FROM employes_changes
WHERE change_type = 'salary_change'
LIMIT 2;

-- 1.3: Check if we have the date column issue
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'employes_changes' 
  AND column_name LIKE '%date%';

-- 1.4: Find employee with most changes for testing
SELECT 
  employee_id,
  COUNT(*) as total_changes,
  COUNT(CASE WHEN change_type = 'salary_change' THEN 1 END) as salary_changes,
  COUNT(CASE WHEN change_type = 'hours_change' THEN 1 END) as hours_changes
FROM employes_changes
WHERE is_duplicate = false
GROUP BY employee_id
ORDER BY total_changes DESC
LIMIT 3;

