-- ============================================
-- 🔍 DIAGNOSE KNOWLEDGE CENTER STATE
-- ============================================

-- Check if tables exist
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'tk_%'
ORDER BY table_name;

-- If tk_documents exists, show what's in it
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tk_documents' AND table_schema = 'public') THEN
    RAISE NOTICE '=== EXISTING DOCUMENTS ===';
    PERFORM title, slug, required FROM tk_documents ORDER BY created_at;
  ELSE
    RAISE NOTICE '❌ tk_documents table does not exist';
  END IF;
END $$;

-- Show current documents if table exists
SELECT 
  'CURRENT DOCUMENTS:' as info,
  title,
  slug,
  required,
  created_at
FROM tk_documents 
ORDER BY created_at
LIMIT 20;

-- Show sections count if table exists  
SELECT 
  'SECTIONS COUNT:' as info,
  d.title,
  COUNT(s.id) as sections
FROM tk_documents d
LEFT JOIN tk_document_sections s ON s.doc_id = d.id
GROUP BY d.id, d.title
ORDER BY d.title;

-- Show table constraints
SELECT 
  constraint_name,
  table_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
AND table_name LIKE 'tk_%'
ORDER BY table_name, constraint_name;
