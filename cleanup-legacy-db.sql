-- ============================================================================
-- TeddyKids LMS - Database Cleanup Script
-- ============================================================================
-- Generated: October 25, 2025
-- Purpose: Safe cleanup of unused database objects
-- Risk Level: LOW (no data loss, only unused objects)
-- 
-- IMPORTANT: Review each section before executing!
-- Recommended: Test in development environment first
-- Backup: Take full database backup before running
-- 
-- Agents: Database Schema Guardian + Dead Code Detector
-- ============================================================================

-- ============================================================================
-- SECTION 1: PRE-FLIGHT CHECKS
-- ============================================================================
-- Run these checks first to verify safe to proceed

-- Check 1: Verify we're on the correct database
SELECT current_database(), current_user;

-- Check 2: List all tables to ensure we recognize the schema
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check 3: Verify backup exists
-- MANUAL STEP: Confirm backup was created
-- pg_dump -U postgres -Fc teddykids_lms > backup_before_cleanup_$(date +%Y%m%d).dump

-- ============================================================================
-- SECTION 2: CREATE MISSING OBJECTS (CRITICAL)
-- ============================================================================
-- These objects are referenced in code but may not exist

BEGIN;

-- Create staff_with_lms_data view (used in Staff.tsx, Interns.tsx)
CREATE OR REPLACE VIEW staff_with_lms_data AS
SELECT
  s.*,
  COUNT(DISTINCT sr.id) as review_count,
  COUNT(DISTINCT sn.id) as notes_count,
  COUNT(DISTINCT sc.id) as certificates_count,
  MAX(sr.star_rating) as latest_rating,
  MAX(sr.review_date) as last_review_date
FROM staff s
LEFT JOIN staff_reviews sr ON s.id = sr.staff_id
LEFT JOIN staff_notes sn ON s.id = sn.staff_id
LEFT JOIN staff_certificates sc ON s.id = sc.staff_id
GROUP BY s.id;

COMMENT ON VIEW staff_with_lms_data IS 
  'Staff view with LMS data aggregations. Used in Staff.tsx and Interns.tsx';

-- Create overdue_reviews view (used in useReviews.ts)
CREATE OR REPLACE VIEW overdue_reviews AS
SELECT
  sr.*,
  s.full_name,
  s.email,
  s.location,
  CURRENT_DATE - sr.due_date as days_overdue
FROM staff_reviews sr
JOIN staff s ON sr.staff_id = s.id
WHERE sr.status != 'completed'
AND sr.due_date < CURRENT_DATE
ORDER BY sr.due_date ASC;

COMMENT ON VIEW overdue_reviews IS 
  'Reviews past their due date. Used in reviews system.';

-- Create staff_document_compliance view if needed
-- NOTE: Definition depends on requirements - placeholder below
-- DROP VIEW IF EXISTS staff_document_compliance;
-- CREATE OR REPLACE VIEW staff_document_compliance AS
-- SELECT
--   s.id as staff_id,
--   s.full_name,
--   COUNT(CASE WHEN sd.status = 'missing' THEN 1 END) as missing_count,
--   COUNT(sd.id) as total_documents
-- FROM staff s
-- LEFT JOIN staff_documents sd ON s.id = sd.staff_id
-- GROUP BY s.id, s.full_name;

COMMIT;

SELECT '✅ Section 2 Complete: Missing objects created' as status;

-- ============================================================================
-- SECTION 3: DROP UNUSED VIEWS (SAFE)
-- ============================================================================
-- These views are defined but never used in code

BEGIN;

-- Verify no dependencies first
DO $$
DECLARE
  view_count INTEGER;
BEGIN
  -- Check for dependent views
  SELECT COUNT(*) INTO view_count
  FROM pg_depend 
  JOIN pg_rewrite ON pg_depend.objid = pg_rewrite.oid 
  JOIN pg_class as dependent_view ON pg_rewrite.ev_class = dependent_view.oid 
  JOIN pg_class as source_table ON pg_depend.refobjid = source_table.oid 
  WHERE source_table.relname IN (
    'review_calendar_unified',
    'v_active_employees',
    'v_incomplete_data_employees',
    'review_calendar',
    'document_compliance_view',
    'data_quality_metrics'
  );
  
  IF view_count > 0 THEN
    RAISE EXCEPTION 'Found % dependent objects. Manual review required.', view_count;
  END IF;
END $$;

-- Drop unused views
DROP VIEW IF EXISTS review_calendar_unified CASCADE;
DROP VIEW IF EXISTS v_active_employees CASCADE;
DROP VIEW IF EXISTS v_incomplete_data_employees CASCADE;
DROP VIEW IF EXISTS review_calendar CASCADE;
DROP VIEW IF EXISTS document_compliance_view CASCADE;
DROP VIEW IF EXISTS data_quality_metrics CASCADE;

-- Note: NOT dropping employes_timeline materialized view yet
-- (verify it's superseded by employes_timeline_v2 first)

COMMIT;

SELECT '✅ Section 3 Complete: Unused views dropped' as status;

-- ============================================================================
-- SECTION 4: DROP OLD TALENT ACQUISITION TABLES (VERIFY FIRST!)
-- ============================================================================
-- WARNING: Only run after verifying data is migrated to 'candidates' table

-- SAFETY CHECK: Verify ta_* tables are empty or data is migrated
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

-- If all counts are 0 OR data confirmed migrated, uncomment below:

-- BEGIN;
-- 
-- DROP TABLE IF EXISTS ta_widget_analytics CASCADE;
-- DROP TABLE IF EXISTS ta_assessment_answers CASCADE;
-- DROP TABLE IF EXISTS ta_assessment_questions CASCADE;
-- DROP TABLE IF EXISTS ta_applicants CASCADE;
-- 
-- COMMIT;
-- 
-- SELECT '✅ Section 4 Complete: Old TA tables dropped' as status;

SELECT '⚠️  Section 4 SKIPPED: Verify data migration first, then uncomment' as status;

-- ============================================================================
-- SECTION 5: DROP DANGEROUS FUNCTION (SECURITY)
-- ============================================================================
-- execute_sql function allows SQL injection - must be removed

-- PREREQUISITE: Update src/lib/staff.ts to remove execute_sql usage first!
-- Then uncomment below:

-- BEGIN;
-- 
-- DROP FUNCTION IF EXISTS execute_sql(TEXT);
-- 
-- COMMIT;
-- 
-- SELECT '✅ Section 5 Complete: execute_sql function dropped' as status;

SELECT '⚠️  Section 5 SKIPPED: Update code first to remove execute_sql usage' as status;

-- ============================================================================
-- SECTION 6: CONSOLIDATE FUNCTION VERSIONS (ADVANCED)
-- ============================================================================
-- Multiple versions of same functions exist - keep only latest

-- Check current versions
SELECT 
  routine_name,
  routine_type,
  external_language
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN (
  'generate_timeline_v2',
  'get_current_salary',
  'get_current_salary_v2'
)
ORDER BY routine_name;

-- Manual review needed to determine which versions to keep
-- Then create consolidation script

SELECT '⚠️  Section 6 SKIPPED: Manual review required for function consolidation' as status;

-- ============================================================================
-- SECTION 7: ADD HELPFUL TABLE COMMENTS
-- ============================================================================
-- Document table purposes for future developers

BEGIN;

COMMENT ON TABLE contracts_enriched_v2 IS 
  'Contract analytics materialized view. CURRENTLY EMPTY - needs population or removal decision.';

COMMENT ON TABLE processing_queue IS 
  'Background job processing system. Prepared for async operations. Not yet in use.';

COMMENT ON TABLE performance_metrics IS 
  'KPI tracking for staff performance. Prepared table. Populate via future feature.';

COMMENT ON TABLE staff_goals IS 
  'Staff goal setting and tracking. Part of reviews v11. Migration function available: migrate_goals_to_table()';

COMMENT ON TABLE candidates IS 
  'New talent acquisition system. Replaces old ta_* tables.';

COMMENT ON TABLE employes_raw_data IS 
  'Source data from Employes.nl API. Base for staff view.';

COMMENT ON TABLE employes_changes IS 
  'Temporal tracking of employment data changes. Used for timeline generation.';

COMMENT ON TABLE employes_current_state IS 
  'Snapshot of current employment state. Updated by triggers.';

COMMENT ON VIEW staff IS 
  'Primary staff view. Computed from employes_raw_data with LMS enhancements.';

COMMIT;

SELECT '✅ Section 7 Complete: Table comments added' as status;

-- ============================================================================
-- SECTION 8: ADD PERFORMANCE INDEXES (OPTIONAL)
-- ============================================================================
-- Add indexes for frequently queried columns

BEGIN;

-- Indexes for foreign keys (if not exist)
CREATE INDEX IF NOT EXISTS idx_staff_reviews_staff_id 
  ON staff_reviews(staff_id);

CREATE INDEX IF NOT EXISTS idx_staff_notes_staff_id 
  ON staff_notes(staff_id);

CREATE INDEX IF NOT EXISTS idx_staff_certificates_staff_id 
  ON staff_certificates(staff_id);

CREATE INDEX IF NOT EXISTS idx_employes_changes_employee_id 
  ON employes_changes(employee_id);

CREATE INDEX IF NOT EXISTS idx_candidates_status 
  ON candidates(status) 
  WHERE status IS NOT NULL;

-- Indexes for date-based queries
CREATE INDEX IF NOT EXISTS idx_staff_reviews_due_date 
  ON staff_reviews(due_date) 
  WHERE status != 'completed';

CREATE INDEX IF NOT EXISTS idx_employes_changes_change_date 
  ON employes_changes(change_date);

CREATE INDEX IF NOT EXISTS idx_candidates_created_at 
  ON candidates(created_at DESC);

COMMIT;

SELECT '✅ Section 8 Complete: Performance indexes added' as status;

-- ============================================================================
-- SECTION 9: VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify cleanup was successful

-- Check 1: List all views
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_type = 'VIEW'
ORDER BY table_name;

-- Check 2: List all materialized views
SELECT 
  schemaname,
  matviewname,
  hasindexes,
  ispopulated
FROM pg_matviews
WHERE schemaname = 'public';

-- Check 3: List all functions
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Check 4: Table sizes
SELECT 
  table_name,
  pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as size,
  pg_total_relation_size(quote_ident(table_name)) as size_bytes
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC
LIMIT 20;

-- Check 5: Orphaned tables (no FK references)
SELECT 
  t.table_name
FROM information_schema.tables t
LEFT JOIN information_schema.table_constraints tc 
  ON t.table_name = tc.table_name 
  AND tc.constraint_type = 'FOREIGN KEY'
WHERE t.table_schema = 'public'
AND t.table_type = 'BASE TABLE'
GROUP BY t.table_name
HAVING COUNT(tc.constraint_name) = 0
ORDER BY t.table_name;

-- ============================================================================
-- ROLLBACK PLAN
-- ============================================================================
-- If something goes wrong, restore from backup:
--
-- psql -U postgres -d teddykids_lms < backup_before_cleanup_YYYYMMDD.dump
--
-- Or restore specific objects:
-- pg_restore -U postgres -d teddykids_lms -t table_name backup.dump
--
-- ============================================================================

-- ============================================================================
-- EXECUTION SUMMARY
-- ============================================================================

SELECT '
╔════════════════════════════════════════════════════════════════╗
║              Database Cleanup Script Complete                  ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  ✅ Section 1: Pre-flight checks completed                    ║
║  ✅ Section 2: Missing objects created                         ║
║  ✅ Section 3: Unused views dropped                            ║
║  ⏭️  Section 4: TA tables (manual verification needed)         ║
║  ⏭️  Section 5: execute_sql (code update needed first)         ║
║  ⏭️  Section 6: Function consolidation (manual review needed)  ║
║  ✅ Section 7: Table comments added                            ║
║  ✅ Section 8: Performance indexes added                       ║
║  ✅ Section 9: Verification queries ready                      ║
║                                                                ║
║  Next Steps:                                                   ║
║  1. Review verification query results                          ║
║  2. Test application functionality                             ║
║  3. Monitor logs for 24-48 hours                               ║
║  4. Complete manual sections 4-6 when ready                    ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
' as summary;

-- ============================================================================
-- END OF SCRIPT
-- ============================================================================

