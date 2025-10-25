-- ============================================================================
-- Database Row Count Checker
-- Run this in Supabase SQL Editor to get actual data counts
-- ============================================================================

-- Get counts for all tables (excluding employes_raw_data)
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
  (SELECT count(*) FROM (SELECT * FROM information_schema.tables WHERE table_schema = schemaname AND table_name = tablename) x) as has_table
FROM pg_tables
WHERE schemaname = 'public'
AND tablename != 'employes_raw_data'
ORDER BY tablename;

-- Then run individual counts (copy results to update audit files)
SELECT 'applications' as table_name, COUNT(*) as row_count FROM applications
UNION ALL SELECT 'candidates', COUNT(*) FROM candidates
UNION ALL SELECT 'candidate_events', COUNT(*) FROM candidate_events
UNION ALL SELECT 'candidate_employes_export', COUNT(*) FROM candidate_employes_export
UNION ALL SELECT 'candidate_trial_reviews', COUNT(*) FROM candidate_trial_reviews
UNION ALL SELECT 'cao_salary_history', COUNT(*) FROM cao_salary_history
UNION ALL SELECT 'disc_mini_questions', COUNT(*) FROM disc_mini_questions
UNION ALL SELECT 'document_types', COUNT(*) FROM document_types
UNION ALL SELECT 'employee_info', COUNT(*) FROM employee_info
UNION ALL SELECT 'employes_changes', COUNT(*) FROM employes_changes
UNION ALL SELECT 'employes_current_state', COUNT(*) FROM employes_current_state
UNION ALL SELECT 'employes_retry_log', COUNT(*) FROM employes_retry_log
UNION ALL SELECT 'employes_sync_logs', COUNT(*) FROM employes_sync_logs
UNION ALL SELECT 'employes_sync_metrics', COUNT(*) FROM employes_sync_metrics
UNION ALL SELECT 'employes_sync_sessions', COUNT(*) FROM employes_sync_sessions
UNION ALL SELECT 'employes_timeline_v2', COUNT(*) FROM employes_timeline_v2
UNION ALL SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL SELECT 'performance_metrics', COUNT(*) FROM performance_metrics
UNION ALL SELECT 'processing_queue', COUNT(*) FROM processing_queue
UNION ALL SELECT 'review_schedules', COUNT(*) FROM review_schedules
UNION ALL SELECT 'review_templates', COUNT(*) FROM review_templates
UNION ALL SELECT 'staff_certificates', COUNT(*) FROM staff_certificates
UNION ALL SELECT 'staff_documents', COUNT(*) FROM staff_documents
UNION ALL SELECT 'staff_docs_status', COUNT(*) FROM staff_docs_status
UNION ALL SELECT 'staff_employment_history', COUNT(*) FROM staff_employment_history
UNION ALL SELECT 'staff_goals', COUNT(*) FROM staff_goals
UNION ALL SELECT 'staff_knowledge_completion', COUNT(*) FROM staff_knowledge_completion
UNION ALL SELECT 'staff_notes', COUNT(*) FROM staff_notes
UNION ALL SELECT 'staff_reviews', COUNT(*) FROM staff_reviews
UNION ALL SELECT 'ta_applicants', COUNT(*) FROM ta_applicants
UNION ALL SELECT 'ta_assessment_answers', COUNT(*) FROM ta_assessment_answers
UNION ALL SELECT 'ta_assessment_questions', COUNT(*) FROM ta_assessment_questions
UNION ALL SELECT 'ta_widget_analytics', COUNT(*) FROM ta_widget_analytics
UNION ALL SELECT 'tk_documents', COUNT(*) FROM tk_documents
UNION ALL SELECT 'tk_document_sections', COUNT(*) FROM tk_document_sections
UNION ALL SELECT 'user_roles', COUNT(*) FROM user_roles
ORDER BY table_name;

-- Check views
SELECT 'staff (VIEW)' as object_name, COUNT(*) as row_count FROM staff
UNION ALL SELECT 'staff_with_lms_data (VIEW)', COUNT(*) FROM staff_with_lms_data
UNION ALL SELECT 'overdue_reviews (VIEW)', COUNT(*) FROM overdue_reviews
UNION ALL SELECT 'staff_review_summary (VIEW)', COUNT(*) FROM staff_review_summary
UNION ALL SELECT 'performance_trends (VIEW)', COUNT(*) FROM performance_trends;

-- Check materialized views
SELECT 'contracts_enriched_v2 (MAT VIEW)' as object_name, COUNT(*) as row_count FROM contracts_enriched_v2;

-- Summary stats
SELECT 
  'TOTAL TABLES' as metric,
  COUNT(DISTINCT tablename) as value
FROM pg_tables
WHERE schemaname = 'public'
UNION ALL
SELECT 
  'TOTAL VIEWS',
  COUNT(DISTINCT viewname)
FROM pg_views
WHERE schemaname = 'public'
UNION ALL
SELECT 
  'TOTAL MAT VIEWS',
  COUNT(DISTINCT matviewname)
FROM pg_matviews
WHERE schemaname = 'public';

