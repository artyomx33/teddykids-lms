-- Phase 2: Staff Reviews System - Clean Migration
-- Step-by-step approach to ensure no errors

-- Step 1: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Create review_templates table
CREATE TABLE public.review_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]',
  criteria JSONB NOT NULL DEFAULT '{}',
  scoring_method TEXT DEFAULT 'five_star',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID
);

-- Step 3: Create staff_reviews table
CREATE TABLE public.staff_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL,
  template_id UUID,
  reviewer_id UUID,
  review_type TEXT NOT NULL,
  review_period_start DATE,
  review_period_end DATE,
  review_date DATE NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'scheduled',
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  responses JSONB DEFAULT '{}',
  summary TEXT,
  goals_previous JSONB DEFAULT '[]',
  goals_next JSONB DEFAULT '[]',
  development_areas TEXT[],
  achievements TEXT[],
  overall_score DECIMAL(3,2),
  score_breakdown JSONB DEFAULT '{}',
  star_rating INTEGER,
  performance_level TEXT,
  promotion_ready BOOLEAN DEFAULT false,
  salary_recommendation TEXT,
  signed_by_employee BOOLEAN DEFAULT false,
  signed_by_reviewer BOOLEAN DEFAULT false,
  employee_signature_date TIMESTAMPTZ,
  reviewer_signature_date TIMESTAMPTZ,
  document_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Step 4: Create review_schedules table
CREATE TABLE public.review_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL,
  template_id UUID NOT NULL,
  frequency_months INTEGER NOT NULL DEFAULT 6,
  next_due_date DATE NOT NULL,
  auto_schedule BOOLEAN DEFAULT true,
  grace_period_days INTEGER DEFAULT 7,
  reminder_days_before INTEGER DEFAULT 14,
  is_active BOOLEAN DEFAULT true,
  last_completed_review_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Step 5: Create review_notes table
CREATE TABLE public.review_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL,
  author_id UUID NOT NULL,
  note_type TEXT DEFAULT 'general',
  content TEXT NOT NULL,
  is_private BOOLEAN DEFAULT false,
  visible_to_employee BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Step 6: Create performance_metrics table
CREATE TABLE public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL,
  review_id UUID,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10,2),
  metric_target DECIMAL(10,2),
  metric_unit TEXT,
  performance_level TEXT,
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Step 7: Add foreign key constraints
ALTER TABLE public.review_templates
ADD CONSTRAINT fk_review_templates_created_by
FOREIGN KEY (created_by) REFERENCES auth.users(id);

ALTER TABLE public.staff_reviews
ADD CONSTRAINT fk_staff_reviews_staff_id
FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE CASCADE;

ALTER TABLE public.staff_reviews
ADD CONSTRAINT fk_staff_reviews_template_id
FOREIGN KEY (template_id) REFERENCES public.review_templates(id);

ALTER TABLE public.staff_reviews
ADD CONSTRAINT fk_staff_reviews_reviewer_id
FOREIGN KEY (reviewer_id) REFERENCES public.staff(id);

ALTER TABLE public.review_schedules
ADD CONSTRAINT fk_review_schedules_staff_id
FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE CASCADE;

ALTER TABLE public.review_schedules
ADD CONSTRAINT fk_review_schedules_template_id
FOREIGN KEY (template_id) REFERENCES public.review_templates(id);

ALTER TABLE public.review_schedules
ADD CONSTRAINT fk_review_schedules_last_completed
FOREIGN KEY (last_completed_review_id) REFERENCES public.staff_reviews(id);

ALTER TABLE public.review_notes
ADD CONSTRAINT fk_review_notes_review_id
FOREIGN KEY (review_id) REFERENCES public.staff_reviews(id) ON DELETE CASCADE;

ALTER TABLE public.review_notes
ADD CONSTRAINT fk_review_notes_author_id
FOREIGN KEY (author_id) REFERENCES public.staff(id);

ALTER TABLE public.performance_metrics
ADD CONSTRAINT fk_performance_metrics_staff_id
FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE CASCADE;

ALTER TABLE public.performance_metrics
ADD CONSTRAINT fk_performance_metrics_review_id
FOREIGN KEY (review_id) REFERENCES public.staff_reviews(id);

-- Step 8: Add check constraints
ALTER TABLE public.review_templates
ADD CONSTRAINT chk_review_templates_type
CHECK (type IN ('six_month', 'yearly', 'performance', 'probation', 'custom'));

ALTER TABLE public.review_templates
ADD CONSTRAINT chk_review_templates_scoring_method
CHECK (scoring_method IN ('five_star', 'percentage', 'qualitative'));

ALTER TABLE public.staff_reviews
ADD CONSTRAINT chk_staff_reviews_review_type
CHECK (review_type IN ('six_month', 'yearly', 'performance', 'probation', 'exit'));

ALTER TABLE public.staff_reviews
ADD CONSTRAINT chk_staff_reviews_status
CHECK (status IN ('scheduled', 'in_progress', 'completed', 'overdue', 'cancelled'));

ALTER TABLE public.staff_reviews
ADD CONSTRAINT chk_staff_reviews_overall_score
CHECK (overall_score >= 0 AND overall_score <= 5);

ALTER TABLE public.staff_reviews
ADD CONSTRAINT chk_staff_reviews_star_rating
CHECK (star_rating >= 1 AND star_rating <= 5);

ALTER TABLE public.staff_reviews
ADD CONSTRAINT chk_staff_reviews_performance_level
CHECK (performance_level IN ('exceptional', 'exceeds', 'meets', 'below', 'unsatisfactory'));

ALTER TABLE public.staff_reviews
ADD CONSTRAINT chk_staff_reviews_salary_recommendation
CHECK (salary_recommendation IN ('increase', 'maintain', 'review', 'decrease'));

ALTER TABLE public.review_notes
ADD CONSTRAINT chk_review_notes_note_type
CHECK (note_type IN ('general', 'improvement', 'achievement', 'concern', 'goal'));

ALTER TABLE public.performance_metrics
ADD CONSTRAINT chk_performance_metrics_level
CHECK (performance_level IN ('exceptional', 'exceeds', 'meets', 'below', 'unsatisfactory'));

-- Step 9: Add unique constraints
ALTER TABLE public.review_templates
ADD CONSTRAINT unq_review_templates_type_name
UNIQUE(type, name);

ALTER TABLE public.review_schedules
ADD CONSTRAINT unq_review_schedules_staff_template
UNIQUE(staff_id, template_id);

-- Step 10: Create indexes for performance
CREATE INDEX idx_staff_reviews_staff_id ON public.staff_reviews (staff_id);
CREATE INDEX idx_staff_reviews_status ON public.staff_reviews (status);
CREATE INDEX idx_staff_reviews_due_date ON public.staff_reviews (due_date);
CREATE INDEX idx_staff_reviews_review_date ON public.staff_reviews (review_date);
CREATE INDEX idx_staff_reviews_reviewer ON public.staff_reviews (reviewer_id);
CREATE INDEX idx_review_notes_review_id ON public.review_notes (review_id);
CREATE INDEX idx_review_notes_author ON public.review_notes (author_id);
CREATE INDEX idx_performance_metrics_staff_id ON public.performance_metrics (staff_id);
CREATE INDEX idx_performance_metrics_period ON public.performance_metrics (period_start, period_end);

-- Step 11: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 12: Apply updated_at triggers
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

-- Step 13: Enable RLS
ALTER TABLE public.review_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Step 14: Create RLS policies
CREATE POLICY "review_templates_read" ON public.review_templates
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "review_templates_admin_full" ON public.review_templates
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

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

CREATE POLICY "review_schedules_read" ON public.review_schedules
  FOR SELECT TO authenticated
  USING (
    staff_id = auth.uid() OR
    auth.jwt() ->> 'role' IN ('admin', 'manager')
  );

CREATE POLICY "review_schedules_manage" ON public.review_schedules
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'manager'));

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

CREATE POLICY "performance_metrics_read" ON public.performance_metrics
  FOR SELECT TO authenticated
  USING (
    staff_id = auth.uid() OR
    auth.jwt() ->> 'role' IN ('admin', 'manager')
  );

CREATE POLICY "performance_metrics_manage" ON public.performance_metrics
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'manager'));

-- Step 15: Insert default templates
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
);

-- Step 16: Create analytics views
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
  MIN(rs.next_due_date) as next_review_due
FROM public.staff s
LEFT JOIN public.staff_reviews sr ON s.id = sr.staff_id
LEFT JOIN public.review_schedules rs ON s.id = rs.staff_id AND rs.is_active = true
GROUP BY s.id, s.full_name, s.position;

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

-- Step 17: Grant permissions
GRANT SELECT ON public.review_templates TO authenticated;
GRANT SELECT ON public.staff_reviews TO authenticated;
GRANT SELECT ON public.review_schedules TO authenticated;
GRANT SELECT ON public.review_notes TO authenticated;
GRANT SELECT ON public.performance_metrics TO authenticated;
GRANT SELECT ON public.staff_review_summary TO authenticated;
GRANT SELECT ON public.overdue_reviews TO authenticated;
GRANT SELECT ON public.review_calendar TO authenticated;
GRANT SELECT ON public.performance_trends TO authenticated;

-- Step 18: Add comments
COMMENT ON TABLE public.review_templates IS 'Templates for different types of performance reviews';
COMMENT ON TABLE public.staff_reviews IS 'Individual staff performance reviews with comprehensive tracking';
COMMENT ON TABLE public.review_schedules IS 'Automated scheduling configuration for recurring reviews';
COMMENT ON TABLE public.review_notes IS 'Additional notes and comments for reviews';
COMMENT ON TABLE public.performance_metrics IS 'Quantitative performance metrics and KPIs';
COMMENT ON VIEW public.staff_review_summary IS 'Summary statistics for each staff member''s review history';
COMMENT ON VIEW public.overdue_reviews IS 'All reviews that are past their due date';
COMMENT ON VIEW public.review_calendar IS 'Calendar view of upcoming and overdue reviews';
COMMENT ON VIEW public.performance_trends IS 'Performance trends over time for analytics';