-- Add row_version column for optimistic locking
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS row_version bigint NOT NULL DEFAULT 0;

-- Create function to bump version on update
CREATE OR REPLACE FUNCTION public.bump_row_version()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.row_version := OLD.row_version + 1;
  RETURN NEW;
END;
$$;

-- Create trigger to automatically bump version on update
DROP TRIGGER IF EXISTS trg_staff_version ON public.staff;
CREATE TRIGGER trg_staff_version
  BEFORE UPDATE ON public.staff
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_row_version();

-- Add comment explaining purpose
COMMENT ON COLUMN public.staff.row_version IS 'Incremented on update for optimistic locking';
