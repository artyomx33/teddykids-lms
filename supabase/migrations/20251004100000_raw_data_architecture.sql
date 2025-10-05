-- ✨ RAW DATA ARCHITECTURE: Single Source of Truth
-- Created: 2025-10-04
-- Purpose: Store ALL employes.nl API responses with full history

-- Step 1: Create raw data table
CREATE TABLE IF NOT EXISTS employes_raw_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL,           -- Employes.nl employee ID
  endpoint TEXT NOT NULL,              -- Which API endpoint (/employee, /employments, etc)
  api_response JSONB NOT NULL,         -- FULL raw response stored here
  data_hash TEXT,                      -- Hash to detect changes
  collected_at TIMESTAMPTZ DEFAULT now(), -- Timestamp for every sync!
  is_latest BOOLEAN DEFAULT true,      -- Flag for latest version

  -- This ensures we keep history but mark latest
  CONSTRAINT unique_latest_data UNIQUE(employee_id, endpoint, is_latest) DEFERRABLE INITIALLY DEFERRED
);

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_employes_raw_employee ON employes_raw_data(employee_id);
CREATE INDEX IF NOT EXISTS idx_employes_raw_latest ON employes_raw_data(is_latest) WHERE is_latest = true;
CREATE INDEX IF NOT EXISTS idx_employes_raw_collected ON employes_raw_data(collected_at DESC);
CREATE INDEX IF NOT EXISTS idx_employes_raw_endpoint ON employes_raw_data(endpoint);

-- Step 3: Add comments for clarity
COMMENT ON TABLE employes_raw_data IS 'Single source of truth for ALL employes.nl API responses with full history';
COMMENT ON COLUMN employes_raw_data.employee_id IS 'Employes.nl employee identifier';
COMMENT ON COLUMN employes_raw_data.endpoint IS 'API endpoint path (e.g., /employee, /employments)';
COMMENT ON COLUMN employes_raw_data.api_response IS 'Complete JSON response from employes.nl API';
COMMENT ON COLUMN employes_raw_data.collected_at IS 'Timestamp when data was fetched from API';
COMMENT ON COLUMN employes_raw_data.is_latest IS 'True for current version, false for historical records';

-- Step 4: Grant permissions
GRANT SELECT, INSERT, UPDATE ON employes_raw_data TO authenticated;
GRANT SELECT, INSERT, UPDATE ON employes_raw_data TO service_role;

-- Step 5: Add RLS policy
ALTER TABLE employes_raw_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read raw data" ON employes_raw_data
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allow service role full access to raw data" ON employes_raw_data
  FOR ALL TO service_role
  USING (true);