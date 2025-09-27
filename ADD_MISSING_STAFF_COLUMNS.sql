-- ============================================
-- 🧸⚡ ADD MISSING STAFF COLUMNS
-- ============================================
-- Add is_intern, intern_year, and staff_docs columns
-- ============================================

-- Check current columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'staff'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add missing columns
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS is_intern BOOLEAN DEFAULT false;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS intern_year INTEGER;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS staff_docs JSONB DEFAULT '{}'::jsonb;

-- Verify columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'staff'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Refresh schema
NOTIFY pgrst, 'reload schema';

-- Success message
DO $$ BEGIN
  RAISE NOTICE '🧸 MISSING COLUMNS ADDED!';
  RAISE NOTICE '✅ is_intern, intern_year, staff_docs columns added';
  RAISE NOTICE '✅ Now run RESTORE_STAFF_OPTIMIZATIONS.sql';
END $$;
