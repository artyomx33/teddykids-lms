-- Enable btree_gist extension for UUID exclusion constraints
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Add new columns to contract_financials for better tracking
ALTER TABLE contract_financials
ADD COLUMN IF NOT EXISTS cao_effective_date DATE,
ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ DEFAULT now();

-- Create cao_salary_history table to track salary changes over time
CREATE TABLE IF NOT EXISTS cao_salary_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
  
  -- CAO Information (manual entry for now)
  scale TEXT,
  trede TEXT,
  
  -- Salary Details (from Employes API)
  bruto36h NUMERIC,
  hours_per_week NUMERIC NOT NULL,
  gross_monthly NUMERIC NOT NULL,
  hourly_wage NUMERIC,
  yearly_wage NUMERIC,
  
  -- Effective Dates
  cao_effective_date DATE NOT NULL,
  valid_from DATE NOT NULL,
  valid_to DATE,
  
  -- Metadata
  data_source TEXT DEFAULT 'employes_sync',
  employes_employee_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Prevent overlapping periods for same staff
  CONSTRAINT no_overlap_periods EXCLUDE USING gist (
    staff_id WITH =,
    daterange(valid_from, COALESCE(valid_to, '9999-12-31'::date), '[]') WITH &&
  )
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_cao_salary_history_staff_id ON cao_salary_history(staff_id);
CREATE INDEX IF NOT EXISTS idx_cao_salary_history_dates ON cao_salary_history(valid_from, valid_to);
CREATE INDEX IF NOT EXISTS idx_cao_salary_history_employes_id ON cao_salary_history(employes_employee_id);

-- RLS Policies for cao_salary_history
ALTER TABLE cao_salary_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage salary history"
ON cao_salary_history FOR ALL
USING (is_admin());

CREATE POLICY "Managers can view salary history of their staff"
ON cao_salary_history FOR SELECT
USING (
  staff_id IN (
    SELECT staff_id FROM managers
    WHERE user_id = auth.uid()
    AND can_view_salary = true
  )
  OR is_admin()
);

-- Function to get current salary for staff
CREATE OR REPLACE FUNCTION get_current_salary(p_staff_id UUID)
RETURNS TABLE (
  scale TEXT,
  trede TEXT,
  gross_monthly NUMERIC,
  hourly_wage NUMERIC,
  hours_per_week NUMERIC,
  effective_date DATE
) AS $$
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
  WHERE csh.staff_id = p_staff_id
  AND csh.valid_from <= CURRENT_DATE
  AND (csh.valid_to IS NULL OR csh.valid_to >= CURRENT_DATE)
  ORDER BY csh.valid_from DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;