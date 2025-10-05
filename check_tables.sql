-- Check contracts table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'contracts'
ORDER BY ordinal_position;

-- Check staff table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'staff'
ORDER BY ordinal_position;

-- Check if tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_type = 'BASE TABLE' THEN 'Table'
        WHEN table_type = 'VIEW' THEN 'View'
        ELSE table_type
    END as type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('contracts', 'staff', 'staff_reviews', 'review_templates', 'contracts_enriched')
ORDER BY table_name;
