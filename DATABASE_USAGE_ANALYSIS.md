# 🔍 DATABASE USAGE ANALYSIS - What's ACTUALLY Used vs OLD STUFF

**Date**: October 6, 2025  
**Status**: ✅ Current system is FAST and WORKING  
**Goal**: Don't break what's working, only ADD missing pieces

---

## 🎯 **CURRENT WORKING SYSTEM (DON'T TOUCH!)**

### **✅ Tables ACTIVELY USED (Keep & Connected)**

#### 1. **`employes_raw_data`** ✅ **USED**
**Status**: 🟢 **ACTIVELY USED** - Core of new system  
**Used By**:
- `src/lib/employesProfile.ts` - Fetches latest employee data
- `src/components/employes/EmployesSyncControl.tsx` - Sync stats
- `src/components/employes/SyncStatisticsPanel.tsx` - Dashboard
- `src/hooks/useEmployees.ts` - Employee lists

**Purpose**: Stores ALL raw API responses from Employes.nl  
**Critical**: YES - This is our single source of truth!

---

#### 2. **`employes_changes`** ✅ **USED**
**Status**: 🟢 **ACTIVELY USED** - Powers employment history  
**Used By**:
- `src/pages/StaffProfile.tsx` - Main profile page (line 93, 119, 129)
- `src/components/employes/EmploymentOverviewEnhanced.tsx` - History display
- `src/components/employes/RecentChangesPanel.tsx` - Recent changes
- `src/components/employes/SyncStatisticsPanel.tsx` - Stats

**Purpose**: Detected changes in salary, hours, contracts  
**Critical**: YES - This is what shows Alena's history!

**Realtime**: YES - Has realtime subscription on `StaffProfile.tsx:87`

---

#### 3. **`employes_sync_sessions`** ✅ **USED**
**Status**: 🟢 **ACTIVELY USED** - Tracks sync runs  
**Used By**:
- `supabase/functions/employes-sync-trigger/index.ts` - Orchestrator
- `src/components/employes/EmployesSyncControl.tsx` - Sync status

**Purpose**: Track sync sessions, errors, success rates  
**Critical**: YES - Required for sync system

---

#### 4. **`staff`** ✅ **USED**
**Status**: 🟢 **ACTIVELY USED** - Core staff table  
**Used By**:
- `src/lib/staff.ts` - Main staff queries
- `src/pages/StaffProfile.tsx` - Profile page
- Multiple components across the app

**Purpose**: Basic staff information  
**Critical**: YES - Core table

**Note**: This is a **VIEW** (not a real table) - generated from other data

---

#### 5. **`contracts`** ✅ **USED**
**Status**: 🟢 **ACTIVELY USED** - Contract storage  
**Used By**:
- `src/lib/staff.ts` - Contract queries
- `src/components/staff/StaffContractsPanel.tsx`
- Multiple contract-related components

**Purpose**: Store contract PDFs and metadata  
**Critical**: YES - Core table

---

#### 6. **`contracts_enriched` / `contracts_enriched_v2`** ✅ **USED**
**Status**: 🟢 **ACTIVELY USED** - Enhanced contract view  
**Used By**:
- `src/lib/unified-data-service.ts` - Main data service
- Multiple components

**Purpose**: Contracts with calculated fields (review dates, etc.)  
**Critical**: YES - Main contract view

---

## ⚠️ **TABLES REFERENCED BUT MISSING (Need to Create)**

### **❌ Tables EXPECTED by Frontend but DON'T EXIST**

#### 1. **`staff_reviews`** ❌ **MISSING**
**Status**: 🔴 **EXPECTED BUT MISSING**  
**Expected By**:
- `src/lib/hooks/useReviews.ts` (line 128)
- `src/lib/unified-data-service.ts` (line 117)
- `src/lib/staff.ts` (line 165)
- `src/components/insights/SmartSuggestions.tsx`
- `src/pages/ActivityFeed.tsx`

**Purpose**: Store performance reviews  
**Impact**: Review system doesn't work (gracefully handled with fallbacks)

**Schema Expected**:
```typescript
{
  id: string
  staff_id: string (FK → staff.id)
  reviewer_id: string (FK → staff.id)
  template_id: string (FK → review_templates.id)
  review_date: date
  review_type: 'probation' | 'six_month' | 'yearly' | 'exit'
  status: 'draft' | 'completed' | 'approved'
  overall_rating: number
  strengths: text
  areas_for_improvement: text
  goals_set: jsonb
  notes: text
  created_at: timestamp
  updated_at: timestamp
}
```

---

#### 2. **`review_templates`** ❌ **MISSING**
**Status**: 🔴 **EXPECTED BUT MISSING**  
**Expected By**:
- `src/lib/hooks/useReviews.ts` (line 308)
- `src/components/reviews/ReviewForm.tsx`

**Purpose**: Store review form templates  
**Impact**: Can't create new reviews

**Schema Expected**:
```typescript
{
  id: string
  name: string
  type: 'probation' | 'six_month' | 'yearly' | 'exit'
  questions: jsonb
  is_active: boolean
  created_at: timestamp
  updated_at: timestamp
}
```

---

#### 3. **`staff_review_summary`** ❌ **MISSING (VIEW)**
**Status**: 🔴 **EXPECTED BUT MISSING**  
**Expected By**:
- `src/lib/hooks/useReviews.ts` (line 257)
- `src/pages/StaffProfile.tsx` (line 71)

**Purpose**: Aggregated review stats per staff member  
**Impact**: No review summary stats

**View Expected**:
```sql
CREATE VIEW staff_review_summary AS
SELECT 
  staff_id,
  COUNT(*) as total_reviews,
  AVG(overall_rating) as average_rating,
  MAX(review_date) as last_review_date,
  MIN(review_date) as first_review_date,
  COUNT(*) FILTER (WHERE review_date > CURRENT_DATE - INTERVAL '1 year') as reviews_last_year
FROM staff_reviews
GROUP BY staff_id;
```

---

#### 4. **`performance_trends`** ❌ **MISSING (VIEW)**
**Status**: 🔴 **EXPECTED BUT MISSING**  
**Expected By**:
- `src/lib/hooks/useReviews.ts` (line 283)
- `src/pages/StaffProfile.tsx` (line 72)

**Purpose**: Performance trends over time  
**Impact**: No performance analytics

**View Expected**:
```sql
CREATE VIEW performance_trends AS
SELECT 
  staff_id,
  EXTRACT(YEAR FROM review_date) as review_year,
  EXTRACT(QUARTER FROM review_date) as review_quarter,
  AVG(overall_rating) as avg_rating,
  COUNT(*) as review_count
FROM staff_reviews
GROUP BY staff_id, review_year, review_quarter;
```

---

#### 5. **`staff_notes`** ❌ **MISSING**
**Status**: 🔴 **EXPECTED BUT MISSING**  
**Expected By**:
- `src/lib/unified-data-service.ts` (line 123)

**Purpose**: Store notes about staff members  
**Impact**: Can't add notes

**Schema Expected**:
```typescript
{
  id: string
  staff_id: string (FK → staff.id)
  note: text
  created_by: string
  created_at: timestamp
  updated_at: timestamp
}
```

---

#### 6. **`staff_certificates`** ❌ **MISSING**
**Status**: 🔴 **EXPECTED BUT MISSING**  
**Expected By**:
- `src/lib/unified-data-service.ts` (line 129)

**Purpose**: Store uploaded certificates  
**Impact**: Can't upload certificates

**Schema Expected**:
```typescript
{
  id: string
  staff_id: string (FK → staff.id)
  certificate_name: string
  file_path: string
  uploaded_at: timestamp
  uploaded_by: string
}
```

---

#### 7. **`staff_docs_status`** ❌ **MISSING**
**Status**: 🔴 **EXPECTED BUT MISSING**  
**Expected By**:
- `src/lib/unified-data-service.ts` (line 135)

**Purpose**: Track document compliance status  
**Impact**: No document status tracking

**Schema Expected**:
```typescript
{
  id: string
  staff_id: string (FK → staff.id)
  vog_status: 'pending' | 'approved' | 'expired'
  vog_expiry: date
  id_verified: boolean
  contract_signed: boolean
  updated_at: timestamp
}
```

---

## 🧹 **OLD STUFF (Probably Not Used)**

### **❓ Tables That MIGHT Be Old/Unused**

#### 1. **`cao_salary_history`** ❓ **UNCLEAR**
**Status**: 🟡 **EXISTS but not directly queried in frontend**  
**Purpose**: CAO salary history (Dutch labor law)  
**Decision**: KEEP - Might be used by backend or future features

---

#### 2. **`contract_access_tokens`** ❓ **UNCLEAR**
**Status**: 🟡 **EXISTS but not directly queried in frontend**  
**Purpose**: Secure contract access tokens  
**Decision**: KEEP - Security feature

---

#### 3. **`contract_financials`** ❓ **UNCLEAR**
**Status**: 🟡 **EXISTS but not directly queried in frontend**  
**Purpose**: Encrypted financial data  
**Decision**: KEEP - Security/compliance feature

---

## 📊 **SUMMARY**

### **✅ WORKING SYSTEM (Don't Touch)**
- ✅ `employes_raw_data` - Core data storage
- ✅ `employes_changes` - Change detection (FAST!)
- ✅ `employes_sync_sessions` - Sync tracking
- ✅ `staff` (view) - Staff info
- ✅ `contracts` - Contract storage
- ✅ `contracts_enriched` - Enhanced contracts

### **❌ MISSING TABLES (Need to Create)**
- ❌ `staff_reviews` - Review storage
- ❌ `review_templates` - Review templates
- ❌ `staff_notes` - Staff notes
- ❌ `staff_certificates` - Certificate uploads
- ❌ `staff_docs_status` - Document compliance

### **❌ MISSING VIEWS (Need to Create)**
- ❌ `staff_review_summary` - Review aggregations
- ❌ `performance_trends` - Performance analytics

---

## 🎯 **RECOMMENDATION**

### **Option A: Create ALL Missing Tables NOW** ✅ **RECOMMENDED**
**Why**: 
- Frontend already has graceful fallbacks
- Won't break anything
- Makes Labs 2.0 fully functional
- All queries are already written and tested

**Risk**: 🟢 **ZERO** - Frontend handles missing tables gracefully

---

### **Option B: Create Only What's Needed**
**Why**: Minimal approach
**Risk**: 🟡 **MEDIUM** - Might miss dependencies

---

## 🚀 **NEXT STEPS**

If you choose **Option A** (recommended):

1. ✅ Create migration for `staff_reviews` table
2. ✅ Create migration for `review_templates` table
3. ✅ Create migration for `staff_notes` table
4. ✅ Create migration for `staff_certificates` table
5. ✅ Create migration for `staff_docs_status` table
6. ✅ Create views: `staff_review_summary`, `performance_trends`
7. ✅ Test that existing pages still work
8. ✅ Verify new features become available

**Time Estimate**: 30 minutes  
**Risk**: Zero (frontend already handles this)

---

## 💡 **ANSWER TO YOUR QUESTION**

> "do we have the raw table still.. is it used??"

**YES! `employes_raw_data` is ACTIVELY USED!** 🟢

It's the **CORE** of your new system:
- ✅ Stores all API responses
- ✅ Powers the profile cards
- ✅ Used by sync system
- ✅ Queried by multiple components

**DO NOT DELETE OR MODIFY IT!** It's what makes everything fast! 🚀

---

**Ready to create the missing tables?** Let me know if you want Option A or Option B!
