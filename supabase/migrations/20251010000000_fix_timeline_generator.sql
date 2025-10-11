-- =====================================================
-- MIGRATION: Fix Timeline Generator Data Extraction
-- Created: 2025-10-10
-- Purpose: Add missing columns and populate salary/hours data
-- =====================================================

BEGIN;

-- =====================================================
-- 1. ADD MISSING COLUMNS TO TABLE
-- =====================================================

-- Add salary and hours columns if they don't exist
ALTER TABLE employes_timeline_v2 
  ADD COLUMN IF NOT EXISTS salary_at_event NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS hours_at_event NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS previous_value JSONB,
  ADD COLUMN IF NOT EXISTS new_value JSONB,
  ADD COLUMN IF NOT EXISTS change_amount NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS change_percentage NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS change_reason TEXT,
  ADD COLUMN IF NOT EXISTS is_milestone BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS milestone_type TEXT,
  ADD COLUMN IF NOT EXISTS source_change_id UUID REFERENCES employes_changes(id);

-- Create index for source_change_id
CREATE INDEX IF NOT EXISTS idx_timeline_v2_source_change 
  ON employes_timeline_v2(source_change_id);

-- =====================================================
-- 2. DROP OLD FUNCTION
-- =====================================================

DROP FUNCTION IF EXISTS generate_timeline_v2(UUID);

-- =====================================================
-- 3. CREATE FIXED TIMELINE GENERATOR
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
      v_event_title TEXT;
      v_description TEXT;
      v_is_milestone BOOLEAN := false;
      v_milestone_type TEXT := NULL;
      v_salary_at_event NUMERIC := NULL;
      v_hours_at_event NUMERIC := NULL;
      v_previous_value JSONB := NULL;
      v_new_value JSONB := NULL;
    BEGIN
      -- ═══════════════════════════════════════════════════════
      -- DETERMINE EVENT TYPE
      -- ═══════════════════════════════════════════════════════
      
      -- Salary changes
      IF v_change.change_type = 'salary_change' THEN
        IF v_change.change_amount > 0 THEN
          v_event_type := 'salary_increase';
          v_event_title := 'Salary Increase';
          v_description := 'Salary increased by €' || v_change.change_amount;
          IF v_change.change_percent > 10 THEN
            v_is_milestone := true;
            v_milestone_type := 'major_increase';
          END IF;
        ELSE
          v_event_type := 'salary_decrease';
          v_event_title := 'Salary Decrease';
          v_description := 'Salary decreased by €' || ABS(v_change.change_amount);
        END IF;
      
      -- Hours changes
      ELSIF v_change.change_type = 'hours_change' THEN
        v_event_type := 'hours_change';
        v_event_title := 'Hours Change';
        v_description := 'Working hours changed';
        
      -- Contract changes
      ELSIF v_change.change_type = 'contract_change' THEN
        v_event_type := 'contract_change';
        v_event_title := 'Contract Change';
        v_description := 'Contract type changed';
        v_is_milestone := true;
        v_milestone_type := 'contract_upgrade';
      
      ELSE
        v_event_type := v_change.change_type;
        v_event_title := INITCAP(REPLACE(v_change.change_type, '_', ' '));
        v_description := COALESCE(v_change.business_impact, 'Employment change');
      END IF;
      
      -- ═══════════════════════════════════════════════════════
      -- EXTRACT SALARY AT EVENT (✅ FIXED)
      -- Try metadata.new_monthly first, fallback to new_value
      -- ═══════════════════════════════════════════════════════
      
      v_salary_at_event := COALESCE(
        (v_change.metadata->>'new_monthly')::NUMERIC,
        CASE 
          WHEN v_change.change_type = 'salary_change' 
          THEN v_change.new_value::NUMERIC 
        END
      );
      
      -- ═══════════════════════════════════════════════════════
      -- EXTRACT HOURS AT EVENT (✅ FIXED - WAS MISSING)
      -- Try metadata.new_hours first, fallback to new_value
      -- ═══════════════════════════════════════════════════════
      
      v_hours_at_event := COALESCE(
        (v_change.metadata->>'new_hours')::NUMERIC,
        CASE 
          WHEN v_change.change_type = 'hours_change' 
          THEN v_change.new_value::NUMERIC 
        END
      );
      
      -- ═══════════════════════════════════════════════════════
      -- BUILD STRUCTURED PREVIOUS_VALUE JSONB (✅ FIXED)
      -- Include both salary and hours so frontend extractor works
      -- ═══════════════════════════════════════════════════════
      
      v_previous_value := jsonb_build_object(
        'monthly_wage', 
        COALESCE(
          (v_change.metadata->>'old_monthly')::NUMERIC,
          CASE 
            WHEN v_change.change_type = 'salary_change' 
            THEN v_change.old_value::NUMERIC 
          END
        ),
        'hours_per_week', 
        COALESCE(
          (v_change.metadata->>'old_hours')::NUMERIC,
          CASE 
            WHEN v_change.change_type = 'hours_change' 
            THEN v_change.old_value::NUMERIC 
          END
        )
      );
      
      -- ═══════════════════════════════════════════════════════
      -- BUILD STRUCTURED NEW_VALUE JSONB (✅ FIXED)
      -- Include both salary and hours so frontend extractor works
      -- ═══════════════════════════════════════════════════════
      
      v_new_value := jsonb_build_object(
        'monthly_wage', 
        COALESCE(
          (v_change.metadata->>'new_monthly')::NUMERIC,
          CASE 
            WHEN v_change.change_type = 'salary_change' 
            THEN v_change.new_value::NUMERIC 
          END
        ),
        'hours_per_week', 
        COALESCE(
          (v_change.metadata->>'new_hours')::NUMERIC,
          CASE 
            WHEN v_change.change_type = 'hours_change' 
            THEN v_change.new_value::NUMERIC 
          END
        )
      );
      
      -- ═══════════════════════════════════════════════════════
      -- INSERT TIMELINE EVENT (✅ ALL FIELDS INCLUDED)
      -- ═══════════════════════════════════════════════════════
      
      INSERT INTO employes_timeline_v2 (
        employee_id,
        event_type,
        event_date,
        event_title,
        event_description,
        salary_at_event,
        hours_at_event,
        previous_value,
        new_value,
        change_amount,
        change_percentage,
        change_reason,
        is_milestone,
        milestone_type,
        source_change_id,
        event_data
      ) VALUES (
        p_employee_id,
        v_event_type,
        v_change.effective_date,
        v_event_title,
        v_description,
        v_salary_at_event,
        v_hours_at_event,
        v_previous_value,
        v_new_value,
        v_change.change_amount,
        v_change.change_percent,
        v_change.business_impact,
        v_is_milestone,
        v_milestone_type,
        v_change.id,
        jsonb_build_object(
          'salary', v_salary_at_event,
          'hours', v_hours_at_event,
          'previous', v_previous_value,
          'new', v_new_value
        )
      );
      
      v_count := v_count + 1;
    END;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. REGENERATE TIMELINE FOR ALL EMPLOYEES
-- =====================================================

DO $$
DECLARE
  v_employee_id UUID;
  v_events INTEGER;
  v_total INTEGER := 0;
BEGIN
  RAISE NOTICE 'Regenerating timeline for all employees...';
  
  FOR v_employee_id IN 
    SELECT DISTINCT employee_id::UUID
    FROM employes_changes
    WHERE is_duplicate = false
  LOOP
    v_events := generate_timeline_v2(v_employee_id);
    v_total := v_total + v_events;
    
    IF v_events > 0 THEN
      RAISE NOTICE 'Employee %: % events', v_employee_id, v_events;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Complete! Regenerated % total events', v_total;
END $$;

-- =====================================================
-- 5. VERIFY DATA QUALITY
-- =====================================================

DO $$
DECLARE
  v_stats RECORD;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE 'Data Quality Report:';
  RAISE NOTICE '========================================';
  
  FOR v_stats IN
    SELECT 
      event_type,
      COUNT(*) as total,
      COUNT(salary_at_event) as has_salary,
      COUNT(hours_at_event) as has_hours,
      COUNT(previous_value) as has_previous,
      COUNT(new_value) as has_new,
      ROUND(100.0 * COUNT(salary_at_event) / COUNT(*), 1) as salary_pct,
      ROUND(100.0 * COUNT(hours_at_event) / COUNT(*), 1) as hours_pct
    FROM employes_timeline_v2
    GROUP BY event_type
    ORDER BY total DESC
  LOOP
    RAISE NOTICE '% (% events):', v_stats.event_type, v_stats.total;
    RAISE NOTICE '  - Salary: %/% (% percent)', v_stats.has_salary, v_stats.total, v_stats.salary_pct;
    RAISE NOTICE '  - Hours: %/% (% percent)', v_stats.has_hours, v_stats.total, v_stats.hours_pct;
    RAISE NOTICE '  - JSONB: %/% previous, %/% new', 
      v_stats.has_previous, v_stats.total,
      v_stats.has_new, v_stats.total;
  END LOOP;
  
  RAISE NOTICE '========================================';
END $$;

COMMIT;

-- =====================================================
-- SUCCESS! 🎉
-- =====================================================
-- Added columns to employes_timeline_v2:
-- ✅ salary_at_event, hours_at_event
-- ✅ previous_value, new_value (structured JSONB)
-- ✅ change_amount, change_percentage
-- ✅ is_milestone, milestone_type
-- ✅ source_change_id
--
-- Timeline generator now properly extracts:
-- ✅ salary from metadata.new_monthly
-- ✅ hours from metadata.new_hours
-- ✅ previous_value as structured JSONB
-- ✅ new_value as structured JSONB
-- =====================================================
