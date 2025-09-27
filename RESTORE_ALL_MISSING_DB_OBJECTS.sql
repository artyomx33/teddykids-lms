-- ============================================
-- 🧸⚡ RESTORE ALL MISSING DB OBJECTS
-- ============================================
-- Recreate all missing functions and views
-- ============================================

-- 1. Create get_staff_list_optimized function
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
    SELECT DISTINCT ON (staff_id)
      staff_id,
      review_date as last_review_date
    FROM staff_reviews
    ORDER BY staff_id, review_date DESC
  ) lr ON lr.staff_id = s.id
  ORDER BY s.full_name ASC;
$$;

-- 2. Create staff_docs_missing_counts view
CREATE OR REPLACE VIEW public.staff_docs_missing_counts AS
SELECT
  s.id AS staff_id,
  s.full_name,
  (
    (CASE WHEN COALESCE((s.staff_docs->'id_card'->>'received')::boolean, false) THEN 0 ELSE 1 END) +
    (CASE WHEN COALESCE((s.staff_docs->'bank_card'->>'received')::boolean, false) THEN 0 ELSE 1 END) +
    (CASE WHEN COALESCE((s.staff_docs->'pok'->>'received')::boolean, false) THEN 0 ELSE 1 END) +
    (CASE WHEN COALESCE((s.staff_docs->'vog'->>'received')::boolean, false) THEN 0 ELSE 1 END) +
    (CASE WHEN COALESCE((s.staff_docs->'prk'->>'received')::boolean, false) THEN 0 ELSE 1 END) +
    (CASE WHEN COALESCE((s.staff_docs->'employees'->>'received')::boolean, false) THEN 0 ELSE 1 END) +
    (CASE WHEN COALESCE((s.staff_docs->'portobase'->>'received')::boolean, false) THEN 0 ELSE 1 END)
  )::int AS missing_count
FROM public.staff s;

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION get_staff_list_optimized() TO authenticated;
GRANT EXECUTE ON FUNCTION get_staff_list_optimized() TO anon;
GRANT SELECT ON public.staff_docs_missing_counts TO authenticated;
GRANT SELECT ON public.staff_docs_missing_counts TO anon;

-- 4. Refresh schema
NOTIFY pgrst, 'reload schema';

-- Success message
DO $$ BEGIN
  RAISE NOTICE '🧸⚡ ALL DB OBJECTS RESTORED!';
  RAISE NOTICE '✅ get_staff_list_optimized function created';
  RAISE NOTICE '✅ staff_docs_missing_counts view created';
  RAISE NOTICE '✅ Permissions granted';
  RAISE NOTICE '✅ Refresh browser now!';
END $$;
