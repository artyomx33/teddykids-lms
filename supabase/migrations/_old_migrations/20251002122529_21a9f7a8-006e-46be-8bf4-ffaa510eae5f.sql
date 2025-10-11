-- ============================================
-- MIGRATION 2.0: Raw Data Architecture (FIXED)
-- Date: 2025-10-02
-- Purpose: Migrate to employes_raw_data as single source of truth
-- ============================================

-- ============================================
-- STEP 0: Make employee_id unique in raw data
-- ============================================

-- First, check if there are duplicates and keep only the latest
DELETE FROM employes_raw_data 
WHERE id NOT IN (
  SELECT DISTINCT ON (employee_id, endpoint) id
  FROM employes_raw_data
  ORDER BY employee_id, endpoint, collected_at DESC
);

-- Add unique constraint on employee_id
-- Note: employee_id alone isn't unique across endpoints, so we need a composite unique key
CREATE UNIQUE INDEX IF NOT EXISTS idx_employes_raw_data_unique 
ON employes_raw_data(employee_id, endpoint);

-- ============================================
-- PHASE 4: Drop Old Tables (Execute First)
-- ============================================

DROP TABLE IF EXISTS performance_metrics CASCADE;
DROP TABLE IF EXISTS staff_notes CASCADE;
DROP TABLE IF EXISTS staff_certificates CASCADE;
DROP TABLE IF EXISTS cao_salary_history CASCADE;
DROP TABLE IF EXISTS staff_reviews CASCADE;

-- ============================================
-- PHASE 1: Create New Tables (Raw Data Only)
-- ============================================

-- 1. staff_reviews (NEW)
-- Note: Links to employee_id from ANY endpoint in raw data
CREATE TABLE staff_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employes_employee_id TEXT NOT NULL,
  review_date DATE NOT NULL,
  review_type TEXT,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  star_rating INTEGER CHECK (star_rating >= 1 AND star_rating <= 5),
  overall_score NUMERIC CHECK (overall_score >= 0 AND overall_score <= 100),
  summary TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  template_id UUID,
  raise BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_staff_reviews_employee ON staff_reviews(employes_employee_id);
CREATE INDEX idx_staff_reviews_date ON staff_reviews(review_date);
CREATE INDEX idx_staff_reviews_status ON staff_reviews(status);

COMMENT ON TABLE staff_reviews IS 'Employee performance reviews linked to employes_raw_data';

-- 2. cao_salary_history (NEW)
CREATE TABLE cao_salary_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employes_employee_id TEXT NOT NULL,
  scale TEXT,
  trede TEXT,
  bruto36h NUMERIC,
  hours_per_week NUMERIC NOT NULL,
  gross_monthly NUMERIC NOT NULL,
  hourly_wage NUMERIC,
  yearly_wage NUMERIC,
  cao_effective_date DATE NOT NULL,
  valid_from DATE NOT NULL,
  valid_to DATE,
  data_source TEXT DEFAULT 'employes_sync',
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  
  -- Ensure valid date ranges
  CONSTRAINT valid_date_range CHECK (valid_to IS NULL OR valid_to >= valid_from)
);

CREATE INDEX idx_cao_salary_employee ON cao_salary_history(employes_employee_id);
CREATE INDEX idx_cao_salary_dates ON cao_salary_history(valid_from, valid_to);
CREATE INDEX idx_cao_salary_effective ON cao_salary_history(cao_effective_date);

COMMENT ON TABLE cao_salary_history IS 'CAO salary history linked to employes_raw_data';

-- 3. staff_certificates (NEW)
CREATE TABLE staff_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employes_employee_id TEXT NOT NULL,
  title TEXT,
  file_path TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_staff_certificates_employee ON staff_certificates(employes_employee_id);

COMMENT ON TABLE staff_certificates IS 'Staff certificates linked to employes_raw_data';

-- 4. staff_notes (NEW)
CREATE TABLE staff_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employes_employee_id TEXT NOT NULL,
  note TEXT,
  note_type TEXT,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_staff_notes_employee ON staff_notes(employes_employee_id);
CREATE INDEX idx_staff_notes_archived ON staff_notes(is_archived);

COMMENT ON TABLE staff_notes IS 'Staff notes linked to employes_raw_data';

-- 5. performance_metrics (NEW)
CREATE TABLE performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employes_employee_id TEXT NOT NULL,
  review_id UUID,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Link to reviews
  CONSTRAINT fk_review
    FOREIGN KEY (review_id)
    REFERENCES staff_reviews(id) ON DELETE CASCADE
);

CREATE INDEX idx_performance_metrics_employee ON performance_metrics(employes_employee_id);
CREATE INDEX idx_performance_metrics_review ON performance_metrics(review_id);

COMMENT ON TABLE performance_metrics IS 'Performance metrics linked to employes_raw_data';

-- ============================================
-- PHASE 3: Update Contracts Table
-- ============================================

-- Add employes_employee_id to contracts table
ALTER TABLE contracts 
ADD COLUMN IF NOT EXISTS employes_employee_id TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_contracts_employee ON contracts(employes_employee_id);

COMMENT ON COLUMN contracts.employes_employee_id IS 'Links contract to employes_raw_data source of truth';

-- ============================================
-- RLS POLICIES (Raw Data Architecture)
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE staff_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE cao_salary_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- staff_reviews policies
CREATE POLICY "Admins can manage reviews"
ON staff_reviews FOR ALL
TO authenticated
USING (is_admin());

CREATE POLICY "Managers can view reviews of their staff"
ON staff_reviews FOR SELECT
TO authenticated
USING (
  employes_employee_id IN (
    SELECT s.employes_id
    FROM staff s
    INNER JOIN managers m ON m.staff_id = s.id
    WHERE m.user_id = auth.uid()
  )
  OR is_admin()
);

CREATE POLICY "Managers can insert reviews for their staff"
ON staff_reviews FOR INSERT
TO authenticated
WITH CHECK (
  employes_employee_id IN (
    SELECT s.employes_id
    FROM staff s
    INNER JOIN managers m ON m.staff_id = s.id
    WHERE m.user_id = auth.uid() AND m.can_edit_reviews = true
  )
  OR is_admin()
);

CREATE POLICY "Managers can update reviews for their staff"
ON staff_reviews FOR UPDATE
TO authenticated
USING (
  employes_employee_id IN (
    SELECT s.employes_id
    FROM staff s
    INNER JOIN managers m ON m.staff_id = s.id
    WHERE m.user_id = auth.uid() AND m.can_edit_reviews = true
  )
  OR is_admin()
);

-- cao_salary_history policies
CREATE POLICY "Admins can manage salary history"
ON cao_salary_history FOR ALL
TO authenticated
USING (is_admin());

CREATE POLICY "Managers can view salary of their staff"
ON cao_salary_history FOR SELECT
TO authenticated
USING (
  employes_employee_id IN (
    SELECT s.employes_id
    FROM staff s
    INNER JOIN managers m ON m.staff_id = s.id
    WHERE m.user_id = auth.uid() AND m.can_view_salary = true
  )
  OR is_admin()
);

-- staff_certificates policies
CREATE POLICY "Admins can manage certificates"
ON staff_certificates FOR ALL
TO authenticated
USING (is_admin());

CREATE POLICY "Managers can view certificates of their staff"
ON staff_certificates FOR SELECT
TO authenticated
USING (
  employes_employee_id IN (
    SELECT s.employes_id
    FROM staff s
    INNER JOIN managers m ON m.staff_id = s.id
    WHERE m.user_id = auth.uid()
  )
  OR is_admin()
);

CREATE POLICY "Managers can insert certificates for their staff"
ON staff_certificates FOR INSERT
TO authenticated
WITH CHECK (
  employes_employee_id IN (
    SELECT s.employes_id
    FROM staff s
    INNER JOIN managers m ON m.staff_id = s.id
    WHERE m.user_id = auth.uid()
  )
  OR is_admin()
);

-- staff_notes policies
CREATE POLICY "Admins can manage notes"
ON staff_notes FOR ALL
TO authenticated
USING (is_admin());

CREATE POLICY "Managers can view notes of their staff"
ON staff_notes FOR SELECT
TO authenticated
USING (
  employes_employee_id IN (
    SELECT s.employes_id
    FROM staff s
    INNER JOIN managers m ON m.staff_id = s.id
    WHERE m.user_id = auth.uid()
  )
  OR is_admin()
);

CREATE POLICY "Managers can insert notes for their staff"
ON staff_notes FOR INSERT
TO authenticated
WITH CHECK (
  employes_employee_id IN (
    SELECT s.employes_id
    FROM staff s
    INNER JOIN managers m ON m.staff_id = s.id
    WHERE m.user_id = auth.uid()
  )
  OR is_admin()
);

CREATE POLICY "Managers can update notes for their staff"
ON staff_notes FOR UPDATE
TO authenticated
USING (
  employes_employee_id IN (
    SELECT s.employes_id
    FROM staff s
    INNER JOIN managers m ON m.staff_id = s.id
    WHERE m.user_id = auth.uid()
  )
  OR is_admin()
);

-- performance_metrics policies
CREATE POLICY "Admins can manage metrics"
ON performance_metrics FOR ALL
TO authenticated
USING (is_admin());

CREATE POLICY "Managers can view metrics of their staff"
ON performance_metrics FOR SELECT
TO authenticated
USING (
  employes_employee_id IN (
    SELECT s.employes_id
    FROM staff s
    INNER JOIN managers m ON m.staff_id = s.id
    WHERE m.user_id = auth.uid()
  )
  OR is_admin()
);

-- ============================================
-- HELPER FUNCTION: Get Current Salary (UPDATED)
-- ============================================

CREATE OR REPLACE FUNCTION get_current_salary_v2(p_employes_employee_id TEXT)
RETURNS TABLE(
  scale TEXT,
  trede TEXT,
  gross_monthly NUMERIC,
  hourly_wage NUMERIC,
  hours_per_week NUMERIC,
  effective_date DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    csh.scale,
    csh.trede,
    csh.gross_monthly,
    csh.hourly_wage,
    csh.hours_per_week,
    csh.cao_effective_date
  FROM cao_salary_history csh
  WHERE csh.employes_employee_id = p_employes_employee_id
  AND csh.valid_from <= CURRENT_DATE
  AND (csh.valid_to IS NULL OR csh.valid_to >= CURRENT_DATE)
  ORDER BY csh.valid_from DESC
  LIMIT 1;
END;
$$;

COMMENT ON FUNCTION get_current_salary_v2 IS 'Gets current salary from raw data architecture using employes_employee_id';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================