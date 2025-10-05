-- Add metadata column to employes_changes table
-- This field stores additional context about the change (old/new values, dates, etc.)

ALTER TABLE employes_changes 
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Add GIN index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_changes_metadata 
ON employes_changes USING GIN (metadata);

-- Add comment
COMMENT ON COLUMN employes_changes.metadata IS 
'Additional context: old/new hourly/monthly/yearly wages, period dates, contract details, etc.';
