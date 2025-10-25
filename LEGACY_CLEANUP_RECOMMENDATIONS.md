# 🧹 Legacy Database Cleanup Recommendations
**Generated**: October 25, 2025  
**Project**: TeddyKids LMS  
**Priority**: Organized by impact and urgency

---

## Executive Summary

**Tables to Review**: 6 orphaned + 4 questionable  
**Views to Clean**: 7 unused views  
**Functions to Consolidate**: 5 version conflicts  
**Security Issues**: 1 critical (`execute_sql`)  
**Estimated Effort**: 8-12 hours over 1-2 weeks

---

## 🔴 CRITICAL PRIORITY (Do First - 2-3 hours)

### 1. Fix `contracts_enriched_v2` Issue
**Problem**: Materialized view used in 16 places but contains NO DATA

**Impact**: HIGH - Analytics features may be broken or showing empty results

**Files Affected**:
```
src/components/employes/ComplianceReportingPanel.tsx
src/components/employes/ContractAnalyticsDashboard.tsx
src/components/employes/PredictiveAnalyticsPanel.tsx
src/components/insights/ProblemDetectionEngine.tsx (3 references)
src/components/insights/SmartSuggestions.tsx
src/components/analytics/PredictiveInsights.tsx
src/components/analytics/PerformanceComparison.tsx
src/components/dashboard/AppiesInsight.tsx
src/components/dashboard/TeddyStarsWidget.tsx
src/lib/unified-employment-data.ts
src/components/staff/StaffActionCards.tsx (2 references)
src/pages/Dashboard.tsx
src/lib/unified-data-service.ts (4 references)
src/pages/Insights.tsx (2 references)
```

**Options**:

**Option A: Populate the View (RECOMMENDED)**
```sql
-- If this view should contain contract data
REFRESH MATERIALIZED VIEW contracts_enriched_v2;

-- Or if the query needs fixing, recreate it
DROP MATERIALIZED VIEW IF EXISTS contracts_enriched_v2;
CREATE MATERIALIZED VIEW contracts_enriched_v2 AS
SELECT
  -- Add actual query here based on requirements
  s.id as staff_id,
  s.full_name,
  -- ... other fields
FROM staff s
LEFT JOIN employes_raw_data e ON s.employes_id = e.id::text;

-- Create index for performance
CREATE INDEX idx_contracts_enriched_v2_staff_id ON contracts_enriched_v2(staff_id);

-- Set up auto-refresh (if needed)
CREATE OR REPLACE FUNCTION refresh_contracts_enriched_v2()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY contracts_enriched_v2;
END;
$$ LANGUAGE plpgsql;
```

**Option B: Remove All References**
If this view is not needed, remove from all 16 files and drop it:
```sql
DROP MATERIALIZED VIEW IF EXISTS contracts_enriched_v2 CASCADE;
```

---

### 2. Verify & Create Missing Tables/Views

**Problem**: Code references tables that may not exist

**Action Items**:

#### A. Check `staff_with_lms_data`
```sql
-- Check if exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'staff_with_lms_data'
);

-- If NOT exists, create view:
CREATE OR REPLACE VIEW staff_with_lms_data AS
SELECT
  s.*,
  COUNT(sr.id) as total_reviews,
  MAX(sr.star_rating) as latest_rating,
  COUNT(sn.id) as total_notes,
  COUNT(sc.id) as total_certificates
FROM staff s
LEFT JOIN staff_reviews sr ON s.id = sr.staff_id
LEFT JOIN staff_notes sn ON s.id = sn.staff_id
LEFT JOIN staff_certificates sc ON s.id = sc.staff_id
GROUP BY s.id;
```

**Files affected**: `Staff.tsx`, `Interns.tsx`

#### B. Check `staff_document_compliance`
```sql
-- Check if exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'staff_document_compliance'
);

-- If NOT exists, create view or fix references
-- Current code has error handling suggesting it might not exist
```

**Files affected**: `StaffActionCards.tsx`, `lib/staff.ts`

#### C. Check `overdue_reviews`
```sql
-- Check if exists  
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'overdue_reviews'
);

-- If NOT exists, create view:
CREATE OR REPLACE VIEW overdue_reviews AS
SELECT
  sr.*,
  s.full_name,
  CURRENT_DATE - sr.due_date as days_overdue
FROM staff_reviews sr
JOIN staff s ON sr.staff_id = s.id
WHERE sr.status != 'completed'
AND sr.due_date < CURRENT_DATE;
```

**Files affected**: `useReviews.ts`

---

### 3. Fix Table Reference Typo

**Problem**: Code references `certificates` but table is `staff_certificates`

**File**: `src/lib/staff.ts` line 357
```typescript
// ❌ WRONG
.from("certificates")

// ✅ FIX
.from("staff_certificates")
```

**Impact**: MEDIUM - Probably causing query errors

---

## 🟠 HIGH PRIORITY (Week 1 - 3-4 hours)

### 4. Consolidate Function Versions

**Problem**: Multiple versions of same functions exist

#### A. `generate_timeline_v2`
**Found in**: 4 different migration files
- `20251011000002_timeline_generator_correct_extraction.sql`
- `20251011000001_enhance_timeline_generator_complete_state.sql`
- `20251010000002_fix_timeline_generator_complete.sql`
- `20251010000000_fix_timeline_generator.sql`

**Action**:
```sql
-- Identify which version is actually active
SELECT 
  routine_name, 
  created 
FROM information_schema.routines 
WHERE routine_name = 'generate_timeline_v2';

-- Drop old versions and keep latest
-- (Manual review needed to determine which is latest)
```

#### B. `get_current_salary`
**Versions**: `get_current_salary` and `get_current_salary_v2`

**Action**:
```sql
-- Check which is used in code
-- Answer: get_current_salary is used in WageSyncPanel.tsx
-- Drop v2 if not needed

DROP FUNCTION IF EXISTS get_current_salary_v2(TEXT);
```

---

### 5. Review & Cleanup `ta_*` Tables (Old Talent Acquisition)

**Problem**: 4 talent acquisition tables with NO code references

**Tables**:
- `ta_applicants`
- `ta_assessment_answers`
- `ta_assessment_questions`
- `ta_widget_analytics`

**Assessment Needed**:
1. Check if superseded by new `candidates` table
2. Check if data migration happened
3. Verify no Edge Functions use these tables

**Action SQL**:
```sql
-- First, check if they contain data
SELECT 
  'ta_applicants' as table_name, 
  COUNT(*) as row_count 
FROM ta_applicants
UNION ALL
SELECT 'ta_assessment_answers', COUNT(*) FROM ta_assessment_answers
UNION ALL
SELECT 'ta_assessment_questions', COUNT(*) FROM ta_assessment_questions
UNION ALL
SELECT 'ta_widget_analytics', COUNT(*) FROM ta_widget_analytics;

-- If all are empty or data was migrated:
DROP TABLE IF EXISTS ta_widget_analytics CASCADE;
DROP TABLE IF EXISTS ta_assessment_answers CASCADE;
DROP TABLE IF EXISTS ta_assessment_questions CASCADE;
DROP TABLE IF EXISTS ta_applicants CASCADE;
```

---

### 6. Remove Dangerous `execute_sql` Function

**Problem**: SQL injection risk

**File**: `src/lib/staff.ts` line 170
```typescript
const { data, error } = await supabase.rpc('execute_sql', { sql_query: query });
```

**Risk**: HIGH - Allows arbitrary SQL execution

**Action**:
1. Find all uses of `execute_sql`
2. Replace with specific safe functions
3. Drop the function

```sql
-- Drop the dangerous function
DROP FUNCTION IF EXISTS execute_sql(TEXT);
```

**Code Change**: Replace dynamic SQL with specific query functions

---

## 🟡 MEDIUM PRIORITY (Week 2 - 2-3 hours)

### 7. Drop Unused Views

**Problem**: 7 views defined but never used

**Views to Review**:
```sql
-- Check usage in logs first, then drop if safe

DROP VIEW IF EXISTS review_calendar_unified CASCADE;
DROP VIEW IF EXISTS v_active_employees CASCADE;
DROP VIEW IF EXISTS v_incomplete_data_employees CASCADE;
DROP VIEW IF EXISTS review_calendar CASCADE;
DROP VIEW IF EXISTS document_compliance_view CASCADE;
DROP VIEW IF EXISTS data_quality_metrics CASCADE;
```

**Note**: Keep `staff_review_summary` and `performance_trends` - they ARE used

**Check Before Dropping**:
```sql
-- Verify no dependencies
SELECT 
  dependent_view.relname as dependent_view,
  source_table.relname as source_table
FROM pg_depend 
JOIN pg_rewrite ON pg_depend.objid = pg_rewrite.oid 
JOIN pg_class as dependent_view ON pg_rewrite.ev_class = dependent_view.oid 
JOIN pg_class as source_table ON pg_depend.refobjid = source_table.oid 
WHERE source_table.relname = 'review_calendar_unified';
```

---

### 8. Review Orphaned Tables

**Problem**: 6 tables exist but no code references found

**Tables & Actions**:

#### A. `applications`
```sql
-- Check if has data
SELECT COUNT(*) FROM applications;

-- If empty and not needed:
DROP TABLE IF EXISTS applications CASCADE;
```

#### B. `disc_mini_questions`
```sql
-- Check if used by functions (get_next_disc_questions)
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_definition LIKE '%disc_mini_questions%';

-- If not used:
DROP TABLE IF EXISTS disc_mini_questions CASCADE;
```

#### C. `employee_info`
```sql
-- Check if redundant with staff table
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'employee_info';

-- Compare with staff table
-- If redundant:
DROP TABLE IF EXISTS employee_info CASCADE;
```

#### D. `employes_retry_log`
```sql
-- Logging table - probably keep
-- But check if it's being populated
SELECT COUNT(*), MAX(created_at) FROM employes_retry_log;

-- If never used, can drop
```

#### E. `employes_sync_metrics`
```sql
-- Analytics table - check if populated
SELECT COUNT(*), MAX(created_at) FROM employes_sync_metrics;

-- If useful, keep; otherwise drop
```

#### F. `user_roles`
```sql
-- Check actual usage (found in backup files only)
SELECT COUNT(*) FROM user_roles;

-- If transitioning to new auth system:
-- Keep until migration complete
-- Otherwise drop if old system
```

---

### 9. Check `employes_timeline` vs `employes_timeline_v2`

**Problem**: Two timeline tables, only v2 used

**Action**:
```sql
-- Check if old one is still referenced
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_definition LIKE '%employes_timeline%'
AND routine_definition NOT LIKE '%employes_timeline_v2%';

-- If old version not used:
DROP MATERIALIZED VIEW IF EXISTS employes_timeline CASCADE;

-- Keep only v2
```

---

## 🟢 LOW PRIORITY (Future - 1-2 hours)

### 10. Document Prepared Tables

**Tables**: `processing_queue`, `performance_metrics`, `staff_goals`

**Action**: Add table comments
```sql
COMMENT ON TABLE processing_queue IS 
  'Background job processing system - Prepared for async operations. Not yet in use.';

COMMENT ON TABLE performance_metrics IS 
  'KPI tracking for staff performance - Prepared table. Populate via future feature.';

COMMENT ON TABLE staff_goals IS 
  'Staff goal setting and tracking - Part of reviews v11. Migration function available.';
```

---

### 11. Standardize Table Naming

**Current Prefixes**:
- `staff_*` (staff management)
- `employes_*` (Employes.nl integration)
- `ta_*` (talent acquisition - old?)
- `tk_*` (TeddyKids/GrowBuddy)
- No prefix (generic like `notifications`, `candidates`)

**Recommendation**: Document naming convention
```markdown
# Table Naming Convention

- `staff_*` - Staff lifecycle management
- `employes_*` - Employes.nl integration & sync
- `candidate_*` - Talent acquisition (new system)
- `tk_*` - TeddyKids-specific features (GrowBuddy, etc.)
- `review_*` - Performance review system
- Generic names for cross-cutting concerns
```

---

### 12. Add Indexes for Performance

**Missing Indexes** (based on common queries):

```sql
-- Frequently joined columns
CREATE INDEX IF NOT EXISTS idx_staff_reviews_staff_id 
  ON staff_reviews(staff_id);

CREATE INDEX IF NOT EXISTS idx_staff_notes_staff_id 
  ON staff_notes(staff_id);

CREATE INDEX IF NOT EXISTS idx_staff_certificates_staff_id 
  ON staff_certificates(staff_id);

CREATE INDEX IF NOT EXISTS idx_employes_changes_employee_id 
  ON employes_changes(employee_id);

CREATE INDEX IF NOT EXISTS idx_candidates_status 
  ON candidates(status);

-- Date-based queries
CREATE INDEX IF NOT EXISTS idx_staff_reviews_due_date 
  ON staff_reviews(due_date) 
  WHERE status != 'completed';

CREATE INDEX IF NOT EXISTS idx_employes_changes_change_date 
  ON employes_changes(change_date);
```

---

## Cleanup SQL Scripts

### Script 1: Safe Cleanup (No Data Loss)
```sql
-- cleanup-safe.sql
-- Drops only unused views and functions

BEGIN;

-- Drop unused views
DROP VIEW IF EXISTS review_calendar_unified CASCADE;
DROP VIEW IF EXISTS v_active_employees CASCADE;
DROP VIEW IF EXISTS v_incomplete_data_employees CASCADE;

-- Drop function duplicates (keep latest)
-- (Manual verification needed first)

-- Add helpful comments
COMMENT ON TABLE contracts_enriched_v2 IS 
  'Contract analytics view - CURRENTLY EMPTY - needs population or removal';

COMMIT;
```

### Script 2: Aggressive Cleanup (Verify First!)
```sql
-- cleanup-aggressive.sql
-- WARNING: Drops tables with no code references
-- VERIFY BACKUPS EXIST FIRST

BEGIN;

-- Drop old talent acquisition if superseded
DROP TABLE IF EXISTS ta_widget_analytics CASCADE;
DROP TABLE IF EXISTS ta_assessment_answers CASCADE;
DROP TABLE IF EXISTS ta_assessment_questions CASCADE;
DROP TABLE IF EXISTS ta_applicants CASCADE;

-- Drop orphaned tables (verify first!)
-- DROP TABLE IF EXISTS applications CASCADE;
-- DROP TABLE IF EXISTS employee_info CASCADE;

-- Drop dangerous function
DROP FUNCTION IF EXISTS execute_sql(TEXT);

COMMIT;
```

### Script 3: Create Missing Objects
```sql
-- create-missing.sql
-- Creates objects referenced in code but not found in schema

BEGIN;

-- Create staff_with_lms_data view
CREATE OR REPLACE VIEW staff_with_lms_data AS
SELECT
  s.*,
  COUNT(DISTINCT sr.id) as review_count,
  COUNT(DISTINCT sn.id) as notes_count,
  COUNT(DISTINCT sc.id) as certificates_count,
  MAX(sr.star_rating) as latest_rating
FROM staff s
LEFT JOIN staff_reviews sr ON s.id = sr.staff_id
LEFT JOIN staff_notes sn ON s.id = sn.staff_id
LEFT JOIN staff_certificates sc ON s.id = sc.staff_id
GROUP BY s.id;

-- Create overdue_reviews view
CREATE OR REPLACE VIEW overdue_reviews AS
SELECT
  sr.*,
  s.full_name,
  s.email,
  CURRENT_DATE - sr.due_date as days_overdue
FROM staff_reviews sr
JOIN staff s ON sr.staff_id = s.id
WHERE sr.status != 'completed'
AND sr.due_date < CURRENT_DATE
ORDER BY sr.due_date ASC;

-- Create staff_document_compliance view if needed
-- (Define based on requirements)

COMMIT;
```

---

## Validation Checklist

Before running cleanup scripts:

- [ ] **Backup database** (full dump)
- [ ] **Test in development** environment first
- [ ] **Verify no Edge Functions** use tables to be dropped
- [ ] **Check Supabase Realtime** subscriptions
- [ ] **Review RLS policies** on affected tables
- [ ] **Grep codebase** for table names one more time
- [ ] **Run explain plans** to verify index usage
- [ ] **Check scheduled functions** (cron jobs)
- [ ] **Verify materialized view** refresh schedules
- [ ] **Test application** after cleanup

---

## Monitoring After Cleanup

```sql
-- Monitor for errors after cleanup
SELECT 
  table_schema,
  table_name,
  pg_size_pretty(pg_total_relation_size(quote_ident(table_schema) || '.' || quote_ident(table_name))) as size
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY pg_total_relation_size(quote_ident(table_schema) || '.' || quote_ident(table_name)) DESC
LIMIT 20;

-- Check for missing table errors in logs
-- (Monitor application logs for 24-48 hours)
```

---

## Rollback Plan

If issues occur after cleanup:

```sql
-- Restore from backup
psql -U postgres -d your_database < backup_before_cleanup.sql

-- Or restore specific table
pg_restore -U postgres -d your_database -t table_name backup_before_cleanup.dump
```

---

## Estimated Time & Impact

| Task | Priority | Effort | Risk | Impact |
|------|----------|--------|------|--------|
| Fix contracts_enriched_v2 | CRITICAL | 1h | LOW | HIGH |
| Verify missing tables | CRITICAL | 1h | LOW | HIGH |
| Fix table reference typo | CRITICAL | 5min | NONE | MEDIUM |
| Consolidate functions | HIGH | 2h | MEDIUM | MEDIUM |
| Review ta_* tables | HIGH | 1h | LOW | LOW |
| Remove execute_sql | HIGH | 1h | MEDIUM | HIGH |
| Drop unused views | MEDIUM | 30min | LOW | LOW |
| Review orphaned tables | MEDIUM | 2h | MEDIUM | LOW |
| Check timeline versions | MEDIUM | 30min | LOW | LOW |
| Document prepared tables | LOW | 30min | NONE | LOW |
| Standardize naming | LOW | 1h | NONE | LOW |
| Add indexes | LOW | 1h | LOW | MEDIUM |

**Total Estimated Effort**: 11-12 hours over 1-2 weeks

---

**Next Steps**:
1. Review this document with team
2. Prioritize based on business needs
3. Create backup strategy
4. Execute CRITICAL items first
5. Monitor and validate
6. Proceed with HIGH/MEDIUM priorities

**Agents Used**: Database Schema Guardian + Dead Code Detector

