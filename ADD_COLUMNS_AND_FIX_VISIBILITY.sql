-- ============================================
-- 🧸⚡ ADD COLUMNS + FIX VISIBILITY (COMPLETE)
-- ============================================
-- Add all columns AND fix RLS policies
-- ============================================

-- First, add ALL missing columns
ALTER TABLE public.staff
ADD COLUMN IF NOT EXISTS employes_id TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS employee_number INTEGER,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS hourly_wage NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS hours_per_week NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS contract_type TEXT,
ADD COLUMN IF NOT EXISTS zipcode TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS street_address TEXT,
ADD COLUMN IF NOT EXISTS house_number TEXT,
ADD COLUMN IF NOT EXISTS iban TEXT,
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ;

-- Verify columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'staff'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Now fix RLS policies
DROP POLICY IF EXISTS "Admin can manage staff" ON public.staff;
DROP POLICY IF EXISTS "Managers can view their staff" ON public.staff;
DROP POLICY IF EXISTS "Allow all operations for staff" ON public.staff;
DROP POLICY IF EXISTS "Admins can view all staff" ON public.staff;
DROP POLICY IF EXISTS "Admins can manage all staff" ON public.staff;
DROP POLICY IF EXISTS "Service role can manage staff" ON public.staff;

-- Create simple admin policies
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

-- Service role policy for Edge Functions
CREATE POLICY "Service role full access"
ON public.staff
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_staff_employes_id ON public.staff (employes_id);
CREATE INDEX IF NOT EXISTS idx_staff_employee_number ON public.staff (employee_number);

-- Check staff count
SELECT COUNT(*) as total_staff FROM public.staff;

-- Show recent staff (should now work!)
SELECT
  id,
  full_name,
  email,
  status,
  created_at
FROM public.staff
ORDER BY created_at DESC
LIMIT 5;

-- Refresh schema
NOTIFY pgrst, 'reload schema';

-- Success message
DO $$ BEGIN
  RAISE NOTICE '🧸⚡ COMPLETE FIX APPLIED!';
  RAISE NOTICE '✅ All 14 columns added to staff table';
  RAISE NOTICE '✅ RLS policies configured for admin access';
  RAISE NOTICE '✅ Service role policy added';
  RAISE NOTICE '✅ Indexes created';
  RAISE NOTICE '✅ Schema refreshed';
  RAISE NOTICE '🔄 Refresh browser and check /staff page!';
END $$;