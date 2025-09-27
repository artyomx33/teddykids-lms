-- Update get_staff_list_optimized function to use location_key instead of location
CREATE OR REPLACE FUNCTION get_staff_list_optimized()
RETURNS TABLE (
  staff_id uuid,
  full_name text,
  role text,
  location text,  -- This will now return location_key value
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
    s.location_key as location, -- Changed from s.location to s.location_key
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

-- Test the function
SELECT 'TESTING get_staff_list_optimized:' as test;
SELECT staff_id, full_name, location FROM get_staff_list_optimized() LIMIT 5;