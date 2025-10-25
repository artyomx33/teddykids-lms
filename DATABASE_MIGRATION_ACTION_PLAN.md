# 🚀 Database Migration Action Plan - contracts_enriched_v2 Replacement

**Generated**: October 25, 2025  
**Agents**: Database Schema Guardian + Component Refactoring Architect + Dependency Health Monitor  
**Status**: READY FOR EXECUTION  
**Estimated Time**: 8-10 hours (over 1-2 days)

---

## 🎯 The Complete Picture

### What We Discovered

**OLD SYSTEM** (Defined but never deployed):
- `contracts` table ✅ EXISTS (basic contract storage)
- `contracts_enriched_v2` materialized view ❌ DOES NOT EXIST (never created)
- 16 components query the non-existent view

**NEW SYSTEM** (Currently deployed):
- `employes_current_state` ✅ ACTIVE (~110 employees, typed fields)
- `employes_timeline_v2` ✅ ACTIVE (historical events)
- `employes_changes` ✅ ACTIVE (audit trail)
- `staff` view ✅ ACTIVE (backward compatibility bridge)

**THE PROBLEM**:
- Code was written for OLD system
- Only NEW system exists in production
- Features appear broken (empty dashboards, no analytics)

---

## 📊 What `contracts` Table Contains (VERIFIED)

**From**: `supabase/backup_migrations/20250902_contracts.sql`

```sql
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY,
  employee_name TEXT NOT NULL,          -- Employee name (not linked to staff!)
  manager TEXT,                         -- Manager name (TEXT, not ID)
  status TEXT DEFAULT 'draft',          -- 'draft', 'generated', 'pending', 'signed'
  contract_type TEXT,                   -- Contract type
  department TEXT,                      -- Department
  signed_at TIMESTAMPTZ,               -- Signature timestamp
  created_at TIMESTAMPTZ DEFAULT now(), -- Created timestamp
  pdf_path TEXT,                        -- PDF document path
  query_params JSONB                    -- All contract data as JSON
);
```

**CRITICAL FINDINGS**:
1. ❌ NO `staff_id` column (not linked to staff table!)
2. ❌ NO `employes_employee_id` (old linking method)
3. ⚠️ Only links by `employee_name` (TEXT matching - unreliable!)
4. ⚠️ `query_params` JSONB has contract details but untyped

**CONCLUSION**: `contracts` table is ISOLATED from staff system!

---

## 🏗️ Agent Analysis: Database Schema Guardian

### Schema Assessment

**OLD Architecture Flaws**:
```
contracts table (isolated)
    ├── ❌ No FK to staff table
    ├── ❌ Links by TEXT name matching (unreliable)
    ├── ❌ Manager as TEXT (not relational)
    └── ⚠️ JSONB query_params (untyped data)

contracts_enriched_v2 (never created)
    ├── Was supposed to JOIN contracts + staff + reviews
    ├── Would have 25+ fields
    └── ❌ Never deployed, so components fail
```

**NEW Architecture Strengths**:
```
employes_current_state (properly designed)
    ├── ✅ UUID employee_id (proper typing)
    ├── ✅ 40+ typed fields (no JSONB soup)
    ├── ✅ Current snapshot optimized for queries
    ├── ✅ Data completeness tracking
    └── ✅ Integrates with staff view via employee_id

staff view (compatibility bridge)
    ├── ✅ Links employes_current_state to UUID staff.id
    ├── ✅ Backward compatible with existing code
    └── ✅ Auto-updates from employes_raw_data

staff_reviews (properly linked)
    ├── ✅ Uses staff.id (UUID FK)
    ├── ✅ Clean relational design
    └── ✅ Review metrics queryable
```

**Guardian Verdict**: ✅ New architecture is SUPERIOR - don't rebuild old view, create better replacement

---

## 🎨 Agent Analysis: Component Refactoring Architect

### Code Impact Assessment

**16 Components Affected** - Categorized by refactoring complexity:

#### TIER 1: ZERO CHANGES (2 files)
**Just rename table** - No field usage

1. `src/components/dashboard/AppiesInsight.tsx` - Line 47
   - Query: `SELECT *` (uses all fields generically)
   - No specific field access in code
   - **Action**: Simple rename

2. `src/components/employes/PredictiveAnalyticsPanel.tsx` - Line 38
   - Query: `SELECT *` (uses for ML-style analysis)
   - Accesses fields dynamically
   - **Action**: Simple rename + verify field names

#### TIER 2: SIMPLE FIELD RENAMES (8 files)
**Rename table + update 1-3 field names**

3. `src/pages/Dashboard.tsx` - Line 72
   - Fields used: `employes_employee_id`, `full_name`, `needs_six_month_review`, `needs_yearly_review`, `next_review_due`, `has_five_star_badge`
   - **Changes**: `employes_employee_id` → `employee_id` (UUID)

4. `src/components/dashboard/TeddyStarsWidget.tsx` - Line 24
   - Fields used: `avg_review_score`, `first_start`
   - **Changes**: `first_start` → `start_date`

5. `src/components/analytics/PerformanceComparison.tsx` - Line 25
   - Fields used: `full_name`, `avg_review_score`, `first_start`, `location_key`
   - **Changes**: `first_start` → `start_date`, `location_key` → `location`

6. `src/components/analytics/PredictiveInsights.tsx` - Line 17
   - Fields used: Generic access via `staffData`
   - **Changes**: Minimal

7. `src/components/staff/StaffActionCards.tsx` - Lines 15, 71
   - Fields used: `needs_six_month_review`, `needs_yearly_review`, `end_date`
   - **Changes**: Verify field names

8. `src/components/insights/SmartSuggestions.tsx` - Line 96
   - Fields used: `needs_six_month_review`, `needs_yearly_review`
   - **Changes**: None (exact match)

9. `src/components/employes/ComplianceReportingPanel.tsx` - Line 43
   - Fields used: Many (compliance calculations)
   - **Changes**: Field mapping needed

10. `src/components/employes/ContractAnalyticsDashboard.tsx` - Line 37
    - Fields used: Contract analytics (status, dates, type)
    - **Changes**: Check contract-specific fields

#### TIER 3: COMPLEX REFACTORING (3 files)
**Multiple queries or complex field usage**

11. `src/components/insights/ProblemDetectionEngine.tsx` - Lines 26, 77, 105
    - **3 separate queries** with specific fields
    - Fields: `full_name`, `manager_key`, `needs_six_month_review`, `needs_yearly_review`, `next_review_due`, `end_date`, `last_review_date`
    - **Changes**: Multiple field renames + 3 query updates

12. `src/lib/unified-data-service.ts` - Lines 102, 217, 280, 318
    - **4 separate queries** + complex logic
    - Query 1: Filter by status
    - Query 2: Filter by avg_review_score
    - Query 3: Performance filtering
    - Query 4: Parallel query with contracts table
    - **Changes**: All 4 queries need updates + verify contracts table usage

13. `src/lib/unified-employment-data.ts` - Line 78
    - Complex data consolidation
    - Fields: All employment + contract + review data
    - **Changes**: Major refactoring needed

14. `src/pages/Insights.tsx` - Lines 23, 35
    - **2 queries** for insights page
    - Fields: Full table scan + specific performance fields
    - **Changes**: Verify field names

---

## 🔧 Agent Analysis: Dependency Health Monitor

### Update Dependency Analysis

**Database Query Dependencies**:
- ✅ Supabase client: No changes needed
- ✅ TypeScript types: Will regenerate after view creation
- ✅ React Query: Cache keys stay same (just table name change)
- ✅ No npm package updates required

**Component Dependencies**:
```
Dashboard (main)
├── Depends on: 3 dashboard widgets
├── Impact: HIGH - most visible page
└── Test priority: #1

StaffActionCards
├── Used in: Staff page
├── Impact: HIGH - critical actions
└── Test priority: #2

Analytics Components (4)
├── Impact: MEDIUM - insights features
└── Test priority: #3

Backend Services (3)
├── Impact: CRITICAL - affects all pages
└── Test priority: #1 (test first!)
```

**Monitor Verdict**: ✅ Low dependency risk, straightforward refactor

---

## ✅ FINAL SOLUTION PLAN

### Phase 1: Database (2 hours)

**Step 1.1**: Run verification SQL
```bash
# Run VERIFY_CURRENT_SCHEMA.sql in Supabase
# Confirm:
# - contracts table exists and row count
# - employes_current_state has data
# - staff_reviews has data
```

**Step 1.2**: Create replacement view
```sql
-- Based on verification results, create:
-- staff_enriched_current (or contracts_enriched_current)
-- 
-- Decision point:
-- If contracts table has data: Include contract fields
-- If contracts table empty: Skip contract fields
```

**Step 1.3**: Test new view
```sql
SELECT * FROM staff_enriched_current LIMIT 5;
SELECT COUNT(*) FROM staff_enriched_current;
-- Verify all required fields exist
```

---

### Phase 2: Backend Services (2-3 hours)

**Priority**: Update backend first (affects all pages)

**Files** (in order):
1. `src/lib/unified-data-service.ts` (4 queries)
2. `src/lib/unified-employment-data.ts` (1 query)

**Changes**:
- Rename: `contracts_enriched_v2` → `staff_enriched_current`
- Update fields: `first_start` → `start_date`, etc.
- Test: Run dev server, check for errors

---

### Phase 3: Dashboard & Widgets (2 hours)

**Files**:
1. `src/pages/Dashboard.tsx`
2. `src/components/dashboard/AppiesInsight.tsx`
3. `src/components/dashboard/TeddyStarsWidget.tsx`
4. `src/components/staff/StaffActionCards.tsx`

**Changes**: Mostly simple renames

**Testing**: Load `/dashboard` and verify all widgets show data

---

### Phase 4: Analytics & Insights (2 hours)

**Files**:
1. `src/components/analytics/PredictiveInsights.tsx`
2. `src/components/analytics/PerformanceComparison.tsx`
3. `src/pages/Insights.tsx`
4. `src/components/insights/ProblemDetectionEngine.tsx`
5. `src/components/insights/SmartSuggestions.tsx`

**Testing**: Load `/insights` and verify data displays

---

### Phase 5: Employes Integration (1 hour)

**Files**:
1. `src/components/employes/ComplianceReportingPanel.tsx`
2. `src/components/employes/ContractAnalyticsDashboard.tsx`
3. `src/components/employes/PredictiveAnalyticsPanel.tsx`

**Testing**: Load employes dashboards, verify compliance metrics

---

### Phase 6: Cleanup & Documentation (30 mins)

- [ ] Update TypeScript types (regenerate or manual)
- [ ] Remove `refresh_contracts_enriched_v2` type
- [ ] Add comments to new view
- [ ] Update documentation
- [ ] Create migration notes

---

## 📋 Pre-Flight Checklist

Before starting ANY changes:

- [ ] **Backup database** (full dump)
- [ ] **Run VERIFY_CURRENT_SCHEMA.sql** (understand current state)
- [ ] **Check contracts table** (does it have data?)
- [ ] **Verify employes_current_state** (110 employees present?)
- [ ] **Test in development** (not production first!)
- [ ] **Create git branch** (`fix/replace-contracts-enriched-v2`)
- [ ] **Document findings** (record verification results)

---

## 🎯 Success Criteria

### Database
- ✅ New view created: `staff_enriched_current`
- ✅ View has all required fields
- ✅ Query performance acceptable (< 100ms for 110 employees)
- ✅ Permissions granted correctly

### Code
- ✅ All 16 files updated
- ✅ Zero TypeScript errors
- ✅ All components render without errors
- ✅ Field names mapped correctly

### Functionality
- ✅ Dashboard shows review counts
- ✅ Action cards show correct data
- ✅ Analytics charts populate
- ✅ Compliance reports accurate
- ✅ Problem detection works
- ✅ No features lost

### Quality
- ✅ No console errors
- ✅ Error boundaries don't trigger
- ✅ Performance maintained
- ✅ Tests pass (if any)

---

## 📝 Quick Reference: SQL Files to Run

**Run in this order**:

1. **`VERIFY_CURRENT_SCHEMA.sql`** - Understand what exists ← START HERE
2. **Create view SQL** - Based on verification results
3. **`cleanup-legacy-db.sql`** (Sections 2-3) - Optional cleanup
4. **`check-database-counts.sql`** - Final verification

---

## 📄 All Related Documentation

**Main Reports**:
1. [CONTRACTS_ENRICHED_V2_ANALYSIS.md](file:///Users/artyomx/projects/teddykids-lms-main/CONTRACTS_ENRICHED_V2_ANALYSIS.md) - Detailed usage analysis
2. [CONTRACTS_ENRICHED_REPLACEMENT_STRATEGY.md](file:///Users/artyomx/projects/teddykids-lms-main/CONTRACTS_ENRICHED_REPLACEMENT_STRATEGY.md) - Field mapping & strategy
3. [DATABASE_MIGRATION_ACTION_PLAN.md](file:///Users/artyomx/projects/teddykids-lms-main/DATABASE_MIGRATION_ACTION_PLAN.md) - This file

**Audit Reports**:
4. [SECURITY_AUDIT.md](file:///Users/artyomx/projects/teddykids-lms-main/SECURITY_AUDIT.md) - Hardcoded credentials
5. [DATABASE_INVENTORY.md](file:///Users/artyomx/projects/teddykids-lms-main/DATABASE_INVENTORY.md) - Complete catalog
6. [DATABASE_AUDIT_SUMMARY.md](file:///Users/artyomx/projects/teddykids-lms-main/DATABASE_AUDIT_SUMMARY.md) - Executive summary

**SQL Scripts**:
7. [VERIFY_CURRENT_SCHEMA.sql](file:///Users/artyomx/projects/teddykids-lms-main/VERIFY_CURRENT_SCHEMA.sql) - Check current state ← RUN FIRST
8. [check-database-counts.sql](file:///Users/artyomx/projects/teddykids-lms-main/check-database-counts.sql) - Row counts
9. [cleanup-legacy-db.sql](file:///Users/artyomx/projects/teddykids-lms-main/cleanup-legacy-db.sql) - Cleanup script

---

## 🚦 Next Immediate Action

**STEP 1**: Run this SQL in Supabase (copy/paste from `VERIFY_CURRENT_SCHEMA.sql`):

```sql
-- Quick verification (30 seconds)
SELECT 'contracts' as table_name, COUNT(*) as rows FROM contracts
UNION ALL
SELECT 'employes_current_state', COUNT(*) FROM employes_current_state
UNION ALL
SELECT 'staff (view)', COUNT(*) FROM staff
UNION ALL
SELECT 'staff_reviews', COUNT(*) FROM staff_reviews;
```

**Share results** and I'll create the EXACT SQL to create the replacement view!

---

**Report Status**: ✅ COMPLETE  
**Ready for**: Database verification → View creation → Code refactoring  
**Agents**: All 3 agents concur on strategy

