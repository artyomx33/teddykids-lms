# 🔍 Complete Analysis: `contracts_enriched_v2` Usage

**Generated**: October 25, 2025  
**Status**: ⚠️ TABLE DOES NOT EXIST (0 materialized views found)  
**Impact**: 16 components querying non-existent table  
**Risk Level**: 🔴 CRITICAL - Features likely broken or showing empty data

---

## Executive Summary

**Problem**: `contracts_enriched_v2` is a materialized view that was supposed to be created but **DOES NOT EXIST** in your production database (your query showed 0 materialized views).

**Evidence**: 
- Defined in `_old_migrations/` folder (never ran in production)
- 16 files actively query this table
- All queries have error handling that silently returns empty arrays
- Users likely seeing **empty dashboards and missing analytics**

---

## Complete Usage Breakdown (16 References)

### 📊 DASHBOARD PAGES (3 files)

#### 1. `/dashboard` - Main Dashboard
**File**: `src/pages/Dashboard.tsx` (lines 72-82)

**Page**: Main admin dashboard (`/dashboard`)

**Query**:
```typescript
const { data, error } = await supabase
  .from('contracts_enriched_v2')
  .select('*')
  .or('needs_six_month_review.eq.true,needs_yearly_review.eq.true')
  .lte('next_review_due', next30Days.toISOString());
```

**Purpose**: Show "Reviews due this month" section

**Fields Used**:
- `employes_employee_id` - Employee identifier
- `full_name` - Employee name
- `needs_six_month_review` - Boolean flag
- `needs_yearly_review` - Boolean flag  
- `next_review_due` - Date field
- `has_five_star_badge` - Badge indicator

**What Happens When Missing**: 
- Widget shows "No upcoming reviews in the next 30 days"
- Dashboard appears empty even if reviews are due
- Admins miss critical review deadlines

**Business Impact**: 🔴 HIGH - Compliance risk, missed mandatory reviews

---

#### 2. `/dashboard` - Teddy Stars Widget
**File**: `src/components/dashboard/TeddyStarsWidget.tsx` (lines 24-32)

**Page**: Main dashboard (`/dashboard`) - Top performer widget

**Query**:
```typescript
const { data, error } = await supabase
  .from('contracts_enriched_v2')
  .select('*')
  .gte('avg_review_score', 4.8);
```

**Purpose**: Display top performers with 4.8+ star ratings

**Fields Used**:
- `avg_review_score` - Average rating (needs calculation)
- `first_start` - Employee start date
- Staff info (name, etc.)

**What Happens When Missing**:
- Widget shows empty/loading state
- Top performers not recognized
- No visibility into high performers

**Business Impact**: 🟡 MEDIUM - Morale impact, no recognition system

---

#### 3. `/dashboard` - Appies Insight Panel
**File**: `src/components/dashboard/AppiesInsight.tsx` (lines 47-55)

**Page**: Main dashboard (`/dashboard`) - Smart insights panel

**Query**:
```typescript
const { data, error } = await supabase
  .from('contracts_enriched_v2')
  .select('*');
```

**Purpose**: Analytics for reviews, documents, activity

**Fields Used**: All fields (full table scan)

**What Happens When Missing**:
- Returns empty array (line 52 error handling)
- No smart insights shown
- Dashboard looks incomplete

**Business Impact**: 🟡 MEDIUM - Lost intelligence features

---

### 📈 ANALYTICS COMPONENTS (3 files)

#### 4. Performance Comparison Analytics
**File**: `src/components/analytics/PerformanceComparison.tsx` (lines 25-32)

**Page**: `/dashboard` - Analytics section (bottom)

**Query**:
```typescript
const { data, error } = await supabase
  .from('contracts_enriched_v2')
  .select('*');
```

**Purpose**: Compare staff performance across locations/roles

**Fields Used**:
- `full_name` - Employee name
- `avg_review_score` - Performance metric
- `first_start` - Tenure calculation
- `location_key` - Location grouping

**What Happens When Missing**:
- Empty performance charts
- No comparative analytics
- Cannot identify top/bottom performers by location

**Business Impact**: 🟡 MEDIUM - No performance insights

---

#### 5. Predictive Insights Engine
**File**: `src/components/analytics/PredictiveInsights.tsx` (lines 17-24)

**Page**: `/dashboard` - Analytics section

**Query**:
```typescript
const { data, error } = await supabase
  .from('contracts_enriched_v2')
  .select('*');
```

**Purpose**: Predictive analytics and recommendations

**Fields Used**: All fields for ML-style analysis

**What Happens When Missing**:
- Returns empty array
- No predictive insights
- Advanced features appear broken

**Business Impact**: 🟡 MEDIUM - Lost AI-powered features

---

#### 6. Predictive Analytics Panel (Employes)
**File**: `src/components/employes/PredictiveAnalyticsPanel.tsx` (lines 38-44)

**Page**: Employes.nl integration dashboard

**Query**:
```typescript
const { data: contracts, error: contractsError } = await supabase
  .from('contracts_enriched_v2')
  .select('*');
```

**Purpose**: Generate predictions based on contract data

**Fields Used**: Full table for predictive modeling

**What Happens When Missing**:
- Throws error (line 44)
- Analytics panel fails to load
- Predictions cannot be generated

**Business Impact**: 🟠 HIGH - Predictive features completely broken

---

###  🧠 INSIGHTS & PROBLEM DETECTION (2 files)

#### 7. Problem Detection Engine
**File**: `src/components/insights/ProblemDetectionEngine.tsx` (lines 26-28, 77-80, 105-107)

**Page**: `/insights` - Automated problem detection

**Query 1 - Overdue Reviews**:
```typescript
const { data: overdueReviews, error: reviewError } = await supabase
  .from('contracts_enriched_v2')
  .select('full_name, manager_key, needs_six_month_review, needs_yearly_review, next_review_due')
  .or('needs_six_month_review.eq.true,needs_yearly_review.eq.true');
```

**Query 2 - Expiring Contracts**:
```typescript
const { data: expiringContracts, error: contractError } = await supabase
  .from('contracts_enriched_v2')
  .select('full_name, end_date, manager_key')
  .not('end_date', 'is', null)
  .lte('end_date', thirtyDaysFromNow.toISOString().split('T')[0]);
```

**Query 3 - Inactive Staff**:
```typescript
const { data: inactiveStaff, error: inactiveError } = await supabase
  .from('contracts_enriched_v2')
  .select('full_name, last_review_date, manager_key')
  .or(`last_review_date.is.null,last_review_date.lt.${sixMonthsAgo...}`);
```

**Purpose**: Detect 3 types of problems:
1. Overdue reviews (compliance risk)
2. Expiring contracts (renewal planning)
3. Inactive staff (engagement risk)

**Fields Used**:
- `full_name` - Employee identification
- `manager_key` - Manager assignment
- `needs_six_month_review`, `needs_yearly_review` - Review flags
- `next_review_due` - Review deadline
- `end_date` - Contract expiration
- `last_review_date` - Last review timestamp

**What Happens When Missing**:
- Returns empty arrays (error handling lines 31-33, 83-85, 110-112)
- NO problems detected ever
- Critical issues go unnoticed
- Compliance violations missed

**Business Impact**: 🔴 CRITICAL - Compliance risk, legal exposure

---

#### 8. Smart Suggestions
**File**: `src/components/insights/SmartSuggestions.tsx` (lines 96-102)

**Page**: `/insights` - AI-free smart suggestions

**Query**:
```typescript
const { data: upcomingReviews, error: contractError } = await supabase
  .from("contracts_enriched_v2")
  .select("needs_six_month_review, needs_yearly_review")
  .or("needs_six_month_review.eq.true,needs_yearly_review.eq.true");
```

**Purpose**: Generate actionable suggestions for batch review scheduling

**Fields Used**:
- `needs_six_month_review` - Review flag
- `needs_yearly_review` - Review flag

**What Happens When Missing**:
- Logs error to console (line 102)
- Returns empty array (line 103)
- No review scheduling suggestions shown
- Batch operations not suggested

**Business Impact**: 🟡 MEDIUM - Lost efficiency suggestions

---

### 📋 STAFF MANAGEMENT (1 file)

#### 9. Staff Action Cards
**File**: `src/components/staff/StaffActionCards.tsx` (lines 15-17, 71-74)

**Page**: `/staff` - Action cards at top of staff list

**Query 1 - Reviews Needed**:
```typescript
const { data, error } = await supabase
  .from('contracts_enriched_v2')
  .select('*')
  .or('needs_six_month_review.eq.true,needs_yearly_review.eq.true');
```

**Query 2 - Expiring Contracts**:
```typescript
const { data, error } = await supabase
  .from('contracts_enriched_v2')
  .select('*')
  .not('end_date', 'is', null)
  .lte('end_date', next90Days.toISOString());
```

**Purpose**: Show 4 action cards:
1. Reviews Needed count
2. Missing Documents count (different table)
3. Contracts Expiring count
4. Ready for Promotion count

**Fields Used**:
- `needs_six_month_review`, `needs_yearly_review` - Review flags
- `end_date` - Contract expiration

**What Happens When Missing**:
- Returns empty array (error handling line 20-22, 77-79)
- Action cards show "0" counts
- Managers think everything is fine when it's not
- Critical actions missed

**Business Impact**: 🔴 HIGH - Missed critical staff actions

---

### 💼 COMPLIANCE & REPORTING (2 files)

#### 10. Compliance Reporting Panel
**File**: `src/components/employes/ComplianceReportingPanel.tsx` (lines 43-50)

**Page**: Employes.nl integration - `/employes/compliance`

**Query**:
```typescript
const { data: contracts, error: contractsError } = await supabase
  .from('contracts_enriched_v2')
  .select('*');
```

**Purpose**: Generate Dutch labor law compliance reports with 5 metrics:
1. Chain Rule Compliance (Ketenregeling)
2. Contract Documentation
3. Performance Reviews
4. Data Synchronization
5. Contract Renewals

**Fields Used**:
- `needs_yearly_review`, `needs_six_month_review` - Review compliance
- `pdf_path` - Documentation status
- `status` - Contract status
- `end_date` - Renewal planning
- `employee_name` - Alert identification

**What Happens When Missing**:
- Returns empty array (error handling lines 47-50)
- Overall compliance score shows 100% (false positive!)
- All metrics show 0 issues
- Compliance dashboard shows green when it should be red
- **LEGAL RISK**: Violations go undetected

**Business Impact**: 🔴 CRITICAL - Legal/compliance violations undetected

---

#### 11. Contract Analytics Dashboard
**File**: `src/components/employes/ContractAnalyticsDashboard.tsx` (lines 37-56)

**Page**: Employes.nl integration - `/employes/analytics`

**Query**:
```typescript
const { data: contracts, error } = await supabase
  .from('contracts_enriched_v2')
  .select('*');
```

**Purpose**: Comprehensive contract analytics dashboard:
- Total/active/expiring contract counts
- Temporary vs permanent distribution
- Average contract duration
- Contracts by type/department
- 12-month expiration timeline
- Chain rule risk analysis
- Compliance rate calculation

**Fields Used**:
- `status` - Active contracts
- `end_date` - Expiration tracking
- `contract_type` - Type distribution
- `department` - Department analysis
- `start_date`, `end_date` - Duration calculation
- `needs_yearly_review`, `needs_six_month_review` - Compliance

**What Happens When Missing**:
- Returns zero stats (lines 41-53)
- All charts show empty/zero
- Dashboard appears completely blank
- Management has NO contract visibility

**Business Impact**: 🔴 CRITICAL - No contract management visibility

---

### 📊 DATA SERVICES (2 files)

#### 12. Unified Employment Data Service
**File**: `src/lib/unified-employment-data.ts` (lines 78-79)

**Page**: Backend service used by multiple pages

**Query**:
```typescript
const { data: enrichedContracts, error: contractsError } = await supabase
  .from('contracts_enriched_v2')
  .select('*')
  .eq('staff_id', staffId);
```

**Purpose**: Single source of truth for employment data
- Primary data source for staff profiles
- Used by `/staff/:id` pages
- Historical data consolidation

**Fields Used**: All fields (complete employment record)

**What Happens When Missing**:
- Falls back to other sources (lines 80+)
- Incomplete data in staff profiles
- Missing enriched analytics

**Business Impact**: 🟠 HIGH - Staff profiles incomplete

---

#### 13. Unified Data Service
**File**: `src/lib/unified-data-service.ts` (4 references: lines 102, 217, 280, 318)

**Page**: Backend service layer

**Query 1 - Get Staff List** (line 102):
```typescript
.from('contracts_enriched_v2')
.select('*')
.eq('status', 'active')
```

**Query 2 - Get Reviews** (line 217):
```typescript
.from('contracts_enriched_v2')
.select('*')
.gte('avg_review_score', 4.0)
```

**Query 3 - Performance Filter** (line 280):
```typescript
.from('contracts_enriched_v2')
.select('*')
.lt('avg_review_score', 3.0)
```

**Query 4 - Parallel Query** (line 318):
```typescript
supabase.from('contracts').select('*').eq('staff_id', staffId),
supabase.from('contracts_enriched_v2').select('*').eq('staff_id', staffId)
```

**Purpose**: Core data service layer for:
- Staff list filtering
- Performance queries
- Review aggregations
- Multi-source data fetching

**Fields Used**:
- `status` - Active staff filter
- `avg_review_score` - Performance metrics
- `staff_id` - Staff identification
- All fields for comprehensive data

**What Happens When Missing**:
- Queries return empty (all have error handling)
- Lists appear empty
- Filters don't work
- Search returns nothing

**Business Impact**: 🔴 CRITICAL - Core functionality broken

---

### 📍 INSIGHTS PAGE (1 file)

#### 14. Insights Page
**File**: `src/pages/Insights.tsx` (lines 23-35)

**Page**: `/insights` - Main insights dashboard

**Query 1 - Contract Analysis** (line 23):
```typescript
.from('contracts_enriched_v2')
.select('*')
```

**Query 2 - Performance Stats** (line 35):
```typescript
.from('contracts_enriched_v2')
.select('avg_review_score, full_name')
```

**Purpose**: Power the insights dashboard:
- Contract distribution analysis
- Performance distribution stats
- Top performers identification

**Fields Used**:
- All fields for analysis
- `avg_review_score` - Performance
- `full_name` - Identification

**What Happens When Missing**:
- Returns empty arrays
- Insights page shows no data
- Charts are empty
- No insights available

**Business Impact**: 🔴 HIGH - Entire insights page non-functional

---

### 🔧 TYPE DEFINITIONS (1 file)

#### 15. TypeScript Types
**File**: `src/integrations/supabase/types/index.ts` (line 181)

**Purpose**: TypeScript function definition

**Reference**:
```typescript
refresh_contracts_enriched_v2: { Args: never; Returns: undefined }
```

**What This Tells Us**:
- A function `refresh_contracts_enriched_v2()` is supposed to exist
- It's for refreshing the materialized view
- Function also doesn't exist (materialized view not created)

**What Happens**: Type definitions exist but runtime fails

---

## 📊 Impact Summary

### By Page/Route

| Page/Route | Components Affected | Impact Level | User-Visible Issue |
|------------|-------------------|--------------|-------------------|
| `/dashboard` | 3 widgets | 🔴 CRITICAL | Empty dashboard, no reviews shown |
| `/staff` | Action cards | 🔴 HIGH | All action counts show 0 |
| `/insights` | 2 components | 🔴 HIGH | Page shows no data |
| `/employes/compliance` | Report panel | 🔴 CRITICAL | False 100% compliance |
| `/employes/analytics` | Analytics dashboard | 🔴 CRITICAL | All charts empty |
| Backend services | 2 services | 🔴 CRITICAL | Core queries return empty |

### By Business Function

| Function | Impact | Risk |
|----------|--------|------|
| Review Management | 🔴 CRITICAL | Missed mandatory reviews → Compliance violations |
| Contract Compliance | 🔴 CRITICAL | Undetected legal violations → Legal liability |
| Performance Analytics | 🔴 HIGH | No performance visibility → Poor management |
| Problem Detection | 🔴 CRITICAL | Issues go undetected → Escalating problems |
| Staff Recognition | 🟡 MEDIUM | Top performers not recognized → Morale impact |

---

## 🔍 What Fields Are Needed?

Based on all 16 references, `contracts_enriched_v2` should contain:

### Core Staff Fields
- `id` - Unique identifier
- `staff_id` - Reference to staff table
- `employes_employee_id` - Employes.nl reference
- `employee_name` / `full_name` - Display name
- `manager_key` - Manager assignment

### Contract Fields
- `status` - Contract status (signed, draft, etc.)
- `contract_type` - Type (temporary, permanent, etc.)
- `start_date` - Contract start
- `end_date` - Contract expiration
- `pdf_path` - Document path
- `department` - Department assignment
- `location_key` - Location assignment

### Review Fields
- `needs_six_month_review` - Boolean flag
- `needs_yearly_review` - Boolean flag
- `next_review_due` - Next review date
- `last_review_date` - Last review timestamp
- `avg_review_score` - Calculated average rating

### Recognition Fields
- `has_five_star_badge` - Boolean flag
- `first_start` - Original start date (for tenure)

---

## 💡 Root Cause

The migration defining `contracts_enriched_v2` is in **`_old_migrations/`** folder:
- `_old_migrations/20251002183858_3ded617a-ff74-4827-b1a6-230fe24d9d97.sql`
- `_old_migrations/20251002175532_866e5740-e66a-41a6-8c91-ba6052a2c3c9.sql`

**Migrations in `_old_migrations/` never ran in production.**

The code was written expecting this view to exist, but it was never created.

---

## ✅ Recommended Solution

**Option 1: Create as Regular VIEW (Recommended)**
- Faster than materialized view
- Auto-updates with source data
- No refresh needed
- Good for < 10,000 rows

**Option 2: Create as MATERIALIZED VIEW**
- Better performance for large datasets
- Requires periodic refresh
- More complex maintenance
- Use if > 10,000 rows

**Option 3: Remove All References**
- Rewrite 16 components to use source tables directly
- More work but possibly cleaner
- Avoids view maintenance

---

**Next Step**: Would you like me to create the SQL to build this view based on what all the components actually need?

