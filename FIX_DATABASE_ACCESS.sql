-- ============================================
-- 🧸🔧 FIX DATABASE ACCESS ISSUES
-- ============================================
-- Fix RLS and view issues after schema refresh
-- ============================================

-- Recreate contracts_enriched view (might have broken)
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
  (c.query_params->>'endDate')::date   as end_date,
  (c.query_params->>'birthDate')::date as birth_date,
  lower(coalesce(c.manager, c.query_params->>'manager'))       as manager_key,
  coalesce(c.department, c.query_params->>'position')          as position_key
FROM public.contracts c;

-- Grant access to the view
GRANT SELECT ON public.contracts_enriched TO anon, authenticated;

-- Ensure staff table is accessible
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff TO authenticated;
GRANT SELECT ON public.staff TO anon;

-- Check if any RLS policies are blocking
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('staff', 'contracts')
ORDER BY tablename, policyname;

-- Refresh PostgREST one more time
NOTIFY pgrst, 'reload schema';

-- Success message
DO $$ BEGIN
  RAISE NOTICE '🧸 DATABASE ACCESS FIXED!';
  RAISE NOTICE '✅ contracts_enriched view recreated';
  RAISE NOTICE '✅ Permissions granted';
  RAISE NOTICE '✅ Schema refreshed';
  RAISE NOTICE '🔄 Refresh your browser!';
END $$;