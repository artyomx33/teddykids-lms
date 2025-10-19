-- =====================================================
-- FIX REVIEWS SYSTEM SCHEMA MISMATCH
-- =====================================================
-- This migration fixes the mismatch between the database schema
-- and the frontend expectations for the Reviews System
-- Date: 2025-10-16
-- Phase 1: Debug & Fix Current System

-- =====================================================
-- 1. ADD MISSING COLUMNS TO staff_reviews
-- =====================================================

-- Review period and scheduling fields
ALTER TABLE staff_reviews 
  ADD COLUMN IF NOT EXISTS review_period_start DATE,
  ADD COLUMN IF NOT EXISTS review_period_end DATE,
  ADD COLUMN IF NOT EXISTS due_date DATE,
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Performance assessment fields
ALTER TABLE staff_reviews
  ADD COLUMN IF NOT EXISTS summary TEXT,
  ADD COLUMN IF NOT EXISTS goals_previous JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS goals_next JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS development_areas JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS overall_score NUMERIC(5,2) CHECK (overall_score >= 0 AND overall_score <= 100),
  ADD COLUMN IF NOT EXISTS star_rating INTEGER CHECK (star_rating >= 1 AND star_rating <= 5),
  ADD COLUMN IF NOT EXISTS score_breakdown JSONB DEFAULT '{}'::jsonb;

-- Performance level and recommendations
ALTER TABLE staff_reviews
  ADD COLUMN IF NOT EXISTS performance_level TEXT CHECK (performance_level IN ('exceptional', 'exceeds', 'meets', 'below', 'unsatisfactory')),
  ADD COLUMN IF NOT EXISTS promotion_ready BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS salary_recommendation TEXT CHECK (salary_recommendation IN ('increase', 'maintain', 'review', 'decrease'));

-- Signature fields
ALTER TABLE staff_reviews
  ADD COLUMN IF NOT EXISTS signed_by_employee BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS signed_by_reviewer BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS employee_signature_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewer_signature_date TIMESTAMPTZ;

-- Document storage
ALTER TABLE staff_reviews
  ADD COLUMN IF NOT EXISTS document_path TEXT;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_staff_reviews_due_date ON staff_reviews(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_staff_reviews_scheduled_at ON staff_reviews(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_staff_reviews_star_rating ON staff_reviews(star_rating) WHERE star_rating IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_staff_reviews_performance_level ON staff_reviews(performance_level) WHERE performance_level IS NOT NULL;

-- =====================================================
-- 2. UPDATE REVIEW STATUS ENUM
-- =====================================================
-- The frontend expects different status values than the database has
-- DB has: 'draft', 'completed', 'approved', 'archived'
-- Frontend needs: 'scheduled', 'in_progress', 'completed', 'overdue', 'cancelled'
-- We'll keep both and add a mapping

-- Drop the old constraint
ALTER TABLE staff_reviews DROP CONSTRAINT IF EXISTS staff_reviews_status_check;

-- Add new constraint with all status values
ALTER TABLE staff_reviews ADD CONSTRAINT staff_reviews_status_check 
  CHECK (status IN (
    'draft', 'scheduled', 'in_progress', 'completed', 
    'approved', 'overdue', 'cancelled', 'archived'
  ));

-- =====================================================
-- 3. UPDATE REVIEW TYPES ENUM
-- =====================================================
-- Add 'performance' and 'custom' if not present

ALTER TABLE staff_reviews DROP CONSTRAINT IF EXISTS staff_reviews_review_type_check;

ALTER TABLE staff_reviews ADD CONSTRAINT staff_reviews_review_type_check 
  CHECK (review_type IN (
    'probation', 'six_month', 'yearly', 'exit', 'performance', 'custom'
  ));

-- =====================================================
-- 4. UPDATE review_templates TABLE
-- =====================================================

-- Add missing columns to review_templates
ALTER TABLE review_templates
  ADD COLUMN IF NOT EXISTS criteria JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS scoring_method TEXT DEFAULT 'five_star' CHECK (scoring_method IN ('five_star', 'percentage', 'qualitative'));

-- Update type constraint to include 'performance'
ALTER TABLE review_templates DROP CONSTRAINT IF EXISTS review_templates_type_check;
ALTER TABLE review_templates ADD CONSTRAINT review_templates_type_check 
  CHECK (type IN ('probation', 'six_month', 'yearly', 'exit', 'performance', 'custom'));

-- =====================================================
-- 5. CREATE review_schedules TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS review_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL,
  template_id UUID REFERENCES review_templates(id) ON DELETE SET NULL,
  frequency_months INTEGER NOT NULL CHECK (frequency_months > 0),
  next_due_date DATE NOT NULL,
  auto_schedule BOOLEAN DEFAULT true,
  grace_period_days INTEGER DEFAULT 7,
  reminder_days_before INTEGER DEFAULT 14,
  is_active BOOLEAN DEFAULT true,
  last_completed_review_id UUID REFERENCES staff_reviews(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for review_schedules
CREATE INDEX IF NOT EXISTS idx_review_schedules_staff_id ON review_schedules(staff_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_review_schedules_next_due_date ON review_schedules(next_due_date) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_review_schedules_template_id ON review_schedules(template_id);

-- =====================================================
-- 6. CREATE overdue_reviews VIEW
-- =====================================================

CREATE OR REPLACE VIEW overdue_reviews AS
SELECT 
  sr.id,
  sr.staff_id,
  sr.review_type,
  sr.review_date,
  sr.due_date,
  sr.status,
  sr.reviewer_id,
  CURRENT_DATE - sr.due_date as days_overdue,
  CASE 
    WHEN CURRENT_DATE - sr.due_date > 30 THEN 'critical'
    WHEN CURRENT_DATE - sr.due_date > 14 THEN 'high'
    WHEN CURRENT_DATE - sr.due_date > 7 THEN 'medium'
    ELSE 'low'
  END as urgency_level
FROM staff_reviews sr
WHERE sr.due_date < CURRENT_DATE
  AND sr.status NOT IN ('completed', 'approved', 'cancelled', 'archived')
ORDER BY sr.due_date ASC;

-- =====================================================
-- 7. UNIFIED CALENDAR VIEW 
-- =====================================================

DROP VIEW IF EXISTS review_calendar_unified;

CREATE VIEW review_calendar_unified AS
SELECT 
  CONCAT('review-completed-', sr.id) AS event_id,
  sr.review_date AS event_date,
  sr.review_date::date AS event_day,
  'review_completed' AS event_type,
  sr.staff_id,
  sr.review_type,
  sr.status,
  COALESCE(s.full_name, 'Unknown Staff') AS label,
  format('Review completed on %s', to_char(sr.review_date, 'YYYY-MM-DD')) AS description,
  'green'::text AS color,
  jsonb_build_object(
    'review_id', sr.id,
    'review_date', sr.review_date,
    'template_id', sr.template_id,
    'review_type', sr.review_type
  ) AS metadata
FROM staff_reviews sr
LEFT JOIN staff s ON sr.staff_id = s.id
WHERE sr.review_date IS NOT NULL
  AND sr.status IN ('completed', 'approved')

UNION ALL

SELECT 
  CONCAT('review-scheduled-', sr.id) AS event_id,
  sr.due_date AS event_date,
  sr.due_date::date AS event_day,
  'review_scheduled' AS event_type,
  sr.staff_id,
  sr.review_type,
  sr.status,
  COALESCE(s.full_name, 'Unknown Staff') AS label,
  format('Review scheduled for %s', to_char(sr.due_date, 'YYYY-MM-DD')) AS description,
  'amber'::text AS color,
  jsonb_build_object(
    'review_id', sr.id,
    'due_date', sr.due_date,
    'template_id', sr.template_id,
    'review_type', sr.review_type
  ) AS metadata
FROM staff_reviews sr
LEFT JOIN staff s ON sr.staff_id = s.id
WHERE sr.due_date IS NOT NULL
  AND sr.status IN ('scheduled', 'in_progress')

UNION ALL

SELECT 
  CONCAT('review-warning-', sr.id) AS event_id,
  COALESCE(sr.due_date, sr.review_date) AS event_date,
  COALESCE(sr.due_date, sr.review_date)::date AS event_day,
  'review_warning' AS event_type,
  sr.staff_id,
  sr.review_type,
  sr.status,
  COALESCE(s.full_name, 'Unknown Staff') AS label,
  format('Warning/exit review: %s', sr.review_type) AS description,
  'red'::text AS color,
  jsonb_build_object(
    'review_id', sr.id,
    'due_date', sr.due_date,
    'review_date', sr.review_date,
    'template_id', sr.template_id,
    'review_type', sr.review_type
  ) AS metadata
FROM staff_reviews sr
LEFT JOIN staff s ON sr.staff_id = s.id
WHERE sr.review_type IN ('warning', 'exit')

UNION ALL

SELECT
  CONCAT('contract-', etv.id::text) AS event_id,
  etv.event_date,
  etv.event_date::date AS event_day,
  etv.event_type,
  etv.employee_id AS staff_id,
  NULL::text AS review_type,
  'info'::text AS status,
  COALESCE(
    s.full_name,
    CONCAT_WS(' ', etv.first_name_at_event, etv.last_name_at_event),
    initcap(replace(etv.event_type, '_', ' '))
  ) AS label,
  COALESCE(
    etv.event_description,
    etv.manual_notes,
    format('%s change recorded', initcap(replace(etv.event_type, '_', ' ')))
  ) AS description,
  'purple'::text AS color,
  jsonb_build_object(
    'timeline_event_id', etv.id,
    'contract_pdf', etv.contract_pdf_path,
    'hours_per_week', etv.hours_per_week_at_event,
    'salary', etv.month_wage_at_event,
    'event_type', etv.event_type
  ) AS metadata
FROM employes_timeline_v2 etv
LEFT JOIN staff s ON etv.employee_id = s.id
WHERE etv.event_date IS NOT NULL
  AND etv.event_type IN ('contract_started', 'contract_ended', 'salary_increase');

-- =====================================================
-- 8. UPDATE staff_review_summary VIEW
-- =====================================================

DROP VIEW IF EXISTS staff_review_summary;

CREATE VIEW staff_review_summary AS
SELECT 
  sr.staff_id,
  COUNT(*) as total_reviews,
  COUNT(*) FILTER (WHERE sr.status = 'completed') as completed_reviews,
  COUNT(*) FILTER (WHERE sr.status = 'approved') as approved_reviews,
  COUNT(*) FILTER (WHERE sr.review_date > CURRENT_DATE - INTERVAL '1 year') as reviews_last_year,
  -- Star rating stats
  AVG(sr.star_rating) as avg_star_rating,
  MAX(sr.star_rating) as highest_star_rating,
  COUNT(*) FILTER (WHERE sr.star_rating = 5) as five_star_count,
  -- Overall rating stats (decimal 0-5)
  AVG(sr.overall_rating) as avg_overall_rating,
  MAX(sr.overall_rating) as highest_overall_rating,
  MIN(sr.overall_rating) as lowest_overall_rating,
  -- Overall score stats (0-100)
  AVG(sr.overall_score) as avg_overall_score,
  -- Dates
  MIN(sr.review_date) as first_review_date,
  MAX(sr.review_date) as last_review_date,
  -- Next review due (1 year from last yearly review)
  MAX(sr.review_date) FILTER (WHERE sr.review_type = 'yearly') + INTERVAL '1 year' as next_review_due,
  -- Overdue count
  COUNT(*) FILTER (WHERE sr.due_date < CURRENT_DATE AND sr.status NOT IN ('completed', 'approved', 'cancelled', 'archived')) as overdue_count
FROM staff_reviews sr
WHERE sr.status NOT IN ('cancelled', 'archived')
GROUP BY sr.staff_id;

-- =====================================================
-- 9. UPDATE performance_trends VIEW
-- =====================================================

DROP VIEW IF EXISTS performance_trends;

CREATE VIEW performance_trends AS
SELECT 
  sr.staff_id,
  EXTRACT(YEAR FROM sr.review_date)::INT as review_year,
  EXTRACT(QUARTER FROM sr.review_date)::INT as review_quarter,
  COUNT(*) as review_count,
  -- Star rating trends (1-5)
  AVG(sr.star_rating) as avg_rating,
  MIN(sr.star_rating) as min_rating,
  MAX(sr.star_rating) as max_rating,
  -- Overall score trends (0-100)
  AVG(sr.overall_score) as avg_score,
  MIN(sr.overall_score) as min_score,
  MAX(sr.overall_score) as max_score,
  -- Performance level distribution
  COUNT(*) FILTER (WHERE sr.performance_level = 'exceptional') as exceptional_count,
  COUNT(*) FILTER (WHERE sr.performance_level = 'exceeds') as exceeds_count,
  COUNT(*) FILTER (WHERE sr.performance_level = 'meets') as meets_count,
  COUNT(*) FILTER (WHERE sr.performance_level = 'below') as below_count,
  COUNT(*) FILTER (WHERE sr.performance_level = 'unsatisfactory') as unsatisfactory_count
FROM staff_reviews sr
WHERE sr.status IN ('completed', 'approved')
  AND (sr.star_rating IS NOT NULL OR sr.overall_rating IS NOT NULL OR sr.overall_score IS NOT NULL)
GROUP BY sr.staff_id, review_year, review_quarter
ORDER BY sr.staff_id, review_year DESC, review_quarter DESC;

-- =====================================================
-- 10. CREATE HELPER VIEW: staff_reviews_needed
-- =====================================================
-- This view identifies staff who need reviews based on employment dates

CREATE OR REPLACE VIEW staff_reviews_needed AS
WITH staff_review_status AS (
  SELECT 
    s.id as staff_id,
    s.full_name,
    s.department,
    s.location,
    MAX(sr.review_date) FILTER (WHERE sr.review_type = 'probation') as last_probation_review,
    MAX(sr.review_date) FILTER (WHERE sr.review_type = 'six_month') as last_six_month_review,
    MAX(sr.review_date) FILTER (WHERE sr.review_type = 'yearly') as last_yearly_review,
    MAX(sr.review_date) as last_any_review
  FROM staff s
  LEFT JOIN staff_reviews sr ON s.id = sr.staff_id AND sr.status IN ('completed', 'approved')
  GROUP BY s.id, s.full_name, s.department, s.location
)
SELECT 
  staff_id,
  full_name,
  department,
  location,
  last_any_review,
  CASE 
    WHEN last_probation_review IS NULL THEN 'probation'
    WHEN last_six_month_review IS NULL 
      OR last_six_month_review < CURRENT_DATE - INTERVAL '6 months' THEN 'six_month'
    WHEN last_yearly_review IS NULL 
      OR last_yearly_review < CURRENT_DATE - INTERVAL '1 year' THEN 'yearly'
    ELSE NULL
  END as suggested_review_type,
  CASE 
    WHEN last_any_review IS NULL THEN 999
    WHEN last_yearly_review < CURRENT_DATE - INTERVAL '1 year' THEN EXTRACT(DAY FROM CURRENT_DATE - last_yearly_review)::INT
    WHEN last_six_month_review < CURRENT_DATE - INTERVAL '6 months' THEN EXTRACT(DAY FROM CURRENT_DATE - last_six_month_review)::INT
    ELSE 0
  END as days_overdue
FROM staff_review_status
WHERE last_probation_review IS NULL 
  OR last_six_month_review IS NULL 
  OR last_six_month_review < CURRENT_DATE - INTERVAL '6 months'
  OR last_yearly_review IS NULL 
  OR last_yearly_review < CURRENT_DATE - INTERVAL '1 year'
ORDER BY days_overdue DESC, full_name;

-- =====================================================
-- 11. ADD TRIGGER FOR updated_at TIMESTAMPS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for staff_reviews
DROP TRIGGER IF EXISTS update_staff_reviews_updated_at ON staff_reviews;
CREATE TRIGGER update_staff_reviews_updated_at
  BEFORE UPDATE ON staff_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for review_templates
DROP TRIGGER IF EXISTS update_review_templates_updated_at ON review_templates;
CREATE TRIGGER update_review_templates_updated_at
  BEFORE UPDATE ON review_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for review_schedules
DROP TRIGGER IF EXISTS update_review_schedules_updated_at ON review_schedules;
CREATE TRIGGER update_review_schedules_updated_at
  BEFORE UPDATE ON review_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 12. ADD COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE staff_reviews IS 'Employee performance reviews with comprehensive tracking of ratings, goals, and signatures';
COMMENT ON TABLE review_templates IS 'Templates for different types of reviews with questions and scoring methods';
COMMENT ON TABLE review_schedules IS 'Automated scheduling for recurring reviews';

COMMENT ON VIEW overdue_reviews IS 'Reviews that are past their due date and not yet completed';
COMMENT ON VIEW review_calendar IS 'Calendar view of all reviews with urgency indicators';
COMMENT ON VIEW staff_review_summary IS 'Aggregate statistics for each staff member reviews';
COMMENT ON VIEW performance_trends IS 'Performance trends over time by quarter';
COMMENT ON VIEW staff_reviews_needed IS 'Staff members who need reviews based on schedule';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- The reviews system schema is now aligned with frontend expectations
-- Next steps:
-- 1. Seed default review templates
-- 2. Test review creation from frontend
-- 3. Verify all views return correct data

