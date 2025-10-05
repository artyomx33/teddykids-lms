-- COMPLETE FRESH START
-- Clear ALL data from temporal tables for clean rebuild

-- Clear all raw data
TRUNCATE TABLE employes_raw_data CASCADE;

-- Clear all changes
TRUNCATE TABLE employes_changes CASCADE;

-- Clear all sync sessions
TRUNCATE TABLE employes_sync_sessions CASCADE;

-- Clear all sync logs
TRUNCATE TABLE employes_sync_logs CASCADE;

-- Refresh materialized view
REFRESH MATERIALIZED VIEW employes_timeline;
