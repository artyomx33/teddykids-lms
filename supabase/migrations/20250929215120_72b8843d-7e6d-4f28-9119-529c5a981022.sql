-- Fix search_path for get_current_salary function (security best practice)
CREATE OR REPLACE FUNCTION get_current_salary(p_staff_id UUID)
RETURNS TABLE (
  scale TEXT,
  trede TEXT,
  gross_monthly NUMERIC,
  hourly_wage NUMERIC,
  hours_per_week NUMERIC,
  effective_date DATE
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    csh.scale,
    csh.trede,
    csh.gross_monthly,
    csh.hourly_wage,
    csh.hours_per_week,
    csh.cao_effective_date
  FROM cao_salary_history csh
  WHERE csh.staff_id = p_staff_id
  AND csh.valid_from <= CURRENT_DATE
  AND (csh.valid_to IS NULL OR csh.valid_to >= CURRENT_DATE)
  ORDER BY csh.valid_from DESC
  LIMIT 1;
END;
$$;