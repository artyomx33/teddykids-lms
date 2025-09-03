# Teddy Kids LMS — Contracts Dashboard Upgrade Plan (Blueprint)

## 1) Executive Summary
Purpose   
Upgrade the contracts area with operational intelligence and proactive alerts.

Outcomes   
• Expiration countdown  
• Birthday tracker  
• KPI snapshot  
• Quick filters & search  

Approach   
Ship an additive dashboard at **`/contracts/dashboard`** (non-breaking). Keep current **`/contracts`** list intact; link between them.

---

## 2) Current State (Inventory)
Stack   
Vite + React + TS + Tailwind + shadcn/ui + TanStack Query + Supabase

Data   
`public.contracts` with `query_params JSONB` containing `endDate`, `birthDate`, `manager`, etc.

Gaps  
• No indexed columns for end / birth dates (live in JSON)  
• No normalized `employees` table (OK for MVP – parse JSON)  

---

## 3) Scope & Deliverables
### MVP
1. **Contract Countdown** – next 90 days, color-coded, Extend / Replace CTA  
2. **Birthday Tracker** – 14-day window  
3. **KPI Snapshot** (this year) – new vs ended, net delta, by-manager metrics  
4. **Quick Filters** – end-date range, manager, location, search  
5. **Empty State** – “🎉 All current contracts are stable!” when no items  

### V2 (optional)
• Export CSV / PDF  
• Timeframe controls (Month / Quarter / Year)  
• Role-based blocks for sensitive KPIs  

---

## 4) Data Model & SQL (Supabase/Postgres)

### Option A — Fast (no schema change)
Use JSONB expression indexes + a view.

```sql
-- Performance indexes
create index if not exists idx_contracts_end_date
  on public.contracts (((query_params->>'endDate')::date));

create index if not exists idx_contracts_birth_date
  on public.contracts (((query_params->>'birthDate')::date));

create index if not exists idx_contracts_manager
  on public.contracts ((lower(coalesce(manager, query_params->>'manager', ''))));

-- Enriched view
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
```

### Option B — Durable (small schema change)
Generated columns + ordinary indexes.

```sql
alter table public.contracts
  add column if not exists end_date   date generated always as ((query_params->>'endDate')::date) stored,
  add column if not exists birth_date date generated always as ((query_params->>'birthDate')::date) stored;

create index if not exists idx_contracts_end_date_col  on public.contracts (end_date);
create index if not exists idx_contracts_birth_date_col on public.contracts (birth_date);
```

**Recommendation:** start with Option A; revisit Option B after auth refactor.

---

## 5) Client Utilities (`src/lib/contractsDashboard.ts`)

```ts
// src/lib/contractsDashboard.ts
import { supabase } from "@/integrations/supabase/client";

export type EnrichedContract = {
  id: string;
  employee_name: string | null;
  manager: string | null;
  department: string | null;
  status: string;
  created_at: string;
  signed_at: string | null;
  pdf_path: string | null;
  end_date: string | null;   // ISO
  birth_date: string | null; // ISO
};

/* ------------------------------------------------------------------ */
/* Fetch helpers                                                      */
/* ------------------------------------------------------------------ */

export async function fetchExpiringContracts(days = 90): Promise<EnrichedContract[]> {
  const { data, error } = await supabase
    .from("contracts_enriched")
    .select("*")
    .gte("end_date", new Date().toISOString().slice(0, 10))
    .lte(
      "end_date",
      new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10)
    )
    .order("end_date", { ascending: true });

  if (error) throw error;
  return (data ?? []) as EnrichedContract[];
}

export async function fetchUpcomingBirthdays(days = 14): Promise<EnrichedContract[]> {
  const today = new Date();
  const max   = new Date(Date.now() + days * 86_400_000);

  const { data, error } = await supabase
    .from("contracts_enriched")
    .select("*")
    .not("birth_date", "is", null);

  if (error) throw error;

  const inWindow = (data ?? []).filter((row: any) => {
    const d = new Date(row.birth_date);
    const next = new Date(today.getFullYear(), d.getMonth(), d.getDate());
    if (next < today) next.setFullYear(next.getFullYear() + 1);
    return next >= today && next <= max;
  });

  return inWindow as EnrichedContract[];
}

export async function fetchKpiStats(year = new Date().getFullYear()) {
  const yearStart = `${year}-01-01`;
  const yearEnd   = `${year}-12-31`;

  const { data, error } = await supabase
    .from("contracts_enriched")
    .select("status, manager, created_at, end_date");

  if (error) throw error;
  const rows = (data ?? []) as EnrichedContract[];

  const createdThisYear = rows.filter(r => r.created_at >= yearStart && r.created_at <= yearEnd).length;
  const endedThisYear   = rows.filter(r => r.end_date && r.end_date >= yearStart && r.end_date <= yearEnd).length;
  const net             = createdThisYear - endedThisYear;

  const byManager: Record<string, { signed: number; ended: number }> = {};
  for (const r of rows) {
    const key = (r.manager ?? "").toLowerCase();
    if (!byManager[key]) byManager[key] = { signed: 0, ended: 0 };
    if (r.created_at >= yearStart && r.created_at <= yearEnd) byManager[key].signed++;
    if (r.end_date && r.end_date >= yearStart && r.end_date <= yearEnd) byManager[key].ended++;
  }

  const topSigned = Object.entries(byManager).sort((a, b) => b[1].signed - a[1].signed)[0]?.[0] ?? null;
  const topEnded  = Object.entries(byManager).sort((a, b) => b[1].ended  - a[1].ended)[0]?.[0] ?? null;

  return { createdThisYear, endedThisYear, net, byManager, topSigned, topEnded };
}

/* ------------------------------------------------------------------ */
/* Utilities                                                          */
/* ------------------------------------------------------------------ */

export function daysUntil(dateIso?: string | null): number | null {
  if (!dateIso) return null;
  return Math.ceil((new Date(dateIso).getTime() - Date.now()) / 86_400_000);
}

export function countdownBadgeVariant(
  days: number | null
): "green" | "orange" | "red" | "muted" {
  if (days === null) return "muted";
  if (days > 60) return "green";
  if (days > 35) return "orange";
  return "red";
}
```

---

## 6) UI — New Page **`/contracts/dashboard`**

### `src/pages/ContractsDashboard.tsx`

```tsx
import { useQuery } from "@tanstack/react-query";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, FileText, PartyPopper, Users } from "lucide-react";
import { Link } from "react-router-dom";
import {
  fetchExpiringContracts,
  fetchUpcomingBirthdays,
  fetchKpiStats,
  daysUntil,
  countdownBadgeVariant,
} from "@/lib/contractsDashboard";

function VariantBadge({ days }: { days: number | null }) {
  const v = countdownBadgeVariant(days);
  const cls =
    v === "green"  ? "bg-green-100 text-green-800"  :
    v === "orange" ? "bg-yellow-100 text-yellow-800" :
    v === "red"    ? "bg-red-100 text-red-800"       :
                     "bg-muted text-muted-foreground";
  return <Badge className={cls}>{days === null ? "—" : `${days} days`}</Badge>;
}

export default function ContractsDashboard() {
  const { data: expiring = [], isLoading: expLoading } = useQuery({
    queryKey: ["expiringContracts"],
    queryFn: () => fetchExpiringContracts(90),
  });

  const { data: birthdays = [], isLoading: bLoading } = useQuery({
    queryKey: ["upcomingBirthdays"],
    queryFn: () => fetchUpcomingBirthdays(14),
  });

  const { data: kpis } = useQuery({
    queryKey: ["kpiStats"],
    queryFn: () => fetchKpiStats(),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contracts Overview</h1>
          <p className="text-muted-foreground">
            Proactive alerts and at-a-glance insights
          </p>
        </div>
        <Button asChild>
          <Link to="/contracts">Go to Contracts</Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" /> New Contracts (YTD)
            </CardTitle>
            <CardDescription>Created this year</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {kpis?.createdThisYear ?? "—"}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" /> Ended (YTD)
            </CardTitle>
            <CardDescription>Ended this year</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {kpis?.endedThisYear ?? "—"}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" /> Net (YTD)
            </CardTitle>
            <CardDescription>New − Ended</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {kpis?.net ?? "—"}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" /> Top Manager (Signed)
            </CardTitle>
            <CardDescription>Most created contracts</CardDescription>
          </CardHeader>
          <CardContent className="text-xl font-semibold">
            {kpis?.topSigned ?? "—"}
          </CardContent>
        </Card>
      </div>

      {/* Expiring Contracts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" /> Upcoming Contract Expirations
          </CardTitle>
          <CardDescription>Next 90 days</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {expLoading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : expiring.length === 0 ? (
            <div className="text-sm">🎉 All current contracts are stable!</div>
          ) : (
            expiring.map((c) => {
              const d = daysUntil(c.end_date);
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{c.employee_name}</span>
                    <span className="text-muted-foreground">• {c.end_date}</span>
                    <span className="text-muted-foreground">
                      • {c.manager ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <VariantBadge days={d} />
                    <Button variant="outline" size="sm">
                      Extend
                    </Button>
                    <Button variant="ghost" size="sm">
                      Replace
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Birthdays */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PartyPopper className="w-5 h-5" /> Upcoming Birthdays
          </CardTitle>
          <CardDescription>Next 14 days</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {bLoading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : birthdays.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No upcoming birthdays in the next 2 weeks.
            </div>
          ) : (
            birthdays.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between text-sm"
              >
                <span>{b.employee_name}</span>
                <span className="text-muted-foreground">{b.birth_date}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 7) Routing & Navigation

### `src/App.tsx`
```tsx
import ContractsDashboard from "./pages/ContractsDashboard";

// …
<Route path="contracts/dashboard" element={<ContractsDashboard />} />
```

### Sidebar entry (`src/components/Layout.tsx`)
```tsx
{
  title: "Contracts Overview",
  url: "/contracts/dashboard",
  icon: FileText,
},
```

---

## 8) Filters & Search (MVP snippet)

```tsx
import { Input } from "@/components/ui/input";
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from "@/components/ui/select";

function Filters() {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Input placeholder="Search name / BSN / email" className="sm:w-64" />
      <Select>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Manager" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          {/* populate via distinct manager query */}
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Location" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="leiden">Leiden</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
```

---

## 9) Permissions Note
“Resignations by manager” is sensitive. Until Supabase Auth is live, gate it behind a `showSensitive` prop defaulting to `false`. Later wire to RLS / JWT claims.

---

## 10) QA Checklist
| Area | Check |
| ---- | ----- |
| Data | `contracts_enriched` view returns correct `end_date` & `birth_date`. |
| Performance | Indexes exist; expiring query < 200 ms on expected data. |
| UI | Badge colors: green > 60, orange 36–60, red ≤ 35. |
| Empty states | Proper messages when lists empty. |
| Routing | `/contracts/dashboard` works; SPA refresh OK. |
| Links | “Go to Contracts” navigates correctly; contract names click→view (when implemented). |

---

## 11) Rollout Plan
1. `git checkout -b droid/contracts-dashboard`  
2. Apply SQL Option A via Supabase SQL editor.  
3. Add utilities, page component, route, sidebar nav.  
4. Push & open PR → Vercel preview builds automatically.  
5. QA using checklist, fix issues.  
6. Merge to `main` → auto-deploy to `app.teddykids.nl`.

---

## 12) Future Enhancements
• CSV/PDF export  
• Timeframe toggles (month / quarter / year)  
• Normalize `employees` table & RLS  
• Cache with React-Query `staleTime`  
• Role-based visibility for sensitive KPIs  
• Slack / email alerts for contracts < 30 days  
