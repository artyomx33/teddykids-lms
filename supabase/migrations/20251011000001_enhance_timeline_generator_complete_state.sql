-- =====================================================
-- ENHANCED TIMELINE GENERATOR - Complete Temporal State
-- =====================================================
-- Extracts ALL employment fields from raw data, not just
-- salary and hours. Creates complete snapshots at each event.
-- =====================================================

DROP FUNCTION IF EXISTS generate_timeline_v2(UUID);

CREATE OR REPLACE FUNCTION generate_timeline_v2(p_employee_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_change RECORD;
  v_raw_employment JSONB;
  v_event_count INTEGER := 0;
  v_salary_at_event NUMERIC;
  v_hours_at_event NUMERIC;
  v_role TEXT;
  v_department TEXT;
  v_contract_type TEXT;
  v_employment_type TEXT;
  v_contract_start DATE;
  v_contract_end DATE;
  v_contract_phase TEXT;
BEGIN
  
  -- Delete existing timeline for this employee
  DELETE FROM employes_timeline_v2 WHERE employee_id = p_employee_id;
  
  -- Get the latest raw employment data for this employee
  SELECT api_response INTO v_raw_employment
  FROM employes_raw_data
  WHERE employee_id = p_employee_id::TEXT
    AND endpoint = '/employments'
    AND is_latest = true
  LIMIT 1;
  
  -- Extract fields from raw employment data (will be used as defaults)
  IF v_raw_employment IS NOT NULL THEN
    v_role := v_raw_employment->'function'->>'name';
    v_department := v_raw_employment->'cost_center'->>'name';
    v_contract_type := v_raw_employment->'contract'->>'contract_type';
    v_employment_type := v_raw_employment->>'employment_type';
    v_contract_start := (v_raw_employment->>'start_date')::DATE;
    v_contract_end := (v_raw_employment->>'end_date')::DATE;
    v_contract_phase := v_raw_employment->'contract'->>'phase';
  END IF;
  
  -- Process each change chronologically
  FOR v_change IN 
    SELECT * FROM employes_changes
    WHERE employee_id = p_employee_id
      AND is_duplicate = false
    ORDER BY detected_at ASC
  LOOP
    
    -- Extract salary from change metadata
    v_salary_at_event := NULL;
    IF v_change.metadata ? 'new_monthly' THEN
      v_salary_at_event := (v_change.metadata->>'new_monthly')::NUMERIC;
    ELSIF v_change.change_type = 'salary_change' THEN
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
    
    -- Extract hours from change metadata
    v_hours_at_event := NULL;
    IF v_change.metadata ? 'new_hours' THEN
      v_hours_at_event := (v_change.metadata->>'new_hours')::NUMERIC;
    ELSIF v_change.change_type = 'hours_change' THEN
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
    
    -- Insert timeline event with COMPLETE employment data
    INSERT INTO employes_timeline_v2 (
      employee_id,
      event_type,
      event_date,
      event_title,
      event_description,
      salary_at_event,
      hours_at_event,
      role_at_event,
      department_at_event,
      contract_type_at_event,
      employment_type_at_event,
      contract_start_date,
      contract_end_date,
      contract_phase,
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
      
      -- Values that changed in THIS event (may be NULL)
      v_salary_at_event,
      v_hours_at_event,
      
      -- Complete employment context from raw data
      v_role,
      v_department,
      v_contract_type,
      v_employment_type,
      v_contract_start,
      v_contract_end,
      v_contract_phase,
      
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
  
  RETURN v_event_count;
END;
$$ LANGUAGE plpgsql;

-- Add helpful comment
COMMENT ON FUNCTION generate_timeline_v2(UUID) IS 
'Generates complete temporal state timeline events. Extracts changed values (salary/hours) from employes_changes and complete employment context (role, department, contract) from employes_raw_data.';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Enhanced timeline generator created!';
  RAISE NOTICE '   - Extracts salary/hours from change events';
  RAISE NOTICE '   - Extracts role, department, contract from raw data';
  RAISE NOTICE '   - Creates complete employment snapshots';
  RAISE NOTICE ' ';
  RAISE NOTICE '📋 Next: Run state completion to fill NULL values';
END $$;

