-- =========================================
-- <â COMPLETE STAFF LOCATIONS RESTORATION
-- =========================================
-- Restores missing department/location functionality found in commits

-- Step 1: Add missing columns
ALTER TABLE public.staff
ADD COLUMN IF NOT EXISTS manager text,
ADD COLUMN IF NOT EXISTS location_key text;

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_manager_lower ON public.staff (lower(manager));
CREATE INDEX IF NOT EXISTS idx_staff_location_key ON public.staff (location_key);

-- Step 3: Update get_staff_list_optimized RPC to use location_key
CREATE OR REPLACE FUNCTION get_staff_list_optimized()
RETURNS TABLE (
  staff_id uuid,
  full_name text,
  role text,
  location text,
  status text,
  first_contract_date date,
  last_review_date date,
  has_recent_review boolean
)
LANGUAGE sql
AS $$
  SELECT
    s.id as staff_id,
    s.full_name,
    s.role,
    s.location_key as location,
    s.status,
    fc.first_contract_date,
    lr.last_review_date,
    CASE
      WHEN lr.last_review_date IS NOT NULL
      AND lr.last_review_date > (CURRENT_DATE - INTERVAL '1 year')
      THEN true
      ELSE false
    END as has_recent_review
  FROM staff s
  LEFT JOIN (
    SELECT DISTINCT ON (employee_name)
      employee_name,
      COALESCE(
        (query_params->>'startDate')::date,
        created_at::date
      ) as first_contract_date
    FROM contracts
    ORDER BY employee_name, created_at ASC
  ) fc ON fc.employee_name = s.full_name
  LEFT JOIN (
    SELECT DISTINCT ON (staff_id)
      staff_id,
      review_date as last_review_date
    FROM staff_reviews
    ORDER BY staff_id, review_date DESC
  ) lr ON lr.staff_id = s.id
  ORDER BY s.full_name ASC;
$$;

-- Step 4: Map staff to Teddy Kids locations based on address patterns
UPDATE public.staff
SET
  location_key = CASE
    WHEN address ILIKE '%rijnsburgerweg 35%' OR address ILIKE '%rijnsburgerweg35%' THEN 'RBW'
    WHEN address ILIKE '%rijnsburgerweg 3%' OR address ILIKE '%rijnsburgerweg 5%'
         OR address ILIKE '%rijnsburgerweg3%' OR address ILIKE '%rijnsburgerweg5%' THEN 'RB3/RB5'
    WHEN address ILIKE '%lorentzkade 15%' OR address ILIKE '%lorentzkade15%' THEN 'LRZ'
    WHEN address ILIKE '%zeemanlaan 22%' OR address ILIKE '%zeemanlaan22%' THEN 'ZML'
    ELSE location_key
  END,
  manager = CASE
    WHEN address ILIKE '%rijnsburgerweg 35%' OR address ILIKE '%rijnsburgerweg35%' THEN 'Sofia'
    WHEN address ILIKE '%rijnsburgerweg 3%' OR address ILIKE '%rijnsburgerweg 5%'
         OR address ILIKE '%rijnsburgerweg3%' OR address ILIKE '%rijnsburgerweg5%' THEN 'Pamela'
    WHEN address ILIKE '%lorentzkade 15%' OR address ILIKE '%lorentzkade15%' THEN 'Antonella'
    WHEN address ILIKE '%zeemanlaan 22%' OR address ILIKE '%zeemanlaan22%' THEN 'Meral'
    ELSE manager
  END
WHERE address IS NOT NULL;

-- Step 5: Alternative mapping by postal codes
UPDATE public.staff
SET
  location_key = CASE
    WHEN postal_code ILIKE '2313%' AND city ILIKE '%leiden%' THEN 'ZML'
    WHEN postal_code ILIKE '2312%' AND city ILIKE '%leiden%' THEN 'RBW'
    WHEN postal_code ILIKE '2311%' AND city ILIKE '%leiden%' THEN 'LRZ'
    WHEN postal_code ILIKE '2314%' AND city ILIKE '%leiden%' THEN 'RB3/RB5'
    ELSE location_key
  END,
  manager = CASE
    WHEN postal_code ILIKE '2313%' AND city ILIKE '%leiden%' THEN 'Meral'
    WHEN postal_code ILIKE '2312%' AND city ILIKE '%leiden%' THEN 'Sofia'
    WHEN postal_code ILIKE '2311%' AND city ILIKE '%leiden%' THEN 'Antonella'
    WHEN postal_code ILIKE '2314%' AND city ILIKE '%leiden%' THEN 'Pamela'
    ELSE manager
  END
WHERE
  location_key IS NULL
  AND postal_code IS NOT NULL
  AND city IS NOT NULL;

-- Step 6: Add comments for documentation
COMMENT ON COLUMN public.staff.manager IS 'Manager: Sofia (RBW), Pamela (RB3/RB5), Antonella (LRZ), Meral (ZML)';
COMMENT ON COLUMN public.staff.location_key IS 'Location: RBW, RB3/RB5, LRZ, ZML, TISA';