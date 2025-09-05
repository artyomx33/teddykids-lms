-- Add intern status columns to staff table
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS is_intern boolean NOT NULL DEFAULT false;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS intern_year smallint;

-- Add comments explaining purpose
COMMENT ON COLUMN public.staff.is_intern IS 'Whether this staff member is an intern';
COMMENT ON COLUMN public.staff.intern_year IS 'Year of internship (1, 2, or 3)';

-- Create index to support filtering by intern status
CREATE INDEX IF NOT EXISTS idx_staff_intern ON public.staff(is_intern) WHERE is_intern = true;
