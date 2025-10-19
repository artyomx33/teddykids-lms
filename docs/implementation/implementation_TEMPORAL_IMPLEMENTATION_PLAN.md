# 🚀 TEMPORAL-FIRST MICROSERVICES - IMPLEMENTATION PLAN

**Solution: #1 (10/10 Rating)**
**Status: READY TO BUILD! 🔥**
**Timeline: 6-8 weeks**
**Goal: Complete salary/contract/hours history tracking with time-travel queries**

---

## 🎯 PHASE 1: DATABASE FOUNDATION (Days 1-3)

### **Step 1.1: Create Enhanced Raw Data Table**

**File:** `supabase/migrations/20251005000001_temporal_raw_data.sql`

```sql
-- Drop and recreate with temporal support
DROP VIEW IF EXISTS staff CASCADE;
DROP TABLE IF EXISTS employes_raw_data CASCADE;

-- Enhanced raw data table with full temporal support
CREATE TABLE employes_raw_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core identifiers
  employee_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,  -- '/employee', '/employments', '/salary-history', etc.
  
  -- Data storage
  api_response JSONB NOT NULL,
  data_hash TEXT NOT NULL,
  
  -- Temporal tracking
  collected_at TIMESTAMPTZ DEFAULT NOW(),
  effective_from TIMESTAMPTZ,  -- When this data became true in reality
  effective_to TIMESTAMPTZ,    -- When this data stopped being true (NULL = still current)
  is_latest BOOLEAN DEFAULT true,
  
  -- Versioning
  superseded_by UUID REFERENCES employes_raw_data(id),
  supersedes UUID REFERENCES employes_raw_data(id),
  
  -- Metadata
  sync_session_id UUID,  -- Group records from same sync run
  confidence_score DECIMAL(3,2) DEFAULT 1.00,  -- How confident we are (0.00-1.00)
  
  CONSTRAINT unique_latest_endpoint UNIQUE(employee_id, endpoint, is_latest) DEFERRABLE INITIALLY DEFERRED
);

-- Indexes for performance
CREATE INDEX idx_raw_employee_endpoint ON employes_raw_data(employee_id, endpoint);
CREATE INDEX idx_raw_latest ON employes_raw_data(is_latest) WHERE is_latest = true;
CREATE INDEX idx_raw_collected ON employes_raw_data(collected_at DESC);
CREATE INDEX idx_raw_effective_from ON employes_raw_data(effective_from) WHERE effective_from IS NOT NULL;
CREATE INDEX idx_raw_temporal ON employes_raw_data(employee_id, effective_from, effective_to);
CREATE INDEX idx_raw_sync_session ON employes_raw_data(sync_session_id);

-- Comments
COMMENT ON TABLE employes_raw_data IS 'Complete temporal storage of ALL Employes.nl API data with full history';
COMMENT ON COLUMN employes_raw_data.effective_from IS 'When this data became true in the real world (from API dates)';
COMMENT ON COLUMN employes_raw_data.effective_to IS 'When this data stopped being true (NULL = still current)';
COMMENT ON COLUMN employes_raw_data.superseded_by IS 'Link to the record that replaced this one';
COMMENT ON COLUMN employes_raw_data.sync_session_id IS 'Groups all records from same sync operation';
```

### **Step 1.2: Create Changes Tracking Table**

```sql
-- Track detected changes between syncs
CREATE TABLE employes_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What changed
  employee_id TEXT NOT NULL,
  change_type TEXT NOT NULL,  -- 'salary_change', 'hours_change', 'contract_change', 'position_change', etc.
  effective_date TIMESTAMPTZ NOT NULL,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Change details
  field_name TEXT,  -- Specific field that changed (e.g., 'hourly_wage', 'hours_per_week')
  old_value JSONB,
  new_value JSONB,
  diff JSONB,  -- Detailed field-by-field comparison
  
  -- Change magnitude
  change_amount NUMERIC,  -- For salary/hours: the numeric difference
  change_percent NUMERIC, -- For salary/hours: percentage change
  
  -- Context
  change_source TEXT,  -- Which endpoint detected this: '/salary-history', '/employments', etc.
  confidence_score DECIMAL(3,2) DEFAULT 1.00,
  validation_status TEXT DEFAULT 'detected',  -- 'detected', 'confirmed', 'suspicious', 'false_positive'
  
  -- Human review
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  -- Links to raw data
  raw_data_before UUID REFERENCES employes_raw_data(id),
  raw_data_after UUID REFERENCES employes_raw_data(id),
  
  -- Business impact
  requires_contract_update BOOLEAN DEFAULT false,
  requires_payroll_adjustment BOOLEAN DEFAULT false,
  requires_manager_notification BOOLEAN DEFAULT false
);

-- Indexes
CREATE INDEX idx_changes_employee ON employes_changes(employee_id, effective_date DESC);
CREATE INDEX idx_changes_type ON employes_changes(change_type, effective_date DESC);
CREATE INDEX idx_changes_detected ON employes_changes(detected_at DESC);
CREATE INDEX idx_changes_validation ON employes_changes(validation_status) WHERE validation_status != 'confirmed';
CREATE INDEX idx_changes_review ON employes_changes(reviewed_by, reviewed_at);

-- Comments
COMMENT ON TABLE employes_changes IS 'Detected changes in salary, hours, contracts over time';
COMMENT ON COLUMN employes_changes.confidence_score IS 'AI confidence in change detection (1.00 = certain, 0.50 = needs review)';
COMMENT ON COLUMN employes_changes.validation_status IS 'detected = new, confirmed = verified, suspicious = needs review, false_positive = ignore';
```

### **Step 1.3: Create Timeline Materialized View**

```sql
-- Fast access to complete employee timelines
CREATE MATERIALIZED VIEW employes_timeline AS
SELECT 
  employee_id,
  
  -- Aggregated timeline
  jsonb_agg(
    jsonb_build_object(
      'id', id,
      'date', effective_date,
      'type', change_type,
      'field', field_name,
      'old_value', old_value,
      'new_value', new_value,
      'change_amount', change_amount,
      'change_percent', change_percent,
      'source', change_source,
      'confidence', confidence_score
    ) ORDER BY effective_date DESC
  ) as timeline,
  
  -- Summary statistics
  COUNT(*) as total_changes,
  COUNT(*) FILTER (WHERE change_type = 'salary_change') as salary_changes,
  COUNT(*) FILTER (WHERE change_type = 'hours_change') as hours_changes,
  COUNT(*) FILTER (WHERE change_type = 'contract_change') as contract_changes,
  MIN(effective_date) as earliest_change,
  MAX(effective_date) as latest_change
  
FROM employes_changes
WHERE validation_status != 'false_positive'
GROUP BY employee_id;

-- Index on materialized view
CREATE UNIQUE INDEX idx_timeline_employee ON employes_timeline(employee_id);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_employes_timeline()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY employes_timeline;
END;
$$ LANGUAGE plpgsql;

COMMENT ON MATERIALIZED VIEW employes_timeline IS 'Fast access to complete change history per employee';
```

### **Step 1.4: Create Temporal Query Functions**

```sql
-- Get salary at specific date
CREATE OR REPLACE FUNCTION get_salary_at_date(
  p_employee_id TEXT,
  p_date TIMESTAMPTZ DEFAULT NOW()
) RETURNS JSONB AS $$
  SELECT new_value
  FROM employes_changes
  WHERE employee_id = p_employee_id
    AND change_type = 'salary_change'
    AND effective_date <= p_date
    AND validation_status = 'confirmed'
  ORDER BY effective_date DESC
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Get contract at specific date
CREATE OR REPLACE FUNCTION get_contract_at_date(
  p_employee_id TEXT,
  p_date TIMESTAMPTZ DEFAULT NOW()
) RETURNS JSONB AS $$
  SELECT new_value
  FROM employes_changes
  WHERE employee_id = p_employee_id
    AND change_type = 'contract_change'
    AND effective_date <= p_date
    AND validation_status = 'confirmed'
  ORDER BY effective_date DESC
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Get hours at specific date
CREATE OR REPLACE FUNCTION get_hours_at_date(
  p_employee_id TEXT,
  p_date TIMESTAMPTZ DEFAULT NOW()
) RETURNS JSONB AS $$
  SELECT new_value
  FROM employes_changes
  WHERE employee_id = p_employee_id
    AND change_type = 'hours_change'
    AND effective_date <= p_date
    AND validation_status = 'confirmed'
  ORDER BY effective_date DESC
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Get complete employee timeline
CREATE OR REPLACE FUNCTION get_employee_timeline(
  p_employee_id TEXT,
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NOW()
) RETURNS JSONB AS $$
  SELECT jsonb_agg(
    jsonb_build_object(
      'date', effective_date,
      'type', change_type,
      'field', field_name,
      'old_value', old_value,
      'new_value', new_value,
      'change_amount', change_amount,
      'change_percent', change_percent
    ) ORDER BY effective_date
  )
  FROM employes_changes
  WHERE employee_id = p_employee_id
    AND (p_start_date IS NULL OR effective_date >= p_start_date)
    AND effective_date <= p_end_date
    AND validation_status = 'confirmed';
$$ LANGUAGE sql STABLE;

-- Comments
COMMENT ON FUNCTION get_salary_at_date IS 'Time-travel query: What was this employees salary on a specific date?';
COMMENT ON FUNCTION get_contract_at_date IS 'Time-travel query: What contract did this employee have on a specific date?';
COMMENT ON FUNCTION get_hours_at_date IS 'Time-travel query: How many hours was this employee working on a specific date?';
COMMENT ON FUNCTION get_employee_timeline IS 'Get complete change history for an employee within date range';
```

### **Step 1.5: Grant Permissions**

```sql
-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON employes_raw_data TO authenticated;
GRANT SELECT, INSERT, UPDATE ON employes_changes TO authenticated;
GRANT SELECT ON employes_timeline TO authenticated;

-- Grant full access to service role
GRANT ALL ON employes_raw_data TO service_role;
GRANT ALL ON employes_changes TO service_role;
GRANT ALL ON employes_timeline TO service_role;

-- Enable RLS
ALTER TABLE employes_raw_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE employes_changes ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Allow authenticated read raw data" ON employes_raw_data
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated read changes" ON employes_changes
  FOR SELECT TO authenticated
  USING (true);

-- Policies for service role (full access)
CREATE POLICY "Allow service role all raw data" ON employes_raw_data
  FOR ALL TO service_role
  USING (true);

CREATE POLICY "Allow service role all changes" ON employes_changes
  FOR ALL TO service_role
  USING (true);
```

### **Step 1.6: Recreate Staff View**

```sql
-- Recreate staff view to work with new structure
CREATE VIEW staff AS
SELECT
  md5('employes_employee:' || employee_id)::uuid as id,
  employee_id as employes_id,
  
  -- Extract from latest snapshot
  TRIM(CONCAT(
    api_response->>'first_name',
    ' ',
    api_response->>'surname'
  )) as full_name,
  
  api_response->>'email' as email,
  COALESCE(api_response->>'mobile', api_response->>'phone') as phone_number,
  (api_response->>'date_of_birth')::date as birth_date,
  
  collected_at as last_sync_at,
  collected_at as created_at,
  collected_at as updated_at

FROM employes_raw_data
WHERE endpoint = '/employee'
  AND is_latest = true
ORDER BY full_name;

GRANT SELECT ON staff TO authenticated;
GRANT SELECT ON staff TO service_role;
```

---

## 🎯 PHASE 2: SHARED UTILITIES (Days 4-5)

### **Create: `supabase/functions/employes-shared/`**

This will be imported by all other services.

**File Structure:**
```
supabase/functions/employes-shared/
├── types.ts          # All TypeScript interfaces
├── auth.ts           # API key and JWT handling
├── logger.ts         # Structured logging
├── temporal.ts       # Temporal helper functions
└── index.ts          # Exports everything
```

**Next steps will create each file...**

---

## 🎯 READY TO START?

Let's begin with **Phase 1: Database Foundation!**

Shall I create the migration file and deploy it? 🚀
