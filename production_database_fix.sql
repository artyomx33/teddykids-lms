-- PRODUCTION-READY DATABASE SOLUTION
-- Based on comprehensive audit of actual component usage

-- First, let's create a proper document tracking system
-- Create staff_required_documents table if it doesn't exist
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

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_staff_required_documents_staff_id
ON staff_required_documents(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_required_documents_type
ON staff_required_documents(document_type);

-- Create the CORRECT staff_docs_missing_counts view
-- This returns a SINGLE ROW with aggregated data (as components expect)
CREATE OR REPLACE VIEW public.staff_docs_missing_counts AS
SELECT
    -- Count staff who are missing ANY required documents
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

    -- Total count of missing document instances
    (
        SELECT COUNT(*)
        FROM staff_required_documents srd
        WHERE srd.is_required = true
        AND (srd.file_path IS NULL OR srd.file_path = '')
    )::bigint as missing_count,

    -- Total staff count for context
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

-- Alternative view for per-staff document status (for detailed views)
CREATE OR REPLACE VIEW public.staff_docs_status AS
SELECT
    s.id as staff_id,
    s.full_name,
    COUNT(srd.id) FILTER (WHERE srd.is_required = true) as required_docs_total,
    COUNT(srd.id) FILTER (WHERE srd.is_required = true AND srd.file_path IS NOT NULL AND srd.file_path != '') as docs_uploaded,
    COUNT(srd.id) FILTER (WHERE srd.is_required = true AND (srd.file_path IS NULL OR srd.file_path = '')) as docs_missing,
    ARRAY_AGG(srd.document_type) FILTER (WHERE srd.is_required = true AND (srd.file_path IS NULL OR srd.file_path = '')) as missing_doc_types
FROM staff s
LEFT JOIN staff_required_documents srd ON s.id = srd.staff_id
GROUP BY s.id, s.full_name;

-- Seed some default required document types for all staff
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

-- Set permissions
GRANT SELECT ON public.staff_docs_missing_counts TO authenticated;
GRANT SELECT ON public.staff_docs_missing_counts TO anon;
GRANT SELECT ON public.staff_docs_status TO authenticated;
GRANT SELECT ON public.staff_docs_status TO anon;

GRANT ALL ON public.staff_required_documents TO authenticated;
GRANT SELECT ON public.staff_required_documents TO anon;

-- Test the views
SELECT 'staff_docs_missing_counts test:' as test_name, * FROM public.staff_docs_missing_counts;
SELECT 'staff_docs_status sample:' as test_name, * FROM public.staff_docs_status LIMIT 3;