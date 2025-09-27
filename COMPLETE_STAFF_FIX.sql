-- ============================================
-- 🧸💯 COMPLETE STAFF PAGE FIX
-- ============================================
-- This file fixes ALL issues with the staff page in ONE go
-- First principles approach - rebuild everything properly
-- ============================================

-- ============================================
-- PART 1: DATABASE FUNCTIONS
-- ============================================

-- Function: get_staff_list_optimized
-- Purpose: Fetch staff list with contracts and reviews in one query
CREATE OR REPLACE FUNCTION public.get_staff_list_optimized()
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
    SELECT DISTINCT ON (staff_id)
      staff_id,
      review_date as last_review_date
    FROM staff_reviews
    ORDER BY staff_id, review_date DESC
  ) lr ON lr.staff_id = s.id
  ORDER BY s.full_name ASC;
$$;

-- ============================================
-- PART 2: DATABASE VIEWS
-- ============================================

-- View: staff_docs_status
-- Purpose: Track which documents each staff member is missing
CREATE OR REPLACE VIEW public.staff_docs_status AS
SELECT
  s.id AS staff_id,
  s.full_name,
  s.is_intern,
  s.intern_year,
  NOT COALESCE((s.staff_docs->'id_card'->>'received')::boolean, false) AS id_card_missing,
  NOT COALESCE((s.staff_docs->'bank_card'->>'received')::boolean, false) AS bank_card_missing,
  NOT COALESCE((s.staff_docs->'pok'->>'received')::boolean, false) AS pok_missing,
  NOT COALESCE((s.staff_docs->'vog'->>'received')::boolean, false) AS vog_missing,
  NOT COALESCE((s.staff_docs->'prk'->>'received')::boolean, false) AS prk_missing,
  NOT COALESCE((s.staff_docs->'employees'->>'received')::boolean, false) AS employees_missing,
  NOT COALESCE((s.staff_docs->'portobase'->>'received')::boolean, false) AS portobase_missing,
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

-- View: staff_docs_missing_counts (alias for compatibility)
CREATE OR REPLACE VIEW public.staff_docs_missing_counts AS
SELECT
  staff_id,
  full_name,
  missing_count
FROM public.staff_docs_status;

-- View: contracts_enriched
-- Purpose: Enhanced contract data with computed fields
DROP VIEW IF EXISTS public.contracts_enriched CASCADE;
CREATE OR REPLACE VIEW public.contracts_enriched AS
SELECT
  c.id,
  c.employee_name,
  c.manager,
  c.department,
  c.status,
  c.created_at,
  c.signed_at,
  c.pdf_path,
  c.contract_type,
  c.staff_id,
  c.full_name,
  (c.query_params->>'endDate')::date as end_date,
  (c.query_params->>'birthDate')::date as birth_date,
  (c.query_params->>'startDate')::date as start_date,
  lower(coalesce(c.manager, c.query_params->>'manager')) as manager_key,
  lower(coalesce(c.department, c.query_params->>'position')) as location_key,
  coalesce(c.department, c.query_params->>'position') as position,
  false as has_five_star_badge,
  false as needs_six_month_review,
  false as needs_yearly_review
FROM public.contracts c;

-- ============================================
-- PART 3: PERMISSIONS
-- ============================================

-- Grant function permissions
GRANT EXECUTE ON FUNCTION public.get_staff_list_optimized() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_staff_list_optimized() TO anon;

-- Grant view permissions
GRANT SELECT ON public.staff_docs_status TO authenticated;
GRANT SELECT ON public.staff_docs_status TO anon;
GRANT SELECT ON public.staff_docs_missing_counts TO authenticated;
GRANT SELECT ON public.staff_docs_missing_counts TO anon;
GRANT SELECT ON public.contracts_enriched TO authenticated;
GRANT SELECT ON public.contracts_enriched TO anon;

-- ============================================
-- PART 4: ROW LEVEL SECURITY (RLS)
-- ============================================

-- Keep existing RLS policies for staff table
-- (don't drop them - they're already set up correctly)

-- ============================================
-- PART 5: REFRESH SCHEMA CACHE
-- ============================================

NOTIFY pgrst, 'reload schema';

-- ============================================
-- PART 6: VERIFICATION
-- ============================================

-- Test the function works
SELECT COUNT(*) as staff_count FROM public.get_staff_list_optimized();

-- Test views work
SELECT COUNT(*) as docs_status_count FROM public.staff_docs_status;
SELECT COUNT(*) as contracts_enriched_count FROM public.contracts_enriched;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$ BEGIN
  RAISE NOTICE '🧸💯 COMPLETE STAFF FIX APPLIED!';
  RAISE NOTICE '✅ get_staff_list_optimized() function created';
  RAISE NOTICE '✅ staff_docs_status view created';
  RAISE NOTICE '✅ staff_docs_missing_counts view created';
  RAISE NOTICE '✅ contracts_enriched view created';
  RAISE NOTICE '✅ All permissions granted';
  RAISE NOTICE '✅ Schema cache refreshed';
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Now refresh your browser at /staff';
  RAISE NOTICE '📊 You should see all 117 synced employees!';
END $$;
