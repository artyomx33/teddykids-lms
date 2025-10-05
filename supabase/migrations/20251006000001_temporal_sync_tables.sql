
-- Clean up legacy tables from earlier architecture
DROP TABLE IF EXISTS employes_sync_metrics CASCADE;
DROP TABLE IF EXISTS employes_sync_logs CASCADE;
DROP TABLE IF EXISTS employes_sync_sessions CASCADE;

-- 1. Sync Sessions -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS employes_sync_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_type TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running',
  total_records INTEGER DEFAULT 0,
  successful_records INTEGER DEFAULT 0,
  failed_records INTEGER DEFAULT 0,
  sync_details JSONB DEFAULT '{}'::jsonb,
  source_function TEXT,
  triggered_by TEXT,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_sync_sessions_type ON employes_sync_sessions(session_type, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_sessions_status ON employes_sync_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sync_sessions_started ON employes_sync_sessions(started_at DESC);

COMMENT ON TABLE employes_sync_sessions IS 'Tracks each run of snapshot/history/change syncs with status and metrics.';
COMMENT ON COLUMN employes_sync_sessions.session_type IS 'snapshot | history | change_detect | timeline | query | monitor | other';
COMMENT ON COLUMN employes_sync_sessions.sync_details IS 'JSON payload with extra context (API rate limits, errors, etc.)';

-- 2. Sync Logs ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employes_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  operation TEXT NOT NULL,
  status TEXT NOT NULL,
  function_name TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  sync_session_id UUID REFERENCES employes_sync_sessions(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_operation ON employes_sync_logs(operation, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON employes_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_session ON employes_sync_logs(sync_session_id, logged_at DESC);

COMMENT ON TABLE employes_sync_logs IS 'Structured logging for temporal services (operations, errors, diagnostics).';

-- 3. Sync Metrics ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS employes_sync_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  session_id UUID REFERENCES employes_sync_sessions(id) ON DELETE CASCADE,
  employee_id TEXT,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_sync_metrics_date ON employes_sync_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_sync_metrics_name ON employes_sync_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_sync_metrics_employee ON employes_sync_metrics(employee_id);

COMMENT ON TABLE employes_sync_metrics IS 'Daily metrics for sync quality and completeness (missing hours, API errors, etc.).';

-- 4. Permissions & Policies --------------------------------------------------
GRANT ALL ON employes_sync_sessions TO service_role;
GRANT ALL ON employes_sync_logs TO service_role;
GRANT ALL ON employes_sync_metrics TO service_role;

GRANT SELECT ON employes_sync_sessions TO authenticated;
GRANT SELECT ON employes_sync_logs TO authenticated;
GRANT SELECT ON employes_sync_metrics TO authenticated;

ALTER TABLE employes_sync_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE employes_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE employes_sync_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all_sync_sessions" ON employes_sync_sessions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_sync_logs" ON employes_sync_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service_role_all_sync_metrics" ON employes_sync_metrics
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "authenticated_read_sync_sessions" ON employes_sync_sessions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read_sync_logs" ON employes_sync_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read_sync_metrics" ON employes_sync_metrics
  FOR SELECT TO authenticated USING (true);

-- ============================================================================
-- END
-- ============================================================================
