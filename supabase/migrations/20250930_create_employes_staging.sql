-- Create staging table for employee data from Employes.nl
CREATE TABLE IF NOT EXISTS employes_staging (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    -- Employes.nl identifiers
    employes_employee_id TEXT NOT NULL,

    -- Raw data for debugging
    raw_employee_data JSONB,

    -- Extracted employee information
    employee_name TEXT NOT NULL,
    email TEXT,

    -- Employment dates
    start_date DATE,
    end_date DATE,

    -- Contract details
    contract_type TEXT DEFAULT 'permanent',
    department TEXT,

    -- Compensation
    hours_per_week NUMERIC,
    salary_amount NUMERIC,
    hourly_rate NUMERIC,

    -- Status
    status TEXT DEFAULT 'active',

    -- Metadata
    staged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_employes_staging_employee_id ON employes_staging(employes_employee_id);
CREATE INDEX IF NOT EXISTS idx_employes_staging_name ON employes_staging(employee_name);
CREATE INDEX IF NOT EXISTS idx_employes_staging_staged_at ON employes_staging(staged_at);

-- Add comments
COMMENT ON TABLE employes_staging IS 'Staging table for employee data from Employes.nl API - allows safe two-step sync process';
COMMENT ON COLUMN employes_staging.raw_employee_data IS 'Full JSON response from Employes.nl for debugging';
COMMENT ON COLUMN employes_staging.staged_at IS 'When this data was staged from the API';

-- Enable RLS (Row Level Security)
ALTER TABLE employes_staging ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Allow service role full access" ON employes_staging
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Allow authenticated users to read staging data
CREATE POLICY "Allow authenticated read access" ON employes_staging
    FOR SELECT USING (auth.role() = 'authenticated');