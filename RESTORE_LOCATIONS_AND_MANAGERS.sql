-- ========================================
-- 🏢 RESTORE STAFF LOCATIONS & MANAGERS
-- ========================================
-- Adds manager/location columns and maps staff to Teddy Kids locations

-- Step 1: Add columns if they don't exist
ALTER TABLE public.staff
ADD COLUMN IF NOT EXISTS manager text,
ADD COLUMN IF NOT EXISTS location_key text;

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_manager_lower ON public.staff (lower(manager));
CREATE INDEX IF NOT EXISTS idx_staff_location_key ON public.staff (location_key);

-- Step 3: Add comments for documentation
COMMENT ON COLUMN public.staff.manager IS 'Manager name (Sofia, Pamela, Antonella, Meral/Svetlana)';
COMMENT ON COLUMN public.staff.location_key IS 'Location code: RBW, RB3/RB5, LRZ, ZML, TISA';

-- Step 4: Map addresses to location keys and managers
-- This uses address patterns to identify locations and assign managers

UPDATE public.staff
SET
  location_key = CASE
    WHEN address ILIKE '%rijnsburgerweg 35%' OR address ILIKE '%rijnsburgerweg35%' THEN 'RBW'
    WHEN address ILIKE '%rijnsburgerweg 3%' OR address ILIKE '%rijnsburgerweg 5%'
         OR address ILIKE '%rijnsburgerweg3%' OR address ILIKE '%rijnsburgerweg5%' THEN 'RB3/RB5'
    WHEN address ILIKE '%lorentzkade 15%' OR address ILIKE '%lorentzkade15%' THEN 'LRZ'
    WHEN address ILIKE '%zeemanlaan 22%' OR address ILIKE '%zeemanlaan22%' THEN 'ZML'
    ELSE NULL
  END,
  manager = CASE
    WHEN address ILIKE '%rijnsburgerweg 35%' OR address ILIKE '%rijnsburgerweg35%' THEN 'Sofia'
    WHEN address ILIKE '%rijnsburgerweg 3%' OR address ILIKE '%rijnsburgerweg 5%'
         OR address ILIKE '%rijnsburgerweg3%' OR address ILIKE '%rijnsburgerweg5%' THEN 'Pamela'
    WHEN address ILIKE '%lorentzkade 15%' OR address ILIKE '%lorentzkade15%' THEN 'Antonella'
    WHEN address ILIKE '%zeemanlaan 22%' OR address ILIKE '%zeemanlaan22%' THEN 'Meral'
    ELSE NULL
  END
WHERE
  (location_key IS NULL OR manager IS NULL)
  AND address IS NOT NULL;

-- Step 5: Alternative mapping by postal codes (if addresses are structured differently)
UPDATE public.staff
SET
  location_key = CASE
    WHEN postal_code ILIKE '2313%' AND city ILIKE '%leiden%' THEN 'ZML'  -- Zeemanlaan area
    WHEN postal_code ILIKE '2312%' AND city ILIKE '%leiden%' THEN 'RBW'  -- Rijnsburgerweg area
    WHEN postal_code ILIKE '2311%' AND city ILIKE '%leiden%' THEN 'LRZ'  -- Lorentzkade area
    ELSE location_key  -- Keep existing value
  END,
  manager = CASE
    WHEN postal_code ILIKE '2313%' AND city ILIKE '%leiden%' THEN 'Meral'
    WHEN postal_code ILIKE '2312%' AND city ILIKE '%leiden%' THEN 'Sofia'
    WHEN postal_code ILIKE '2311%' AND city ILIKE '%leiden%' THEN 'Antonella'
    ELSE manager  -- Keep existing value
  END
WHERE
  location_key IS NULL
  AND postal_code IS NOT NULL
  AND city IS NOT NULL;

-- Step 6: Verify the mapping results
SELECT
  '🎉 LOCATION MAPPING COMPLETE!' as status,
  location_key,
  manager,
  COUNT(*) as staff_count,
  array_agg(full_name ORDER BY full_name) FILTER (WHERE full_name IS NOT NULL) as sample_staff
FROM public.staff
WHERE location_key IS NOT NULL
GROUP BY location_key, manager
ORDER BY location_key;

-- Step 7: Show unmapped staff for manual review
SELECT
  'UNMAPPED STAFF (for manual review):' as note,
  full_name,
  address,
  postal_code,
  city
FROM public.staff
WHERE location_key IS NULL
ORDER BY full_name
LIMIT 10;

-- Step 8: Final summary
SELECT
  'FINAL SUMMARY:' as summary,
  COUNT(*) FILTER (WHERE location_key IS NOT NULL) as mapped_staff,
  COUNT(*) FILTER (WHERE location_key IS NULL) as unmapped_staff,
  COUNT(*) as total_staff
FROM public.staff;