-- =============================================
-- TEDDYKIDS HIRING WIDGET SYSTEM
-- Date: 2025-10-03
-- Purpose: Comprehensive hiring pipeline from widget to candidate management
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- POSITION TEMPLATES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.position_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  position_type TEXT CHECK (position_type IN ('full_time', 'part_time', 'internship', 'temporary', 'volunteer')),
  experience_level TEXT CHECK (experience_level IN ('entry', 'junior', 'mid', 'senior', 'expert')),
  description TEXT,
  requirements JSONB DEFAULT '[]',
  responsibilities JSONB DEFAULT '[]',
  benefits JSONB DEFAULT '[]',
  salary_range_min DECIMAL(10,2),
  salary_range_max DECIMAL(10,2),
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- =============================================
-- ASSESSMENT TEMPLATES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.assessment_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  assessment_type TEXT CHECK (assessment_type IN ('skills', 'personality', 'general', 'technical', 'cultural_fit')),
  questions JSONB NOT NULL DEFAULT '[]',
  scoring_method TEXT DEFAULT 'percentage' CHECK (scoring_method IN ('percentage', 'points', 'qualitative')),
  time_limit_minutes INTEGER,
  passing_score DECIMAL(5,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),

  UNIQUE(name, assessment_type)
);

-- =============================================
-- POSITION ASSESSMENTS MAPPING
-- =============================================
CREATE TABLE IF NOT EXISTS public.position_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  position_id UUID NOT NULL REFERENCES public.position_templates(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES public.assessment_templates(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT true,
  order_sequence INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(position_id, assessment_id)
);

-- =============================================
-- CANDIDATES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic Information
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  nationality TEXT,

  -- Address Information
  address_street TEXT,
  address_city TEXT,
  address_postal_code TEXT,
  address_country TEXT DEFAULT 'Netherlands',

  -- Professional Information
  current_position TEXT,
  current_company TEXT,
  years_experience INTEGER,
  education_level TEXT CHECK (education_level IN ('high_school', 'vocational', 'bachelor', 'master', 'phd', 'other')),

  -- Preferences
  preferred_positions TEXT[],
  preferred_departments TEXT[],
  preferred_work_type TEXT CHECK (preferred_work_type IN ('full_time', 'part_time', 'internship', 'temporary', 'volunteer')),
  available_start_date DATE,
  salary_expectation_min DECIMAL(10,2),
  salary_expectation_max DECIMAL(10,2),

  -- Application Status
  application_status TEXT DEFAULT 'applied' CHECK (application_status IN ('applied', 'screening', 'assessment', 'interview', 'offer', 'hired', 'rejected', 'withdrawn')),
  application_source TEXT DEFAULT 'widget' CHECK (application_source IN ('widget', 'referral', 'job_board', 'social_media', 'direct')),

  -- Documents
  cv_file_path TEXT,
  cover_letter_file_path TEXT,
  portfolio_file_path TEXT,

  -- GDPR Compliance
  privacy_consent BOOLEAN DEFAULT false,
  privacy_consent_date TIMESTAMPTZ,
  marketing_consent BOOLEAN DEFAULT false,
  data_retention_until DATE,

  -- Metadata
  widget_session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  referrer_url TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure unique email per candidate
  UNIQUE(email)
);

-- =============================================
-- CANDIDATE APPLICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.candidate_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  position_id UUID NOT NULL REFERENCES public.position_templates(id) ON DELETE CASCADE,

  -- Application Details
  application_date TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'assessment_pending', 'assessment_completed', 'interview_scheduled', 'interview_completed', 'offer_made', 'offer_accepted', 'offer_rejected', 'hired', 'rejected')),

  -- Scoring & Assessment
  overall_score DECIMAL(5,2),
  assessment_scores JSONB DEFAULT '{}',
  reviewer_notes TEXT,

  -- Interview Scheduling
  interview_scheduled_at TIMESTAMPTZ,
  interviewer_id UUID REFERENCES public.staff(id),
  interview_notes TEXT,
  interview_rating INTEGER CHECK (interview_rating >= 1 AND interview_rating <= 5),

  -- Decision Making
  decision TEXT CHECK (decision IN ('hire', 'reject', 'hold', 'pending')),
  decision_reason TEXT,
  decision_made_by UUID REFERENCES public.staff(id),
  decision_made_at TIMESTAMPTZ,

  -- Offer Details
  offer_salary DECIMAL(10,2),
  offer_start_date DATE,
  offer_expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- One application per candidate per position
  UNIQUE(candidate_id, position_id)
);

-- =============================================
-- CANDIDATE ASSESSMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.candidate_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES public.candidate_applications(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES public.assessment_templates(id) ON DELETE CASCADE,

  -- Assessment Execution
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'expired', 'skipped')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  -- Assessment Results
  responses JSONB DEFAULT '{}',
  score DECIMAL(5,2),
  max_score DECIMAL(5,2),
  percentage_score DECIMAL(5,2),
  passed BOOLEAN,

  -- Time Tracking
  time_spent_minutes INTEGER,

  -- Metadata
  session_data JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- One assessment per candidate per application
  UNIQUE(candidate_id, application_id, assessment_id)
);

-- =============================================
-- CANDIDATE COMMUNICATIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.candidate_communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  application_id UUID REFERENCES public.candidate_applications(id) ON DELETE CASCADE,

  -- Communication Details
  communication_type TEXT CHECK (communication_type IN ('email', 'phone', 'sms', 'in_person', 'video_call')),
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  subject TEXT,
  content TEXT,

  -- Participants
  from_staff_id UUID REFERENCES public.staff(id),
  to_email TEXT,
  cc_emails TEXT[],

  -- Status & Tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'responded', 'failed')),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,

  -- Attachments
  attachments JSONB DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- HIRING PIPELINE STAGES
-- =============================================
CREATE TABLE IF NOT EXISTS public.hiring_pipeline_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  order_sequence INTEGER NOT NULL,
  stage_type TEXT CHECK (stage_type IN ('application', 'screening', 'assessment', 'interview', 'decision', 'offer', 'onboarding')),
  is_active BOOLEAN DEFAULT true,
  auto_transition_rules JSONB DEFAULT '{}',
  required_actions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(name, order_sequence)
);

-- =============================================
-- CANDIDATE PIPELINE TRACKING
-- =============================================
CREATE TABLE IF NOT EXISTS public.candidate_pipeline_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES public.candidate_applications(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES public.hiring_pipeline_stages(id),

  -- Stage Tracking
  entered_at TIMESTAMPTZ DEFAULT now(),
  exited_at TIMESTAMPTZ,
  duration_hours DECIMAL(10,2),

  -- Stage Results
  stage_outcome TEXT CHECK (stage_outcome IN ('passed', 'failed', 'pending', 'skipped')),
  notes TEXT,

  -- Metadata
  moved_by UUID REFERENCES public.staff(id),
  automatic_transition BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- WIDGET ANALYTICS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.widget_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Session Information
  session_id TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  referrer_url TEXT,

  -- Widget Interaction
  event_type TEXT CHECK (event_type IN ('widget_load', 'form_start', 'form_step', 'form_complete', 'form_abandon', 'assessment_start', 'assessment_complete', 'file_upload')),
  event_data JSONB DEFAULT '{}',

  -- Timing
  timestamp TIMESTAMPTZ DEFAULT now(),

  -- Location & Device
  country TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,

  -- Conversion Tracking
  candidate_id UUID REFERENCES public.candidates(id),
  application_id UUID REFERENCES public.candidate_applications(id)
);

-- =============================================
-- CREATE INDEXES FOR PERFORMANCE
-- =============================================

-- Position Templates
CREATE INDEX IF NOT EXISTS idx_position_templates_active ON public.position_templates (is_active);
CREATE INDEX IF NOT EXISTS idx_position_templates_department ON public.position_templates (department);
CREATE INDEX IF NOT EXISTS idx_position_templates_type ON public.position_templates (position_type);

-- Assessment Templates
CREATE INDEX IF NOT EXISTS idx_assessment_templates_active ON public.assessment_templates (is_active);
CREATE INDEX IF NOT EXISTS idx_assessment_templates_type ON public.assessment_templates (assessment_type);

-- Candidates
CREATE INDEX IF NOT EXISTS idx_candidates_email ON public.candidates (email);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON public.candidates (application_status);
CREATE INDEX IF NOT EXISTS idx_candidates_source ON public.candidates (application_source);
CREATE INDEX IF NOT EXISTS idx_candidates_created ON public.candidates (created_at);

-- Candidate Applications
CREATE INDEX IF NOT EXISTS idx_applications_candidate ON public.candidate_applications (candidate_id);
CREATE INDEX IF NOT EXISTS idx_applications_position ON public.candidate_applications (position_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.candidate_applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_date ON public.candidate_applications (application_date);

-- Candidate Assessments
CREATE INDEX IF NOT EXISTS idx_assessments_candidate ON public.candidate_assessments (candidate_id);
CREATE INDEX IF NOT EXISTS idx_assessments_application ON public.candidate_assessments (application_id);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON public.candidate_assessments (status);

-- Communications
CREATE INDEX IF NOT EXISTS idx_communications_candidate ON public.candidate_communications (candidate_id);
CREATE INDEX IF NOT EXISTS idx_communications_type ON public.candidate_communications (communication_type);
CREATE INDEX IF NOT EXISTS idx_communications_sent ON public.candidate_communications (sent_at);

-- Pipeline History
CREATE INDEX IF NOT EXISTS idx_pipeline_candidate ON public.candidate_pipeline_history (candidate_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stage ON public.candidate_pipeline_history (stage_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_entered ON public.candidate_pipeline_history (entered_at);

-- Widget Analytics
CREATE INDEX IF NOT EXISTS idx_analytics_session ON public.widget_analytics (session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.widget_analytics (event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON public.widget_analytics (timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_candidate ON public.widget_analytics (candidate_id);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_position_templates_updated_at
  BEFORE UPDATE ON public.position_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_templates_updated_at
  BEFORE UPDATE ON public.assessment_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at
  BEFORE UPDATE ON public.candidates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidate_applications_updated_at
  BEFORE UPDATE ON public.candidate_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidate_assessments_updated_at
  BEFORE UPDATE ON public.candidate_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hiring_pipeline_stages_updated_at
  BEFORE UPDATE ON public.hiring_pipeline_stages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.position_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.position_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hiring_pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_pipeline_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widget_analytics ENABLE ROW LEVEL SECURITY;

-- Position Templates - Public read for active positions, admin manage
CREATE POLICY "position_templates_public_read" ON public.position_templates
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "position_templates_admin_manage" ON public.position_templates
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'hr'));

-- Assessment Templates - Admin and HR manage
CREATE POLICY "assessment_templates_admin_manage" ON public.assessment_templates
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'hr'));

-- Position Assessments - Admin and HR manage
CREATE POLICY "position_assessments_admin_manage" ON public.position_assessments
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'hr'));

-- Candidates - Public insert for applications, admin/hr read
CREATE POLICY "candidates_public_insert" ON public.candidates
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "candidates_admin_read" ON public.candidates
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'hr', 'manager'));

CREATE POLICY "candidates_admin_update" ON public.candidates
  FOR UPDATE TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'hr'));

-- Candidate Applications - Similar to candidates
CREATE POLICY "applications_public_insert" ON public.candidate_applications
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "applications_admin_manage" ON public.candidate_applications
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'hr', 'manager'));

-- Candidate Assessments - Public insert for taking assessments, admin manage
CREATE POLICY "assessments_public_access" ON public.candidate_assessments
  FOR ALL TO anon, authenticated
  USING (true);

CREATE POLICY "assessments_admin_manage" ON public.candidate_assessments
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'hr'));

-- Communications - Admin and HR manage
CREATE POLICY "communications_admin_manage" ON public.candidate_communications
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'hr', 'manager'));

-- Pipeline Stages - Admin manage
CREATE POLICY "pipeline_stages_admin_manage" ON public.hiring_pipeline_stages
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'hr'));

-- Pipeline History - Admin and HR read/manage
CREATE POLICY "pipeline_history_admin_manage" ON public.candidate_pipeline_history
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'hr', 'manager'));

-- Widget Analytics - Public insert, admin read
CREATE POLICY "analytics_public_insert" ON public.widget_analytics
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "analytics_admin_read" ON public.widget_analytics
  FOR SELECT TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'hr'));

-- =============================================
-- STORAGE BUCKETS FOR FILE UPLOADS
-- =============================================

-- Create buckets for candidate files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('candidate-cvs', 'candidate-cvs', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('candidate-portfolios', 'candidate-portfolios', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/zip'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for candidate files
CREATE POLICY "candidate_files_upload" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id IN ('candidate-cvs', 'candidate-portfolios'));

CREATE POLICY "candidate_files_admin_access" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id IN ('candidate-cvs', 'candidate-portfolios') AND
    auth.jwt() ->> 'role' IN ('admin', 'hr', 'manager')
  );

-- =============================================
-- SEED DATA - DEFAULT PIPELINE STAGES
-- =============================================

INSERT INTO public.hiring_pipeline_stages (name, description, order_sequence, stage_type) VALUES
('Application Received', 'Initial application submission', 1, 'application'),
('Application Screening', 'Initial review of application materials', 2, 'screening'),
('Assessment Phase', 'Skills and personality assessments', 3, 'assessment'),
('Phone Screening', 'Initial phone/video interview', 4, 'interview'),
('In-Person Interview', 'Face-to-face or detailed video interview', 5, 'interview'),
('Decision Review', 'Internal decision making process', 6, 'decision'),
('Offer Extended', 'Job offer made to candidate', 7, 'offer'),
('Offer Accepted', 'Candidate accepted the offer', 8, 'offer'),
('Onboarding', 'New hire onboarding process', 9, 'onboarding')
ON CONFLICT (name, order_sequence) DO NOTHING;

-- =============================================
-- SEED DATA - DEFAULT ASSESSMENT TEMPLATES
-- =============================================

INSERT INTO public.assessment_templates (name, description, assessment_type, questions, time_limit_minutes, passing_score) VALUES
('General Skills Assessment', 'Basic skills evaluation for all positions', 'general',
'[
  {"id": 1, "question": "How do you prioritize tasks when facing multiple deadlines?", "type": "multiple_choice", "options": ["Work on the most urgent first", "Work on the easiest first", "Create a detailed schedule", "Ask for help from colleagues"], "required": true},
  {"id": 2, "question": "Describe a challenging situation you faced at work and how you resolved it.", "type": "text", "min_length": 100, "required": true},
  {"id": 3, "question": "Rate your proficiency with computer software (1-5 scale)", "type": "rating", "min": 1, "max": 5, "required": true},
  {"id": 4, "question": "How comfortable are you working in a team environment?", "type": "multiple_choice", "options": ["Very comfortable", "Somewhat comfortable", "Neutral", "Prefer working alone"], "required": true},
  {"id": 5, "question": "What motivates you most in your work?", "type": "multiple_choice", "options": ["Recognition and praise", "Financial rewards", "Learning new skills", "Helping others", "Achieving goals"], "required": true}
]', 30, 70.00),

('Childcare Skills Assessment', 'Specialized assessment for childcare positions', 'skills',
'[
  {"id": 1, "question": "How would you handle a child who is having a tantrum?", "type": "text", "min_length": 150, "required": true},
  {"id": 2, "question": "What activities would you organize for children aged 3-5?", "type": "text", "min_length": 100, "required": true},
  {"id": 3, "question": "How do you ensure child safety during outdoor activities?", "type": "text", "min_length": 100, "required": true},
  {"id": 4, "question": "Rate your experience with different age groups", "type": "multiple_rating", "categories": ["Infants (0-1)", "Toddlers (1-3)", "Preschool (3-5)", "School age (5-12)"], "required": true},
  {"id": 5, "question": "How would you communicate with parents about their child''s day?", "type": "multiple_choice", "options": ["Detailed written report", "Brief verbal update", "Photos and short notes", "Only when there are concerns"], "required": true}
]', 45, 75.00),

('Cultural Fit Assessment', 'Evaluate alignment with TeddyKids values', 'cultural_fit',
'[
  {"id": 1, "question": "What does quality childcare mean to you?", "type": "text", "min_length": 100, "required": true},
  {"id": 2, "question": "How do you handle stress in a busy environment?", "type": "multiple_choice", "options": ["Take deep breaths and stay calm", "Focus on one task at a time", "Ask for support from colleagues", "Take short breaks when possible"], "required": true},
  {"id": 3, "question": "Rate the importance of these values in childcare", "type": "multiple_rating", "categories": ["Safety", "Creativity", "Communication", "Patience", "Flexibility"], "required": true},
  {"id": 4, "question": "How do you stay updated with childcare best practices?", "type": "multiple_choice", "options": ["Online courses", "Workshops and seminars", "Reading publications", "Peer discussions", "Trial and experience"], "required": true}
]', 20, 80.00)

ON CONFLICT (name, assessment_type) DO NOTHING;

-- =============================================
-- SEED DATA - SAMPLE POSITION TEMPLATES
-- =============================================

INSERT INTO public.position_templates (title, department, position_type, experience_level, description, requirements, responsibilities, benefits, salary_range_min, salary_range_max, location) VALUES
('Childcare Professional', 'Early Childhood', 'full_time', 'junior',
'Join our team as a dedicated childcare professional providing nurturing care and educational activities for children in our daycare facility.',
'["Valid childcare certification", "First aid certification", "Minimum 1 year experience", "Strong communication skills", "Patience and empathy"]',
'["Supervise and care for children", "Plan educational activities", "Maintain safe environment", "Communicate with parents", "Document child development"]',
'["Competitive salary", "Health insurance", "Professional development", "Paid time off", "Retirement plan"]',
2200.00, 2800.00, 'Amsterdam'),

('Assistant Childcare Worker', 'Early Childhood', 'part_time', 'entry',
'Support our childcare team by assisting with daily activities and providing additional care for children.',
'["High school diploma", "Interest in child development", "Basic first aid knowledge", "Reliability", "Team player attitude"]',
'["Assist lead caregivers", "Help with meal times", "Support play activities", "Maintain cleanliness", "Follow safety protocols"]',
'["Flexible hours", "Training provided", "Growth opportunities", "Team environment"]',
1400.00, 1800.00, 'Amsterdam'),

('Lead Educator', 'Early Childhood', 'full_time', 'mid',
'Lead our educational programs and mentor junior staff while providing exceptional childcare services.',
'["Bachelor degree in Early Childhood Education", "5+ years experience", "Leadership skills", "Curriculum development experience", "Advanced certifications"]',
'["Develop educational programs", "Lead team of caregivers", "Mentor junior staff", "Parent communication", "Quality assurance"]',
'["Leadership role", "Professional development budget", "Health insurance", "Paid vacation", "Performance bonuses"]',
3000.00, 3800.00, 'Amsterdam'),

('Internship - Early Childhood Education', 'Early Childhood', 'internship', 'entry',
'Gain hands-on experience in professional childcare while completing your education.',
'["Currently enrolled in relevant program", "Basic background check", "Enthusiasm to learn", "Communication skills"]',
'["Shadow experienced caregivers", "Assist with daily activities", "Participate in training", "Complete assignments", "Reflect on learning"]',
'["Real-world experience", "Mentorship", "Letter of recommendation", "Potential job opportunity"]',
800.00, 1200.00, 'Amsterdam')

ON CONFLICT DO NOTHING;

-- Link positions with assessments
INSERT INTO public.position_assessments (position_id, assessment_id, is_required, order_sequence)
SELECT
  pt.id as position_id,
  at.id as assessment_id,
  true as is_required,
  CASE
    WHEN at.name = 'General Skills Assessment' THEN 1
    WHEN at.name = 'Childcare Skills Assessment' THEN 2
    WHEN at.name = 'Cultural Fit Assessment' THEN 3
  END as order_sequence
FROM public.position_templates pt
CROSS JOIN public.assessment_templates at
WHERE pt.title IN ('Childcare Professional', 'Lead Educator')
ON CONFLICT (position_id, assessment_id) DO NOTHING;

-- Link entry-level positions with basic assessments
INSERT INTO public.position_assessments (position_id, assessment_id, is_required, order_sequence)
SELECT
  pt.id as position_id,
  at.id as assessment_id,
  true as is_required,
  CASE
    WHEN at.name = 'General Skills Assessment' THEN 1
    WHEN at.name = 'Cultural Fit Assessment' THEN 2
  END as order_sequence
FROM public.position_templates pt
CROSS JOIN public.assessment_templates at
WHERE pt.title IN ('Assistant Childcare Worker', 'Internship - Early Childhood Education')
  AND at.name IN ('General Skills Assessment', 'Cultural Fit Assessment')
ON CONFLICT (position_id, assessment_id) DO NOTHING;

-- =============================================
-- ANALYTICS VIEWS
-- =============================================

-- Candidate Pipeline View
CREATE OR REPLACE VIEW public.candidate_pipeline_overview AS
SELECT
  c.id as candidate_id,
  c.full_name,
  c.email,
  c.application_status,
  ca.id as application_id,
  pt.title as position_title,
  ca.status as application_status_detailed,
  ca.overall_score,
  ca.application_date,
  cph.stage_id as current_stage_id,
  hps.name as current_stage_name,
  cph.entered_at as stage_entered_at,
  (SELECT COUNT(*) FROM public.candidate_assessments WHERE candidate_id = c.id AND status = 'completed') as assessments_completed,
  (SELECT COUNT(*) FROM public.candidate_assessments WHERE candidate_id = c.id) as total_assessments
FROM public.candidates c
LEFT JOIN public.candidate_applications ca ON c.id = ca.candidate_id
LEFT JOIN public.position_templates pt ON ca.position_id = pt.id
LEFT JOIN LATERAL (
  SELECT stage_id, entered_at
  FROM public.candidate_pipeline_history
  WHERE candidate_id = c.id AND application_id = ca.id AND exited_at IS NULL
  ORDER BY entered_at DESC
  LIMIT 1
) cph ON true
LEFT JOIN public.hiring_pipeline_stages hps ON cph.stage_id = hps.id;

-- Widget Conversion Funnel
CREATE OR REPLACE VIEW public.widget_conversion_funnel AS
SELECT
  DATE(timestamp) as date,
  COUNT(CASE WHEN event_type = 'widget_load' THEN 1 END) as widget_loads,
  COUNT(CASE WHEN event_type = 'form_start' THEN 1 END) as form_starts,
  COUNT(CASE WHEN event_type = 'form_complete' THEN 1 END) as form_completions,
  COUNT(CASE WHEN event_type = 'assessment_start' THEN 1 END) as assessment_starts,
  COUNT(CASE WHEN event_type = 'assessment_complete' THEN 1 END) as assessment_completions,
  COUNT(DISTINCT candidate_id) as unique_candidates
FROM public.widget_analytics
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- Application Status Summary
CREATE OR REPLACE VIEW public.application_status_summary AS
SELECT
  pt.title as position_title,
  pt.department,
  COUNT(ca.id) as total_applications,
  COUNT(CASE WHEN ca.status = 'submitted' THEN 1 END) as submitted,
  COUNT(CASE WHEN ca.status = 'under_review' THEN 1 END) as under_review,
  COUNT(CASE WHEN ca.status = 'assessment_pending' THEN 1 END) as assessment_pending,
  COUNT(CASE WHEN ca.status = 'interview_scheduled' THEN 1 END) as interview_scheduled,
  COUNT(CASE WHEN ca.status = 'offer_made' THEN 1 END) as offer_made,
  COUNT(CASE WHEN ca.status = 'hired' THEN 1 END) as hired,
  COUNT(CASE WHEN ca.status = 'rejected' THEN 1 END) as rejected,
  AVG(ca.overall_score) as avg_score
FROM public.position_templates pt
LEFT JOIN public.candidate_applications ca ON pt.id = ca.position_id
WHERE pt.is_active = true
GROUP BY pt.id, pt.title, pt.department;

-- Grant permissions on views
GRANT SELECT ON public.candidate_pipeline_overview TO authenticated;
GRANT SELECT ON public.widget_conversion_funnel TO authenticated;
GRANT SELECT ON public.application_status_summary TO authenticated;

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE public.position_templates IS 'Job position definitions with requirements and assessments';
COMMENT ON TABLE public.assessment_templates IS 'Reusable assessment questionnaires for candidate evaluation';
COMMENT ON TABLE public.candidates IS 'Individual candidates who applied through the widget or other channels';
COMMENT ON TABLE public.candidate_applications IS 'Applications submitted by candidates for specific positions';
COMMENT ON TABLE public.candidate_assessments IS 'Assessment responses and scores for candidates';
COMMENT ON TABLE public.candidate_communications IS 'All communications between staff and candidates';
COMMENT ON TABLE public.hiring_pipeline_stages IS 'Configurable stages in the hiring process';
COMMENT ON TABLE public.candidate_pipeline_history IS 'Tracking of candidates through the hiring pipeline';
COMMENT ON TABLE public.widget_analytics IS 'Analytics data from the hiring widget interactions';

COMMENT ON VIEW public.candidate_pipeline_overview IS 'Comprehensive view of candidates in the hiring pipeline';
COMMENT ON VIEW public.widget_conversion_funnel IS 'Conversion metrics for the hiring widget';
COMMENT ON VIEW public.application_status_summary IS 'Summary of application statuses by position';