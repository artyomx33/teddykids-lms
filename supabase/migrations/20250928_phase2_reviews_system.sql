-- Phase 2: Staff & Reviews System Database Migration
-- Date: 2025-09-28
-- Purpose: Comprehensive review management system with templates, scheduling, and analytics

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- REVIEW TEMPLATES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.review_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('six_month', 'yearly', 'performance', 'probation', 'custom')),
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]',
  criteria JSONB NOT NULL DEFAULT '{}',
  scoring_method TEXT DEFAULT 'five_star' CHECK (scoring_method IN ('five_star', 'percentage', 'qualitative')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),

  -- Unique constraint for template types
  UNIQUE(type, name)
);

-- =============================================
-- STAFF REVIEWS TABLE (Enhanced)
-- =============================================
CREATE TABLE IF NOT EXISTS public.staff_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.review_templates(id),
  reviewer_id UUID REFERENCES public.staff(id),

  -- Review Details
  review_type TEXT NOT NULL CHECK (review_type IN ('six_month', 'yearly', 'performance', 'probation', 'exit')),
  review_period_start DATE,
  review_period_end DATE,
  review_date DATE NOT NULL,
  due_date DATE,

  -- Scheduling & Status
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'overdue', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Review Content
  responses JSONB DEFAULT '{}',
  summary TEXT,
  goals_previous JSONB DEFAULT '[]',
  goals_next JSONB DEFAULT '[]',
  development_areas TEXT[],
  achievements TEXT[],

  -- Scoring
  overall_score DECIMAL(3,2) CHECK (overall_score >= 0 AND overall_score <= 5),
  score_breakdown JSONB DEFAULT '{}',
  star_rating INTEGER CHECK (star_rating >= 1 AND star_rating <= 5),

  -- Performance Indicators
  performance_level TEXT CHECK (performance_level IN ('exceptional', 'exceeds', 'meets', 'below', 'unsatisfactory')),
  promotion_ready BOOLEAN DEFAULT false,
  salary_recommendation TEXT CHECK (salary_recommendation IN ('increase', 'maintain', 'review', 'decrease')),

  -- Document Management
  signed_by_employee BOOLEAN DEFAULT false,
  signed_by_reviewer BOOLEAN DEFAULT false,
  employee_signature_date TIMESTAMPTZ,
  reviewer_signature_date TIMESTAMPTZ,
  document_path TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Indexes for performance
  INDEX idx_staff_reviews_staff_id (staff_id),
  INDEX idx_staff_reviews_status (status),
  INDEX idx_staff_reviews_due_date (due_date),
  INDEX idx_staff_reviews_review_date (review_date),
  INDEX idx_staff_reviews_reviewer (reviewer_id)
);

-- =============================================
-- REVIEW SCHEDULES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.review_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.review_templates(id),

  -- Scheduling Configuration
  frequency_months INTEGER NOT NULL DEFAULT 6,
  next_due_date DATE NOT NULL,
  auto_schedule BOOLEAN DEFAULT true,

  -- Business Rules
  grace_period_days INTEGER DEFAULT 7,
  reminder_days_before INTEGER DEFAULT 14,

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_completed_review_id UUID REFERENCES public.staff_reviews(id),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure one schedule per staff per template type
  UNIQUE(staff_id, template_id)
);

-- =============================================
-- REVIEW NOTES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.review_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES public.staff_reviews(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.staff(id),

  -- Note Content
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'improvement', 'achievement', 'concern', 'goal')),
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false,

  -- Visibility & Security
  visible_to_employee BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  INDEX idx_review_notes_review_id (review_id),
  INDEX idx_review_notes_author (author_id)
);

-- =============================================
-- PERFORMANCE METRICS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  review_id UUID REFERENCES public.staff_reviews(id),

  -- Metric Details
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10,2),
  metric_target DECIMAL(10,2),
  metric_unit TEXT,

  -- Performance Assessment
  performance_level TEXT CHECK (performance_level IN ('exceptional', 'exceeds', 'meets', 'below', 'unsatisfactory')),

  -- Tracking Period
  period_start DATE,
  period_end DATE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),

  INDEX idx_performance_metrics_staff_id (staff_id),
  INDEX idx_performance_metrics_period (period_start, period_end)
);

-- =============================================
-- REVIEW REMINDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.review_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES public.staff_reviews(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES public.review_schedules(id) ON DELETE CASCADE,

  -- Reminder Configuration
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('due_soon', 'overdue', 'scheduled', 'completion')),
  send_date DATE NOT NULL,

  -- Recipients
  recipient_staff_id UUID REFERENCES public.staff(id),
  recipient_email TEXT,

  -- Status
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'failed')),

  -- Content
  subject TEXT,
  message TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),

  INDEX idx_review_reminders_send_date (send_date),
  INDEX idx_review_reminders_status (status)
);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_review_templates_updated_at
  BEFORE UPDATE ON public.review_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_reviews_updated_at
  BEFORE UPDATE ON public.staff_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_schedules_updated_at
  BEFORE UPDATE ON public.review_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_notes_updated_at
  BEFORE UPDATE ON public.review_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.review_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_reminders ENABLE ROW LEVEL SECURITY;

-- Review Templates - Admins and managers can read, only admins can modify
CREATE POLICY "review_templates_read" ON public.review_templates
  FOR SELECT TO authenticated
  USING (true); -- All authenticated users can read templates

CREATE POLICY "review_templates_admin_full" ON public.review_templates
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Staff Reviews - Complex access based on roles and relationships
CREATE POLICY "staff_reviews_read_own_or_manager" ON public.staff_reviews
  FOR SELECT TO authenticated
  USING (
    staff_id = auth.uid() OR
    reviewer_id = auth.uid() OR
    auth.jwt() ->> 'role' IN ('admin', 'manager')
  );

CREATE POLICY "staff_reviews_create_manager" ON public.staff_reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    reviewer_id = auth.uid() OR
    auth.jwt() ->> 'role' IN ('admin', 'manager')
  );

CREATE POLICY "staff_reviews_update_own_or_reviewer" ON public.staff_reviews
  FOR UPDATE TO authenticated
  USING (
    reviewer_id = auth.uid() OR
    auth.jwt() ->> 'role' = 'admin'
  );

-- Review Schedules - Similar to reviews
CREATE POLICY "review_schedules_read" ON public.review_schedules
  FOR SELECT TO authenticated
  USING (
    staff_id = auth.uid() OR
    auth.jwt() ->> 'role' IN ('admin', 'manager')
  );

CREATE POLICY "review_schedules_manage" ON public.review_schedules
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'manager'));

-- Review Notes - Authors and related parties can access
CREATE POLICY "review_notes_read" ON public.review_notes
  FOR SELECT TO authenticated
  USING (
    author_id = auth.uid() OR
    (SELECT staff_id FROM public.staff_reviews WHERE id = review_id) = auth.uid() OR
    auth.jwt() ->> 'role' IN ('admin', 'manager')
  );

CREATE POLICY "review_notes_create" ON public.review_notes
  FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid());

-- Performance Metrics - Staff can read own, managers can read all
CREATE POLICY "performance_metrics_read" ON public.performance_metrics
  FOR SELECT TO authenticated
  USING (
    staff_id = auth.uid() OR
    auth.jwt() ->> 'role' IN ('admin', 'manager')
  );

CREATE POLICY "performance_metrics_manage" ON public.performance_metrics
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'manager'));

-- Review Reminders - Recipients and admins can access
CREATE POLICY "review_reminders_read" ON public.review_reminders
  FOR SELECT TO authenticated
  USING (
    recipient_staff_id = auth.uid() OR
    auth.jwt() ->> 'role' IN ('admin', 'manager')
  );

-- =============================================
-- SEED DATA - DEFAULT TEMPLATES
-- =============================================

INSERT INTO public.review_templates (name, type, description, questions, criteria) VALUES
('Six Month Review', 'six_month', 'Standard 6-month performance review',
 '[
   {"question": "How would you rate your overall performance this period?", "type": "rating", "required": true},
   {"question": "What were your key achievements?", "type": "text", "required": true},
   {"question": "What areas would you like to develop?", "type": "text", "required": false},
   {"question": "Do you feel supported by your manager?", "type": "boolean", "required": true},
   {"question": "Rate your job satisfaction", "type": "rating", "required": true}
 ]',
 '{"attendance": 20, "quality": 30, "communication": 20, "teamwork": 15, "initiative": 15}'
),
('Yearly Review', 'yearly', 'Comprehensive annual performance review',
 '[
   {"question": "Overall performance rating", "type": "rating", "required": true},
   {"question": "Major accomplishments this year", "type": "text", "required": true},
   {"question": "Areas for improvement", "type": "text", "required": true},
   {"question": "Career development goals", "type": "text", "required": true},
   {"question": "Training needs", "type": "text", "required": false},
   {"question": "Salary review discussion", "type": "text", "required": false}
 ]',
 '{"performance": 40, "goals_achievement": 25, "professional_development": 20, "leadership": 15}'
),
('Probation Review', 'probation', 'Review for staff during probation period',
 '[
   {"question": "Meeting job requirements?", "type": "boolean", "required": true},
   {"question": "Areas of strength", "type": "text", "required": true},
   {"question": "Areas needing improvement", "type": "text", "required": true},
   {"question": "Support needed", "type": "text", "required": false},
   {"question": "Recommendation for continuation", "type": "select", "options": ["continue", "extend_probation", "terminate"], "required": true}
 ]',
 '{"job_requirements": 50, "attitude": 25, "learning_curve": 25}'
)
ON CONFLICT (type, name) DO NOTHING;

-- =============================================
-- ANALYTICS VIEWS
-- =============================================

-- Staff Review Summary View
CREATE OR REPLACE VIEW public.staff_review_summary AS
SELECT
  s.id as staff_id,
  s.full_name,
  s.position,
  COUNT(sr.id) as total_reviews,
  AVG(sr.star_rating) as avg_star_rating,
  AVG(sr.overall_score) as avg_overall_score,
  MAX(sr.review_date) as last_review_date,
  COUNT(sr.id) FILTER (WHERE sr.star_rating = 5) as five_star_count,
  COUNT(sr.id) FILTER (WHERE sr.status = 'overdue') as overdue_count,
  -- Next review due date from schedules
  MIN(rs.next_due_date) as next_review_due
FROM public.staff s
LEFT JOIN public.staff_reviews sr ON s.id = sr.staff_id
LEFT JOIN public.review_schedules rs ON s.id = rs.staff_id AND rs.is_active = true
GROUP BY s.id, s.full_name, s.position;

-- Overdue Reviews View
CREATE OR REPLACE VIEW public.overdue_reviews AS
SELECT
  sr.id,
  sr.staff_id,
  s.full_name,
  s.position,
  sr.review_type,
  sr.due_date,
  CURRENT_DATE - sr.due_date as days_overdue,
  sr.reviewer_id,
  reviewer.full_name as reviewer_name
FROM public.staff_reviews sr
JOIN public.staff s ON sr.staff_id = s.id
LEFT JOIN public.staff reviewer ON sr.reviewer_id = reviewer.id
WHERE sr.status IN ('scheduled', 'in_progress')
  AND sr.due_date < CURRENT_DATE
ORDER BY sr.due_date ASC;

-- Review Calendar View
CREATE OR REPLACE VIEW public.review_calendar AS
SELECT
  sr.id,
  sr.staff_id,
  s.full_name,
  sr.review_type,
  sr.review_date,
  sr.due_date,
  sr.status,
  sr.reviewer_id,
  reviewer.full_name as reviewer_name,
  CASE
    WHEN sr.due_date < CURRENT_DATE THEN 'overdue'
    WHEN sr.due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'due_soon'
    ELSE 'upcoming'
  END as urgency
FROM public.staff_reviews sr
JOIN public.staff s ON sr.staff_id = s.id
LEFT JOIN public.staff reviewer ON sr.reviewer_id = reviewer.id
WHERE sr.status IN ('scheduled', 'in_progress')
ORDER BY sr.due_date ASC;

-- Performance Trends View
CREATE OR REPLACE VIEW public.performance_trends AS
SELECT
  staff_id,
  EXTRACT(YEAR FROM review_date) as review_year,
  EXTRACT(QUARTER FROM review_date) as review_quarter,
  AVG(star_rating) as avg_rating,
  AVG(overall_score) as avg_score,
  COUNT(*) as review_count
FROM public.staff_reviews
WHERE star_rating IS NOT NULL
  AND overall_score IS NOT NULL
  AND status = 'completed'
GROUP BY staff_id, EXTRACT(YEAR FROM review_date), EXTRACT(QUARTER FROM review_date)
ORDER BY staff_id, review_year, review_quarter;

-- Grant permissions on views
GRANT SELECT ON public.staff_review_summary TO authenticated;
GRANT SELECT ON public.overdue_reviews TO authenticated;
GRANT SELECT ON public.review_calendar TO authenticated;
GRANT SELECT ON public.performance_trends TO authenticated;

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE public.review_templates IS 'Templates for different types of performance reviews';
COMMENT ON TABLE public.staff_reviews IS 'Individual staff performance reviews with comprehensive tracking';
COMMENT ON TABLE public.review_schedules IS 'Automated scheduling configuration for recurring reviews';
COMMENT ON TABLE public.review_notes IS 'Additional notes and comments for reviews';
COMMENT ON TABLE public.performance_metrics IS 'Quantitative performance metrics and KPIs';
COMMENT ON TABLE public.review_reminders IS 'System for sending review reminders and notifications';

COMMENT ON VIEW public.staff_review_summary IS 'Summary statistics for each staff member''s review history';
COMMENT ON VIEW public.overdue_reviews IS 'All reviews that are past their due date';
COMMENT ON VIEW public.review_calendar IS 'Calendar view of upcoming and overdue reviews';
COMMENT ON VIEW public.performance_trends IS 'Performance trends over time for analytics';