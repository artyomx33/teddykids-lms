-- ✨ STAFF VIEW: Pure Raw Data Architecture
-- Created: 2025-10-04
-- Purpose: Staff view that ALWAYS pulls from raw data (single source!)

-- Step 1: Drop existing staff view safely
DROP VIEW IF EXISTS staff CASCADE;

-- Step 2: Create new staff view from raw data
CREATE VIEW staff AS
SELECT
  -- Deterministic UUID from employee_id
  md5('employes_employee:' || employee_id)::uuid as id,

  -- Link to raw data (PRIMARY IDENTIFIER)
  employee_id as employes_id,

  -- Extract personal data from JSON response
  TRIM(CONCAT(
    api_response->>'first_name',
    ' ',
    api_response->>'surname'
  )) as full_name,

  -- Contact information
  api_response->>'email' as email,
  COALESCE(api_response->>'mobile', api_response->>'phone') as phone_number,

  -- Personal details
  (api_response->>'date_of_birth')::date as birth_date,
  api_response->>'gender' as gender,
  api_response->>'nationality' as nationality,

  -- Address information
  CONCAT_WS(' ',
    api_response->>'street_name',
    api_response->>'house_number'
  ) as address,
  api_response->>'zipcode' as zipcode,
  api_response->>'city' as city,
  api_response->>'country_code' as country,

  -- Employment basics (from /employee endpoint)
  api_response->>'department' as department,
  api_response->>'position' as role,
  api_response->>'status' as status,
  api_response->>'location' as location,

  -- Timestamp tracking (YOUR REQUIREMENT!)
  collected_at as last_sync_at,
  collected_at as created_at,
  collected_at as updated_at,

  -- Employment fields (will come from /employments endpoint later)
  NULL::text as contract_type,
  NULL::date as employment_start_date,
  NULL::date as employment_end_date,
  NULL::numeric as hours_per_week,
  NULL::numeric as salary_amount,
  NULL::numeric as hourly_wage

FROM employes_raw_data
WHERE endpoint = '/employee'
  AND is_latest = true  -- ONLY show latest data!
ORDER BY full_name;

-- Step 3: Add contracts table link to raw data
ALTER TABLE contracts
ADD COLUMN IF NOT EXISTS employes_employee_id TEXT;

-- Step 4: Create index for performance
CREATE INDEX IF NOT EXISTS idx_contracts_employes_employee
ON contracts(employes_employee_id);

-- Step 5: Add helpful comments
COMMENT ON VIEW staff IS 'Staff view pulling directly from employes_raw_data - single source of truth';
COMMENT ON COLUMN contracts.employes_employee_id IS 'Link to employes.nl employee via raw data';

-- Step 6: Grant permissions
GRANT SELECT ON staff TO authenticated;
GRANT SELECT ON staff TO service_role;