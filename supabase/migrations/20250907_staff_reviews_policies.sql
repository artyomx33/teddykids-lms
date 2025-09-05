-- Enable Row Level Security on staff_reviews table
ALTER TABLE public.staff_reviews ENABLE ROW LEVEL SECURITY;

-- Create permissive SELECT policy (anyone can read any reviews)
CREATE POLICY IF NOT EXISTS "staff_reviews_select_policy" 
ON public.staff_reviews
FOR SELECT 
USING (true);

-- Create permissive INSERT policy (anyone can create reviews)
CREATE POLICY IF NOT EXISTS "staff_reviews_insert_policy" 
ON public.staff_reviews
FOR INSERT 
WITH CHECK (true);

-- Create permissive UPDATE policy (anyone can update any reviews)
CREATE POLICY IF NOT EXISTS "staff_reviews_update_policy" 
ON public.staff_reviews
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Add comment explaining purpose
COMMENT ON TABLE public.staff_reviews IS 'Staff reviews with RLS enabled and permissive policies for MVP';
