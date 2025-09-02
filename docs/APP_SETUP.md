# TeddyKids LMS — App Setup Playbook
A repeatable, zero-drama checklist to launch Vite + React + Supabase apps to production (Vercel + Cloudflare).

---

## 0) Overview
- **Stack:** Vite + React 18 + TypeScript + Tailwind + shadcn + TanStack Query  
- **Data:** Supabase (Postgres + Storage)  
- **Deploy:** Vercel (SPA rewrites)  
- **Domain:** Cloudflare DNS  

---

## 1) GitHub Repo & Branching
| Item | Convention |
| --- | --- |
| Repository name | `teddykids-lms` (pattern `{org}-{product}`) |
| Default branch | `main` |
| Feature branches | scoped names like `teddy/lms-core` |
| Commits | Conventional Commits `feat:`, `fix:`, `chore:`, `docs:` |
| Pull Requests | Small, focused; include summary + config steps |

---

## 2) Environment Variables (Vite)
| Key | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase *anon* public key |

Checklist  
- [ ] Add both keys to **.env.example** (template only)  
- [ ] Ensure `.env` is git-ignored (`.gitignore` already configured)  
- [ ] Set the keys in **Vercel → Project → Settings → Environment Variables**  
- 👎 **Don’t** use `NEXT_PUBLIC_*` in Vite projects.

---

## 3) Supabase Setup
1. Create (or reuse) a Supabase project; copy Project URL + anon key.  
2. Run migration: `supabase/migrations/20250902_contracts.sql`  
   - Creates `public.contracts` table  
   - Adds public `contracts` storage bucket  
   - RLS enabled with permissive “allow all” (tighten after auth)  
3. **Auth phase (later):** add `https://app.teddykids.nl` to **Auth → Redirect URLs**.

---

## 4) Vercel Deployment
1. **Import Project** → GitHub → `teddykids-lms` → branch `teddy/lms-core` (or `main`).  
2. **Build settings**  
   - Framework: **Vite**  
   - Build command: `npm run build`  
   - Output dir: `dist`  
3. **Environment Variables:** add the two `VITE_*` keys.  
4. **SPA routing** – file `vercel.json` (already in repo):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

---

## 5) Cloudflare DNS → Vercel
1. Vercel → Project → Settings → **Domains** → add `app.teddykids.nl`.  
2. Vercel shows a CNAME target like  
   `a90ae3d75f07fe35.vercel-dns-017.com`.  
3. Cloudflare DNS → **Add record**  
   | Type | Name | Target | Proxy |
   |------|------|--------|-------|
   | CNAME | `app` | *Vercel CNAME target* | **DNS Only** (grey) |
4. Wait for Vercel verification – HTTPS cert is auto-managed.

---

## 6) App Features (Contracts MVP)
Flow  
1. **Generate** → DB row → client PDF (jsPDF) → upload to Storage → update row.  
2. **List** → Supabase query → actions: View (signed URL), Download, Duplicate (prefill).  

Key files  
- Client: `src/integrations/supabase/client.ts`  
- Helpers: `src/lib/contracts.ts`  
- Pages: `src/pages/GenerateContract.tsx`, `src/pages/Contracts.tsx`, `src/pages/ViewContract.tsx`  
- Routes root: `src/App.tsx`

---

## 7) Launch & QA Checklist
- [ ] Vercel env vars set (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`)  
- [ ] Supabase migration applied; table + bucket exist  
- [ ] SPA rewrites work (refresh `/contracts`, `/contract/view/:id`)  
- [ ] DNS CNAME verified; HTTPS green lock  
- [ ] Contract flow: generate → list → view/download → duplicate  
- [ ] Console clean, toast notifications show errors

---

## 8) Do / Don’t

### ✅ Do
- Use `VITE_*` envs for all client config.  
- Keep secrets out of git; only commit **.env.example**.  
- Add/keep `vercel.json` rewrites for SPA routing.  
- Use signed URLs for downloads if bucket private; public bucket OK for MVP.  
- Keep branches scoped; PRs small and descriptive.

### ❌ Don’t
- Don’t use `NEXT_PUBLIC_*` prefixes in Vite apps.  
- Don’t commit real `.env` values.  
- Don’t turn on Cloudflare orange proxy before verifying HTTPS & app behaviour.  
- Don’t skip the Supabase migration – UI will fail without schema.  
- Don’t forget to add domain to Supabase Auth redirects (when auth is added).

---

## 9) Useful Commands
| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run lint` | Lint & type-check |

---

## 10) Next Steps (optional)
- Add Supabase Auth + tighten RLS policies.  
- Server-side PDF generation (e.g. Puppeteer on Vercel).  
- CI: ESLint / type checks, Lighthouse budgets, PR comment bots.  
- Cloudflare proxy & HSTS once traffic is stable.  
