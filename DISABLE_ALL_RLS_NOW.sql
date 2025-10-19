-- =====================================================
-- DISABLE ALL RLS FOR DEVELOPMENT
-- Run this NOW to stop RLS blocking everything
-- =====================================================

-- Disable RLS on ALL tables
ALTER TABLE IF EXISTS employes_timeline_v2 DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS employee_info DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS staff_reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS review_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS review_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS staff_goals DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS disc_mini_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS staff_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS document_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS employes_raw_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS employes_changes DISABLE ROW LEVEL SECURITY;

-- Success!
SELECT '✅ RLS DISABLED - No more security blocking during development!' as result;

