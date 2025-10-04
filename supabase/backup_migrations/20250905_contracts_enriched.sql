-- ===========================================
-- Migration: contracts_enriched (materialized)
-- Date: 2025-09-05
-- ===========================================

-- 1. Drop old objects safely
DROP VIEW IF EXISTS public.contracts_enriched CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.contracts_enriched_mat;

-- 2. Create materialized view (derived columns from current contracts schema)
CREATE MATERIALIZED VIEW public.contracts_enriched_mat AS
SELECT
    c.id,
    s.id AS staff_id,
    COALESCE(s.full_name, c.employee_name) AS full_name,
    COALESCE(c.department, c.query_params->>'position') AS position,
    lower(COALESCE(c.query_params->>'cityOfEmployment', 'unknown')) AS location_key,
    lower(COALESCE(c.manager, c.query_params->>'manager')) AS manager_key,
    to_date(c.query_params->>'startDate', 'YYYY-MM-DD') AS start_date,
    to_date(c.query_params->>'endDate',   'YYYY-MM-DD') AS end_date,
    to_date(c.query_params->>'birthDate', 'YYYY-MM-DD') AS birth_date,
    c.created_at,
    COALESCE(c.signed_at, c.created_at) AS updated_at
FROM public.contracts AS c
LEFT JOIN public.staff AS s
  ON lower(s.full_name) = lower(c.employee_name);

-- 3. Indexes
-- Unique index required by some refresh strategies and speeds lookups by id
CREATE UNIQUE INDEX IF NOT EXISTS idx_contracts_enriched_mat_id
    ON public.contracts_enriched_mat (id);

-- Filtering by manager + end_date is common
CREATE INDEX IF NOT EXISTS idx_contracts_mgr_end
    ON public.contracts_enriched_mat (manager_key, end_date);

-- Filtering by location + end_date is also common
CREATE INDEX IF NOT EXISTS idx_contracts_loc_end
    ON public.contracts_enriched_mat (location_key, end_date);

-- 4. Wrapper view (app queries this, not the MV)
CREATE OR REPLACE VIEW public.contracts_enriched AS
SELECT * FROM public.contracts_enriched_mat;

-- 5. Initial populate (non-concurrent to be migration-safe)
REFRESH MATERIALIZED VIEW public.contracts_enriched_mat;
