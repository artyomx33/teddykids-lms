-- =====================================================
-- ENABLE RLS FOR PRODUCTION (RUN BEFORE LAUNCH)
-- =====================================================
-- This script systematically enables RLS with proper policies
-- Run this when you're ready to go live
-- =====================================================

BEGIN;

-- =====================================================
-- STRATEGY: Authenticated users can do everything
-- =====================================================
-- For TeddyKids internal tool, this is sufficient:
-- - Only authenticated staff can access
-- - No public access
-- - All authenticated users have equal permissions
-- 
-- Before scaling, you can add more granular policies

-- =====================================================
-- 1. ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE employes_timeline_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE disc_mini_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employes_raw_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE employes_changes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. CREATE PERMISSIVE POLICIES (authenticated users)
-- =====================================================

-- Timeline Events
CREATE POLICY "Authenticated users full access to timeline"
ON employes_timeline_v2
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Employee Info (LMS data)
CREATE POLICY "Authenticated users full access to employee_info"
ON employee_info
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Reviews
CREATE POLICY "Authenticated users full access to reviews"
ON staff_reviews
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Review Templates
CREATE POLICY "Authenticated users full access to review_templates"
ON review_templates
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Review Schedules
CREATE POLICY "Authenticated users full access to review_schedules"
ON review_schedules
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Staff Goals
CREATE POLICY "Authenticated users full access to staff_goals"
ON staff_goals
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- DISC Questions
CREATE POLICY "Authenticated users full access to disc_questions"
ON disc_mini_questions
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Documents
CREATE POLICY "Authenticated users full access to staff_documents"
ON staff_documents
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Document Types
CREATE POLICY "Authenticated users full access to document_types"
ON document_types
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Locations
CREATE POLICY "Authenticated users full access to locations"
ON locations
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Raw Data (read-only for most)
CREATE POLICY "Authenticated users read access to raw_data"
ON employes_raw_data
FOR SELECT
TO authenticated
USING (true);

-- Changes (read-only for most)
CREATE POLICY "Authenticated users read access to changes"
ON employes_changes
FOR SELECT
TO authenticated
USING (true);

COMMIT;

-- =====================================================
-- VERIFICATION
-- =====================================================

SELECT 
    tablename,
    rowsecurity as rls_enabled,
    COUNT(*) FILTER (WHERE cmd = 'ALL') as all_policies,
    COUNT(*) FILTER (WHERE cmd = 'SELECT') as select_policies,
    COUNT(*) FILTER (WHERE cmd = 'INSERT') as insert_policies,
    COUNT(*) FILTER (WHERE cmd = 'UPDATE') as update_policies
FROM pg_tables t
LEFT JOIN pg_policies p ON p.tablename = t.tablename AND p.schemaname = t.schemaname
WHERE t.schemaname = 'public'
    AND t.tablename IN (
        'employes_timeline_v2',
        'employee_info',
        'staff_reviews',
        'review_templates',
        'staff_documents',
        'document_types'
    )
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.tablename;

DO $$ BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ RLS ENABLED FOR PRODUCTION';
    RAISE NOTICE '';
    RAISE NOTICE '🔒 Security Strategy:';
    RAISE NOTICE '   - All authenticated users have full access';
    RAISE NOTICE '   - Public users have NO access';
    RAISE NOTICE '   - Simple and sufficient for internal tool';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 What This Protects:';
    RAISE NOTICE '   - Prevents public access to data';
    RAISE NOTICE '   - Ensures only logged-in staff can access';
    RAISE NOTICE '   - Meets Supabase security requirements';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Future Enhancements (if needed):';
    RAISE NOTICE '   - Add role-based policies (admin vs staff)';
    RAISE NOTICE '   - Add location-based policies';
    RAISE NOTICE '   - Add department-based access';
END $$;

