-- Drop existing staff view (CASCADE will also drop dependent views)
DROP VIEW IF EXISTS staff CASCADE;

-- Create new staff view pulling from employes_raw_data /employee endpoint
CREATE VIEW staff AS
SELECT 
  -- Generate deterministic UUID from employee_id
  md5('employes_employee:' || employee_id)::uuid as id,
  
  -- Employee ID from Employes.nl (primary link)
  employee_id as employes_id,
  
  -- Basic personal info (from /employee endpoint)
  TRIM(CONCAT(
    api_response->>'first_name', 
    ' ', 
    api_response->>'surname'
  )) as full_name,
  
  -- Contact info
  api_response->>'email' as email,
  COALESCE(api_response->>'mobile', api_response->>'phone') as phone_number,
  
  -- Personal details
  (api_response->>'date_of_birth')::date as birth_date,
  
  -- Metadata
  collected_at as last_sync_at,
  collected_at as created_at,
  
  -- Employment fields (NULL - these come from /employments endpoint, queried separately)
  NULL::text as role,
  NULL::text as department,
  NULL::text as location,
  NULL::text as status,
  NULL::text as contract_type,
  NULL::date as employment_start_date,
  NULL::date as employment_end_date,
  NULL::numeric as hours_per_week,
  NULL::numeric as salary_amount,
  NULL::numeric as hourly_wage
  
FROM employes_raw_data
WHERE endpoint = '/employee'
  AND is_latest = true;

-- Recreate contracts_enriched_v2 materialized view
DROP MATERIALIZED VIEW IF EXISTS contracts_enriched_v2;

CREATE MATERIALIZED VIEW contracts_enriched_v2 AS
SELECT 
  c.id,
  c.employes_employee_id,
  s.full_name,
  c.query_params->>'position' as position,
  c.query_params->>'location' as location_key,
  c.query_params->>'manager' as manager_key,
  (c.query_params->>'startDate')::date as start_date,
  (c.query_params->>'endDate')::date as end_date,
  s.birth_date,
  c.created_at,
  c.pdf_path as updated_at,
  
  -- Review metrics
  (SELECT MIN(review_date) FROM staff_reviews sr WHERE sr.employes_employee_id = s.employes_id) as first_start,
  (SELECT MAX(review_date) FROM staff_reviews sr WHERE sr.employes_employee_id = s.employes_id) as last_review_date,
  (SELECT AVG(overall_score) FROM staff_reviews sr WHERE sr.employes_employee_id = s.employes_id) as avg_review_score,
  (SELECT COUNT(*) > 0 FROM staff_reviews sr WHERE sr.employes_employee_id = s.employes_id AND sr.star_rating >= 5) as has_five_star_badge,
  
  -- Review due calculations
  CASE 
    WHEN (SELECT MAX(review_date) FROM staff_reviews sr WHERE sr.employes_employee_id = s.employes_id) IS NULL 
      AND (c.query_params->>'startDate')::date + INTERVAL '6 months' <= CURRENT_DATE
    THEN true
    ELSE false
  END as needs_six_month_review,
  
  CASE 
    WHEN (SELECT MAX(review_date) FROM staff_reviews sr WHERE sr.employes_employee_id = s.employes_id) IS NOT NULL
      AND (SELECT MAX(review_date) FROM staff_reviews sr WHERE sr.employes_employee_id = s.employes_id) + INTERVAL '1 year' <= CURRENT_DATE
    THEN true
    ELSE false
  END as needs_yearly_review,
  
  CASE 
    WHEN (SELECT MAX(review_date) FROM staff_reviews sr WHERE sr.employes_employee_id = s.employes_id) IS NULL 
    THEN (c.query_params->>'startDate')::date + INTERVAL '6 months'
    ELSE (SELECT MAX(review_date) FROM staff_reviews sr WHERE sr.employes_employee_id = s.employes_id) + INTERVAL '1 year'
  END as next_review_due
  
FROM contracts c
LEFT JOIN staff s ON s.employes_id = c.employes_employee_id
WHERE c.employes_employee_id IS NOT NULL;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX contracts_enriched_v2_id_idx ON contracts_enriched_v2 (id);

-- Grant permissions
GRANT SELECT ON staff TO authenticated;
GRANT SELECT ON contracts_enriched_v2 TO authenticated;