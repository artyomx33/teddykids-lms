-- Contracts Dashboard indexes and view (Option A: no schema change)
create index if not exists idx_contracts_end_date
  on public.contracts (((query_params->>'endDate')::date));

create index if not exists idx_contracts_birth_date
  on public.contracts (((query_params->>'birthDate')::date));

create index if not exists idx_contracts_manager
  on public.contracts ((lower(coalesce(manager, query_params->>'manager', ''))));

create or replace view public.contracts_enriched as
select
  id,
  employee_name,
  manager,
  department,
  status,
  created_at,
  signed_at,
  pdf_path,
  (query_params->>'endDate')::date   as end_date,
  (query_params->>'birthDate')::date as birth_date,
  lower(coalesce(manager, query_params->>'manager'))       as manager_key,
  coalesce(department, query_params->>'position')          as position_key
from public.contracts;
