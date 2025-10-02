# MIGRATION 2.0: Clean Database Migration to Raw Data Architecture

**Date Created:** 2025-10-02  
**Status:** ✅ APPROVED - READY FOR IMPLEMENTATION

## 🎯 Objective
Migrate entire database to use `employes_raw_data` as the single source of truth. Eliminate all legacy `staff_id` references and ensure every piece of data traces back to raw employee data via `employes_employee_id`.

---

## Phase 1: Create New Tables (Raw Data Only)

### Tables to Create
Create brand new tables with ONLY `employes_employee_id` linking:

1. ✅ `staff_reviews` (NEW - not v2, just create fresh)
2. ✅ `cao_salary_history` (NEW - completely fresh) 
3. ✅ `staff_certificates` (NEW)
4. ✅ `staff_notes` (NEW)
5. ✅ `performance_metrics` (NEW)

### Key Principles
- ✅ ONLY `employes_employee_id` as foreign key link
- ✅ NO `staff_id` column at all
- ✅ All data MUST trace back to `employes_raw_data`
- ✅ Clean, modern schema design

### Example New Structure
```sql
CREATE TABLE staff_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employes_employee_id TEXT NOT NULL,
  review_date DATE NOT NULL,
  review_type TEXT,
  score INTEGER,
  star_rating INTEGER,
  overall_score NUMERIC,
  summary TEXT,
  status TEXT DEFAULT 'scheduled',
  template_id UUID,
  raise BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Link to raw data only
  CONSTRAINT fk_employes_employee 
    FOREIGN KEY (employes_employee_id) 
    REFERENCES employes_raw_data(employee_id)
);
```

---

## Phase 2: Update Application Code (Direct Only)

### Code Update Strategy
Update ALL application code to:
- ✅ Use new tables immediately
- ✅ Query by `employes_employee_id` only
- ✅ Remove ALL references to old table names
- ✅ NO fallback logic - clean cut

### Files to Update
- `src/components/celebrations/CelebrationTrigger.tsx`
- `src/components/dashboard/AppiesInsight.tsx` 
- `src/components/dashboard/QuickWinMetrics.tsx`
- `src/components/insights/SmartSuggestions.tsx`
- `src/hooks/useEmailTeddyConnections.ts`
- `src/components/employes/WageSyncPanel.tsx`
- `src/lib/staff.ts`
- `src/lib/salaryTable.ts`
- Any other files referencing these tables

---

## Phase 3: Contract Generation (Raw Data Only)

### Updates Needed
Update contract system to:
- ✅ Pull ALL data from `employes_raw_data` via `employes_employee_id`
- ✅ Store ONLY `employes_employee_id` in contracts table
- ✅ Remove `staff_id` reference completely

### Files to Update
- `src/lib/contracts.ts`: Add `employes_employee_id` field
- `src/pages/GenerateContract.tsx`: Link to raw data
- Contracts table migration: Add `employes_employee_id` column

---

## Phase 4: Drop Old Tables (Immediate)

### Tables to DROP Immediately
**DROP these tables immediately after new ones are created:**
- ❌ DROP old `staff_reviews` (if exists)
- ❌ DROP old `cao_salary_history` (if exists)
- ❌ DROP old `staff_certificates` (if exists)
- ❌ DROP old `staff_notes` (if exists)
- ❌ DROP old `performance_metrics` (if exists)

### Why Immediate Deletion?
- ✅ Zero data loss (all tables currently empty)
- ✅ No confusion about which table to use
- ✅ Clean codebase with single source of truth
- ✅ Forces correct implementation from day one

---

## 📊 Database Architecture After Migration

```
employes_raw_data (SOURCE OF TRUTH)
    ↓ employee_id
    ├── staff (80 records - via employes_id)
    ├── staff_reviews (NEW - via employes_employee_id)
    ├── cao_salary_history (NEW - via employes_employee_id)
    ├── staff_certificates (NEW - via employes_employee_id)
    ├── staff_notes (NEW - via employes_employee_id)
    ├── performance_metrics (NEW - via employes_employee_id)
    └── contracts (UPDATED - via employes_employee_id)
```

---

## ✅ Success Criteria

1. **All tables link to raw data**: Every operational table has `employes_employee_id` foreign key
2. **Zero legacy code**: No `staff_id` references remain in new structure
3. **Clean queries**: All queries trace back to `employes_raw_data`
4. **RLS policies updated**: Security policies use `employes_employee_id`
5. **Application works**: All features function correctly with new structure

---

## 🔄 Data Flow

```
Employes.nl API
    ↓
Edge Function (employes-integration)
    ↓
employes_raw_data (stored with employee_id)
    ↓
Application Tables (linked via employes_employee_id)
    ↓
UI Components (display via employes_employee_id joins)
```

---

## 🚀 Result
**Every single piece of data traces back to `employes_raw_data` with zero legacy baggage.**

- Single source of truth: `employes_raw_data`
- Clean architecture: No dual-tracking
- Future-proof: Easy to extend and maintain
- Data integrity: Foreign key constraints enforce relationships
