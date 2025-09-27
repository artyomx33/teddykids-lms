-- Add manager and location_key columns to existing staff table
ALTER TABLE public.staff
ADD COLUMN IF NOT EXISTS manager text,
ADD COLUMN IF NOT EXISTS location_key text;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_staff_manager_lower ON public.staff (lower(manager));
CREATE INDEX IF NOT EXISTS idx_staff_location_key ON public.staff (location_key);

-- Add comments
COMMENT ON COLUMN public.staff.manager IS 'The name of the staff member''s manager';
COMMENT ON COLUMN public.staff.location_key IS 'Structured reference key for the staff member''s primary work location (RBW, LRZ, RB3&5, ZML)';

-- Verify columns were added
SELECT 'SUCCESS: Columns added' as result,
       array_agg(column_name) as new_columns
FROM information_schema.columns
WHERE table_name = 'staff'
AND table_schema = 'public'
AND column_name IN ('manager', 'location_key');