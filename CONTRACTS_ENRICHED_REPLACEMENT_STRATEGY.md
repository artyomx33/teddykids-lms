# 🔄 Complete Replacement Strategy: `contracts_enriched_v2` → New Architecture

**Generated**: October 25, 2025  
**Agents Deployed**: Database Schema Guardian + Component Refactoring Architect + Dependency Health Monitor  
**Analysis Depth**: DEEP - Field-by-field mapping with connection points

---

## 🎯 Executive Summary

**The Problem**:
- OLD: `contracts_enriched_v2` materialized view (never created in production)
- OLD: References `contracts` table + `employes_employee_id` (TEXT)
- NEW: Modern temporal architecture with `employes_current_state` + `employes_timeline_v2`
- NEW: UUID-based employee IDs, proper relational structure

**The Solution**:
- Replace 16 code references with new table queries
- Map old fields → new table fields
- Refactor components to use new architecture
- No functionality loss (per Component Refactoring Architect principles)

---

## 📊 Architecture Evolution

### OLD ARCHITECTURE (Never Deployed)
```sql
contracts (table - may not exist)
└── contracts_enriched_v2 (materialized view - DOES NOT EXIST)
    ├── Joins: staff (view) + staff_reviews (table)
    ├── ID Type: employes_employee_id (TEXT)
    ├── Query Pattern: Direct SELECT from materialized view
    └── Fields: 25+ fields (contract + staff + reviews)
```

### NEW ARCHITECTURE (Currently Deployed)
```sql
employes_raw_data (table - source of truth)
├── employes_current_state (table - typed current snapshot)
│   ├── Fields: 40+ typed fields
│   ├── ID Type: employee_id (UUID)
│   ├── Updated via: Sync process
│   └── Purpose: Fast queries, current data only
│
├── employes_timeline_v2 (table - historical events)
│   ├── Fields: Event-based timeline
│   ├── Generated from: employes_changes
│   ├── Purpose: Visual timeline, history tracking
│   └── Function: generate_timeline_v2(employee_id)
│
├── employes_changes (table - change tracking)
│   ├── Fields: Old/new values, change metadata
│   ├── Purpose: Audit trail, change detection
│   └── Supports: Time-travel queries
│
└── staff (view - backward compatibility)
    ├── Generated from: employes_raw_data
    ├── ID: md5 hash → UUID (deterministic)
    ├── Purpose: Legacy code compatibility
    └── Fields: Basic staff info only
```

---

## 🔍 Field Mapping Analysis

### Agent: Database Schema Guardian - Field Inventory

#### OLD `contracts_enriched_v2` Fields (from _old_migrations)

| Old Field | Type | Source | NEW Replacement | New Location |
|-----------|------|--------|-----------------|--------------|
| **IDENTIFIERS** |
| `id` | UUID | contracts.id | ❌ No direct replacement | N/A - contract-specific |
| `employes_employee_id` | TEXT | contracts | `employee_id` | `employes_current_state.employee_id` (UUID) |
| `staff_id` | UUID | staff.id | `id` | `staff.id` (still works via view) |
| **PERSONAL INFO** |
| `full_name` | TEXT | staff.full_name | `full_name` | `employes_current_state.full_name` |
| `email` | TEXT | staff.email | `email` | `employes_current_state.email` |
| `phone_number` | TEXT | staff.phone_number | `phone` / `mobile` | `employes_current_state.phone` |
| `birth_date` | DATE | staff.birth_date | `date_of_birth` | `employes_current_state.date_of_birth` |
| **EMPLOYMENT** |
| `position` / `role` | TEXT | staff.role | `position` / `role` | `employes_current_state.position` |
| `location_key` | TEXT | staff.location | `location` | `employes_current_state.location` |
| `department` | TEXT | staff.department | `department` | `employes_current_state.department` |
| `employment_status` | TEXT | staff.status | `employment_status` | `employes_current_state.employment_status` |
| `first_start` | DATE | staff.employment_start_date | `start_date` | `employes_current_state.start_date` |
| `employment_end_date` | DATE | staff.employment_end_date | `end_date` | `employes_current_state.end_date` |
| **CONTRACT** |
| `start_date` | DATE | query_params | ❌ No direct replacement | Derive from employes_timeline_v2? |
| `end_date` | DATE | query_params | `contract_end_date` | `employes_current_state.contract_end_date` |
| `contract_type` | TEXT | query_params | `contract_type` | `employes_current_state.contract_type` |
| `status` | TEXT | contracts.status | ❌ No direct replacement | N/A - contract-specific |
| `pdf_path` | TEXT | contracts.pdf_path | ❌ No direct replacement | N/A - stored in contracts table |
| `manager_key` | TEXT | query_params | `manager_id` / `manager_name` | `employes_current_state.manager_id` |
| **COMPENSATION** |
| `salary_amount` | NUMERIC | staff.salary_amount | `current_salary` | `employes_current_state.current_salary` |
| `hours_per_week` | NUMERIC | staff.hours_per_week | `current_hours_per_week` | `employes_current_state.current_hours_per_week` |
| `hourly_wage` | NUMERIC | staff.hourly_wage | `current_hourly_rate` | `employes_current_state.current_hourly_rate` |
| **REVIEWS** |
| `last_review_date` | DATE | Subquery on staff_reviews | ❌ Need to query | `staff_reviews` table directly |
| `avg_review_score` | NUMERIC | AVG(staff_reviews.overall_score) | ❌ Need to calculate | Compute from `staff_reviews` |
| `has_five_star_badge` | BOOLEAN | COUNT check on staff_reviews | ❌ Need to calculate | Compute from `staff_reviews` |
| `needs_six_month_review` | BOOLEAN | Calculated field | ❌ Need to calculate | Compute from `staff_reviews` + dates |
| `needs_yearly_review` | BOOLEAN | Calculated field | ❌ Need to calculate | Compute from `staff_reviews` + dates |
| `next_review_due` | DATE | Calculated field | ❌ Need to calculate | Compute from `staff_reviews` + dates |

---

## 🔧 Agent: Component Refactoring Architect - Refactoring Strategy

### Replacement Pattern Analysis

**Key Finding**: The old view mixed 3 data sources:
1. **Contract data** (from `contracts` table) - ❌ May not exist
2. **Staff data** (from `staff` view) - ✅ Still exists
3. **Review calculations** (from `staff_reviews` table) - ✅ Still exists

**New Approach**: Create a **replacement view** that uses current architecture

---

## 🏗️ RECOMMENDED SOLUTION: Create New View

### Option 1: Create `staff_enriched_current` View (RECOMMENDED)

```sql
-- Drop old materialized view if it exists
DROP MATERIALIZED VIEW IF EXISTS contracts_enriched_v2 CASCADE;

-- Create new regular VIEW (not materialized - auto-updates)
CREATE OR REPLACE VIEW staff_enriched_current AS
SELECT
  -- Core identifiers (UUID-based)
  s.id as staff_id,
  ecs.employee_id,
  
  -- Personal info
  ecs.full_name,
  ecs.email,
  ecs.phone,
  ecs.mobile,
  ecs.date_of_birth as birth_date,
  
  -- Employment
  ecs.position as role,
  ecs.location as location_key,
  ecs.department,
  ecs.employment_status as status,
  ecs.start_date as first_start,
  ecs.end_date as employment_end_date,
  ecs.contract_start_date as start_date,
  ecs.contract_end_date as end_date,
  ecs.contract_type,
  
  -- Manager
  ecs.manager_id,
  ecs.manager_name as manager_key,
  
  -- Compensation
  ecs.current_salary as salary_amount,
  ecs.current_hourly_rate as hourly_wage,
  ecs.current_hours_per_week as hours_per_week,
  
  -- Review metrics (calculated from staff_reviews)
  (
    SELECT MAX(review_date)
    FROM staff_reviews sr
    WHERE sr.staff_id = s.id
  ) as last_review_date,
  
  (
    SELECT AVG(overall_score)
    FROM staff_reviews sr
    WHERE sr.staff_id = s.id
  ) as avg_review_score,
  
  (
    SELECT COUNT(*) > 0
    FROM staff_reviews sr
    WHERE sr.staff_id = s.id
    AND sr.star_rating >= 5
  ) as has_five_star_badge,
  
  -- Review due calculations
  CASE
    WHEN ecs.start_date + INTERVAL '6 months' <= CURRENT_DATE
    AND NOT EXISTS (
      SELECT 1 FROM staff_reviews sr
      WHERE sr.staff_id = s.id
      AND sr.review_date >= ecs.start_date + INTERVAL '6 months'
    )
    THEN true
    ELSE false
  END as needs_six_month_review,
  
  CASE
    WHEN (
      SELECT MAX(review_date)
      FROM staff_reviews sr
      WHERE sr.staff_id = s.id
    ) + INTERVAL '1 year' <= CURRENT_DATE
    THEN true
    ELSE false
  END as needs_yearly_review,
  
  -- Next review due date
  CASE
    WHEN (SELECT MAX(review_date) FROM staff_reviews sr WHERE sr.staff_id = s.id) IS NULL
    THEN ecs.start_date + INTERVAL '6 months'
    ELSE (SELECT MAX(review_date) FROM staff_reviews sr WHERE sr.staff_id = s.id) + INTERVAL '1 year'
  END as next_review_due,
  
  -- Metadata
  ecs.last_sync_at as updated_at,
  ecs.created_at,
  ecs.is_active,
  ecs.months_employed,
  ecs.age
  
FROM employes_current_state ecs
JOIN staff s ON s.employes_id = ecs.employee_id::TEXT
WHERE ecs.is_active = true;

-- Grant permissions
GRANT SELECT ON staff_enriched_current TO authenticated;

-- Add helpful comment
COMMENT ON VIEW staff_enriched_current IS 
  'Replacement for contracts_enriched_v2 - uses employes_current_state + staff + staff_reviews. Auto-updates, no refresh needed.';
```

**Why Regular VIEW not Materialized**:
- Your data: ~110 employees (small dataset)
- Regular view = real-time data
- No refresh function needed
- Simpler maintenance
- Better for development

---

## 📝 Code Refactoring Plan (Per Agent Principles)

### Agent: Component Refactoring Architect - Zero Functionality Loss

**Refactoring Strategy**: Global search/replace with field mapping

#### Step 1: Simple Rename (11 of 16 files)
```typescript
// Files with simple queries (just SELECT *)
// Can be direct renamed: contracts_enriched_v2 → staff_enriched_current

// File 1: src/pages/Dashboard.tsx (line 72)
// OLD:
.from('contracts_enriched_v2')

// NEW:
.from('staff_enriched_current')

// Files affected:
// 1. src/pages/Dashboard.tsx
// 2. src/components/dashboard/TeddyStarsWidget.tsx
// 3. src/components/dashboard/AppiesInsight.tsx
// 4. src/components/analytics/PredictiveInsights.tsx
// 5. src/components/analytics/PerformanceComparison.tsx
// 6. src/components/employes/PredictiveAnalyticsPanel.tsx
// 7. src/components/employes/ComplianceReportingPanel.tsx
// 8. src/components/employes/ContractAnalyticsDashboard.tsx
// 9. src/components/insights/SmartSuggestions.tsx
// 10. src/components/staff/StaffActionCards.tsx (2 queries)
// 11. src/components/insights/ProblemDetectionEngine.tsx (3 queries)
```

#### Step 2: Complex Refactoring (2 of 16 files)
```typescript
// Files that query specific fields or do joins

// File: src/lib/unified-data-service.ts (4 queries)
// Needs field mapping + possible join changes

// File: src/pages/Insights.tsx (2 queries)
// May need field mapping
```

---

## 🔗 Connection Point Analysis

### Agent: Database Schema Guardian - Dependency Tree

**PRIMARY CONNECTION**: `staff` view

```
employes_raw_data (source table)
    ↓
staff (view) - generates UUID from employee_id
    ↓
staff_enriched_current (NEW view) - joins current_state + reviews
    ↓
16 components (TypeScript/React)
```

**KEY INSIGHT**: The `staff` view already exists and works! It bridges the gap between:
- OLD: `employes_employee_id` (TEXT)
- NEW: `employee_id` (UUID)

**How it works**:
```sql
-- staff view (line 395 in temporal_architecture.sql)
SELECT
  md5('employes_employee:' || employee_id)::uuid as id,  -- Creates UUID
  employee_id as employes_id,  -- Keeps TEXT reference
  ...
FROM employes_raw_data
```

---

## 🧩 Field-by-Field Replacement Map

### Group 1: Direct Replacements (14 fields)

| Old Field | New Table | New Field | Change Required |
|-----------|-----------|-----------|-----------------|
| `full_name` | `employes_current_state` | `full_name` | ✅ Exact match |
| `email` | `employes_current_state` | `email` | ✅ Exact match |
| `phone_number` | `employes_current_state` | `phone` or `mobile` | ⚠️ Split field |
| `birth_date` | `employes_current_state` | `date_of_birth` | ⚠️ Name change |
| `position`/`role` | `employes_current_state` | `position` or `role` | ✅ Both exist |
| `location_key` | `employes_current_state` | `location` | ⚠️ Name change |
| `department` | `employes_current_state` | `department` | ✅ Exact match |
| `employment_status` | `employes_current_state` | `employment_status` | ✅ Exact match |
| `first_start` | `employes_current_state` | `start_date` | ⚠️ Name change |
| `contract_type` | `employes_current_state` | `contract_type` | ✅ Exact match |
| `salary_amount` | `employes_current_state` | `current_salary` | ⚠️ Name change |
| `hours_per_week` | `employes_current_state` | `current_hours_per_week` | ⚠️ Name change |
| `manager_key` | `employes_current_state` | `manager_name` | ⚠️ Name change |
| `manager_id` | `employes_current_state` | `manager_id` | ✅ Exact match |

### Group 2: Calculated Fields (6 fields - Need Subqueries)

| Old Field | Calculation | NEW Implementation |
|-----------|-------------|-------------------|
| `last_review_date` | `MAX(staff_reviews.review_date)` | Subquery or JOIN |
| `avg_review_score` | `AVG(staff_reviews.overall_score)` | Subquery or JOIN |
| `has_five_star_badge` | `COUNT(*) > 0 WHERE star_rating >= 5` | Subquery or JOIN |
| `needs_six_month_review` | Complex logic based on start_date + reviews | Recalculate in view |
| `needs_yearly_review` | Complex logic based on last review + 1 year | Recalculate in view |
| `next_review_due` | COALESCE logic with intervals | Recalculate in view |

### Group 3: Contract-Specific Fields (5 fields - PROBLEM!)

| Old Field | Source | NEW Replacement | Status |
|-----------|--------|-----------------|--------|
| `id` (contract) | `contracts.id` | ❌ No replacement | Need contracts table? |
| `start_date` (contract) | `contracts.query_params` | ⚠️ Different from employment start | Use contract_start_date? |
| `end_date` (contract) | `contracts.query_params` | ✅ `contract_end_date` | `employes_current_state` |
| `status` (contract) | `contracts.status` | ❌ No replacement | Need contracts table? |
| `pdf_path` | `contracts.pdf_path` | ❌ No replacement | Need contracts table? |

---

## ⚠️ CRITICAL FINDING: Missing `contracts` Table

### Agent: Database Schema Guardian - Schema Integrity Check

**Problem**: Old view referenced `contracts` table, but we don't know if it exists!

**Questions to Answer**:
1. Does `contracts` table still exist in your database?
2. If yes, what fields does it have?
3. If no, where is contract PDF data stored?

**Check with this SQL**:
```sql
-- Check if contracts table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'contracts'
);

-- If exists, show columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'contracts'
ORDER BY ordinal_position;
```

---

## 🎯 Recommended Actions by Priority

### 🔴 CRITICAL (Do First - 2 hours)

#### Action 1: Verify `contracts` Table Status
```sql
-- Run in Supabase SQL Editor:
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name LIKE '%contract%'
ORDER BY table_name;
```

**If `contracts` exists**:
- Include it in new view definition
- Map contract-specific fields

**If `contracts` DOES NOT exist**:
- Remove contract-specific fields from components
- Focus on employment data only
- Update 16 components to not expect contract fields

---

#### Action 2: Create `staff_enriched_current` View

**SQL Script**: (Based on Action 1 results)

**Scenario A**: If `contracts` table EXISTS:
```sql
CREATE OR REPLACE VIEW staff_enriched_current AS
SELECT
  -- Staff data from employes_current_state
  ecs.*,
  s.id as staff_id,
  
  -- Contract data (if contracts table exists)
  c.id as contract_id,
  c.status as contract_status,
  c.pdf_path,
  c.created_at as contract_created_at,
  c.signed_at,
  
  -- Review metrics (subqueries)
  (SELECT MAX(review_date) FROM staff_reviews WHERE staff_id = s.id) as last_review_date,
  (SELECT AVG(overall_score) FROM staff_reviews WHERE staff_id = s.id) as avg_review_score,
  (SELECT COUNT(*) > 0 FROM staff_reviews WHERE staff_id = s.id AND star_rating >= 5) as has_five_star_badge,
  
  -- Review due flags (calculated)
  -- [Complex CASE statements here]
  
FROM employes_current_state ecs
JOIN staff s ON s.employes_id = ecs.employee_id::TEXT
LEFT JOIN contracts c ON c.staff_id = s.id  -- Or however contracts link
WHERE ecs.is_active = true;
```

**Scenario B**: If `contracts` table DOES NOT EXIST:
```sql
CREATE OR REPLACE VIEW staff_enriched_current AS
SELECT
  -- Staff data only
  ecs.*,
  s.id as staff_id,
  
  -- Review metrics
  (SELECT MAX(review_date) FROM staff_reviews WHERE staff_id = s.id) as last_review_date,
  (SELECT AVG(overall_score) FROM staff_reviews WHERE staff_id = s.id) as avg_review_score,
  (SELECT COUNT(*) > 0 FROM staff_reviews WHERE staff_id = s.id AND star_rating >= 5) as has_five_star_badge,
  
  -- Review due calculations
  CASE
    WHEN ecs.start_date + INTERVAL '6 months' <= CURRENT_DATE
    AND NOT EXISTS (
      SELECT 1 FROM staff_reviews sr
      WHERE sr.staff_id = s.id
      AND sr.review_date >= ecs.start_date + INTERVAL '6 months'
    )
    THEN true
    ELSE false
  END as needs_six_month_review,
  
  CASE
    WHEN (SELECT MAX(review_date) FROM staff_reviews WHERE staff_id = s.id) + INTERVAL '1 year' <= CURRENT_DATE
    THEN true
    ELSE false
  END as needs_yearly_review,
  
  CASE
    WHEN (SELECT MAX(review_date) FROM staff_reviews WHERE staff_id = s.id) IS NULL
    THEN ecs.start_date + INTERVAL '6 months'
    ELSE (SELECT MAX(review_date) FROM staff_reviews WHERE staff_id = s.id) + INTERVAL '1 year'
  END as next_review_due
  
FROM employes_current_state ecs
JOIN staff s ON s.employes_id = ecs.employee_id::TEXT
WHERE ecs.is_active = true;
```

---

#### Action 3: Update TypeScript Types

**File**: `src/integrations/supabase/types/index.ts`

```typescript
// Remove old type reference
// DELETE this:
refresh_contracts_enriched_v2: { Args: never; Returns: undefined }

// If view is created, types will auto-generate
// OR manually add:
export type StaffEnrichedCurrent = {
  staff_id: string;
  employee_id: string;
  full_name: string;
  email: string | null;
  // ... all other fields from view
  last_review_date: string | null;
  avg_review_score: number | null;
  has_five_star_badge: boolean;
  needs_six_month_review: boolean;
  needs_yearly_review: boolean;
  next_review_due: string | null;
};
```

---

### 🟠 HIGH (Week 1 - 4-6 hours)

#### Action 4: Global Code Replacement

**Agent: Dependency Health Monitor - Impact Analysis**

**16 files need updates** - Prioritize by dependency:

**Tier 1: Backend Services** (affects everything)
1. `src/lib/unified-data-service.ts` (4 queries)
2. `src/lib/unified-employment-data.ts` (1 query)

**Tier 2: Dashboard** (high visibility)
3. `src/pages/Dashboard.tsx` (1 query)
4. `src/components/dashboard/AppiesInsight.tsx` (1 query)
5. `src/components/dashboard/TeddyStarsWidget.tsx` (1 query)

**Tier 3: Analytics** (medium visibility)
6. `src/components/analytics/PredictiveInsights.tsx` (1 query)
7. `src/components/analytics/PerformanceComparison.tsx` (1 query)
8. `src/pages/Insights.tsx` (2 queries)

**Tier 4: Staff Management**
9. `src/components/staff/StaffActionCards.tsx` (2 queries)

**Tier 5: Employes Integration**
10. `src/components/employes/ComplianceReportingPanel.tsx` (1 query)
11. `src/components/employes/ContractAnalyticsDashboard.tsx` (1 query)
12. `src/components/employes/PredictiveAnalyticsPanel.tsx` (1 query)

**Tier 6: Insights Engine**
13. `src/components/insights/ProblemDetectionEngine.tsx` (3 queries)
14. `src/components/insights/SmartSuggestions.tsx` (1 query)

---

#### Action 5: Fix Field Name Changes

**Files that use renamed fields** - Need code updates:

```typescript
// FIELD NAME MAPPING FOR CODE UPDATES:

// birth_date → date_of_birth
// OLD: data.birth_date
// NEW: data.date_of_birth

// first_start → start_date  
// OLD: data.first_start
// NEW: data.start_date

// location_key → location
// OLD: data.location_key
// NEW: data.location

// salary_amount → current_salary
// OLD: data.salary_amount
// NEW: data.current_salary

// hours_per_week → current_hours_per_week
// OLD: data.hours_per_week
// NEW: data.current_hours_per_week

// hourly_wage → current_hourly_rate
// OLD: data.hourly_wage
// NEW: data.current_hourly_rate

// manager_key → manager_name
// OLD: data.manager_key
// NEW: data.manager_name
```

**Script to find affected code**:
```bash
# Find all usages of old field names
grep -r "\.birth_date" src/
grep -r "\.first_start" src/
grep -r "\.location_key" src/
grep -r "\.salary_amount" src/
grep -r "\.hours_per_week" src/
grep -r "\.hourly_wage" src/
grep -r "\.manager_key" src/
```

---

### 🟡 MEDIUM (Week 2 - 2 hours)

#### Action 6: Handle Missing Contract Fields

**If `contracts` table doesn't exist**, components expecting these fields will break:

**Affected Fields**:
- `id` (contract ID) - Used for: keys in lists
- `status` (contract status) - Used for: filtering signed contracts
- `pdf_path` - Used for: document links
- `start_date` (contract specific) - May differ from employment start

**Options**:

**Option A**: Remove contract-specific logic
```typescript
// Example: ContractAnalyticsDashboard.tsx
// OLD:
const activeContracts = contracts.filter(c => c.status === 'signed');

// NEW:
const activeStaff = staff.filter(s => s.employment_status === 'active');
```

**Option B**: Add contract fields to `employes_current_state`
```sql
ALTER TABLE employes_current_state
ADD COLUMN contract_pdf_path TEXT,
ADD COLUMN contract_status TEXT DEFAULT 'active',
ADD COLUMN contract_id UUID;
```

---

## 📋 Complete Refactoring Checklist

### Pre-Refactoring Verification
- [ ] Run SQL to check if `contracts` table exists
- [ ] Verify `employes_current_state` has all needed fields
- [ ] Check `staff_reviews` table structure
- [ ] Confirm `staff` view is working
- [ ] Backup database before changes

### Create New View
- [ ] Create `staff_enriched_current` view (Scenario A or B)
- [ ] Test view with sample query: `SELECT * FROM staff_enriched_current LIMIT 5`
- [ ] Verify all required fields exist
- [ ] Check review calculations are correct
- [ ] Grant permissions to authenticated users

### Code Refactoring (Per Component Refactoring Architect)
- [ ] **Tier 1**: Update unified-data-service.ts (test thoroughly!)
- [ ] **Tier 2**: Update Dashboard.tsx components
- [ ] **Tier 3**: Update Analytics components
- [ ] **Tier 4**: Update Staff management
- [ ] **Tier 5**: Update Employes integration
- [ ] **Tier 6**: Update Insights engine
- [ ] **All Tiers**: Test each tier before proceeding

### Field Name Updates
- [ ] Find all usages of renamed fields (grep script above)
- [ ] Update field references in TypeScript code
- [ ] Update TypeScript types if needed
- [ ] Test each component after update

### Cleanup
- [ ] Remove `refresh_contracts_enriched_v2` type reference
- [ ] Update documentation
- [ ] Remove old migration files from project (keep in git history)
- [ ] Add comments to new view

### Testing
- [ ] Test Dashboard page (all widgets load)
- [ ] Test Staff page (action cards show correct counts)
- [ ] Test Insights page (data visible)
- [ ] Test Compliance reporting (correct metrics)
- [ ] Test Analytics dashboards (charts populate)
- [ ] Verify no console errors
- [ ] Check error boundaries don't trigger

---

## 🔬 Verification Queries

### After Creating View
```sql
-- Verify view exists
SELECT * FROM staff_enriched_current LIMIT 5;

-- Check field coverage
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'staff_enriched_current'
ORDER BY ordinal_position;

-- Verify review calculations
SELECT 
  full_name,
  last_review_date,
  avg_review_score,
  needs_six_month_review,
  needs_yearly_review,
  next_review_due
FROM staff_enriched_current
WHERE needs_six_month_review = true OR needs_yearly_review = true
LIMIT 10;

-- Check for NULL fields (data quality)
SELECT
  COUNT(*) as total_records,
  COUNT(full_name) as has_name,
  COUNT(email) as has_email,
  COUNT(current_salary) as has_salary,
  COUNT(last_review_date) as has_reviews,
  COUNT(avg_review_score) as has_avg_score
FROM staff_enriched_current;
```

---

## 🚀 Estimated Impact

### Time Required
- **Investigation**: 1 hour (verify contracts table, check fields)
- **Create View**: 1 hour (write + test SQL)
- **Code Refactoring**: 4-6 hours (16 files, field renames)
- **Testing**: 2 hours (verify all features work)
- **Documentation**: 30 minutes (update docs)
- **Total**: 8-10 hours

### Risk Level
- **Database**: 🟢 LOW (creating view is safe, read-only)
- **Code Changes**: 🟡 MEDIUM (16 files, but simple refactor)
- **Functionality**: 🟢 LOW (if done carefully, zero loss)
- **Performance**: 🟢 EXCELLENT (regular view faster than mat view for 110 employees)

### Business Value
- ✅ Dashboard actually shows data
- ✅ Compliance monitoring works
- ✅ Analytics become functional
- ✅ Problem detection catches issues
- ✅ Review tracking operational
- **ROI**: Features go from 0% → 100% functional

---

## 🎖️ Agent Recommendations Summary

### Database Schema Guardian
**Verdict**: ✅ New architecture is BETTER than old
- Temporal tracking superior
- Proper UUID usage
- Type-safe current state
- Full audit trail
**Recommendation**: Don't recreate old view - build better replacement

### Component Refactoring Architect
**Verdict**: ✅ Refactoring is straightforward with zero functionality loss
- Simple table rename for most files
- Field mapping is clear
- All functionality preservable
**Recommendation**: Batch refactor in tiers, test each tier

### Dependency Health Monitor
**Verdict**: ✅ Low dependency risk
- Only Supabase client involved
- No package updates needed
- Type regeneration after view creation
**Recommendation**: Safe to proceed, low complexity change

---

## 📚 Next Steps

1. **Run verification SQL** (check contracts table)
2. **Create new view** (based on verification results)
3. **Test view** (verify data loads correctly)
4. **Refactor Tier 1** (backend services first)
5. **Test thoroughly** (verify core functionality)
6. **Refactor Tiers 2-6** (one tier at a time)
7. **Final testing** (all pages, all features)
8. **Cleanup** (remove old types, update docs)

---

**Report Status**: ✅ COMPLETE  
**Next Action**: Run verification SQL to check contracts table status  
**Estimated Completion**: 8-10 hours (over 1-2 days)

**Agents**: Database Schema Guardian + Component Refactoring Architect + Dependency Health Monitor

