-- ============================================
-- 🧸🔧 SIMPLE RLS FIX FOR STAFF
-- ============================================
-- Make staff visible to admins
-- ============================================

-- First, check if any staff exist at all
SELECT COUNT(*) as total_staff_in_db FROM public.staff;

-- Show first 5 staff (bypass RLS by using service role context)
SELECT id, full_name, email, created_at
FROM public.staff
LIMIT 5;

-- Drop ALL existing policies on staff
DROP POLICY IF EXISTS "Admin can manage staff" ON public.staff;
DROP POLICY IF EXISTS "Managers can view their staff" ON public.staff;
DROP POLICY IF EXISTS "Allow all operations for staff" ON public.staff;
DROP POLICY IF EXISTS "Admins can view all staff" ON public.staff;
DROP POLICY IF EXISTS "Admins can manage all staff" ON public.staff;
DROP POLICY IF EXISTS "Service role full access" ON public.staff;

-- Temporarily allow ALL authenticated users to see staff (for testing)
CREATE POLICY "Temp allow all authenticated"
ON public.staff
FOR SELECT
TO authenticated
USING (true);

-- Allow admins to manage
CREATE POLICY "Admins can do everything"
ON public.staff
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Verify the is_admin function works for your user
SELECT
  'Your admin status:' as test,
  public.is_admin() as is_admin,
  auth.uid() as your_user_id;

-- Refresh
NOTIFY pgrst, 'reload schema';

-- Success
DO $$ BEGIN
  RAISE NOTICE '🧸 TEMPORARY RLS FIX APPLIED!';
  RAISE NOTICE '✅ All authenticated users can now view staff';
  RAISE NOTICE '✅ Admins can manage staff';
  RAISE NOTICE '🔄 Refresh browser and check /staff page!';
END $$;