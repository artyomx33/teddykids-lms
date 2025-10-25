-- =====================================================
-- DATABASE INDEX RECOMMENDATIONS
-- =====================================================
-- Generated: October 25, 2025
-- Purpose: Performance optimization for mock data removal queries
-- Impact: Improves query performance for dashboard widgets
-- =====================================================

-- Index 1: staff_docs_status.is_compliant
-- Used by: AppiesInsight.tsx, StaffActionCards.tsx
-- Purpose: Fast filtering for non-compliant staff
-- Impact: Speeds up document compliance queries
CREATE INDEX IF NOT EXISTS idx_staff_docs_status_is_compliant 
ON staff_docs_status(is_compliant);

-- Index 2: staff_with_lms_data.is_intern (if it's a table, not a view)
-- Used by: InternWatchWidget.tsx, PredictiveInsights.tsx
-- Purpose: Fast filtering for intern identification
-- Impact: Speeds up intern data queries
-- Note: If staff_with_lms_data is a VIEW, index the underlying table column instead
CREATE INDEX IF NOT EXISTS idx_employee_info_is_intern 
ON employee_info(is_intern) 
WHERE is_intern = true;

-- Index 3: staff_docs_status.staff_id (for JOINs)
-- Used by: InternWatchWidget.tsx (JOIN optimization)
-- Purpose: Fast JOIN between staff_with_lms_data and staff_docs_status
-- Impact: Speeds up JOIN queries
-- Note: This may already exist from migration 20251006110000_complete_fresh_start.sql
CREATE INDEX IF NOT EXISTS idx_staff_docs_status_staff_id 
ON staff_docs_status(staff_id);

-- Composite Index: Intern + Compliance
-- Used by: InternWatchWidget.tsx optimized JOIN query
-- Purpose: Cover query for intern watch with document status
-- Impact: Maximum performance for combined intern + compliance queries
CREATE INDEX IF NOT EXISTS idx_employee_info_intern_with_docs 
ON employee_info(is_intern, staff_id) 
WHERE is_intern = true;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check which indexes exist
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('staff_docs_status', 'employee_info', 'staff_with_lms_data')
ORDER BY tablename, indexname;

-- Explain analyze for InternWatchWidget query (check performance)
EXPLAIN ANALYZE
SELECT 
  s.id,
  s.full_name,
  s.intern_year,
  s.is_intern,
  d.is_compliant
FROM staff_with_lms_data s
LEFT JOIN staff_docs_status d ON d.staff_id = s.id
WHERE s.is_intern = true;

-- =====================================================
-- NOTES
-- =====================================================

/**
 * Index Strategy:
 * 
 * 1. staff_docs_status.is_compliant
 *    - Used for filtering non-compliant staff
 *    - Small table scan vs full table scan
 * 
 * 2. employee_info.is_intern (underlying table for view)
 *    - Partial index (WHERE is_intern = true) saves space
 *    - Only indexes interns, not all staff
 * 
 * 3. staff_docs_status.staff_id
 *    - Required for efficient JOINs
 *    - Should already exist from migrations
 * 
 * 4. Composite index (is_intern, staff_id)
 *    - Covers the most common query pattern
 *    - Allows index-only scans (no table access needed)
 */

-- =====================================================
-- ROLLBACK
-- =====================================================

-- If indexes cause issues, drop them:
-- DROP INDEX IF EXISTS idx_staff_docs_status_is_compliant;
-- DROP INDEX IF EXISTS idx_employee_info_is_intern;
-- DROP INDEX IF EXISTS idx_employee_info_intern_with_docs;

