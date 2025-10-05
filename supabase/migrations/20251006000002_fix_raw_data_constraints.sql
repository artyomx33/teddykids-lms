-- Fix temporal architecture constraints
-- 1. Remove the problematic text-based hash index
-- 2. Relax the unique_latest_endpoint constraint to allow multiple endpoints per employee

-- Drop the oversized hash index
DROP INDEX IF EXISTS idx_raw_hash;

-- Create a hash-based index instead (MD5 of data_hash for fixed size)
CREATE INDEX idx_raw_hash_md5 ON employes_raw_data(md5(data_hash));

-- Drop the overly restrictive unique constraint
-- (It was preventing us from having both /employees and /employments marked as latest)
ALTER TABLE employes_raw_data 
DROP CONSTRAINT IF EXISTS unique_latest_endpoint;

-- Create a more flexible unique constraint that allows multiple endpoints to be "latest"
-- but prevents duplicate (employee_id, endpoint, is_latest=true) combinations
CREATE UNIQUE INDEX unique_latest_per_endpoint 
ON employes_raw_data(employee_id, endpoint) 
WHERE is_latest = true;

-- Add comment explaining the design
COMMENT ON INDEX unique_latest_per_endpoint IS 
'Ensures only one latest record per employee per endpoint. Allows /employees and /employments to both be marked latest for the same employee.';
