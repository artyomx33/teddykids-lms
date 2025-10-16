-- Check the actual schema of employes_timeline_v2
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'employes_timeline_v2'
ORDER BY ordinal_position;


