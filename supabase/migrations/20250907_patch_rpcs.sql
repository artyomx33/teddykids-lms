-- Add JSONB columns to staff table (if they don't exist)
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS intern_meta JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS staff_docs JSONB DEFAULT '{}'::jsonb;

-- Add comments explaining purpose
COMMENT ON COLUMN public.staff.intern_meta IS 'Intern-specific metadata (school, supervisor, etc)';
COMMENT ON COLUMN public.staff.staff_docs IS 'Document tracking and completion status';

-- Create patch_intern_meta RPC
-- Safely merges provided JSONB with existing intern_meta (no overwrites)
CREATE OR REPLACE FUNCTION public.patch_intern_meta(p_staff_id UUID, p_patch JSONB)
RETURNS VOID LANGUAGE SQL AS $$
  UPDATE public.staff
  SET intern_meta = COALESCE(intern_meta, '{}'::jsonb) || p_patch
  WHERE id = p_staff_id;
$$;

-- Create patch_staff_docs RPC
-- Safely merges provided JSONB with existing staff_docs (no overwrites)
CREATE OR REPLACE FUNCTION public.patch_staff_docs(p_staff_id UUID, p_patch JSONB)
RETURNS VOID LANGUAGE SQL AS $$
  UPDATE public.staff
  SET staff_docs = COALESCE(staff_docs, '{}'::jsonb) || p_patch
  WHERE id = p_staff_id;
$$;

-- Add comments explaining functions
COMMENT ON FUNCTION public.patch_intern_meta IS 'Safely patch intern_meta JSONB without overwriting existing keys';
COMMENT ON FUNCTION public.patch_staff_docs IS 'Safely patch staff_docs JSONB without overwriting existing keys';
