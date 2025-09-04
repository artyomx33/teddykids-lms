-- Staff core table
create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  location text,
  role text,
  status text default 'active', -- 'active' | 'inactive'
  created_at timestamptz default now()
);

create index if not exists idx_staff_name on public.staff (lower(full_name));
create index if not exists idx_staff_status on public.staff (status);

-- Reviews
create table if not exists public.staff_reviews (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff(id) on delete cascade,
  review_type text, -- '6mo' | 'yearly' | 'custom'
  review_date date not null,
  score int, -- 1..5
  summary text,
  raise boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_staff_reviews_staff on public.staff_reviews (staff_id);
create index if not exists idx_staff_reviews_date on public.staff_reviews (review_date);

-- Notes
create table if not exists public.staff_notes (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff(id) on delete cascade,
  note_type text, -- 'positive' | 'concern' | 'warning' | 'note'
  note text,
  created_at timestamptz default now()
);

create index if not exists idx_staff_notes_staff on public.staff_notes (staff_id);
create index if not exists idx_staff_notes_type on public.staff_notes (note_type);

-- Certificates (metadata table; files in storage)
create table if not exists public.staff_certificates (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null references public.staff(id) on delete cascade,
  title text,
  file_path text, -- storage path in 'certificates' bucket
  uploaded_at timestamptz default now()
);

create index if not exists idx_staff_certs_staff on public.staff_certificates (staff_id);

-- Storage bucket for certificates (public read for MVP)
insert into storage.buckets (id, name, public)
values ('certificates', 'certificates', true)
on conflict (id) do nothing;

-- View: derive staff meta from contracts (for fallback/bootstrapping)
create or replace view public.staff_from_contracts as
select
  min(c.created_at) as first_seen_at,
  min((c.query_params->>'startDate')::date) as first_contract_start,
  c.employee_name as full_name,
  lower(coalesce(c.manager, c.query_params->>'manager')) as manager_key,
  coalesce(c.department, c.query_params->>'position') as role_guess,
  count(*) as contract_count
from public.contracts c
group by c.employee_name, lower(coalesce(c.manager, c.query_params->>'manager')), coalesce(c.department, c.query_params->>'position');

-- Seed: upsert distinct employees into staff (by name) if staff is empty/new
insert into public.staff (full_name, role, status)
select sfc.full_name, sfc.role_guess, 'active'
from public.staff_from_contracts sfc
on conflict (full_name) do nothing;

-- Optional: function to refresh seed on demand (idempotent)
create or replace function public.sync_staff_from_contracts()
returns void language sql as $$
  insert into public.staff (full_name, role, status)
  select sfc.full_name, sfc.role_guess, 'active'
  from public.staff_from_contracts sfc
  on conflict (full_name) do nothing;
$$;
