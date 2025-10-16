-- Check what the change_type constraint allows
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conname = 'employes_changes_change_type_check';

-- Also check if there's an enum type
SELECT 
  t.typname as enum_name,
  e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname LIKE '%change%'
ORDER BY t.typname, e.enumsortorder;


