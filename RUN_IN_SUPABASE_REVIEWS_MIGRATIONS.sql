-- =====================================================
-- REVIEWS SYSTEM MIGRATIONS - MANUAL RUN
-- =====================================================
-- Run this directly in Supabase SQL Editor
-- Project: gjlgaufihseaagzmidhc
-- Date: 2025-10-16
-- 
-- Instructions:
-- 1. Open Supabase Dashboard
-- 2. Go to SQL Editor
-- 3. Paste and run this entire script
-- =====================================================

BEGIN;

-- =====================================================
-- PART 1: FIX REVIEWS SYSTEM SCHEMA
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

-- Update status enum
ALTER TABLE staff_reviews DROP CONSTRAINT IF EXISTS staff_reviews_status_check;
ALTER TABLE staff_reviews ADD CONSTRAINT staff_reviews_status_check 
  CHECK (status IN (
    'draft', 'scheduled', 'in_progress', 'completed', 
    'approved', 'overdue', 'cancelled', 'archived'
  ));

-- Update review_type enum
ALTER TABLE staff_reviews DROP CONSTRAINT IF EXISTS staff_reviews_review_type_check;
ALTER TABLE staff_reviews ADD CONSTRAINT staff_reviews_review_type_check 
  CHECK (review_type IN (
    'probation', 'six_month', 'yearly', 'exit', 'performance', 'custom'
  ));

-- Update review_templates table
ALTER TABLE review_templates
  ADD COLUMN IF NOT EXISTS criteria JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS scoring_method TEXT DEFAULT 'five_star' CHECK (scoring_method IN ('five_star', 'percentage', 'qualitative'));

ALTER TABLE review_templates DROP CONSTRAINT IF EXISTS review_templates_type_check;
ALTER TABLE review_templates ADD CONSTRAINT review_templates_type_check 
  CHECK (type IN ('probation', 'six_month', 'yearly', 'exit', 'performance', 'custom'));

-- Create review_schedules table
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

CREATE INDEX IF NOT EXISTS idx_review_schedules_staff_id ON review_schedules(staff_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_review_schedules_next_due_date ON review_schedules(next_due_date) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_review_schedules_template_id ON review_schedules(template_id);

-- Create overdue_reviews view
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

-- Update review_calendar view
DROP VIEW IF EXISTS review_calendar CASCADE;

CREATE VIEW review_calendar AS
SELECT 
  sr.id,
  sr.staff_id,
  sr.review_type,
  sr.review_date,
  sr.due_date,
  sr.status,
  sr.reviewer_id,
  sr.template_id,
  CASE 
    WHEN sr.due_date < CURRENT_DATE AND sr.status NOT IN ('completed', 'approved', 'cancelled') THEN 'overdue'
    WHEN sr.due_date <= CURRENT_DATE + INTERVAL '7 days' AND sr.status NOT IN ('completed', 'approved', 'cancelled') THEN 'due_soon'
    ELSE 'upcoming'
  END as urgency,
  COALESCE(sr.due_date, sr.review_date) as calendar_date
FROM staff_reviews sr
WHERE sr.status NOT IN ('cancelled', 'archived')
ORDER BY calendar_date ASC;

-- Update staff_review_summary view
DROP VIEW IF EXISTS staff_review_summary CASCADE;

CREATE VIEW staff_review_summary AS
SELECT 
  sr.staff_id,
  COUNT(*) as total_reviews,
  COUNT(*) FILTER (WHERE sr.status = 'completed') as completed_reviews,
  COUNT(*) FILTER (WHERE sr.status = 'approved') as approved_reviews,
  COUNT(*) FILTER (WHERE sr.review_date > CURRENT_DATE - INTERVAL '1 year') as reviews_last_year,
  AVG(sr.star_rating) as avg_star_rating,
  MAX(sr.star_rating) as highest_star_rating,
  COUNT(*) FILTER (WHERE sr.star_rating = 5) as five_star_count,
  AVG(sr.overall_rating) as avg_overall_rating,
  MAX(sr.overall_rating) as highest_overall_rating,
  MIN(sr.overall_rating) as lowest_overall_rating,
  AVG(sr.overall_score) as avg_overall_score,
  MIN(sr.review_date) as first_review_date,
  MAX(sr.review_date) as last_review_date,
  MAX(sr.review_date) FILTER (WHERE sr.review_type = 'yearly') + INTERVAL '1 year' as next_review_due,
  COUNT(*) FILTER (WHERE sr.due_date < CURRENT_DATE AND sr.status NOT IN ('completed', 'approved', 'cancelled', 'archived')) as overdue_count
FROM staff_reviews sr
WHERE sr.status NOT IN ('cancelled', 'archived')
GROUP BY sr.staff_id;

-- Update performance_trends view
DROP VIEW IF EXISTS performance_trends CASCADE;

CREATE VIEW performance_trends AS
SELECT 
  sr.staff_id,
  EXTRACT(YEAR FROM sr.review_date)::INT as review_year,
  EXTRACT(QUARTER FROM sr.review_date)::INT as review_quarter,
  COUNT(*) as review_count,
  AVG(sr.star_rating) as avg_rating,
  MIN(sr.star_rating) as min_rating,
  MAX(sr.star_rating) as max_rating,
  AVG(sr.overall_score) as avg_score,
  MIN(sr.overall_score) as min_score,
  MAX(sr.overall_score) as max_score,
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

-- Create staff_reviews_needed view
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

-- Add triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_staff_reviews_updated_at ON staff_reviews;
CREATE TRIGGER update_staff_reviews_updated_at
  BEFORE UPDATE ON staff_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_review_templates_updated_at ON review_templates;
CREATE TRIGGER update_review_templates_updated_at
  BEFORE UPDATE ON review_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_review_schedules_updated_at ON review_schedules;
CREATE TRIGGER update_review_schedules_updated_at
  BEFORE UPDATE ON review_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PART 2: SEED REVIEW TEMPLATES
-- =====================================================

-- 1. Probation Period Review
INSERT INTO review_templates (name, type, description, questions, criteria, scoring_method, is_active)
VALUES (
  'Probation Period Review',
  'probation',
  'Standard review template for employees during their probation period',
  '[{"question": "How well has the employee adapted to the role and company culture?", "type": "rating", "required": true}, {"question": "Has the employee demonstrated the core competencies required for this position?", "type": "boolean", "required": true}, {"question": "What are the employee''s key strengths observed so far?", "type": "text", "required": true}, {"question": "Are there any areas where additional training or support is needed?", "type": "text", "required": false}, {"question": "Rate the employee''s communication and teamwork", "type": "rating", "required": true}, {"question": "Rate the employee''s work quality and attention to detail", "type": "rating", "required": true}, {"question": "Should this employee''s probation period be confirmed?", "type": "select", "required": true, "options": ["Confirm employment", "Extend probation period", "Terminate employment"]}]'::jsonb,
  '{"adaptation": 20, "competencies": 20, "communication": 20, "work_quality": 20, "teamwork": 20}'::jsonb,
  'five_star',
  true
) ON CONFLICT DO NOTHING;

-- 2. 6-Month Review
INSERT INTO review_templates (name, type, description, questions, criteria, scoring_method, is_active)
VALUES (
  '6-Month Performance Review',
  'six_month',
  'Standard 6-month check-in review for all employees',
  '[{"question": "How would you rate the employee''s overall performance in the past 6 months?", "type": "rating", "required": true}, {"question": "What are the employee''s most significant achievements?", "type": "text", "required": true}, {"question": "Rate the quality and consistency of work delivered", "type": "rating", "required": true}, {"question": "Rate the employee''s initiative and problem-solving ability", "type": "rating", "required": true}, {"question": "Rate teamwork and collaboration with colleagues", "type": "rating", "required": true}, {"question": "Rate communication skills (verbal and written)", "type": "rating", "required": true}, {"question": "What areas should the employee focus on for development?", "type": "text", "required": true}, {"question": "Are the employee''s goals from the last review being met?", "type": "boolean", "required": false}]'::jsonb,
  '{"overall_performance": 20, "work_quality": 20, "initiative": 15, "teamwork": 15, "communication": 15, "goal_achievement": 15}'::jsonb,
  'five_star',
  true
) ON CONFLICT DO NOTHING;

-- 3. Annual Review
INSERT INTO review_templates (name, type, description, questions, criteria, scoring_method, is_active)
VALUES (
  'Annual Performance Review',
  'yearly',
  'Comprehensive annual review template with focus on achievements, goals, and career development',
  '[{"question": "Overall performance rating for the year", "type": "rating", "required": true}, {"question": "What were the employee''s most significant accomplishments this year?", "type": "text", "required": true}, {"question": "Were the goals set in the previous review achieved?", "type": "select", "required": true, "options": ["All goals achieved", "Most goals achieved", "Some goals achieved", "Goals not achieved"]}, {"question": "Rate job knowledge and expertise", "type": "rating", "required": true}, {"question": "Rate quality of work and attention to detail", "type": "rating", "required": true}, {"question": "Rate productivity and time management", "type": "rating", "required": true}, {"question": "Rate leadership and mentoring (if applicable)", "type": "rating", "required": false}, {"question": "Rate adaptability and learning agility", "type": "rating", "required": true}, {"question": "Rate communication and interpersonal skills", "type": "rating", "required": true}, {"question": "What are the key development areas for the coming year?", "type": "text", "required": true}, {"question": "What are the employee''s career aspirations?", "type": "text", "required": false}, {"question": "Is the employee ready for promotion or increased responsibilities?", "type": "boolean", "required": false}, {"question": "Salary recommendation", "type": "select", "required": true, "options": ["Recommend increase", "Maintain current", "Under review", "Not recommended"]}]'::jsonb,
  '{"overall_performance": 15, "job_knowledge": 15, "work_quality": 15, "productivity": 15, "communication": 10, "adaptability": 10, "leadership": 10, "goal_achievement": 10}'::jsonb,
  'five_star',
  true
) ON CONFLICT DO NOTHING;

-- 4. Performance Review
INSERT INTO review_templates (name, type, description, questions, criteria, scoring_method, is_active)
VALUES (
  'Performance Improvement Review',
  'performance',
  'Special review template for addressing performance concerns or tracking improvement',
  '[{"question": "What is the primary reason for this performance review?", "type": "text", "required": true}, {"question": "Have the previously identified performance issues improved?", "type": "select", "required": true, "options": ["Significant improvement", "Some improvement", "No improvement", "Worsened"]}, {"question": "Rate current performance level", "type": "rating", "required": true}, {"question": "What specific concerns need to be addressed?", "type": "text", "required": true}, {"question": "What support or resources have been provided?", "type": "text", "required": true}, {"question": "What are the clear expectations and goals going forward?", "type": "text", "required": true}, {"question": "Timeline for next performance review", "type": "select", "required": true, "options": ["1 month", "2 months", "3 months"]}, {"question": "What are the consequences if improvement is not demonstrated?", "type": "text", "required": true}]'::jsonb,
  '{"current_performance": 30, "improvement_progress": 30, "goal_clarity": 20, "engagement": 20}'::jsonb,
  'five_star',
  true
) ON CONFLICT DO NOTHING;

-- 5. Exit Interview
INSERT INTO review_templates (name, type, description, questions, criteria, scoring_method, is_active)
VALUES (
  'Exit Interview Review',
  'exit',
  'Exit interview template for departing employees to gather feedback and insights',
  '[{"question": "What is the primary reason for leaving?", "type": "select", "required": true, "options": ["Career advancement", "Better compensation", "Work-life balance", "Relocation", "Company culture", "Management issues", "Personal reasons", "Other"]}, {"question": "Would you recommend this company as a place to work?", "type": "boolean", "required": true}, {"question": "Rate your overall satisfaction with your role", "type": "rating", "required": true}, {"question": "Rate your satisfaction with management and leadership", "type": "rating", "required": true}, {"question": "Rate the work environment and company culture", "type": "rating", "required": true}, {"question": "Rate professional development and growth opportunities", "type": "rating", "required": true}, {"question": "What did you enjoy most about working here?", "type": "text", "required": false}, {"question": "What could the company improve?", "type": "text", "required": true}, {"question": "Did you feel supported in your role?", "type": "boolean", "required": true}, {"question": "Would you consider returning to the company in the future?", "type": "boolean", "required": false}, {"question": "Any additional feedback or comments?", "type": "text", "required": false}]'::jsonb,
  '{"role_satisfaction": 25, "management_satisfaction": 25, "culture_rating": 25, "development_opportunities": 25}'::jsonb,
  'five_star',
  true
) ON CONFLICT DO NOTHING;

-- 6. Custom Review
INSERT INTO review_templates (name, type, description, questions, criteria, scoring_method, is_active)
VALUES (
  'Custom Review Template',
  'custom',
  'Flexible template for custom review situations',
  '[{"question": "What is the purpose of this review?", "type": "text", "required": true}, {"question": "Overall performance rating", "type": "rating", "required": true}, {"question": "Key strengths demonstrated", "type": "text", "required": true}, {"question": "Areas for development", "type": "text", "required": true}, {"question": "Additional notes and observations", "type": "text", "required": false}]'::jsonb,
  '{"overall_performance": 50, "strengths": 25, "development": 25}'::jsonb,
  'five_star',
  true
) ON CONFLICT DO NOTHING;

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to confirm everything worked:

SELECT 'Review Templates Count:' as check_name, COUNT(*)::text as result FROM review_templates
UNION ALL
SELECT 'Review Schedules Table Exists:', CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'review_schedules') THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 'Overdue Reviews View Exists:', CASE WHEN EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'overdue_reviews') THEN 'YES' ELSE 'NO' END
UNION ALL
SELECT 'Star Rating Column Exists:', CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_reviews' AND column_name = 'star_rating') THEN 'YES' ELSE 'NO' END;

-- Show all review templates
SELECT id, name, type, scoring_method FROM review_templates ORDER BY type;

