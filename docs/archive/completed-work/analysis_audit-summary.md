# Teddy LMS – Full Repo Integrity Audit

Date: 2025-09-02  
Branch: teddy/lms-core  
Domain: https://app.teddykids.nl  

## 1) Form Structure & Field Binding

File: `src/pages/GenerateContract.tsx` (single-page form)

All fields are rendered, stored in state, captured on change, and included in `query_params` at submit:

| Field | Status |
| ----- | ------ |
| firstName | ✅ yes |
| lastName | ✅ yes |
| birthDate | ✅ yes |
| bsn | ✅ yes (placeholder + numeric mask; 8–9 digit validation) |
| address | ✅ yes |
| startDate | ✅ yes |
| endDate (auto) | ✅ yes (derived) |
| duration | ✅ yes (buttons) |
| cityOfEmployment | ✅ yes (fixed “Leiden”, read-only) |
| position | ✅ yes |
| scale | ✅ yes (limited to “6”) |
| trede | ✅ yes (validated 10–23) |
| bruto36h (auto) | ✅ yes (derived) |
| hoursPerWeek | ✅ yes (validated 1–40) |
| grossMonthly (auto) | ✅ yes (derived) |
| reiskostenPerMonth | ✅ yes (manual) |
| manager | ✅ yes (select) |
| notes | ✅ yes |

Validation: required-field checks, BSN length, trede range, scale restricted to 6, hours/week bounds; submit blocked until valid with inline errors.

## 2) Duration → End Date Logic

* Clicking a duration button updates `formData.duration`.
* `endDate` auto-computed from `startDate + duration` (months) via `useEffect`; written to state and shown read-only.

## 3) Salary Calculation Logic

Files: `src/lib/salaryTable.ts`, `src/lib/cao.ts`

* Form uses `getBruto36hByDate(scale, trede, startDate)` to populate `bruto36h` whenever **scale**, **trede**, or **startDate** change.
* `grossMonthly` formula: `calculateGrossMonthly(bruto36h, hoursPerWeek)` = bruto36h × (hoursPerWeek / 36) rounded to 2 decimals.
* Salary table contains CAO schaal 6 with effective date keys (2025-01-01, 2025-07-01, 2026-01-01, 2026-09-01). Latest effective date ≤ startDate is used; returns 0 if out-of-range.

## 4) Supabase Submit Logic

Files: `src/lib/contracts.ts` (helpers) + `src/integrations/supabase/client.ts`

Submit flow (`handleGenerate`):

1. **Create** row in `contracts` table with `employee_name`, `manager`, `status`, `contract_type`, `department`, `query_params` (full form + derived fields).
2. **Generate** PDF blob client-side.
3. **Upload** PDF to Supabase Storage `contracts/` bucket → receive `pdf_path`.
4. **Update** row with `pdf_path` and `status`.
5. **Navigate** to `/contract/view/:id`.

Supabase client reads Vite env vars `VITE_SUPABASE_URL` & `VITE_SUPABASE_PUBLISHABLE_KEY`.

## 5) View Contract Page

File: `src/pages/ViewContract.tsx`

* Loads by `id` from route params.
* Fetches contract row and renders from stored `query_params`.
* Shows PDF preview; download works.
* QR element present on page.
* Visible fields: employee name, job details, dates, hours, compensation, reiskosten, notes.

## 6) Deployment Routing

* Deployed via Vercel  
  * Production branch: **teddy/lms-core**  
  * Domain: **app.teddykids.nl**
* `vercel.json` includes SPA rewrite:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Note: destination `/index.html` ensures Vite SPA refresh works across all routes (fixes previous 404).

---

## Findings & Recommendations

* **OK** – Form bindings and validations are complete and robust.  
* **OK** – Date-aware CAO lookups for schaal 6 (trede 10–23) with correct gross-monthly math.  
* **OK** – Supabase flow (row → PDF → upload → update) and navigation confirmed.  
* **OK** – SPA routing fix deployed (no 404 on refresh).  

Future enhancements:  
1. Expand salary tables beyond scale 6 when CAO data available.  
2. Add digital signature capture & verification.  
3. Introduce Supabase Auth + RLS and manager dashboard.  
4. Provide parent portal for contract access.

## Verdict

Production-ready. No broken or unlinked logic found. Minor improvement opportunities noted above.
