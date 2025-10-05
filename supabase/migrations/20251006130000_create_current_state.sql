-- =====================================================
-- MIGRATION: Create Current State Table
-- Created: 2025-10-06
-- Purpose: Fast, typed employee current state
-- Philosophy: Speed over flexibility
-- =====================================================

BEGIN;

-- =====================================================
-- 1. CREATE CURRENT STATE TABLE
-- =====================================================

CREATE TABLE employes_current_state (
  -- Core
  employee_id UUID PRIMARY KEY,
  
  -- Essential fields for UI
  full_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  
  -- Personal
  date_of_birth DATE,
  nationality TEXT,
  nationality_id INTEGER,
  
  -- Employment
  employment_status TEXT DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  
  -- Position
  department TEXT,
  location TEXT,
  manager_name TEXT,
  manager_id UUID,
  role TEXT,
  position TEXT,
  
  -- Compensation (current)
  current_salary DECIMAL(10,2),
  current_hourly_rate DECIMAL(10,2),
  current_hours_per_week DECIMAL(5,2),
  salary_effective_date DATE,
  
  -- Contract
  contract_type TEXT,
  contract_start_date DATE,
  contract_end_date DATE,
  
  -- Address
  street_address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT,
  
  -- Identifiers
  bsn TEXT,
  iban TEXT,
  
  -- Metadata
  last_sync_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_session_id UUID REFERENCES employes_sync_sessions(id),
  data_completeness_score DECIMAL(3,2),
  data_quality_flags JSONB,
  
  -- Computed columns (removed GENERATED - will compute in app/view)
  months_employed INTEGER,
  age INTEGER,
  is_active BOOLEAN,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE INDEXES
-- =====================================================

-- Primary filters
CREATE INDEX idx_current_state_status ON employes_current_state(employment_status);
CREATE INDEX idx_current_state_active ON employes_current_state(is_active) WHERE is_active = true;
CREATE INDEX idx_current_state_department ON employes_current_state(department);
CREATE INDEX idx_current_state_location ON employes_current_state(location);

-- Search
CREATE INDEX idx_current_state_name ON employes_current_state(full_name);
CREATE INDEX idx_current_state_email ON employes_current_state(email);

-- Sorting
CREATE INDEX idx_current_state_start_date ON employes_current_state(start_date DESC);
CREATE INDEX idx_current_state_salary ON employes_current_state(current_salary DESC);

-- Data quality
CREATE INDEX idx_current_state_completeness ON employes_current_state(data_completeness_score DESC);
CREATE INDEX idx_current_state_last_sync ON employes_current_state(last_sync_at DESC);

-- =====================================================
-- 3. CREATE UPDATE TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION update_current_state_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_current_state_timestamp
  BEFORE UPDATE ON employes_current_state
  FOR EACH ROW
  EXECUTE FUNCTION update_current_state_timestamp();

-- =====================================================
-- 4. BACKFILL FROM RAW DATA
-- =====================================================

-- Helper function to get current salary from employments data
CREATE OR REPLACE FUNCTION get_current_salary(employments_data JSONB)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  current_salary DECIMAL(10,2);
  salary_record JSONB;
BEGIN
  -- Try to find current salary (no end_date)
  FOR salary_record IN 
    SELECT * FROM jsonb_array_elements(employments_data->'salary')
    WHERE (value->>'end_date') IS NULL
    ORDER BY (value->>'start_date') DESC
    LIMIT 1
  LOOP
    current_salary := (salary_record->>'month_wage')::DECIMAL(10,2);
    RETURN current_salary;
  END LOOP;
  
  -- If no current salary, get most recent
  FOR salary_record IN 
    SELECT * FROM jsonb_array_elements(employments_data->'salary')
    ORDER BY (value->>'start_date') DESC
    LIMIT 1
  LOOP
    current_salary := (salary_record->>'month_wage')::DECIMAL(10,2);
    RETURN current_salary;
  END LOOP;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get current hours
CREATE OR REPLACE FUNCTION get_current_hours(employments_data JSONB)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  current_hours DECIMAL(5,2);
  hours_record JSONB;
BEGIN
  -- Try to find current hours (no end_date)
  FOR hours_record IN 
    SELECT * FROM jsonb_array_elements(employments_data->'hours')
    WHERE (value->>'end_date') IS NULL
    ORDER BY (value->>'start_date') DESC
    LIMIT 1
  LOOP
    current_hours := (hours_record->>'hours_per_week')::DECIMAL(5,2);
    RETURN current_hours;
  END LOOP;
  
  -- If no current hours, get most recent
  FOR hours_record IN 
    SELECT * FROM jsonb_array_elements(employments_data->'hours')
    ORDER BY (value->>'start_date') DESC
    LIMIT 1
  LOOP
    current_hours := (hours_record->>'hours_per_week')::DECIMAL(5,2);
    RETURN current_hours;
  END LOOP;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Backfill current state from latest raw data
INSERT INTO employes_current_state (
  employee_id,
  full_name,
  first_name,
  last_name,
  email,
  phone,
  mobile,
  date_of_birth,
  nationality_id,
  employment_status,
  start_date,
  end_date,
  department,
  location,
  role,
  position,
  street_address,
  city,
  postal_code,
  country,
  bsn,
  iban,
  current_salary,
  current_hours_per_week,
  months_employed,
  age,
  is_active,
  last_sync_at,
  data_completeness_score
)
SELECT DISTINCT ON (employee_id)
  employee_id::UUID,
  TRIM(COALESCE(api_response->>'first_name', '') || ' ' || COALESCE(api_response->>'last_name', '')) as full_name,
  api_response->>'first_name' as first_name,
  api_response->>'last_name' as last_name,
  api_response->>'email' as email,
  api_response->>'phone' as phone,
  api_response->>'mobile' as mobile,
  (api_response->>'date_of_birth')::DATE as date_of_birth,
  (api_response->>'nationality_id')::INTEGER as nationality_id,
  COALESCE(api_response->>'status', 'active') as employment_status,
  (api_response->>'start_date')::DATE as start_date,
  (api_response->>'end_date')::DATE as end_date,
  api_response->>'department' as department,
  api_response->>'location' as location,
  api_response->>'role' as role,
  api_response->>'position' as position,
  api_response->>'street_address' as street_address,
  api_response->>'city' as city,
  api_response->>'postal_code' as postal_code,
  api_response->>'country' as country,
  api_response->>'bsn' as bsn,
  api_response->>'iban' as   iban,
  get_current_salary(api_response) as current_salary,
  get_current_hours(api_response) as current_hours_per_week,
  -- Compute months employed
  EXTRACT(YEAR FROM AGE(COALESCE((api_response->>'end_date')::DATE, CURRENT_DATE), (api_response->>'start_date')::DATE)) * 12 +
  EXTRACT(MONTH FROM AGE(COALESCE((api_response->>'end_date')::DATE, CURRENT_DATE), (api_response->>'start_date')::DATE)) as months_employed,
  -- Compute age
  EXTRACT(YEAR FROM AGE(CURRENT_DATE, (api_response->>'date_of_birth')::DATE)) as age,
  -- Compute is_active
  (COALESCE(api_response->>'status', 'active') = 'active' AND 
   ((api_response->>'end_date')::DATE IS NULL OR (api_response->>'end_date')::DATE > CURRENT_DATE)) as is_active,
  collected_at as last_sync_at,
  -- Calculate data completeness (0-1 scale)
  (
    CASE WHEN api_response->>'first_name' IS NOT NULL THEN 0.1 ELSE 0 END +
    CASE WHEN api_response->>'last_name' IS NOT NULL THEN 0.1 ELSE 0 END +
    CASE WHEN api_response->>'email' IS NOT NULL THEN 0.1 ELSE 0 END +
    CASE WHEN api_response->>'date_of_birth' IS NOT NULL THEN 0.1 ELSE 0 END +
    CASE WHEN api_response->>'start_date' IS NOT NULL THEN 0.1 ELSE 0 END +
    CASE WHEN api_response->>'department' IS NOT NULL THEN 0.1 ELSE 0 END +
    CASE WHEN api_response->>'position' IS NOT NULL THEN 0.1 ELSE 0 END +
    CASE WHEN get_current_salary(api_response) IS NOT NULL THEN 0.15 ELSE 0 END +
    CASE WHEN get_current_hours(api_response) IS NOT NULL THEN 0.15 ELSE 0 END +
    CASE WHEN api_response->>'bsn' IS NOT NULL THEN 0.1 ELSE 0 END
  ) as data_completeness_score
FROM employes_raw_data
WHERE endpoint = '/employments'
  AND is_latest = true
ORDER BY employee_id, collected_at DESC
ON CONFLICT (employee_id) DO NOTHING;

-- =====================================================
-- 5. CREATE HELPER VIEWS
-- =====================================================

-- Active employees only
CREATE VIEW v_active_employees AS
SELECT * FROM employes_current_state
WHERE is_active = true
ORDER BY full_name;

-- Employees with incomplete data
CREATE VIEW v_incomplete_data_employees AS
SELECT 
  employee_id,
  full_name,
  email,
  data_completeness_score,
  CASE 
    WHEN date_of_birth IS NULL THEN 'Missing birth date'
    WHEN current_salary IS NULL THEN 'Missing salary'
    WHEN current_hours_per_week IS NULL THEN 'Missing hours'
    WHEN department IS NULL THEN 'Missing department'
    WHEN position IS NULL THEN 'Missing position'
    ELSE 'Other missing data'
  END as missing_data
FROM employes_current_state
WHERE data_completeness_score < 0.8
ORDER BY data_completeness_score ASC;

-- Grant permissions
GRANT SELECT ON v_active_employees TO authenticated;
GRANT SELECT ON v_incomplete_data_employees TO authenticated;

-- =====================================================
-- 6. STATISTICS
-- =====================================================

DO $$
DECLARE
  total_employees INTEGER;
  active_employees INTEGER;
  avg_completeness DECIMAL(3,2);
  complete_employees INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_employees FROM employes_current_state;
  SELECT COUNT(*) INTO active_employees FROM employes_current_state WHERE is_active = true;
  SELECT AVG(data_completeness_score) INTO avg_completeness FROM employes_current_state;
  SELECT COUNT(*) INTO complete_employees FROM employes_current_state WHERE data_completeness_score >= 0.8;
  
  RAISE NOTICE 'CURRENT STATE TABLE CREATED';
  RAISE NOTICE 'Total employees: %', total_employees;
  RAISE NOTICE 'Active employees: %', active_employees;
  RAISE NOTICE 'Average completeness: %', ROUND(avg_completeness * 100, 1);
  RAISE NOTICE 'Complete profiles (>80 percent): %', complete_employees;
END $$;

COMMIT;

-- =====================================================
-- SUCCESS!
-- =====================================================
