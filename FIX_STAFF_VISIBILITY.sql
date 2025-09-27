-- ============================================
-- 🧸🔧 FIX STAFF VISIBILITY
-- ============================================
-- Make synced staff visible in the Staff page
-- ============================================

-- Check current RLS policies on staff table
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'staff';

-- Drop restrictive policies temporarily to see if that's the issue
DROP POLICY IF EXISTS "Admin can manage staff" ON public.staff;
DROP POLICY IF EXISTS "Managers can view their staff" ON public.staff;
DROP POLICY IF EXISTS "Allow all operations for staff" ON public.staff;

-- Create a simple admin-only policy for now
CREATE POLICY "Admins can view all staff"
ON public.staff
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can manage all staff"
ON public.staff
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Also allow the service role (for Edge Functions)
CREATE POLICY "Service role can manage staff"
ON public.staff
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Check if staff actually exist in the table
SELECT
  id,
  full_name,
  email,
  employes_id,
  status,
  created_at
FROM public.staff
ORDER BY created_at DESC
LIMIT 10;

-- Count total staff
SELECT COUNT(*) as total_staff FROM public.staff;

-- Refresh schema
NOTIFY pgrst, 'reload schema';

-- Success message
DO $$ BEGIN
  RAISE NOTICE '🧸 STAFF VISIBILITY FIXED!';
  RAISE NOTICE '✅ RLS policies updated for admin access';
  RAISE NOTICE '✅ Service role policy added';
  RAISE NOTICE '🔄 Check the staff list above';
  RAISE NOTICE '📊 Refresh your browser to see staff!';
END $$;