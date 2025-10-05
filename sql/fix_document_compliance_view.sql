-- Fix missing staff_document_compliance view
-- This view is required by the DocumentStatusPanel component

CREATE OR REPLACE VIEW public.staff_document_compliance AS
SELECT
  s.id as staff_id,
  s.full_name,
  COUNT(CASE WHEN sc.id IS NOT NULL THEN 1 END) as completed_docs,
  7 as total_required,
  (7 - COUNT(CASE WHEN sc.id IS NOT NULL THEN 1 END)) as missing_count,
  s.created_at
FROM public.staff s
LEFT JOIN public.staff_certificates sc ON s.id = sc.staff_id
GROUP BY s.id, s.full_name, s.created_at;

-- Grant permissions
GRANT SELECT ON public.staff_document_compliance TO authenticated;
GRANT SELECT ON public.staff_document_compliance TO anon;

-- Add comment
COMMENT ON VIEW public.staff_document_compliance IS 'Document compliance tracking for staff members';