-- =========================================
-- 🏢 EMPLOYES.NL LOCATION ID MAPPING
-- =========================================
-- Maps Teddy Kids locations to employes.nl location UUIDs
-- You manually found these location IDs from employes.nl interface

-- Step 1: Create a mapping table for employes.nl location IDs
CREATE TABLE IF NOT EXISTS employes_location_mapping (
  location_key text PRIMARY KEY,
  location_name text NOT NULL,
  address text NOT NULL,
  manager text NOT NULL,
  employes_location_id uuid,
  created_at timestamptz DEFAULT now()
);

-- Step 2: Insert the Teddy Kids locations with placeholder UUIDs
-- NOTE: Replace these placeholder UUIDs with actual employes.nl location IDs
INSERT INTO employes_location_mapping (location_key, location_name, address, manager, employes_location_id)
VALUES
  ('RBW', 'RBW - Rijnsburgerweg 35', 'Rijnsburgerweg 35, Leiden', 'Sofia',
   '00000000-0000-0000-0000-000000000001'::uuid), -- REPLACE WITH ACTUAL RBW UUID

  ('RB3/RB5', 'RB3/RB5 - Rijnsburgerweg 3&5', 'Rijnsburgerweg 3 & 5, Leiden', 'Pamela',
   '00000000-0000-0000-0000-000000000002'::uuid), -- REPLACE WITH ACTUAL RB3/RB5 UUID

  ('LRZ', 'LRZ - Lorentzkade 15a', 'Lorentzkade 15a, Leiden', 'Antonella',
   '00000000-0000-0000-0000-000000000003'::uuid), -- REPLACE WITH ACTUAL LRZ UUID

  ('ZML', 'ZML - Zeemanlaan 22a', 'Zeemanlaan 22a, Leiden', 'Meral',
   '00000000-0000-0000-0000-000000000004'::uuid), -- REPLACE WITH ACTUAL ZML UUID

  ('TISA', 'TISA - Lorentzkade 15a', 'Lorentzkade 15a, Leiden', 'Numa',
   '00000000-0000-0000-0000-000000000005'::uuid) -- REPLACE WITH ACTUAL TISA UUID
ON CONFLICT (location_key) DO UPDATE SET
  location_name = EXCLUDED.location_name,
  address = EXCLUDED.address,
  manager = EXCLUDED.manager,
  employes_location_id = EXCLUDED.employes_location_id;

-- Step 3: Add employes_location_id column to staff table
ALTER TABLE public.staff
ADD COLUMN IF NOT EXISTS employes_location_id uuid;

-- Step 4: Update staff records with employes location IDs based on location_key
UPDATE public.staff
SET employes_location_id = elm.employes_location_id
FROM employes_location_mapping elm
WHERE staff.location_key = elm.location_key
AND staff.employes_location_id IS NULL;

-- Step 5: Create a function to sync staff locations with employes.nl
CREATE OR REPLACE FUNCTION sync_staff_locations_with_employes()
RETURNS TABLE (
  staff_id uuid,
  full_name text,
  location_key text,
  employes_location_id uuid,
  sync_status text
) LANGUAGE sql AS $$
  SELECT
    s.id as staff_id,
    s.full_name,
    s.location_key,
    s.employes_location_id,
    CASE
      WHEN s.employes_location_id IS NOT NULL THEN 'MAPPED'
      WHEN s.location_key IS NOT NULL THEN 'NEEDS_EMPLOYES_ID'
      ELSE 'NO_LOCATION'
    END as sync_status
  FROM staff s
  ORDER BY s.location_key, s.full_name;
$$;

-- Step 6: Show current mapping status
SELECT '🏢 LOCATION MAPPING STATUS' as title;

SELECT
  location_key,
  location_name,
  manager,
  employes_location_id,
  CASE
    WHEN employes_location_id::text LIKE '00000000%' THEN '⚠️ PLACEHOLDER - NEEDS REAL UUID'
    ELSE '✅ MAPPED'
  END as status
FROM employes_location_mapping
ORDER BY location_key;

-- Step 7: Show staff needing location mapping
SELECT '👥 STAFF LOCATION MAPPING STATUS' as title;

SELECT
  location_key,
  COUNT(*) as staff_count,
  COUNT(employes_location_id) as mapped_to_employes,
  COUNT(*) - COUNT(employes_location_id) as needs_employes_mapping
FROM staff
WHERE location_key IS NOT NULL
GROUP BY location_key
ORDER BY location_key;

-- Step 8: Instructions for completing the mapping
SELECT '📋 NEXT STEPS:' as instructions;
SELECT 'To complete the mapping:' as step_1;
SELECT '1. Log into employes.nl admin panel' as step_2;
SELECT '2. Find the location UUIDs for each Teddy Kids location' as step_3;
SELECT '3. Replace the placeholder UUIDs (00000000-...) in this script' as step_4;
SELECT '4. Re-run this script with actual UUIDs' as step_5;
SELECT '5. Verify mapping with: SELECT * FROM sync_staff_locations_with_employes();' as step_6;