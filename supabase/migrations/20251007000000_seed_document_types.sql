-- =====================================================
-- SEED DOCUMENT TYPES FOR DUTCH CHILDCARE
-- =====================================================
-- This migration populates the document_types table with
-- all required and optional documents for TeddyKids staff

-- Insert all document types for Dutch childcare compliance
INSERT INTO document_types (code, name, description, category, is_required, requires_expiry, default_expiry_months, sort_order) VALUES
  -- IDENTITY & BACKGROUND (Required)
  ('IDW', 'ID/Passport', 'Valid identification document', 'identity', true, true, 60, 1),
  ('BSN', 'BSN Registration', 'Burgerservicenummer proof', 'identity', true, false, NULL, 2),
  ('VOG', 'VOG (Certificate of Conduct)', 'Verklaring Omtrent Gedrag - Criminal background check', 'background_check', true, true, 36, 3),
  
  -- HEALTH & SAFETY (Required)
  ('EHBO', 'EHBO Certificate', 'First Aid certification (Eerste Hulp Bij Ongelukken)', 'health_safety', true, true, 12, 4),
  ('3F', 'Child First Aid (3F)', 'Pediatric first aid certification (Drie Fenomenen)', 'health_safety', true, true, 24, 5),
  ('HEALTH_DECL', 'Health Declaration', 'Health fitness declaration for childcare work', 'health_safety', true, true, 12, 6),
  ('CODE_RED', 'Code Red Training', 'Emergency response training certification', 'training', true, true, 24, 7),
  
  -- QUALIFICATIONS (Required)
  ('PRK', 'Basic Pedagogical Certificate', 'Pedagogisch Reken Kernpunten', 'qualification', true, false, NULL, 8),
  ('DIPLOMA_MBO', 'MBO Diploma', 'MBO level childcare qualification (Niveau 3 or 4)', 'qualification', true, false, NULL, 9),
  
  -- TRAINING (Required)
  ('ORIENTATION', 'Orientation Completion', 'Onboarding completion certificate', 'training', true, false, NULL, 10),
  
  -- QUALIFICATIONS (Optional)
  ('DIPLOMA_HBO', 'HBO Diploma', 'HBO level childcare/pedagogy qualification', 'qualification', false, false, NULL, 11),
  ('SPW3', 'SPW Level 3', 'Gespecialiseerd Pedagogisch Werk level 3', 'qualification', false, false, NULL, 12),
  
  -- WORK AUTHORIZATION (Conditional - Required for non-EU)
  ('WORK_PERMIT', 'Work Permit', 'Non-EU work authorization document', 'work_auth', false, true, 12, 13),
  
  -- HEALTH (Optional)
  ('VACCINATION', 'Vaccination Record', 'Immunization records relevant to childcare', 'health_safety', false, true, 12, 14),
  
  -- OTHER (Optional)
  ('OTHER', 'Other Document', 'Custom document type with user-defined label', 'other', false, false, NULL, 99)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  is_required = EXCLUDED.is_required,
  requires_expiry = EXCLUDED.requires_expiry,
  default_expiry_months = EXCLUDED.default_expiry_months,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- Add comments for clarity
COMMENT ON TABLE document_types IS 'Master list of all document types that can be tracked for TeddyKids staff. Includes required and optional documents for Dutch childcare compliance.';

-- Verify seeding
DO $$
DECLARE
  doc_count integer;
  required_count integer;
BEGIN
  SELECT COUNT(*) INTO doc_count FROM document_types;
  SELECT COUNT(*) INTO required_count FROM document_types WHERE is_required = true;
  
  RAISE NOTICE 'Document types seeded: % total (% required)', doc_count, required_count;
  
  IF doc_count < 15 THEN
    RAISE WARNING 'Expected at least 15 document types, found only %', doc_count;
  END IF;
END $$;

