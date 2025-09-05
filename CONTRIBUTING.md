# Contributing to Teddy LMS

Welcome!  
This repo is a Vite + React (TypeScript) monorepo backed by Supabase and React Query.  
Please follow the guidelines below so Dev ↔ Prod stays smooth.

---

## 1. Branch strategy

| Branch | Purpose | Vercel env | Domain |
|--------|---------|------------|--------|
| `main` | Production – stable, released features | Production | `app.teddykids.nl` |
| `dev`  | Always-on development playground | Preview (public) | `dev.teddykids.nl` |
| `feature/*` | Short-lived work branches | — | — |

Flow:

1. `git checkout -b feature/my-change`
2. Commit → open **PR into `dev`**.
3. Vercel auto-deploys `dev` — test UI & API.
4. When QA passes, open PR `dev → main` (tag “Release”).
5. Merge → Vercel deploys to production.

*Deploy Previews may remain ON, but “Protected Previews” must be OFF so `dev` stays publicly callable.*

---

## 2. Environment variables (set in Vercel ➜ Settings ➜ Environment Variables)

Add **to both Preview & Production**:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `https://gjlgaufihseaagzmidhc.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | *Supabase anon key* |
| `DATABASE_URL` | `postgresql://postgres.gjlgaufihseaagzmidhc:00Arttyomx%21@aws-1-eu-central-2.pooler.supabase.com:6543/postgres?sslmode=require` |

---

## 3. Database migrations

* Folder: `supabase/migrations`
* One file per logical change, name `YYYYMMDD_descriptive.sql`.
* Always include `CREATE EXTENSION IF NOT EXISTS pgcrypto;` if you need `gen_random_uuid()`.
* Apply in **Supabase _dev_** first → verify → promote to prod via Supabase dashboard.
* Front-end should **query `public.contracts_enriched` view only** (never the *_mat MV).

---

## 4. Refreshing the materialised view

After any write that should instantly update review flags (e.g. adding a review) call:

```ts
import { refreshContractsCache } from '@/lib/refreshContractsCache';
await refreshContractsCache(); // fire-and-forget
```

Endpoint: `POST /api/db/refresh-contracts-cache`  
Cron still refreshes hourly + nightly, so this is optional but nice for UX.

---

## 5. Coding standards

* TypeScript strict, ESLint passes (`npm run lint`).
* Build passes (`npm run build`).
* Use React Query for all network state.
* Prefer **supabase-js v2** helpers in `src/integrations/supabase`.
* Reuse Shadcn-UI components; no ad-hoc CSS.

---

## 6. Pull request checklist

- [ ] Target branch correct (`feature/* → dev`, `dev → main` for releases).
- [ ] `npm run lint && npm run build` succeed locally.
- [ ] If DB schema changed, migration file added & applied to dev Supabase.
- [ ] If flags affected, call `refreshContractsCache()` in the code path.
- [ ] Updated/added tests or storybook if relevant.
- [ ] PR description explains “what/why”; add “Droid-assisted PR” tag if Factory helped.

---

## 7. Local setup

```bash
pnpm install          # or npm / bun
pnpm dev              # Vite dev server
supabase start        # optional local Supabase
```

---

### Questions?

Open an issue or ping @artyomx33 / @lunadev in Slack. Happy coding!

---

## 8. Data-safety rules (avoid overwrites)

• **Append-only notes**  
  Keep notes in `public.staff_notes`. In UI use “Add note” → `insert()`.  
  Editing a note updates that **row only** – never store notes inside a staff JSON blob.

• **PATCH semantics**  
  Send *only* changed columns:  
  ```ts
  await supabase.from('staff').update({ position: form.position })
    .eq('id', staffId);
  ```  
  Avoid “full-row” updates unless intentional.

• **JSONB merge, don’t replace**  
  ```sql
  -- SQL merge example
  update public.staff
  set intern_meta = coalesce(intern_meta,'{}'::jsonb) || '{"school":"ROC"}'::jsonb
  where id = :staff_id;
  ```  
  RPC wrapper:
  ```sql
  create or replace function public.patch_intern_meta(p_staff uuid, p_patch jsonb)
  returns void language sql as $$
    update public.staff
    set intern_meta = coalesce(intern_meta,'{}'::jsonb) || p_patch
    where id = p_staff;
  $$;
  ```

• **Optimistic locking**  
  `public.staff.row_version bigint` auto-increments via trigger.  
  Clients include it when updating:  
  ```ts
  await supabase.from('staff')
    .update({ location: form.location })
    .eq('id', staffId)
    .eq('row_version', currentRowVersion); // 0 rows ⇒ stale → prompt reload
  ```

• **Safe migrations**  
  Prefer `ALTER TABLE … ADD COLUMN`; keep seeds idempotent.  
  If a table must be rebuilt: copy → swap names inside a single migration.  
  Views: always `CREATE OR REPLACE VIEW` (safe).

• **E2E guard**  
  Cypress test:  
  1. Insert a note.  
  2. Update an unrelated staff field (e.g., role).  
  3. Re-fetch notes → ensure the note still exists (not overwritten).
