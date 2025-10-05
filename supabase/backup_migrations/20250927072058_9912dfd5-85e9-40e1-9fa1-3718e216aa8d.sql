-- Update location mappings to correct codes and addresses
-- Update existing incorrect location names to correct codes
UPDATE staff 
SET location = 'rbw' 
WHERE location IN ('rainbow', 'Rainbow', 'RAINBOW');

UPDATE staff 
SET location = 'zml' 
WHERE location IN ('zuiderpark', 'Zuiderpark', 'ZUIDERPARK');

-- Remove office and home locations if they exist
UPDATE staff 
SET location = NULL 
WHERE location IN ('office', 'Office', 'OFFICE', 'home', 'Home', 'HOME');

-- Create a locations reference table for mapping codes to addresses
CREATE TABLE IF NOT EXISTS public.locations (
  code text PRIMARY KEY,
  name text NOT NULL,
  address text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert correct location mappings
INSERT INTO public.locations (code, name, address) VALUES 
('rbw', 'Rijnsburgerweg 35', 'Rijnsburgerweg 35'),
('zml', 'Zeemanlaan 22a', 'Zeemanlaan 22a'),
('lrz', 'Lorentzkade 15a', 'Lorentzkade 15a'),
('rb3&5', 'Rijnsburgerweg 3&5', 'Rijnsburgerweg 3&5')
ON CONFLICT (code) DO UPDATE SET 
  name = EXCLUDED.name,
  address = EXCLUDED.address;

-- Enable RLS on locations table
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read locations
CREATE POLICY "Anyone can view locations" ON public.locations
  FOR SELECT TO authenticated USING (true);