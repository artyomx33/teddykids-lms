-- ===========================================
-- Migration: contracts_enriched (flags + cron)
-- Date: 2025-09-06
-- ===========================================

-- 1) Drop wrappers first to avoid deps
DROP VIEW IF EXISTS public.contracts_enriched CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.contracts_enriched_mat;

-- 2) Recreate MV with flags
CREATE MATERIALIZED VIEW public.contracts_enriched_mat AS
SELECT
  c.id,
  s1.id AS staff_id,
  COALESCE(s1.full_name, c.employee_name) AS full_name,
  COALESCE(c.department, c.query_params->>'position') AS position,
  lower(COALESCE(c.query_params->>'cityOfEmployment', 'unknown')) AS location_key,
  lower(COALESCE(c.manager, c.query_params->>'manager')) AS manager_key,
  to_date(c.query_params->>'startDate', 'YYYY-MM-DD') AS start_date,
  to_date(c.query_params->>'endDate',   'YYYY-MM-DD') AS end_date,
  to_date(c.query_params->>'birthDate', 'YYYY-MM-DD') AS birth_date,
  c.created_at,
  COALESCE(c.signed_at, c.created_at) AS updated_at,

  -- Enrichments via LATERAL subqueries
  fc.first_start,
  lr.last_review_date,
  lr.avg_review_score,
  (COALESCE(lr.avg_review_score, 0) = 5.00) AS has_five_star_badge,
  (lr.last_review_date IS NULL AND fc.first_start IS NOT NULL AND now()::date >= (fc.first_start + interval '6 months')::date) AS needs_six_month_review,
  (lr.last_review_date IS NOT NULL AND now()::date >= (lr.last_review_date + interval '12 months')::date) AS needs_yearly_review,
  CASE
    WHEN lr.last_review_date IS NULL AND fc.first_start IS NOT NULL
      THEN (fc.first_start + interval '6 months')::date
    WHEN lr.last_review_date IS NOT NULL
      THEN (lr.last_review_date + interval '12 months')::date
    ELSE NULL
  END AS next_review_due
FROM public.contracts AS c
LEFT JOIN LATERAL (
  SELECT s.id, s.full_name, s.created_at
  FROM public.staff s
  WHERE lower(s.full_name) = lower(c.employee_name)
  ORDER BY s.created_at DESC, s.id DESC
  LIMIT 1
) s1 ON true
LEFT JOIN LATERAL (
  SELECT min(to_date(c2.query_params->>'startDate','YYYY-MM-DD')) AS first_start
  FROM public.contracts c2
  WHERE lower(c2.employee_name) = lower(c.employee_name)
) fc ON true
LEFT JOIN LATERAL (
  SELECT max(r.review_date)::date AS last_review_date,
         avg(r.score)::numeric(3,2) AS avg_review_score
  FROM public.staff_reviews r
  WHERE r.staff_id = s1.id
) lr ON true;

-- 3) Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_contracts_enriched_mat_id ON public.contracts_enriched_mat (id);
CREATE INDEX IF NOT EXISTS idx_contracts_mgr_end ON public.contracts_enriched_mat (manager_key, end_date);
CREATE INDEX IF NOT EXISTS idx_contracts_loc_end ON public.contracts_enriched_mat (location_key, end_date);
CREATE INDEX IF NOT EXISTS idx_contracts_review_flags ON public.contracts_enriched_mat (needs_six_month_review, needs_yearly_review, has_five_star_badge);

-- 4) Wrapper view
CREATE OR REPLACE VIEW public.contracts_enriched AS SELECT * FROM public.contracts_enriched_mat;

-- 5) Initial (non-concurrent) populate
REFRESH MATERIALIZED VIEW public.contracts_enriched_mat;

-- 6) Schedule auto-refresh via pg_cron (safe if already exists)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
-- Nightly at 02:05
SELECT cron.schedule('refresh_contracts_enriched_nightly', '5 2 * * *', $$ REFRESH MATERIALIZED VIEW CONCURRENTLY public.contracts_enriched_mat; $$);
-- Hourly at :15
SELECT cron.schedule('refresh_contracts_enriched_hourly', '15 * * * *', $$ REFRESH MATERIALIZED VIEW CONCURRENTLY public.contracts_enriched_mat; $$);
