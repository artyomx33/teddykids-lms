-- ============================================
-- 🧸🔧 FORCE SCHEMA CACHE REFRESH
-- ============================================
-- Multiple ways to refresh the schema cache
-- ============================================

-- Method 1: PostgREST notification
NOTIFY pgrst, 'reload schema';

-- Method 2: PostgREST config notification
NOTIFY pgrst, 'reload config';

-- Method 3: Check if columns exist
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'staff'
AND table_schema = 'public'
AND column_name IN (
  'birth_date', 'start_date', 'employes_id', 'phone_number',
  'employee_number', 'hourly_wage', 'hours_per_week',
  'contract_type', 'zipcode', 'city', 'street_address',
  'house_number', 'iban', 'last_sync_at'
)
ORDER BY column_name;

-- Method 4: Force refresh by touching the table
COMMENT ON TABLE public.staff IS 'Staff table with Employes.nl sync columns - updated ' || now();

-- Success message
DO $$ BEGIN
  RAISE NOTICE '🧸 SCHEMA CACHE REFRESH ATTEMPTED!';
  RAISE NOTICE '✅ PostgREST notifications sent';
  RAISE NOTICE '✅ Table comment updated to trigger refresh';
  RAISE NOTICE '🔄 Check the column list above to verify';
END $$;