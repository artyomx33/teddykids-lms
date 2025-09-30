-- Create staging table for employee data from Employes.nl
CREATE TABLE IF NOT EXISTS employes_staging (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employes_employee_id TEXT NOT NULL,
    raw_employee_data JSONB,
    employee_name TEXT NOT NULL,
    email TEXT,
    start_date DATE,
    end_date DATE,
    contract_type TEXT DEFAULT 'permanent',
    department TEXT,
    hours_per_week NUMERIC,
    salary_amount NUMERIC,
    hourly_rate NUMERIC,
    status TEXT DEFAULT 'active',
    staged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_employes_staging_employee_id ON employes_staging(employes_employee_id);
CREATE INDEX IF NOT EXISTS idx_employes_staging_name ON employes_staging(employee_name);

-- Enable RLS and add policies
ALTER TABLE employes_staging ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow service role full access" ON employes_staging;
DROP POLICY IF EXISTS "Allow authenticated read access" ON employes_staging;

-- Allow service role full access
CREATE POLICY "Allow service role full access" ON employes_staging
    FOR ALL USING (true);

-- Allow authenticated users to read
CREATE POLICY "Allow authenticated read access" ON employes_staging
    FOR SELECT USING (auth.role() = 'authenticated');