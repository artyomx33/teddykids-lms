-- ============================================
-- 🧸⚡ RESTORE STAFF OPTIMIZATIONS
-- ============================================
-- Recreate staff_docs_status view and fix missing functions
-- ============================================

-- Create or replace view for staff document status
CREATE OR REPLACE VIEW public.staff_docs_status AS
SELECT
  s.id AS staff_id,
  s.full_name,
  s.is_intern,
  s.intern_year,
  -- Individual document missing flags
  NOT COALESCE((s.staff_docs->'id_card'->>'received')::boolean, false) AS id_card_missing,
  NOT COALESCE((s.staff_docs->'bank_card'->>'received')::boolean, false) AS bank_card_missing,
  NOT COALESCE((s.staff_docs->'pok'->>'received')::boolean, false) AS pok_missing,
  NOT COALESCE((s.staff_docs->'vog'->>'received')::boolean, false) AS vog_missing,
  NOT COALESCE((s.staff_docs->'prk'->>'received')::boolean, false) AS prk_missing,
  NOT COALESCE((s.staff_docs->'employees'->>'received')::boolean, false) AS employees_missing,
  NOT COALESCE((s.staff_docs->'portobase'->>'received')::boolean, false) AS portobase_missing,
  -- Total missing count
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

-- Add comment
COMMENT ON VIEW public.staff_docs_status IS 'Staff document status with missing flags and counts for filtering';

-- Grant permissions
GRANT SELECT ON public.staff_docs_status TO authenticated;
GRANT SELECT ON public.staff_docs_status TO service_role;

-- Refresh schema
NOTIFY pgrst, 'reload schema';

-- Success message
DO $$ BEGIN
  RAISE NOTICE '🧸⚡ STAFF OPTIMIZATIONS RESTORED!';
  RAISE NOTICE '✅ staff_docs_status view created';
  RAISE NOTICE '✅ Permissions granted';
  RAISE NOTICE '✅ Schema refreshed';
  RAISE NOTICE '🔄 Refresh browser to see filters and improved performance!';
END $$;