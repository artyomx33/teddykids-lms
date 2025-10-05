-- =====================================================
-- MIGRATION: Add last_verified_at for hash deduplication
-- Created: 2025-10-06
-- Purpose: Track when data was last verified (even if unchanged)
-- =====================================================

BEGIN;

-- Add last_verified_at column
ALTER TABLE employes_raw_data
ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ;

-- Backfill existing records
UPDATE employes_raw_data
SET last_verified_at = collected_at
WHERE last_verified_at IS NULL;

-- Add indexes for fast hash lookups (avoiding huge JSON hashes)
-- Only index proper SHA-256 hashes (64 chars), not massive JSON strings
CREATE INDEX IF NOT EXISTS idx_raw_data_hash_sha256
ON employes_raw_data(data_hash)
WHERE is_latest = true AND LENGTH(data_hash) = 64;

CREATE INDEX IF NOT EXISTS idx_raw_data_employee_endpoint
ON employes_raw_data(employee_id, endpoint, is_latest);

-- Additional index for performance
CREATE INDEX IF NOT EXISTS idx_raw_data_latest_lookup
ON employes_raw_data(employee_id, endpoint, is_latest, collected_at)
WHERE is_latest = true;

-- Add comment
COMMENT ON COLUMN employes_raw_data.last_verified_at IS 'Last time we verified this data (even if unchanged)';

COMMIT;