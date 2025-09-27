-- Check for existing employes.nl location data in the database

-- Check if staff table has employes-related columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'staff'
AND table_schema = 'public'
AND column_name ILIKE '%employes%'
ORDER BY column_name;

-- Check for any tables with employes location mapping
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name ILIKE '%employes%'
ORDER BY table_name;

-- Check staff records for any existing employes_id patterns
SELECT
  'Sample employes_id patterns:' as info,
  employes_id,
  COUNT(*) as count
FROM staff
WHERE employes_id IS NOT NULL
GROUP BY employes_id
LIMIT 10;

-- Check if location_key has any values
SELECT
  'Location key distribution:' as info,
  location_key,
  COUNT(*) as staff_count
FROM staff
WHERE location_key IS NOT NULL
GROUP BY location_key
ORDER BY staff_count DESC;

-- Look for any UUID patterns in staff table
SELECT
  'UUID-like fields in staff:' as info,
  id as sample_staff_id,
  employes_id,
  location_key
FROM staff
WHERE employes_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
LIMIT 5;