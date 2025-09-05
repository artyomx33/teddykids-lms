-- Create a view that counts missing documents by type
-- Returns a single row with counts for each document type
CREATE OR REPLACE VIEW public.staff_docs_missing_counts AS
SELECT
  COUNT(*) FILTER (WHERE vog_missing = true) AS vog_missing,
  COUNT(*) FILTER (WHERE pok_missing = true) AS pok_missing,
  COUNT(*) FILTER (WHERE id_card_missing = true) AS id_card_missing,
  COUNT(*) FILTER (WHERE bank_card_missing = true) AS bank_card_missing,
  COUNT(*) FILTER (WHERE prk_missing = true) AS prk_missing,
  COUNT(*) FILTER (WHERE employees_missing = true) AS employees_missing,
  COUNT(*) FILTER (WHERE portobase_missing = true) AS portobase_missing,
  COUNT(*) FILTER (WHERE missing_count > 0) AS any_missing,
  COUNT(*) FILTER (WHERE is_intern = true AND missing_count > 0) AS intern_missing
FROM public.staff_docs_status;

-- Add comment explaining purpose
COMMENT ON VIEW public.staff_docs_missing_counts IS 'Global counts of missing documents by type for filter UI badges';
