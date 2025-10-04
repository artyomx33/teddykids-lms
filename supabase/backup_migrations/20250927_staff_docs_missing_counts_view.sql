-- Migration: Create staff_docs_missing_counts view
-- Date: 2025-09-27
-- Purpose: Fix 400/406 errors caused by missing database view

-- Create the missing staff_docs_missing_counts view
CREATE OR REPLACE VIEW public.staff_docs_missing_counts AS
SELECT
  s.id as staff_id,
  s.full_name,
  COUNT(*) FILTER (WHERE d.id IS NULL OR d.file_path IS NULL) as missing_count,
  COUNT(expected_docs.doc_type) as total_expected,
  ARRAY_AGG(expected_docs.doc_type) FILTER (WHERE d.id IS NULL) as missing_doc_types
FROM staff s
CROSS JOIN (VALUES ('contract'), ('id_copy'), ('diploma'), ('certificate')) as expected_docs(doc_type)
LEFT JOIN documents d ON s.id = d.staff_id AND d.doc_type = expected_docs.doc_type
GROUP BY s.id, s.full_name;

-- Add comment for documentation
COMMENT ON VIEW public.staff_docs_missing_counts IS 'Shows missing document counts per staff member. Required by StaffActionCards and AppiesInsight components.';

-- Grant necessary permissions
GRANT SELECT ON public.staff_docs_missing_counts TO authenticated;
GRANT SELECT ON public.staff_docs_missing_counts TO anon;