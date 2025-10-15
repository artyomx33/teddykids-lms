-- Fix get_staff_list_optimized to use employes_employee_id
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
    SELECT DISTINCT ON (employes_employee_id)
      employes_employee_id,
      review_date as last_review_date
    FROM staff_reviews
    ORDER BY employes_employee_id, review_date DESC
  ) lr ON lr.employes_employee_id = s.employes_id
  ORDER BY s.full_name ASC;
$$;