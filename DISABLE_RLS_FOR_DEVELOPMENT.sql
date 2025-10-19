-- =====================================================
-- DISABLE RLS FOR DEVELOPMENT MODE
-- =====================================================
-- Run this to stop RLS from blocking development work
-- We'll add proper RLS systematically before production
-- =====================================================

BEGIN;

-- 1. Disable RLS on all main tables
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

-- 2. Drop existing policies (optional, but cleaner)
-- This prevents confusion when we re-enable RLS later
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      pol.policyname, pol.schemaname, pol.tablename);
        RAISE NOTICE 'Dropped policy: %.% - %', pol.schemaname, pol.tablename, pol.policyname;
    END LOOP;
END $$;

COMMIT;

-- Verification
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN (
        'employes_timeline_v2',
        'employee_info',
        'staff_reviews',
        'review_templates',
        'staff_documents',
        'document_types',
        'locations',
        'employes_raw_data'
    )
ORDER BY tablename;

DO $$ BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ RLS DISABLED FOR DEVELOPMENT';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Benefits:';
    RAISE NOTICE '   - No more "row-level security policy" errors';
    RAISE NOTICE '   - Faster development';
    RAISE NOTICE '   - Focus on features, not policies';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Next Steps:';
    RAISE NOTICE '   - Build features without RLS friction';
    RAISE NOTICE '   - Before production: run ENABLE_RLS_FOR_PRODUCTION.sql';
    RAISE NOTICE '   - That script will add proper policies systematically';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Development Philosophy:';
    RAISE NOTICE '   - Simple now, secure later';
    RAISE NOTICE '   - No premature optimization';
    RAISE NOTICE '   - Systematic security before launch';
END $$;

