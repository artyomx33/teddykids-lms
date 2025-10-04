-- Migration: 20250902_contracts.sql
-- Description: Creates contracts table and storage bucket for Teddy Kids Hub

-- Enable pgcrypto extension for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create contracts table
CREATE TABLE public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique identifier for each contract
    employee_name TEXT NOT NULL, -- Full name of the employee
    manager TEXT, -- Manager responsible for the contract
    status TEXT NOT NULL DEFAULT 'draft', -- Status: draft, generated, pending, signed
    contract_type TEXT, -- Type: full-time, part-time, temporary, casual
    department TEXT, -- Department: infant-care, toddler-care, preschool, after-school, administration
    signed_at TIMESTAMPTZ, -- When the contract was signed
    created_at TIMESTAMPTZ DEFAULT now(), -- When the contract was created
    pdf_path TEXT, -- Path to the PDF in storage
    query_params JSONB, -- Full form data as JSON
    
    -- Add constraints
    CONSTRAINT status_check CHECK (status IN ('draft', 'generated', 'pending', 'signed'))
);

-- Add table comment
COMMENT ON TABLE public.contracts IS 'Employee contracts for Teddy Kids childcare centers';

-- Add column comments
COMMENT ON COLUMN public.contracts.id IS 'Unique identifier for the contract';
COMMENT ON COLUMN public.contracts.employee_name IS 'Full name of the employee';
COMMENT ON COLUMN public.contracts.manager IS 'Manager responsible for the contract';
COMMENT ON COLUMN public.contracts.status IS 'Current status of the contract (draft, generated, pending, signed)';
COMMENT ON COLUMN public.contracts.contract_type IS 'Type of employment contract';
COMMENT ON COLUMN public.contracts.department IS 'Department the employee belongs to';
COMMENT ON COLUMN public.contracts.signed_at IS 'Timestamp when the contract was signed';
COMMENT ON COLUMN public.contracts.created_at IS 'Timestamp when the contract was created';
COMMENT ON COLUMN public.contracts.pdf_path IS 'Path to the PDF file in storage';
COMMENT ON COLUMN public.contracts.query_params IS 'Complete form data used to generate the contract';

-- Create contracts storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('contracts', 'contracts', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policy for the contracts table
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- For now, allow all operations since we're not using auth yet
CREATE POLICY "Allow all operations for contracts" 
ON public.contracts FOR ALL 
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- The 'contracts' storage bucket is marked public (public = true) above.
-- No additional storage RLS policies are required at this time.
