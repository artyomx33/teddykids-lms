-- =====================================================
-- TIMELINE GENERATOR - CORRECT EXTRACTION
-- =====================================================
-- Extracts ONLY fields that exist in /employments endpoint
-- Based on verified JSON structure analysis
-- =====================================================

DROP FUNCTION IF EXISTS generate_timeline_v2(UUID);

CREATE OR REPLACE FUNCTION generate_timeline_v2(p_employee_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_change RECORD;
  v_raw_employment JSONB;
  v_event_count INTEGER := 0;
  
  -- Fields from change events:
  v_salary_at_event NUMERIC;
  v_hours_at_event NUMERIC;
  
  -- Fields from /employments raw data (VERIFIED TO EXIST):
  v_contract_type TEXT;
  v_employment_type TEXT;
  v_contract_start DATE;
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
  
  -- Extract fields from /employments (ONLY verified fields)
  IF v_raw_employment IS NOT NULL THEN
    -- Contract type from contracts array (definite or permanent)
    IF jsonb_array_length(v_raw_employment->'contracts') > 0 THEN
      v_contract_type := v_raw_employment->'contracts'->0->>'contract_duration';
    END IF;
    
    -- Employment type from hours array (fulltime or parttime)
    IF jsonb_array_length(v_raw_employment->'hours') > 0 THEN
      v_employment_type := v_raw_employment->'hours'->0->>'employee_type';
    END IF;
    
    -- Contract start date
    v_contract_start := (v_raw_employment->>'start_date')::DATE;
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
    
    -- Insert timeline event
    INSERT INTO employes_timeline_v2 (
      employee_id,
      event_type,
      event_date,
      event_title,
      event_description,
      
      -- From change events:
      salary_at_event,
      hours_at_event,
      
      -- From /employments raw data:
      contract_type_at_event,
      employment_type_at_event,
      contract_start_date,
      
      -- LMS-specific fields (left NULL, can be populated by LMS later):
      role_at_event,              -- NULL - LMS has "Position" elsewhere
      department_at_event,        -- NULL - Not in Employes.nl data
      contract_end_date,          -- NULL - Not in Employes.nl data
      contract_phase,             -- NULL - Not in Employes.nl data
      
      -- Change metadata:
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
      
      -- Values from THIS event (may be NULL):
      v_salary_at_event,
      v_hours_at_event,
      
      -- Context from /employments raw data (verified fields only):
      v_contract_type,
      v_employment_type,
      v_contract_start,
      
      -- LMS fields (NULL for now):
      NULL,  -- role_at_event
      NULL,  -- department_at_event
      NULL,  -- contract_end_date
      NULL,  -- contract_phase
      
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
'Generates timeline events with verified Employes.nl data only. Extracts: contract_type, employment_type, contract_start_date from /employments endpoint. LMS-specific fields (role, department) left NULL for manual input.';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Timeline generator updated with correct extraction!';
  RAISE NOTICE ' ';
  RAISE NOTICE '📊 Extracting from /employments:';
  RAISE NOTICE '   - contract_type (permanent/definite)';
  RAISE NOTICE '   - employment_type (fulltime/parttime)';
  RAISE NOTICE '   - contract_start_date';
  RAISE NOTICE ' ';
  RAISE NOTICE '📊 From change events:';
  RAISE NOTICE '   - salary_at_event';
  RAISE NOTICE '   - hours_at_event';
  RAISE NOTICE ' ';
  RAISE NOTICE '⚠️  LMS fields left NULL:';
  RAISE NOTICE '   - role_at_event (use Position from contract form)';
  RAISE NOTICE '   - department_at_event (not needed)';
  RAISE NOTICE '   - contract_end_date (not in raw data)';
  RAISE NOTICE '   - contract_phase (not in raw data)';
END $$;

