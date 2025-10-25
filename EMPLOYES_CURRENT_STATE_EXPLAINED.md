# 🔍 What is `employes_current_state`? Complete Investigation

**Generated**: October 25, 2025  
**Your Results**: 79 employees (matches staff view count)  
**Status**: ✅ ACTIVE and IN USE (you're using it!)

---

## 📊 Quick Answer

**What it is**: A typed, fast-access table containing current employment snapshot for all 79 active employees

**Created**: October 6, 2025 (migration `20251006130000_create_current_state.sql`)

**Purpose**: Replace slow JSONB queries with typed columns for better performance

**Who uses it**: `src/hooks/useEmployeeCurrentState.ts` (custom hook)

---

## 🗂️ What Data It Contains

Based on migration, this table has **40+ typed fields**:

### Personal Information
- `employee_id` (UUID) - Primary key
- `full_name` (TEXT) - Full employee name
- `first_name` (TEXT)
- `last_name` (TEXT)
- `email` (TEXT)
- `phone` (TEXT)
- `mobile` (TEXT)
- `date_of_birth` (DATE)
- `nationality` (TEXT)
- `nationality_id` (INTEGER)

### Employment Details
- `employment_status` (TEXT) - 'active', 'inactive', etc.
- `start_date` (DATE) - Employment start
- `end_date` (DATE) - Employment end (NULL if still employed)
- `position` (TEXT) - Job title
- `role` (TEXT) - Role description
- `department` (TEXT) - Department
- `location` (TEXT) - Work location
- `manager_name` (TEXT)
- `manager_id` (UUID)

### Compensation (CURRENT)
- `current_salary` (DECIMAL) - Current monthly salary
- `current_hourly_rate` (DECIMAL) - Current hourly wage
- `current_hours_per_week` (DECIMAL) - Current work hours
- `salary_effective_date` (DATE) - When current salary started

### Contract Information
- `contract_type` (TEXT) - Temporary, permanent, etc.
- `contract_start_date` (DATE)
- `contract_end_date` (DATE)

### Address
- `street_address` (TEXT)
- `city` (TEXT)
- `postal_code` (TEXT)
- `country` (TEXT)

### Identifiers (Dutch System)
- `bsn` (TEXT) - Dutch social security number
- `iban` (TEXT) - Bank account

### Computed Fields
- `months_employed` (INTEGER) - Tenure calculation
- `age` (INTEGER) - Current age
- `is_active` (BOOLEAN) - Active employment flag

### Data Quality Metadata
- `last_sync_at` (TIMESTAMPTZ) - Last sync from Employes.nl
- `last_sync_session_id` (UUID) - Sync session reference
- `data_completeness_score` (DECIMAL 0-1) - Data quality metric (0.8 = 80% complete)
- `data_quality_flags` (JSONB) - Quality issues

### Timestamps
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

---

## 🔗 What Connects to It?

### Direct Code Usage (3 places found)

**File**: `src/hooks/useEmployeeCurrentState.ts`

**Hook 1: `useEmployeeCurrentState(employeeId)`** - Line 97
```typescript
const { data, error } = await supabase
  .from('employes_current_state')
  .select('*')
  .eq('employee_id', employeeId)
  .maybeSingle();
```
**Purpose**: Get complete current state for ONE employee  
**Used by**: Employee profile pages

---

**Hook 2: `useActiveEmployees()`** - Line 131
```typescript
const { data, error } = await supabase
  .from('employes_current_state')
  .select('employee_id, full_name, department, position, email, current_salary')
  .eq('is_active', true)
  .order('full_name');
```
**Purpose**: Get list of all active employees with key fields  
**Used by**: Staff lists, dropdowns, filters

---

**Hook 3: `useEmployeesByDepartment(department)`** - Line 160
```typescript
const { data, error } = await supabase
  .from('employes_current_state')
  .select('*')
  .eq('department', department)
  .eq('is_active', true);
```
**Purpose**: Filter employees by department  
**Used by**: Department views, org charts

---

**Hook 4: `useDataQualityStats()`** - Line 186
```typescript
const { data, error } = await supabase
  .from('employes_current_state')
  .select('data_completeness_score, is_active');
```
**Purpose**: Monitor data quality across all employees  
**Used by**: Data quality dashboards

---

### Indirect Usage (via functions)

**Function**: `get_system_health_score()`  
**In**: `20251006180000_complete_analytics_system.sql`

Queries `employes_current_state` for health metrics:
- Last sync times
- Data completeness averages
- Fresh vs stale record counts
- Total employee counts

---

### View Dependencies

**Views that MIGHT use it**:
- `v_active_employees` - Filters to active only
- `v_incomplete_data_employees` - Shows data quality issues

**Current Check**: Run `CHECK_EMPLOYES_CURRENT_STATE.sql` to verify

---

## 🆚 How It Differs from Other Tables

### `employes_current_state` vs `employes_raw_data`

| Feature | employes_raw_data | employes_current_state |
|---------|-------------------|------------------------|
| **Purpose** | Store ALL API responses | Current snapshot ONLY |
| **Data Type** | JSONB (untyped) | Typed columns |
| **History** | Full temporal history | Latest state only |
| **Rows** | Thousands (all history) | 79 (one per employee) |
| **Query Speed** | Slower (JSON parsing) | Faster (indexed columns) |
| **Use Case** | Time-travel queries | Fast current data |

---

### `employes_current_state` vs `staff` view

| Feature | staff (view) | employes_current_state |
|---------|--------------|------------------------|
| **Type** | VIEW | TABLE (or VIEW - changed in later migration) |
| **Source** | employes_raw_data | employes_raw_data (backfilled) |
| **Fields** | ~20 basic fields | 40+ comprehensive fields |
| **ID Type** | UUID (generated) + TEXT employes_id | UUID employee_id |
| **Purpose** | Backward compatibility | Modern typed access |
| **Updates** | Auto (view) | Sync process (table) |

---

### `employes_current_state` vs `contracts_enriched_v2`

| Feature | contracts_enriched_v2 | employes_current_state |
|---------|----------------------|------------------------|
| **Exists** | ❌ NO (never created) | ✅ YES (79 rows) |
| **Type** | Materialized view | Table |
| **Fields** | 25 (contract + staff + reviews) | 40+ (employment only) |
| **Reviews** | ✅ Had review metrics | ❌ NO review metrics |
| **Contract** | ✅ Had contract fields | ✅ Has basic contract fields |
| **Performance** | Unknown | Fast (typed) |

---

## 🎯 So What's the Relationship?

### Current Architecture Flow

```
1. Employes.nl API (external)
        ↓
2. employes_raw_data (stores all API responses)
        ↓
3. employes_current_state (extracts current typed snapshot)
        ↓
4. staff view (generates UUID, backward compatible)
        ↓
5. Your components (use staff.id for foreign keys)
```

### The Missing Link

**What `employes_current_state` DOESN'T have**:
- ❌ Review metrics (last_review_date, avg_review_score, etc.)
- ❌ Review flags (needs_six_month_review, needs_yearly_review)
- ❌ Next review due dates
- ❌ Five star badge flag

**What components NEED** (from old contracts_enriched_v2):
- ✅ Review metrics (must JOIN with staff_reviews)
- ✅ Review due calculations
- ✅ Performance scoring

---

## 💡 The Solution Becomes Clear

**Option A**: Create view that ADDS review metrics to employes_current_state

```sql
CREATE OR REPLACE VIEW staff_enriched_current AS
SELECT
  ecs.*,  -- All 40+ fields from employes_current_state
  s.id as staff_id,  -- UUID from staff view
  
  -- Add review metrics via subqueries
  (SELECT MAX(review_date) FROM staff_reviews WHERE staff_id = s.id) as last_review_date,
  (SELECT AVG(overall_score) FROM staff_reviews WHERE staff_id = s.id) as avg_review_score,
  (SELECT COUNT(*) > 0 FROM staff_reviews WHERE staff_id = s.id AND star_rating >= 5) as has_five_star_badge,
  
  -- Add review due flags
  -- [Complex CASE logic here]
  
FROM employes_current_state ecs
JOIN staff s ON s.employes_id = ecs.employee_id::TEXT
WHERE ecs.is_active = true;
```

**Why this works**:
- ✅ `employes_current_state` has employment data (79 employees)
- ✅ `staff` view bridges to UUID for staff_reviews FK
- ✅ `staff_reviews` has review data (15 reviews)
- ✅ Regular view = auto-updates, no refresh needed
- ✅ All required fields available

---

## 🔬 What Your Data Shows

**Your Query Results**:
```
contracts: 423 rows          (historical contracts)
employes_current_state: 79   (current employees - typed)
staff (view): 79             (same employees - with UUID)
staff_reviews: 15            (review records)
```

**Key Insights**:
1. ✅ 79 employees in both `employes_current_state` AND `staff` view (perfect match!)
2. ✅ 423 contracts total (historical data available)
3. ⚠️ Only 15 reviews for 79 employees (19% review coverage)
4. ✅ System is operational - just missing the enriched view

---

## 🚀 Why You Don't Remember It

**Created**: October 6, 2025 (migration `20251006130000_create_current_state.sql`)

**Philosophy** (from migration comments):
> "Fast, typed employee current state"  
> "Speed over flexibility"

**What Happened**:
1. You created `employes_raw_data` for temporal tracking
2. Realized JSONB queries were slow
3. Created `employes_current_state` as fast-access typed table
4. Populated it with data from `employes_raw_data`
5. Created hooks to use it (`useEmployeeCurrentState.ts`)
6. But... never created the enriched view with review metrics!

**So You ARE Using It** - just not directly. It's used via:
- `useActiveEmployees()` hook
- `useEmployeesByDepartment()` hook  
- `useDataQualityStats()` hook
- System health monitoring functions

---

## 📋 What Needs to Happen Now

### The Missing Piece

You have:
- ✅ Employment data (`employes_current_state` - 79 employees)
- ✅ Staff UUID bridge (`staff` view - 79 records)
- ✅ Review data (`staff_reviews` - 15 reviews)
- ✅ Contract data (`contracts` - 423 contracts)

You're missing:
- ❌ A view that JOINS all of them together
- ❌ Review metric calculations
- ❌ Review due flags

**16 components** expect this joined view to exist but it doesn't!

---

## ✅ Next Action

**Run this SQL** to see what's actually IN `employes_current_state`:

```sql
-- See sample data
SELECT 
  employee_id,
  full_name,
  email,
  position,
  department,
  employment_status,
  current_salary,
  current_hours_per_week,
  start_date,
  is_active,
  data_completeness_score
FROM employes_current_state
LIMIT 5;
```

Then I'll create the EXACT SQL to build `staff_enriched_current` view that gives your 16 components the data they need! 🎯

---

**File**: [CHECK_EMPLOYES_CURRENT_STATE.sql](file:///Users/artyomx/projects/teddykids-lms-main/CHECK_EMPLOYES_CURRENT_STATE.sql) - Run this to see full details

