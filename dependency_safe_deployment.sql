-- DEPENDENCY-SAFE DATABASE DEPLOYMENT
-- This works around view dependency issues

-- Step 1: Create the document tracking table first
CREATE TABLE IF NOT EXISTS staff_required_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    file_path TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Step 2: Create indexes
CREATE INDEX IF NOT EXISTS idx_staff_required_documents_staff_id
ON staff_required_documents(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_required_documents_type
ON staff_required_documents(document_type);

-- Step 3: Check what the current view structure is
SELECT
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'staff_docs_missing_counts'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Step 4: Create a NEW view with the correct structure (different name to avoid conflicts)
CREATE OR REPLACE VIEW public.staff_document_compliance AS
SELECT
    -- This is the key field that StaffActionCards.tsx expects: any_missing
    (
        SELECT COUNT(DISTINCT s.id)
        FROM staff s
        WHERE EXISTS (
            SELECT 1
            FROM staff_required_documents srd
            WHERE srd.staff_id = s.id
            AND srd.is_required = true
            AND (srd.file_path IS NULL OR srd.file_path = '')
        )
    )::bigint as any_missing,

    -- Additional useful fields
    (
        SELECT COUNT(*)
        FROM staff_required_documents srd
        WHERE srd.is_required = true
        AND (srd.file_path IS NULL OR srd.file_path = '')
    )::bigint as missing_count,

    (SELECT COUNT(*) FROM staff)::bigint as total_staff,

    -- Compliance percentage
    CASE
        WHEN (SELECT COUNT(*) FROM staff) = 0 THEN 100
        ELSE (
            (SELECT COUNT(*) FROM staff) -
            (
                SELECT COUNT(DISTINCT s.id)
                FROM staff s
                WHERE EXISTS (
                    SELECT 1
                    FROM staff_required_documents srd
                    WHERE srd.staff_id = s.id
                    AND srd.is_required = true
                    AND (srd.file_path IS NULL OR srd.file_path = '')
                )
            )
        ) * 100 / (SELECT COUNT(*) FROM staff)
    END as compliance_percentage;

-- Step 5: Create detailed per-staff view
CREATE OR REPLACE VIEW public.staff_docs_status AS
SELECT
    s.id as staff_id,
    s.full_name,
    COALESCE(COUNT(srd.id) FILTER (WHERE srd.is_required = true), 0) as required_docs_total,
    COALESCE(COUNT(srd.id) FILTER (WHERE srd.is_required = true AND srd.file_path IS NOT NULL AND srd.file_path != ''), 0) as docs_uploaded,
    COALESCE(COUNT(srd.id) FILTER (WHERE srd.is_required = true AND (srd.file_path IS NULL OR srd.file_path = '')), 0) as docs_missing,
    ARRAY_AGG(srd.document_type) FILTER (WHERE srd.is_required = true AND (srd.file_path IS NULL OR srd.file_path = '')) as missing_doc_types
FROM staff s
LEFT JOIN staff_required_documents srd ON s.id = srd.staff_id
GROUP BY s.id, s.full_name;

-- Step 6: Seed required documents for all staff
INSERT INTO staff_required_documents (staff_id, document_type, is_required)
SELECT
    s.id,
    doc_type,
    true
FROM staff s
CROSS JOIN (VALUES
    ('contract'),
    ('id_copy'),
    ('diploma'),
    ('certificate_of_good_conduct'),
    ('bank_details')
) as required_docs(doc_type)
ON CONFLICT DO NOTHING;

-- Step 7: Grant permissions
GRANT SELECT ON public.staff_document_compliance TO authenticated;
GRANT SELECT ON public.staff_document_compliance TO anon;
GRANT SELECT ON public.staff_docs_status TO authenticated;
GRANT SELECT ON public.staff_docs_status TO anon;
GRANT ALL ON public.staff_required_documents TO authenticated;
GRANT SELECT ON public.staff_required_documents TO anon;

-- Step 8: Test the new view
SELECT
    'SUCCESS: New staff_document_compliance view created' as status,
    any_missing,
    missing_count,
    total_staff,
    compliance_percentage
FROM public.staff_document_compliance;

-- Step 9: Show current problematic view structure for reference
SELECT
    'Current staff_docs_missing_counts columns:' as info,
    array_agg(column_name ORDER BY ordinal_position) as columns
FROM information_schema.columns
WHERE table_name = 'staff_docs_missing_counts'
    AND table_schema = 'public';

-- Step 10: Alternative - Create a function that returns the data in the right format
CREATE OR REPLACE FUNCTION get_staff_document_summary()
RETURNS TABLE (
    any_missing bigint,
    missing_count bigint,
    total_staff bigint,
    compliance_percentage bigint
)
LANGUAGE SQL
STABLE
AS $$
    SELECT
        (
            SELECT COUNT(DISTINCT s.id)
            FROM staff s
            WHERE EXISTS (
                SELECT 1
                FROM staff_required_documents srd
                WHERE srd.staff_id = s.id
                AND srd.is_required = true
                AND (srd.file_path IS NULL OR srd.file_path = '')
            )
        )::bigint,
        (
            SELECT COUNT(*)
            FROM staff_required_documents srd
            WHERE srd.is_required = true
            AND (srd.file_path IS NULL OR srd.file_path = '')
        )::bigint,
        (SELECT COUNT(*) FROM staff)::bigint,
        CASE
            WHEN (SELECT COUNT(*) FROM staff) = 0 THEN 100
            ELSE (
                (SELECT COUNT(*) FROM staff) -
                (
                    SELECT COUNT(DISTINCT s.id)
                    FROM staff s
                    WHERE EXISTS (
                        SELECT 1
                        FROM staff_required_documents srd
                        WHERE srd.staff_id = s.id
                        AND srd.is_required = true
                        AND (srd.file_path IS NULL OR srd.file_path = '')
                    )
                )
            ) * 100 / (SELECT COUNT(*) FROM staff)
        END;
$$;

-- Test the function
SELECT * FROM get_staff_document_summary();