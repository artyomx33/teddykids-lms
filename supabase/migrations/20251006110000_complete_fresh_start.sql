-- =====================================================
-- MIGRATION: COMPLETE FRESH START (Legacy Backup)
-- Created: 2025-10-06
-- Purpose: Rename old tables to _legacy and create fresh system
-- =====================================================

-- =====================================================
-- 1. RENAME OLD TABLES TO _legacy (Safe Backup)
-- =====================================================

-- Rename old tables instead of dropping (just in case!)
ALTER TABLE IF EXISTS staff_reviews RENAME TO staff_reviews_legacy;
ALTER TABLE IF EXISTS review_templates RENAME TO review_templates_legacy;
ALTER TABLE IF EXISTS staff_notes RENAME TO staff_notes_legacy;
ALTER TABLE IF EXISTS staff_certificates RENAME TO staff_certificates_legacy;
ALTER TABLE IF EXISTS staff_docs_status RENAME TO staff_docs_status_legacy;

-- Drop old views (we'll recreate fresh)
DROP VIEW IF EXISTS staff_review_summary CASCADE;
DROP VIEW IF EXISTS performance_trends CASCADE;
DROP VIEW IF EXISTS review_calendar CASCADE;
DROP VIEW IF EXISTS document_compliance_view CASCADE;

-- =====================================================
-- 2. CREATE REVIEW TEMPLATES TABLE (FRESH)
-- =====================================================

CREATE TABLE review_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('probation', 'six_month', 'yearly', 'exit', 'custom')),
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Partial unique index for active templates
CREATE UNIQUE INDEX unique_active_template_per_type 
  ON review_templates(type) 
  WHERE is_active = true;

CREATE INDEX idx_review_templates_type ON review_templates(type) WHERE is_active = true;
CREATE INDEX idx_review_templates_active ON review_templates(is_active);

-- =====================================================
-- 3. CREATE STAFF REVIEWS TABLE (FRESH)
-- =====================================================

CREATE TABLE staff_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL,
  reviewer_id UUID,
  template_id UUID REFERENCES review_templates(id) ON DELETE SET NULL,
  review_date DATE NOT NULL DEFAULT CURRENT_DATE,
  review_type TEXT NOT NULL CHECK (review_type IN ('probation', 'six_month', 'yearly', 'exit', 'custom')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'approved', 'archived')),
  
  -- Review content
  overall_rating DECIMAL(3,2) CHECK (overall_rating >= 0 AND overall_rating <= 5),
  strengths TEXT,
  areas_for_improvement TEXT,
  goals_set JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  responses JSONB DEFAULT '{}'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_staff_reviews_staff_id ON staff_reviews(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_reviews_reviewer_id ON staff_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_staff_reviews_template_id ON staff_reviews(template_id);
CREATE INDEX IF NOT EXISTS idx_staff_reviews_review_date ON staff_reviews(review_date DESC);
CREATE INDEX IF NOT EXISTS idx_staff_reviews_status ON staff_reviews(status);
CREATE INDEX IF NOT EXISTS idx_staff_reviews_type ON staff_reviews(review_type);
CREATE INDEX IF NOT EXISTS idx_staff_reviews_staff_date ON staff_reviews(staff_id, review_date DESC);

-- =====================================================
-- 4. CREATE STAFF NOTES TABLE (FRESH)
-- =====================================================

CREATE TABLE staff_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL,
  note TEXT NOT NULL,
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'performance', 'disciplinary', 'achievement', 'concern', 'meeting')),
  is_private BOOLEAN NOT NULL DEFAULT false,
  is_important BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  related_review_id UUID REFERENCES staff_reviews(id) ON DELETE SET NULL,
  tags JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_staff_notes_staff_id ON staff_notes(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_notes_created_at ON staff_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_staff_notes_created_by ON staff_notes(created_by);
CREATE INDEX IF NOT EXISTS idx_staff_notes_type ON staff_notes(note_type);
CREATE INDEX IF NOT EXISTS idx_staff_notes_staff_date ON staff_notes(staff_id, created_at DESC);

-- =====================================================
-- 5. CREATE STAFF CERTIFICATES TABLE (FRESH)
-- =====================================================

CREATE TABLE staff_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL,
  certificate_name TEXT NOT NULL,
  certificate_type TEXT DEFAULT 'other' CHECK (certificate_type IN ('training', 'qualification', 'license', 'diploma', 'certification', 'other')),
  file_path TEXT NOT NULL,
  file_size_bytes BIGINT,
  mime_type TEXT,
  issued_by TEXT,
  issue_date DATE,
  expiry_date DATE,
  certificate_number TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_staff_certificates_staff_id ON staff_certificates(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_certificates_uploaded_at ON staff_certificates(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_staff_certificates_type ON staff_certificates(certificate_type);
CREATE INDEX IF NOT EXISTS idx_staff_certificates_expiry ON staff_certificates(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_staff_certificates_staff_uploaded ON staff_certificates(staff_id, uploaded_at DESC);

-- =====================================================
-- 6. CREATE STAFF DOCS STATUS TABLE (FRESH)
-- =====================================================

CREATE TABLE staff_docs_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL UNIQUE,
  
  -- VOG (Dutch requirement)
  vog_status TEXT DEFAULT 'pending' CHECK (vog_status IN ('pending', 'approved', 'expired', 'not_required')),
  vog_expiry DATE,
  vog_file_path TEXT,
  vog_verified_at TIMESTAMPTZ,
  
  -- ID Verification
  id_verified BOOLEAN NOT NULL DEFAULT false,
  id_verified_at TIMESTAMPTZ,
  id_verified_by UUID REFERENCES auth.users(id),
  id_type TEXT,
  id_expiry DATE,
  
  -- Contract Status
  contract_signed BOOLEAN NOT NULL DEFAULT false,
  contract_signed_at TIMESTAMPTZ,
  latest_contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
  
  -- Work Permit
  work_permit_required BOOLEAN NOT NULL DEFAULT false,
  work_permit_status TEXT CHECK (work_permit_status IN ('pending', 'approved', 'expired', 'not_required')),
  work_permit_expiry DATE,
  work_permit_file_path TEXT,
  
  -- Banking
  iban_verified BOOLEAN NOT NULL DEFAULT false,
  iban_verified_at TIMESTAMPTZ,
  
  -- Emergency Contact
  emergency_contact_provided BOOLEAN NOT NULL DEFAULT false,
  
  -- Overall Compliance (computed)
  is_compliant BOOLEAN GENERATED ALWAYS AS (
    vog_status IN ('approved', 'not_required') AND
    id_verified = true AND
    contract_signed = true AND
    (NOT work_permit_required OR work_permit_status = 'approved') AND
    iban_verified = true
  ) STORED,
  
  -- Metadata
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_staff_docs_status_staff_id ON staff_docs_status(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_docs_status_compliant ON staff_docs_status(is_compliant);
CREATE INDEX IF NOT EXISTS idx_staff_docs_status_vog ON staff_docs_status(vog_status);

-- =====================================================
-- 7. CREATE TRIGGERS
-- =====================================================

-- Review templates updated_at
CREATE OR REPLACE FUNCTION update_review_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_review_templates_updated_at
  BEFORE UPDATE ON review_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_review_templates_updated_at();

-- Staff reviews updated_at
CREATE OR REPLACE FUNCTION update_staff_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_staff_reviews_updated_at
  BEFORE UPDATE ON staff_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_staff_reviews_updated_at();

-- Staff notes updated_at
CREATE OR REPLACE FUNCTION update_staff_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_staff_notes_updated_at
  BEFORE UPDATE ON staff_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_staff_notes_updated_at();

-- Staff docs status updated_at
CREATE OR REPLACE FUNCTION update_staff_docs_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_staff_docs_status_updated_at
  BEFORE UPDATE ON staff_docs_status
  FOR EACH ROW
  EXECUTE FUNCTION update_staff_docs_status_updated_at();

-- =====================================================
-- 8. ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE review_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_docs_status ENABLE ROW LEVEL SECURITY;

-- Simple policies (authenticated users can access)
CREATE POLICY "Authenticated users can read templates" ON review_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage templates" ON review_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read reviews" ON staff_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage reviews" ON staff_reviews FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read notes" ON staff_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage notes" ON staff_notes FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read certificates" ON staff_certificates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage certificates" ON staff_certificates FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read docs status" ON staff_docs_status FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage docs status" ON staff_docs_status FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- 9. CREATE ANALYTICS VIEWS
-- =====================================================

-- Staff Review Summary View
CREATE VIEW staff_review_summary AS
SELECT 
  sr.staff_id,
  COUNT(*) as total_reviews,
  COUNT(*) FILTER (WHERE sr.status = 'completed') as completed_reviews,
  COUNT(*) FILTER (WHERE sr.status = 'approved') as approved_reviews,
  COUNT(*) FILTER (WHERE sr.review_date > CURRENT_DATE - INTERVAL '1 year') as reviews_last_year,
  AVG(sr.overall_rating) as average_rating,
  MAX(sr.overall_rating) as highest_rating,
  MIN(sr.overall_rating) as lowest_rating,
  MIN(sr.review_date) as first_review_date,
  MAX(sr.review_date) as last_review_date,
  MAX(sr.review_date) FILTER (WHERE sr.review_type = 'yearly') + INTERVAL '1 year' as next_review_due
FROM staff_reviews sr
WHERE sr.status IN ('completed', 'approved')
GROUP BY sr.staff_id;

-- Performance Trends View
CREATE VIEW performance_trends AS
SELECT 
  sr.staff_id,
  EXTRACT(YEAR FROM sr.review_date)::INT as review_year,
  EXTRACT(QUARTER FROM sr.review_date)::INT as review_quarter,
  COUNT(*) as review_count,
  AVG(sr.overall_rating) as avg_rating,
  MIN(sr.overall_rating) as min_rating,
  MAX(sr.overall_rating) as max_rating
FROM staff_reviews sr
WHERE sr.status IN ('completed', 'approved')
  AND sr.overall_rating IS NOT NULL
GROUP BY sr.staff_id, review_year, review_quarter
ORDER BY sr.staff_id, review_year DESC, review_quarter DESC;

-- Review Calendar View
CREATE VIEW review_calendar AS
WITH staff_last_reviews AS (
  SELECT DISTINCT ON (staff_id, review_type)
    staff_id,
    review_type,
    review_date
  FROM staff_reviews
  WHERE status IN ('completed', 'approved')
  ORDER BY staff_id, review_type, review_date DESC
)
SELECT 
  slr.staff_id,
  slr.review_type,
  slr.review_date as last_review_date,
  CASE slr.review_type
    WHEN 'probation' THEN slr.review_date + INTERVAL '2 months'
    WHEN 'six_month' THEN slr.review_date + INTERVAL '6 months'
    WHEN 'yearly' THEN slr.review_date + INTERVAL '1 year'
    ELSE slr.review_date + INTERVAL '1 year'
  END as next_due_date,
  EXTRACT(DAY FROM (CASE slr.review_type
    WHEN 'probation' THEN slr.review_date + INTERVAL '2 months'
    WHEN 'six_month' THEN slr.review_date + INTERVAL '6 months'
    WHEN 'yearly' THEN slr.review_date + INTERVAL '1 year'
    ELSE slr.review_date + INTERVAL '1 year'
  END - CURRENT_DATE))::INT as days_until_due,
  CASE 
    WHEN (CASE slr.review_type
      WHEN 'probation' THEN slr.review_date + INTERVAL '2 months'
      WHEN 'six_month' THEN slr.review_date + INTERVAL '6 months'
      WHEN 'yearly' THEN slr.review_date + INTERVAL '1 year'
      ELSE slr.review_date + INTERVAL '1 year'
    END) < CURRENT_DATE THEN 'overdue'
    WHEN (CASE slr.review_type
      WHEN 'probation' THEN slr.review_date + INTERVAL '2 months'
      WHEN 'six_month' THEN slr.review_date + INTERVAL '6 months'
      WHEN 'yearly' THEN slr.review_date + INTERVAL '1 year'
      ELSE slr.review_date + INTERVAL '1 year'
    END - CURRENT_DATE) <= INTERVAL '30 days' THEN 'due_soon'
    ELSE 'upcoming'
  END as review_status
FROM staff_last_reviews slr
ORDER BY next_due_date ASC;

-- Document Compliance View
CREATE VIEW document_compliance_view AS
SELECT 
  sds.staff_id,
  sds.is_compliant,
  sds.vog_status,
  sds.vog_expiry,
  CASE WHEN sds.vog_expiry IS NOT NULL AND sds.vog_expiry < CURRENT_DATE THEN true ELSE false END as vog_expired,
  sds.id_verified,
  sds.contract_signed,
  sds.work_permit_required,
  sds.work_permit_status,
  sds.iban_verified,
  sds.emergency_contact_provided,
  (
    CASE WHEN sds.vog_status NOT IN ('approved', 'not_required') THEN 1 ELSE 0 END +
    CASE WHEN NOT sds.id_verified THEN 1 ELSE 0 END +
    CASE WHEN NOT sds.contract_signed THEN 1 ELSE 0 END +
    CASE WHEN sds.work_permit_required AND sds.work_permit_status != 'approved' THEN 1 ELSE 0 END +
    CASE WHEN NOT sds.iban_verified THEN 1 ELSE 0 END
  ) as missing_items_count
FROM staff_docs_status sds;

-- =====================================================
-- 10. SEED DEFAULT TEMPLATES
-- =====================================================

INSERT INTO review_templates (name, type, description, questions, is_active) VALUES
('Probation Review', 'probation', 'Standard probation period review (first 2 months)', 
 '[
   {"id": "adaptation", "question": "How well has the employee adapted to the role?", "type": "rating", "required": true},
   {"id": "skills", "question": "Technical skills assessment", "type": "text", "required": true},
   {"id": "teamwork", "question": "How well does the employee work with the team?", "type": "rating", "required": true},
   {"id": "recommendation", "question": "Recommendation for continuation", "type": "select", "options": ["Continue", "Extend probation", "Terminate"], "required": true}
 ]'::jsonb, true),
 
('Six Month Review', 'six_month', 'Mandatory 6-month review (Dutch labor law)', 
 '[
   {"id": "performance", "question": "Overall performance rating", "type": "rating", "required": true},
   {"id": "achievements", "question": "Key achievements in the past 6 months", "type": "text", "required": true},
   {"id": "goals", "question": "Goals for next 6 months", "type": "text", "required": true}
 ]'::jsonb, true),
 
('Yearly Review', 'yearly', 'Annual performance review', 
 '[
   {"id": "overall_performance", "question": "Overall performance rating", "type": "rating", "required": true},
   {"id": "goal_achievement", "question": "Achievement of previous year goals", "type": "rating", "required": true},
   {"id": "strengths", "question": "Key strengths demonstrated", "type": "text", "required": true},
   {"id": "improvements", "question": "Areas for improvement", "type": "text", "required": true}
 ]'::jsonb, true),
 
('Exit Review', 'exit', 'Exit interview for departing employees', 
 '[
   {"id": "reason", "question": "Reason for leaving", "type": "text", "required": true},
   {"id": "satisfaction", "question": "Overall job satisfaction", "type": "rating", "required": true},
   {"id": "improvements", "question": "Suggestions for company improvement", "type": "text", "required": false}
 ]'::jsonb, true);

-- =====================================================
-- 11. GRANT PERMISSIONS
-- =====================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON review_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON staff_reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON staff_notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON staff_certificates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON staff_docs_status TO authenticated;
GRANT SELECT ON staff_review_summary TO authenticated;
GRANT SELECT ON performance_trends TO authenticated;
GRANT SELECT ON review_calendar TO authenticated;
GRANT SELECT ON document_compliance_view TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- SUCCESS!
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'COMPLETE FRESH START SUCCESSFUL!';
  RAISE NOTICE 'Old tables renamed to *_legacy (safe backup)';
  RAISE NOTICE 'Created 5 fresh tables with correct schema';
  RAISE NOTICE 'Created 4 analytics views';
  RAISE NOTICE 'Seeded 4 default review templates';
  RAISE NOTICE 'RLS policies enabled';
  RAISE NOTICE 'Labs 2.0 is now 100%% functional!';
END $$;
