-- MIGRATION 2.0: Pure View-Based Architecture
-- This migration converts staff table to a view and creates contracts_enriched_v2

-- Step 1: Rename existing staff table to staff_legacy (for safety, can drop later)
ALTER TABLE IF EXISTS staff RENAME TO staff_legacy;

-- Step 2: Create staff VIEW from employes_raw_data
-- This view generates deterministic UUIDs and extracts all fields from raw data
CREATE OR REPLACE VIEW staff AS
SELECT 
  -- Generate deterministic UUID from employee_id
  uuid_generate_v5(
    uuid_ns_url(), 
    'employes:' || employee_id
  ) as id,
  
  -- Core identifiers
  employee_id as employes_id,
  
  -- Personal information from latest snapshot
  (SELECT api_response->>'full_name' 
   FROM employes_raw_data erd_name 
   WHERE erd_name.employee_id = erd_main.employee_id 
   AND erd_name.endpoint = 'employees/{id}' 
   AND erd_name.is_latest = true 
   LIMIT 1) as full_name,
  
  (SELECT (api_response->>'birth_date')::date 
   FROM employes_raw_data erd_birth 
   WHERE erd_birth.employee_id = erd_main.employee_id 
   AND erd_birth.endpoint = 'employees/{id}' 
   AND erd_birth.is_latest = true 
   LIMIT 1) as birth_date,
  
  (SELECT api_response->>'email' 
   FROM employes_raw_data erd_email 
   WHERE erd_email.employee_id = erd_main.employee_id 
   AND erd_email.endpoint = 'employees/{id}' 
   AND erd_email.is_latest = true 
   LIMIT 1) as email,
  
  (SELECT api_response->>'phone_number' 
   FROM employes_raw_data erd_phone 
   WHERE erd_phone.employee_id = erd_main.employee_id 
   AND erd_phone.endpoint = 'employees/{id}' 
   AND erd_phone.is_latest = true 
   LIMIT 1) as phone_number,
  
  -- Employment information from latest employment data
  (SELECT api_response->>'role' 
   FROM employes_raw_data erd_role 
   WHERE erd_role.employee_id = erd_main.employee_id 
   AND erd_role.endpoint = 'employees/{id}/employment' 
   AND erd_role.is_latest = true 
   LIMIT 1) as role,
  
  (SELECT api_response->>'department' 
   FROM employes_raw_data erd_dept 
   WHERE erd_dept.employee_id = erd_main.employee_id 
   AND erd_dept.endpoint = 'employees/{id}/employment' 
   AND erd_dept.is_latest = true 
   LIMIT 1) as department,
  
  (SELECT api_response->>'location' 
   FROM employes_raw_data erd_loc 
   WHERE erd_loc.employee_id = erd_main.employee_id 
   AND erd_loc.endpoint = 'employees/{id}/employment' 
   AND erd_loc.is_latest = true 
   LIMIT 1) as location,
  
  (SELECT (api_response->>'start_date')::date 
   FROM employes_raw_data erd_start 
   WHERE erd_start.employee_id = erd_main.employee_id 
   AND erd_start.endpoint = 'employees/{id}/employment' 
   AND erd_start.is_latest = true 
   LIMIT 1) as employment_start_date,
  
  (SELECT (api_response->>'end_date')::date 
   FROM employes_raw_data erd_end 
   WHERE erd_end.employee_id = erd_main.employee_id 
   AND erd_end.endpoint = 'employees/{id}/employment' 
   AND erd_end.is_latest = true 
   LIMIT 1) as employment_end_date,
  
  (SELECT api_response->>'status' 
   FROM employes_raw_data erd_status 
   WHERE erd_status.employee_id = erd_main.employee_id 
   AND erd_status.endpoint = 'employees/{id}/employment' 
   AND erd_status.is_latest = true 
   LIMIT 1) as status,
  
  -- Working hours from latest data
  (SELECT (api_response->>'hours_per_week')::numeric 
   FROM employes_raw_data erd_hours 
   WHERE erd_hours.employee_id = erd_main.employee_id 
   AND erd_hours.endpoint = 'employees/{id}/working-hours' 
   AND erd_hours.is_latest = true 
   LIMIT 1) as hours_per_week,
  
  -- Current salary from latest salary data
  (SELECT (api_response->>'gross_monthly')::numeric 
   FROM employes_raw_data erd_salary 
   WHERE erd_salary.employee_id = erd_main.employee_id 
   AND erd_salary.endpoint = 'employees/{id}/salary' 
   AND erd_salary.is_latest = true 
   LIMIT 1) as salary_amount,
  
  (SELECT (api_response->>'hourly_wage')::numeric 
   FROM employes_raw_data erd_wage 
   WHERE erd_wage.employee_id = erd_main.employee_id 
   AND erd_wage.endpoint = 'employees/{id}/salary' 
   AND erd_wage.is_latest = true 
   LIMIT 1) as hourly_wage,
  
  -- Contract type from employment data
  (SELECT api_response->>'contract_type' 
   FROM employes_raw_data erd_contract 
   WHERE erd_contract.employee_id = erd_main.employee_id 
   AND erd_contract.endpoint = 'employees/{id}/employment' 
   AND erd_contract.is_latest = true 
   LIMIT 1) as contract_type,
  
  -- Timestamps
  erd_main.collected_at as last_sync_at,
  erd_main.collected_at as created_at
  
FROM employes_raw_data erd_main
WHERE erd_main.is_latest = true
AND erd_main.endpoint = 'employees/{id}'
GROUP BY erd_main.employee_id, erd_main.collected_at;

-- Step 3: Create contracts_enriched_v2 materialized view
CREATE MATERIALIZED VIEW contracts_enriched_v2 AS
SELECT 
  c.id,
  c.employes_employee_id,
  c.employee_name,
  c.full_name,
  c.manager,
  c.department,
  c.contract_type,
  c.status,
  c.pdf_path,
  c.created_at,
  c.signed_at,
  c.query_params,
  
  -- Extract dates from query_params
  (c.query_params->>'startDate')::date as start_date,
  (c.query_params->>'endDate')::date as end_date,
  
  -- Join staff data via employes_employee_id
  s.full_name as staff_full_name,
  s.birth_date,
  s.email,
  s.phone_number,
  s.role as position,
  s.location as location_key,
  s.department as staff_department,
  s.employment_start_date as first_start,
  s.employment_end_date,
  s.status as employment_status,
  s.hours_per_week,
  s.salary_amount,
  
  -- Review metrics from staff_reviews
  (SELECT review_date 
   FROM staff_reviews sr 
   WHERE sr.employes_employee_id = c.employes_employee_id 
   ORDER BY review_date DESC 
   LIMIT 1) as last_review_date,
  
  (SELECT AVG(overall_score) 
   FROM staff_reviews sr 
   WHERE sr.employes_employee_id = c.employes_employee_id) as avg_review_score,
  
  (SELECT COUNT(*) > 0 
   FROM staff_reviews sr 
   WHERE sr.employes_employee_id = c.employes_employee_id 
   AND sr.star_rating = 5) as has_five_star_badge,
  
  -- Review due calculations
  CASE 
    WHEN s.employment_start_date IS NOT NULL 
    AND s.employment_start_date + INTERVAL '6 months' > CURRENT_DATE
    AND NOT EXISTS (
      SELECT 1 FROM staff_reviews sr 
      WHERE sr.employes_employee_id = c.employes_employee_id 
      AND sr.review_date >= s.employment_start_date + INTERVAL '6 months'
    )
    THEN true 
    ELSE false 
  END as needs_six_month_review,
  
  CASE 
    WHEN s.employment_start_date IS NOT NULL 
    AND s.employment_start_date + INTERVAL '1 year' > CURRENT_DATE
    AND NOT EXISTS (
      SELECT 1 FROM staff_reviews sr 
      WHERE sr.employes_employee_id = c.employes_employee_id 
      AND sr.review_date >= s.employment_start_date + INTERVAL '1 year'
    )
    THEN true 
    ELSE false 
  END as needs_yearly_review,
  
  -- Next review due date
  CASE
    WHEN s.employment_start_date IS NOT NULL THEN
      COALESCE(
        (SELECT MAX(review_date) + INTERVAL '1 year' 
         FROM staff_reviews sr 
         WHERE sr.employes_employee_id = c.employes_employee_id),
        s.employment_start_date + INTERVAL '6 months'
      )
    ELSE NULL
  END as next_review_due

FROM contracts c
LEFT JOIN staff s ON s.employes_id = c.employes_employee_id;

-- Create index for performance
CREATE UNIQUE INDEX idx_contracts_enriched_v2_id ON contracts_enriched_v2(id);
CREATE INDEX idx_contracts_enriched_v2_employee ON contracts_enriched_v2(employes_employee_id);
CREATE INDEX idx_contracts_enriched_v2_status ON contracts_enriched_v2(status);

-- Step 4: Update get_staff_list_optimized function to work with new view
CREATE OR REPLACE FUNCTION public.get_staff_list_optimized()
RETURNS TABLE(
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
SECURITY DEFINER
AS $$
  SELECT 
    s.id as staff_id,
    s.full_name,
    s.role,
    s.location,
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
    SELECT DISTINCT ON (employes_employee_id)
      employes_employee_id,
      COALESCE(
        (query_params->>'startDate')::date,
        created_at::date
      ) as first_contract_date
    FROM contracts
    WHERE employes_employee_id IS NOT NULL
    ORDER BY employes_employee_id, created_at ASC
  ) fc ON fc.employes_employee_id = s.employes_id
  LEFT JOIN (
    SELECT DISTINCT ON (employes_employee_id)
      employes_employee_id,
      review_date as last_review_date
    FROM staff_reviews
    ORDER BY employes_employee_id, review_date DESC
  ) lr ON lr.employes_employee_id = s.employes_id
  ORDER BY s.full_name ASC;
$$;

-- Step 5: Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_contracts_enriched_v2()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY contracts_enriched_v2;
END;
$$;

-- Step 6: Grant necessary permissions
GRANT SELECT ON staff TO authenticated;
GRANT SELECT ON contracts_enriched_v2 TO authenticated;

-- Step 7: Add comment explaining the architecture
COMMENT ON VIEW staff IS 'Pure view derived from employes_raw_data - single source of truth for employee data';
COMMENT ON MATERIALIZED VIEW contracts_enriched_v2 IS 'Enriched contract view joining contracts with staff view - refresh periodically using refresh_contracts_enriched_v2()';
