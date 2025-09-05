-- Enable Row Level Security on staff_notes table
ALTER TABLE public.staff_notes ENABLE ROW LEVEL SECURITY;

-- Create permissive SELECT policy (anyone can read any notes)
CREATE POLICY IF NOT EXISTS "staff_notes_select_policy" 
ON public.staff_notes
FOR SELECT 
USING (true);

-- Create permissive INSERT policy (anyone can create notes)
CREATE POLICY IF NOT EXISTS "staff_notes_insert_policy" 
ON public.staff_notes
FOR INSERT 
WITH CHECK (true);

-- Create permissive UPDATE policy (anyone can update any notes)
CREATE POLICY IF NOT EXISTS "staff_notes_update_policy" 
ON public.staff_notes
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Add comment explaining purpose
COMMENT ON TABLE public.staff_notes IS 'Staff notes with RLS enabled and permissive policies for MVP';
