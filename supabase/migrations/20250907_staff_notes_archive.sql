-- Add is_archived column to staff_notes table
ALTER TABLE public.staff_notes ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;

-- Backfill existing rows (safety check)
UPDATE public.staff_notes SET is_archived = false WHERE is_archived IS NULL;

-- Add index to support efficient queries filtering by archive status
-- This allows quick retrieval of non-archived notes for a staff member
CREATE INDEX IF NOT EXISTS idx_staff_notes_archived ON public.staff_notes(staff_id, is_archived, created_at DESC);

-- Add comment explaining purpose
COMMENT ON COLUMN public.staff_notes.is_archived IS 'When true, note is hidden by default in UI';
