-- =====================================================
-- MIGRATION: Timeline System V2 (Clean)
-- Created: 2025-10-06
-- Purpose: Beautiful employment history visualization
-- Philosophy: Make data easy to understand
-- =====================================================

BEGIN;

-- =====================================================
-- 1. CREATE TIMELINE TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS employes_timeline_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL,
  
  -- Event details
  event_type TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_description TEXT,
  
  -- Snapshot of values at this point
  salary_at_event DECIMAL(10,2),
  hours_at_event DECIMAL(5,2),
  role_at_event TEXT,
  department_at_event TEXT,
  
  -- Change details
  previous_value JSONB,
  new_value JSONB,
  change_amount DECIMAL(10,2),
  change_percentage DECIMAL(5,2),
  
  -- Context
  change_reason TEXT,
  is_milestone BOOLEAN DEFAULT false,
  milestone_type TEXT,
  
  -- Metadata
  source_change_id UUID REFERENCES employes_changes(id),
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_timeline_v2_employee 
  ON employes_timeline_v2(employee_id, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_v2_type 
  ON employes_timeline_v2(event_type);
CREATE INDEX IF NOT EXISTS idx_timeline_v2_milestones 
  ON employes_timeline_v2(employee_id) WHERE is_milestone = true;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON employes_timeline_v2 TO authenticated;

-- =====================================================
-- 2. CREATE SIMPLE TIMELINE GENERATOR
-- =====================================================

CREATE OR REPLACE FUNCTION generate_timeline_v2(p_employee_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_change RECORD;
BEGIN
  -- Clear existing timeline for this employee
  DELETE FROM employes_timeline_v2 WHERE employee_id = p_employee_id;
  
  -- Process each change
  FOR v_change IN 
    SELECT * FROM employes_changes
    WHERE employee_id = p_employee_id::TEXT
      AND is_duplicate = false
    ORDER BY effective_date ASC
  LOOP
    -- Determine event type
    DECLARE
      v_event_type TEXT;
      v_description TEXT;
      v_is_milestone BOOLEAN := false;
      v_milestone_type TEXT := NULL;
    BEGIN
      -- Salary changes
      IF v_change.change_type = 'salary_change' THEN
        IF v_change.change_amount > 0 THEN
          v_event_type := 'salary_increase';
          v_description := 'Salary increased by €' || v_change.change_amount;
          IF v_change.change_percent > 10 THEN
            v_is_milestone := true;
            v_milestone_type := 'major_increase';
          END IF;
        ELSE
          v_event_type := 'salary_decrease';
          v_description := 'Salary decreased by €' || ABS(v_change.change_amount);
        END IF;
      
      -- Hours changes
      ELSIF v_change.change_type = 'hours_change' THEN
        v_event_type := 'hours_change';
        v_description := 'Working hours changed';
        
      -- Contract changes
      ELSIF v_change.change_type = 'contract_change' THEN
        v_event_type := 'contract_change';
        v_description := 'Contract type changed';
        v_is_milestone := true;
        v_milestone_type := 'contract_upgrade';
      
      ELSE
        v_event_type := v_change.change_type;
        v_description := COALESCE(v_change.business_impact, 'Employment change');
      END IF;
      
      -- Insert timeline event
      INSERT INTO employes_timeline_v2 (
        employee_id,
        event_type,
        event_date,
        event_description,
        salary_at_event,
        previous_value,
        new_value,
        change_amount,
        change_percentage,
        change_reason,
        is_milestone,
        milestone_type,
        source_change_id
      ) VALUES (
        p_employee_id,
        v_event_type,
        v_change.effective_date::DATE,
        v_description,
        CASE WHEN v_change.change_type = 'salary_change' THEN (v_change.new_value::TEXT)::NUMERIC ELSE NULL END,
        v_change.old_value,
        v_change.new_value,
        v_change.change_amount,
        v_change.change_percent,
        v_change.business_impact,
        v_is_milestone,
        v_milestone_type,
        v_change.id
      );
      
      v_count := v_count + 1;
    END;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. CREATE HELPER VIEWS
-- =====================================================

CREATE OR REPLACE VIEW v_timeline_summary AS
SELECT 
  employee_id,
  COUNT(*) as total_events,
  COUNT(*) FILTER (WHERE is_milestone = true) as milestone_count,
  MIN(event_date) as first_event,
  MAX(event_date) as last_event,
  MAX(salary_at_event) as highest_salary
FROM employes_timeline_v2
GROUP BY employee_id;

GRANT SELECT ON v_timeline_summary TO authenticated;

-- =====================================================
-- 4. BACKFILL TIMELINE
-- =====================================================

DO $$
DECLARE
  v_employee_id UUID;
  v_total INTEGER := 0;
  v_events INTEGER;
BEGIN
  RAISE NOTICE 'Starting timeline backfill...';
  
  FOR v_employee_id IN 
    SELECT DISTINCT employee_id::UUID
    FROM employes_changes
    WHERE is_duplicate = false
    LIMIT 5  -- Start with just 5 employees for testing
  LOOP
    v_events := generate_timeline_v2(v_employee_id);
    v_total := v_total + v_events;
    RAISE NOTICE 'Employee %: % events', v_employee_id, v_events;
  END LOOP;
  
  RAISE NOTICE 'Backfill complete: % total events', v_total;
END $$;

COMMIT;

-- =====================================================
-- SUCCESS!
-- =====================================================
