-- ============================================
-- 🧸🔧 FIX CONTRACTS_ENRICHED VIEW
-- ============================================
-- Add missing staff_id and other columns needed by Staff page
-- ============================================

-- Drop and recreate with all required columns
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
  (c.query_params->>'endDate')::date as end_date,
  (c.query_params->>'birthDate')::date as birth_date,
  lower(coalesce(c.manager, c.query_params->>'manager')) as manager_key,
  coalesce(c.department, c.query_params->>'position') as position_key,
  lower(coalesce(c.department, c.query_params->>'position')) as location_key,
  coalesce(c.department, c.query_params->>'position') as position,
  false as has_five_star_badge,
  false as needs_six_month_review,
  false as needs_yearly_review,
  c.full_name
FROM public.contracts c;

-- Grant permissions
GRANT SELECT ON public.contracts_enriched TO authenticated;
GRANT SELECT ON public.contracts_enriched TO anon;

-- Refresh schema
NOTIFY pgrst, 'reload schema';

-- Success message
DO $$ BEGIN
  RAISE NOTICE '🧸 CONTRACTS_ENRICHED VIEW FIXED!';
  RAISE NOTICE '✅ Added staff_id and all required columns';
  RAISE NOTICE '✅ Permissions granted';
  RAISE NOTICE '✅ Refresh browser now!';
END $$;
