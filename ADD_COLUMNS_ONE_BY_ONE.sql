-- ============================================
-- 🧸⚡ ADD COLUMNS ONE BY ONE
-- ============================================
-- Add each column individually to see which one fails
-- ============================================

-- Add columns one at a time
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS employes_id TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS employee_number INTEGER;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS hourly_wage NUMERIC(10,2);
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS hours_per_week NUMERIC(5,2);
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS contract_type TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS zipcode TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS street_address TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS house_number TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS iban TEXT;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ;

-- Verify ALL columns now exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'staff'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Success message
DO $$ BEGIN
  RAISE NOTICE '🧸 COLUMNS ADDED ONE BY ONE!';
  RAISE NOTICE '✅ Check the column list above';
  RAISE NOTICE '🔄 Now run the visibility fix!';
END $$;