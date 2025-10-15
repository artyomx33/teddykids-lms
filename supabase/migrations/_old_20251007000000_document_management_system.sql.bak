-- =====================================================
-- Document Management System - Simplified Architecture
-- =====================================================
-- Purpose: Track staff documents with file storage
-- Features: Multiple files per type, expiry tracking, active file marking
-- Author: TeddyKids Development Team
-- Date: 2025-10-07
-- =====================================================

-- =====================================================
-- 1. DOCUMENT TYPES TABLE
-- =====================================================
-- Master list of all document types we need to track

CREATE TABLE IF NOT EXISTS document_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL, -- 'identity', 'compliance', 'certification', 'education', 'other'
  
  -- Configuration
  is_required boolean DEFAULT false, -- Shows in checklist if true
  requires_expiry boolean DEFAULT false,
  default_expiry_months integer,
  
  -- UI
  icon text, -- Lucide icon name
  sort_order integer NOT NULL,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 2. STAFF DOCUMENTS TABLE (SIMPLIFIED)
-- =====================================================
-- One row per uploaded file
-- Multiple files allowed per staff/type (no unique constraint)
-- is_current marks which file is the "active" one

CREATE TABLE IF NOT EXISTS staff_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  document_type_id uuid NOT NULL REFERENCES document_types(id) ON DELETE RESTRICT,
  
  -- File information
  file_name text,
  file_path text, -- staff/{staff_id}/{document_type_code}.{ext}
  file_size bigint,
  mime_type text,
  
  -- Status & tracking
  status text NOT NULL DEFAULT 'missing', -- 'missing', 'uploaded', 'expired'
  is_current boolean DEFAULT true, -- Which file is the active one
  
  -- Dates
  uploaded_at timestamptz,
  expires_at timestamptz, -- Only set if document_type.requires_expiry = true
  
  -- For "OTHER" document type
  custom_label text, -- User-defined label when type = 'OTHER'
  notes text,
  
  -- Metadata
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 3. INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_staff_documents_staff_id ON staff_documents(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_documents_status ON staff_documents(status);
CREATE INDEX IF NOT EXISTS idx_staff_documents_is_current ON staff_documents(is_current) WHERE is_current = true;
CREATE INDEX IF NOT EXISTS idx_staff_documents_expires_at ON staff_documents(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_staff_documents_type ON staff_documents(document_type_id);

-- =====================================================
-- 4. TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_document_types_updated_at
  BEFORE UPDATE ON document_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_documents_updated_at
  BEFORE UPDATE ON staff_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-mark old files as not current when new file is uploaded
CREATE OR REPLACE FUNCTION mark_old_documents_inactive()
RETURNS TRIGGER AS $$
BEGIN
  -- When a new document is uploaded with is_current = true
  -- mark all other documents of same type for same staff as is_current = false
  IF NEW.is_current = true AND NEW.status = 'uploaded' THEN
    UPDATE staff_documents
    SET is_current = false
    WHERE 
      staff_id = NEW.staff_id 
      AND document_type_id = NEW.document_type_id 
      AND id != NEW.id
      AND is_current = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_current_document
  BEFORE INSERT OR UPDATE ON staff_documents
  FOR EACH ROW
  EXECUTE FUNCTION mark_old_documents_inactive();

-- =====================================================
-- 5. FUNCTIONS
-- =====================================================

-- Function to check and expire documents daily (called by cron)
CREATE OR REPLACE FUNCTION check_document_expiry()
RETURNS void AS $$
BEGIN
  UPDATE staff_documents
  SET 
    status = 'expired',
    is_current = false, -- Expired docs are no longer current
    updated_at = now()
  WHERE 
    status = 'uploaded' 
    AND is_current = true
    AND expires_at IS NOT NULL 
    AND expires_at <= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get document summary for a staff member (used by UI)
CREATE OR REPLACE FUNCTION get_staff_document_summary(p_staff_id uuid)
RETURNS TABLE (
  total_required integer,
  uploaded_count integer,
  missing_count integer,
  expired_count integer,
  expiring_soon_count integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::integer FILTER (WHERE dt.is_required) AS total_required,
    COUNT(*)::integer FILTER (WHERE dt.is_required AND sd.status = 'uploaded' AND sd.is_current = true) AS uploaded_count,
    COUNT(*)::integer FILTER (WHERE dt.is_required AND (sd.status = 'missing' OR sd.id IS NULL)) AS missing_count,
    COUNT(*)::integer FILTER (WHERE sd.status = 'expired') AS expired_count,
    COUNT(*)::integer FILTER (WHERE sd.status = 'uploaded' AND sd.is_current = true AND sd.expires_at IS NOT NULL AND sd.expires_at <= CURRENT_DATE + INTERVAL '30 days') AS expiring_soon_count
  FROM document_types dt
  LEFT JOIN staff_documents sd ON sd.document_type_id = dt.id AND sd.staff_id = p_staff_id AND sd.is_current = true
  WHERE dt.code != 'OTHER'; -- Don't count "other" in required totals
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- 6. SEED DOCUMENT TYPES
-- =====================================================

INSERT INTO document_types (code, name, description, category, is_required, requires_expiry, default_expiry_months, icon, sort_order) VALUES
-- REQUIRED DOCUMENTS (show in checklist) --
('IDW', 'IDW/DUO Evaluation', 'Confirms bachelor/master diploma validation for KDV/BSO work', 'education', true, false, NULL, 'GraduationCap', 1),
('ENGLISH_TEST', 'English Language Test', 'Minimum B2/C1 proficiency level', 'certification', true, false, NULL, 'Languages', 2),
('VOG', 'VOG Certificate', 'Certificate of Good Conduct linked to company', 'compliance', true, false, NULL, 'ShieldCheck', 3),
('EHBO', 'EHBO/BHV Certificate', 'First aid certification (expires yearly)', 'certification', true, true, 12, 'Heart', 4),
('3F', '3F Document', 'Required for Dutch teachers', 'compliance', true, false, NULL, 'FileCheck', 5),
('DIPLOMA', 'Diploma', 'Educational qualification diploma', 'education', true, false, NULL, 'Award', 6),
('PRK', 'PRK Screenshot', 'PRK link to TeddyKids', 'compliance', true, false, NULL, 'Link', 7),

-- OPTIONAL/SUPPORTING DOCUMENTS --
('FCB', 'FCB Confirmation', 'Confirmation to work for daycare/BSO', 'compliance', false, false, NULL, 'CheckCircle', 8),
('ID', 'ID Card', 'Identity document', 'identity', false, false, NULL, 'CreditCard', 9),
('BANK_ACCOUNT', 'Bank Account', 'Bank account details', 'identity', false, false, NULL, 'Landmark', 10),
('BSN', 'BSN Document', 'Dutch social security number', 'identity', false, false, NULL, 'Hash', 11),
('BABY_COURSE', 'Baby Course Certificate', 'Baby care certification', 'certification', false, false, NULL, 'Baby', 12),
('FG', 'FG Document', 'FG certification', 'compliance', false, false, NULL, 'FileText', 13),
('STINT_COURSE', 'Stint Course Certificate', 'Stint course completion', 'certification', false, false, NULL, 'BookOpen', 14),

-- OTHER (always last) --
('OTHER', 'Other Document', 'Any other document (requires custom label)', 'other', false, false, NULL, 'FileText', 99)

ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  is_required = EXCLUDED.is_required,
  requires_expiry = EXCLUDED.requires_expiry,
  default_expiry_months = EXCLUDED.default_expiry_months,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- =====================================================
-- 7. RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_documents ENABLE ROW LEVEL SECURITY;

-- Document Types: Anyone authenticated can read
CREATE POLICY "Anyone can view document types"
  ON document_types FOR SELECT
  TO authenticated
  USING (true);

-- Staff Documents: Staff can view their own, admins can view all
CREATE POLICY "Staff can view own documents"
  ON staff_documents FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM staff WHERE id = staff_documents.staff_id
    )
    OR
    EXISTS (
      SELECT 1 FROM staff 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Staff can insert their own documents
CREATE POLICY "Staff can upload own documents"
  ON staff_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM staff WHERE id = staff_documents.staff_id
    )
    OR
    EXISTS (
      SELECT 1 FROM staff 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Staff can update their own documents
CREATE POLICY "Staff can update own documents"
  ON staff_documents FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM staff WHERE id = staff_documents.staff_id
    )
    OR
    EXISTS (
      SELECT 1 FROM staff 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- Staff can delete their own documents
CREATE POLICY "Staff can delete own documents"
  ON staff_documents FOR DELETE
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT user_id FROM staff WHERE id = staff_documents.staff_id
    )
    OR
    EXISTS (
      SELECT 1 FROM staff 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- 8. INITIALIZE REQUIRED DOCUMENTS FOR EXISTING STAFF
-- =====================================================

-- Create placeholder entries for all required documents for all staff
INSERT INTO staff_documents (staff_id, document_type_id, status, is_current)
SELECT 
  s.id AS staff_id,
  dt.id AS document_type_id,
  'missing' AS status,
  true AS is_current
FROM staff s
CROSS JOIN document_types dt
WHERE dt.is_required = true
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE document_types IS 'Master list of all document types that can be tracked';
COMMENT ON TABLE staff_documents IS 'Stores uploaded documents for staff members. Multiple files per type allowed; is_current marks the active file.';
COMMENT ON COLUMN staff_documents.is_current IS 'Marks which file is the active/current one. Only one file per type per staff should have is_current=true.';
COMMENT ON COLUMN staff_documents.custom_label IS 'For OTHER document type, stores user-defined label';
COMMENT ON FUNCTION check_document_expiry() IS 'Called daily by cron to mark expired documents';
COMMENT ON FUNCTION get_staff_document_summary(uuid) IS 'Returns summary statistics for document status widget';

