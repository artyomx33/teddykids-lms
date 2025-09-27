-- Check if location columns exist in staff table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'staff'
AND table_schema = 'public'
AND column_name IN ('manager', 'location_key', 'department', 'location')
ORDER BY column_name;