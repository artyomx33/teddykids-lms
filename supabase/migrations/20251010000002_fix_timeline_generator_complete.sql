-- =====================================================
-- TIMELINE GENERATOR FIX - Complete & Correct Version
-- =====================================================
-- This migration fixes the generate_timeline_v2 function to:
-- 1. Use correct column names (detected_at, field_path)
-- 2. Extract salary/hours from metadata JSONB
-- 3. Build proper structured JSONB for previous_value and new_value
-- =====================================================

-- Drop old version
DROP FUNCTION IF EXISTS generate_timeline_v2(UUID);

-- Create corrected version
CREATE OR REPLACE FUNCTION generate_timeline_v2(p_employee_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_change RECORD;
  v_event_count INTEGER := 0;
  v_salary_at_event NUMERIC;
  v_hours_at_event NUMERIC;
BEGIN
  
  -- Delete existing timeline for this employee
  DELETE FROM employes_timeline_v2 WHERE employee_id = p_employee_id;
  
  RAISE NOTICE 'Processing employee: %', p_employee_id;
  
  -- Process each change
  FOR v_change IN 
    SELECT * FROM employes_changes
    WHERE employee_id = p_employee_id
      AND is_duplicate = false
    ORDER BY detected_at ASC
  LOOP
    
    -- Extract salary from metadata or raw value
    v_salary_at_event := NULL;
    IF v_change.metadata ? 'new_monthly' THEN
      v_salary_at_event := (v_change.metadata->>'new_monthly')::NUMERIC;
    ELSIF v_change.change_type = 'salary_change' THEN
      -- Fallback: try to extract from new_value JSONB or cast directly
      BEGIN
        IF jsonb_typeof(v_change.new_value) = 'number' THEN
          v_salary_at_event := (v_change.new_value)::TEXT::NUMERIC;
        ELSIF jsonb_typeof(v_change.new_value) = 'string' THEN
          v_salary_at_event := (v_change.new_value::TEXT)::NUMERIC;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        v_salary_at_event := NULL;
      END;
    END IF;
    
    -- Extract hours from metadata or raw value
    v_hours_at_event := NULL;
    IF v_change.metadata ? 'new_hours' THEN
      v_hours_at_event := (v_change.metadata->>'new_hours')::NUMERIC;
    ELSIF v_change.change_type = 'hours_change' THEN
      -- Fallback: try to extract from new_value JSONB or cast directly
      BEGIN
        IF jsonb_typeof(v_change.new_value) = 'number' THEN
          v_hours_at_event := (v_change.new_value)::TEXT::NUMERIC;
        ELSIF jsonb_typeof(v_change.new_value) = 'string' THEN
          v_hours_at_event := (v_change.new_value::TEXT)::NUMERIC;
        END IF;
      EXCEPTION WHEN OTHERS THEN
        v_hours_at_event := NULL;
      END;
    END IF;
    
    -- Insert timeline event
    INSERT INTO employes_timeline_v2 (
      employee_id,
      event_type,
      event_date,
      event_title,
      event_description,
      salary_at_event,
      hours_at_event,
      previous_value,
      new_value
    ) VALUES (
      p_employee_id,
      v_change.change_type,
      v_change.detected_at,
      
      -- Generate user-friendly title
      CASE v_change.change_type
        WHEN 'salary_change' THEN 'Salary Change'
        WHEN 'hours_change' THEN 'Hours Change'
        WHEN 'contract_change' THEN 'Contract Change'
        ELSE 'Employment Change'
      END,
      
      -- Description from field_path
      v_change.field_path,
      
      -- Salary at event
      v_salary_at_event,
      
      -- Hours at event
      v_hours_at_event,
      
      -- Build structured previous_value JSONB
      jsonb_build_object(
        'monthly_wage', v_change.metadata->>'old_monthly',
        'hours_per_week', v_change.metadata->>'old_hours',
        'raw_old_value', v_change.old_value
      ),
      
      -- Build structured new_value JSONB
      jsonb_build_object(
        'monthly_wage', v_change.metadata->>'new_monthly',
        'hours_per_week', v_change.metadata->>'new_hours',
        'raw_new_value', v_change.new_value
      )
    );
    
    v_event_count := v_event_count + 1;
  END LOOP;
  
  RAISE NOTICE 'Generated % events for employee %', v_event_count, p_employee_id;
  
  RETURN v_event_count;
END;
$$ LANGUAGE plpgsql;

-- Add helpful comment
COMMENT ON FUNCTION generate_timeline_v2(UUID) IS 
'Generates timeline events from employes_changes table. Uses detected_at (not effective_date) and field_path (not field_name). Extracts salary/hours from metadata JSONB.';

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '✅ Timeline generator function fixed and ready!';
  RAISE NOTICE '📋 Next step: Regenerate timelines by calling generate_timeline_v2() for each employee';
END $$;

