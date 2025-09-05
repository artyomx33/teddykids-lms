-- Enable Row Level Security on staff_certificates table
ALTER TABLE public.staff_certificates ENABLE ROW LEVEL SECURITY;

-- Create permissive SELECT policy (anyone can read any certificates)
CREATE POLICY IF NOT EXISTS "staff_certificates_select_policy" 
ON public.staff_certificates
FOR SELECT 
USING (true);

-- Create permissive INSERT policy (anyone can create certificates)
CREATE POLICY IF NOT EXISTS "staff_certificates_insert_policy" 
ON public.staff_certificates
FOR INSERT 
WITH CHECK (true);

-- Create permissive UPDATE policy (anyone can update any certificates)
CREATE POLICY IF NOT EXISTS "staff_certificates_update_policy" 
ON public.staff_certificates
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Add comment explaining purpose
COMMENT ON TABLE public.staff_certificates IS 'Staff certificates with RLS enabled and permissive policies for MVP';
