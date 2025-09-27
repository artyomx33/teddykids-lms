-- ============================================
-- 🔍 DIAGNOSE KNOWLEDGE CENTER STATE (FIXED)
-- ============================================

-- Check if tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'tk_%'
ORDER BY table_name;

-- Check for any knowledge-related tables with different names
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND (table_name LIKE '%knowledge%' OR table_name LIKE '%document%')
ORDER BY table_name;

-- Show all tables to see what exists
SELECT 
  'ALL TABLES:' as info,
  table_name
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Result summary
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tk_documents' AND table_schema = 'public') 
    THEN '✅ tk_documents exists'
    ELSE '❌ tk_documents does NOT exist - tables need to be created'
  END as diagnosis;
