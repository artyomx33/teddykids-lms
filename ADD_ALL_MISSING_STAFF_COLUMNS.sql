-- ============================================
-- 🧸⚡ ADD ALL MISSING STAFF COLUMNS FOR EMPLOYES SYNC
-- ============================================
-- Add all the missing columns that the sync needs (complete list)
-- ============================================

-- Add missing columns to staff table
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

-- Update existing status column if needed
ALTER TABLE public.staff
ALTER COLUMN status TYPE TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_staff_employes_id ON public.staff (employes_id);
CREATE INDEX IF NOT EXISTS idx_staff_employee_number ON public.staff (employee_number);
CREATE INDEX IF NOT EXISTS idx_staff_phone ON public.staff (phone_number);
CREATE INDEX IF NOT EXISTS idx_staff_zipcode ON public.staff (zipcode);
CREATE INDEX IF NOT EXISTS idx_staff_last_sync ON public.staff (last_sync_at);

-- Add constraints for data integrity
ALTER TABLE public.staff
DROP CONSTRAINT IF EXISTS unique_employes_id,
ADD CONSTRAINT unique_employes_id UNIQUE (employes_id);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Verify the new columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'staff'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Success message
DO $$ BEGIN
  RAISE NOTICE '🧸⚡ STAFF TABLE FULLY ENHANCED FOR EMPLOYES SYNC!';
  RAISE NOTICE '✅ Added: employes_id, phone_number, employee_number';
  RAISE NOTICE '✅ Added: birth_date, start_date, hourly_wage, hours_per_week';
  RAISE NOTICE '✅ Added: contract_type, zipcode, city, street_address';
  RAISE NOTICE '✅ Added: house_number, iban, last_sync_at';
  RAISE NOTICE '✅ Added indexes and constraints';
  RAISE NOTICE '✅ Schema cache refreshed';
  RAISE NOTICE '🚀 Ready for employee synchronization!';
END $$;