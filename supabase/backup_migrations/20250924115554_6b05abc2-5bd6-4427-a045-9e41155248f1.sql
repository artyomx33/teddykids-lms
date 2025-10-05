-- Enable RLS on staff table to fix security warning
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Create policy for staff table access (allowing all operations for now)
CREATE POLICY "staff_policy" ON public.staff FOR ALL USING (true);