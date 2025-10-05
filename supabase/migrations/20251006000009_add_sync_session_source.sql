-- Add source tracking to sync sessions
-- This allows us to distinguish between manual and scheduled syncs

ALTER TABLE employes_sync_sessions 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'scheduler', 'api', 'webhook'));

ALTER TABLE employes_sync_sessions 
ADD COLUMN IF NOT EXISTS triggered_by TEXT;

-- Add index for querying by source
CREATE INDEX IF NOT EXISTS idx_sync_sessions_source ON employes_sync_sessions(source, started_at DESC);

-- Add comment
COMMENT ON COLUMN employes_sync_sessions.source IS 'Source of sync trigger: manual (UI button), scheduler (cron), api (external), webhook (external)';
COMMENT ON COLUMN employes_sync_sessions.triggered_by IS 'User email for manual syncs, "system" for scheduler, or external identifier';
