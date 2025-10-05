-- Contracts enriched materialized view for dashboard performance
create materialized view if not exists public.contracts_enriched_mat as
select
  c.id,
  c.employee_name,
  c.manager,
  lower(coalesce(c.manager, c.query_params->>'manager')) as manager_key,
  c.status,
  c.contract_type,
  c.department,
  c.created_at,
  to_date(c.query_params->>'startDate', 'YYYY-MM-DD') as start_date,
  to_date(c.query_params->>'endDate',   'YYYY-MM-DD') as end_date,
  to_date(c.query_params->>'birthDate', 'YYYY-MM-DD') as birth_date
from public.contracts c
with no data;

-- Indexes on the materialized view
create unique index if not exists idx_contracts_enriched_mat_id on public.contracts_enriched_mat (id);
create index if not exists idx_contracts_enriched_mat_start_date on public.contracts_enriched_mat (start_date);
create index if not exists idx_contracts_enriched_mat_end_date   on public.contracts_enriched_mat (end_date);
create index if not exists idx_contracts_enriched_mat_birth_date on public.contracts_enriched_mat (birth_date);
create index if not exists idx_contracts_enriched_mat_manager_key on public.contracts_enriched_mat (manager_key);

-- Plain view pointer used by the app
create or replace view public.contracts_enriched as
select * from public.contracts_enriched_mat;

-- Initial load (non-concurrent to allow running inside migration transaction)
refresh materialized view public.contracts_enriched_mat;
