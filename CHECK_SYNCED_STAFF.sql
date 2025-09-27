-- ============================================
-- 🧸🎉 CHECK SYNCED STAFF
-- ============================================
-- Let's see all the synced employees!
-- ============================================

-- Total count
SELECT COUNT(*) as total_synced_staff FROM public.staff;

-- All synced staff with details
SELECT
  id,
  full_name,
  email,
  phone_number,
  status,
  employes_id,
  zipcode,
  city,
  created_at,
  last_sync_at
FROM public.staff
ORDER BY created_at DESC;

-- Success message
DO $$ BEGIN
  RAISE NOTICE '🧸🎉 CHECKING ALL SYNCED EMPLOYEES!';
  RAISE NOTICE '✅ See the list above!';
END $$;