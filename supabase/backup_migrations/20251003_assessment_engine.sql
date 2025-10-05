-- =============================================
-- 🧪 TEDDYKIDS ASSESSMENT ENGINE - LABS 2.0
-- Independent hiring assessment system
-- =============================================

-- Assessment Role Categories for TeddyKids
CREATE TYPE assessment_role_category AS ENUM (
  'childcare_staff',     -- Nursery, toddler care
  'educational_staff',   -- BSO, early learning
  'support_staff',       -- Admin, kitchen, maintenance
  'management',          -- Team leads, coordinators
  'universal'            -- Applies to all roles
);

-- Assessment Question Types
CREATE TYPE assessment_question_type AS ENUM (
  'multiple_choice',
  'scenario_response',
  'video_response',
  'file_upload',
  'rating_scale',
  'time_challenge',
  'text_response',
  'emotional_intelligence',
  'cultural_fit'
);

-- Assessment Categories
CREATE TYPE assessment_category AS ENUM (
  'communication_skills',
  'childcare_scenarios',
  'cultural_fit',
  'technical_competency',
  'emotional_intelligence',
  'emergency_response',
  'teamwork',
  'leadership',
  'creativity',
  'problem_solving'
);

-- Candidate Status in Assessment Pipeline
CREATE TYPE candidate_assessment_status AS ENUM (
  'pending_start',
  'in_progress',
  'completed',
  'expired',
  'failed',
  'approved_for_hire',
  'rejected'
);

-- =============================================
-- ASSESSMENT TEMPLATES SYSTEM
-- =============================================

-- Assessment Templates (reusable test templates)
CREATE TABLE assessment_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  role_category assessment_role_category NOT NULL,
  version INTEGER DEFAULT 1,

  -- Configuration
  time_limit_minutes INTEGER, -- NULL = no time limit
  questions_order JSONB DEFAULT '[]'::jsonb, -- Question ordering/grouping
  passing_threshold INTEGER DEFAULT 70, -- Percentage needed to pass
  weighted_scoring BOOLEAN DEFAULT false,

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,

  -- Analytics
  total_attempts INTEGER DEFAULT 0,
  average_score DECIMAL(5,2),
  pass_rate DECIMAL(5,2)
);

-- Assessment Questions Library
CREATE TABLE assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES assessment_templates(id) ON DELETE CASCADE,

  -- Question Content
  question_text TEXT NOT NULL,
  question_type assessment_question_type NOT NULL,
  category assessment_category NOT NULL,

  -- Question Configuration
  options JSONB DEFAULT '[]'::jsonb, -- For multiple choice, rating scales
  correct_answers JSONB DEFAULT '[]'::jsonb, -- For auto-scoring
  scenario_context TEXT, -- For scenario-based questions

  -- Scoring
  points INTEGER DEFAULT 1,
  weight DECIMAL(3,2) DEFAULT 1.0,
  auto_scorable BOOLEAN DEFAULT false,

  -- Constraints
  min_length INTEGER, -- For text responses
  max_length INTEGER,
  required_files INTEGER DEFAULT 0, -- For file uploads
  time_limit_seconds INTEGER, -- For time challenges

  -- Metadata
  order_sequence INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CANDIDATE ASSESSMENT SYSTEM
-- =============================================

-- Candidates (completely independent from staff system)
CREATE TABLE assessment_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Information
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  date_of_birth DATE,

  -- Application Details
  position_applied VARCHAR(255) NOT NULL,
  role_category assessment_role_category NOT NULL,
  application_source VARCHAR(100) DEFAULT 'widget',

  -- Contact Info
  address_street TEXT,
  address_city VARCHAR(100),
  address_postal_code VARCHAR(20),
  address_country VARCHAR(100) DEFAULT 'Netherlands',

  -- Professional Background
  years_experience INTEGER,
  education_level VARCHAR(100),
  current_position VARCHAR(255),
  current_company VARCHAR(255),

  -- Documents
  cv_file_path TEXT,
  cover_letter_path TEXT,
  portfolio_path TEXT,
  certificates_paths JSONB DEFAULT '[]'::jsonb,

  -- Status & Tracking
  overall_status candidate_assessment_status DEFAULT 'pending_start',
  overall_score INTEGER, -- Final combined score
  ai_match_score INTEGER, -- AI-calculated position fit

  -- Privacy & Compliance
  privacy_consent BOOLEAN NOT NULL DEFAULT false,
  privacy_consent_date TIMESTAMPTZ,
  marketing_consent BOOLEAN DEFAULT false,
  gdpr_data_retention_until DATE,

  -- Metadata
  widget_session_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  referrer_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidate Assessment Sessions
CREATE TABLE candidate_assessment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES assessment_candidates(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES assessment_templates(id),

  -- Session Management
  status candidate_assessment_status DEFAULT 'pending_start',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  -- Progress Tracking
  current_question_index INTEGER DEFAULT 0,
  total_questions INTEGER NOT NULL,
  time_spent_minutes INTEGER DEFAULT 0,
  time_remaining_minutes INTEGER,

  -- Scoring
  current_score INTEGER DEFAULT 0,
  max_possible_score INTEGER NOT NULL,
  percentage_score DECIMAL(5,2),
  passed BOOLEAN,

  -- Session Data
  session_metadata JSONB DEFAULT '{}'::jsonb,
  browser_tab_switches INTEGER DEFAULT 0, -- Integrity monitoring
  suspicious_activity JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidate Question Responses
CREATE TABLE candidate_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES candidate_assessment_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES assessment_questions(id),

  -- Response Data
  response_data JSONB NOT NULL, -- Flexible storage for all response types
  response_text TEXT, -- Extracted text for searching
  file_paths JSONB DEFAULT '[]'::jsonb, -- For file uploads

  -- Scoring
  awarded_points INTEGER DEFAULT 0,
  max_points INTEGER NOT NULL,
  auto_scored BOOLEAN DEFAULT false,
  manual_review_needed BOOLEAN DEFAULT false,
  reviewer_notes TEXT,

  -- Timing
  time_to_answer_seconds INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SCORING & ANALYTICS SYSTEM
-- =============================================

-- Category Scoring Breakdown
CREATE TABLE candidate_category_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES candidate_assessment_sessions(id) ON DELETE CASCADE,
  category assessment_category NOT NULL,

  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,

  -- Insights
  strengths TEXT[],
  improvement_areas TEXT[],
  ai_analysis TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Insights & Recommendations
CREATE TABLE candidate_ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES assessment_candidates(id) ON DELETE CASCADE,

  -- AI Analysis
  personality_profile JSONB DEFAULT '{}'::jsonb,
  competency_analysis JSONB DEFAULT '{}'::jsonb,
  cultural_fit_score INTEGER,
  role_suitability_score INTEGER,

  -- Recommendations
  hiring_recommendation TEXT NOT NULL, -- 'hire', 'reject', 'interview', 'reassess'
  recommendation_confidence DECIMAL(3,2), -- 0.0 to 1.0
  recommendation_reasoning TEXT,

  -- Insights
  key_strengths TEXT[],
  potential_concerns TEXT[],
  development_suggestions TEXT[],
  interview_focus_areas TEXT[],

  -- Metadata
  ai_model_version VARCHAR(50),
  generated_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- REVIEW & APPROVAL SYSTEM
-- =============================================

-- Manual Review Queue
CREATE TABLE assessment_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES assessment_candidates(id),
  session_id UUID NOT NULL REFERENCES candidate_assessment_sessions(id),

  -- Review Assignment
  assigned_to UUID, -- Could be user_id or manager_id
  assigned_at TIMESTAMPTZ,

  -- Review Status
  review_status VARCHAR(50) DEFAULT 'pending', -- pending, in_review, completed
  priority_level INTEGER DEFAULT 3, -- 1=high, 3=normal, 5=low

  -- Review Results
  reviewer_score INTEGER,
  reviewer_recommendation TEXT, -- hire, reject, interview, reassess
  reviewer_notes TEXT,
  reviewed_at TIMESTAMPTZ,

  -- Decision Tracking
  final_decision VARCHAR(50), -- approved_for_hire, rejected, needs_interview
  decision_reasoning TEXT,
  decided_by UUID,
  decided_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ANALYTICS & REPORTING
-- =============================================

-- Assessment Performance Analytics
CREATE TABLE assessment_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  template_id UUID REFERENCES assessment_templates(id),
  role_category assessment_role_category,

  -- Volume Metrics
  total_started INTEGER DEFAULT 0,
  total_completed INTEGER DEFAULT 0,
  total_passed INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,

  -- Performance Metrics
  average_score DECIMAL(5,2),
  average_completion_time INTEGER, -- minutes
  abandonment_rate DECIMAL(5,2),
  pass_rate DECIMAL(5,2),

  -- Quality Metrics
  average_time_per_question INTEGER, -- seconds
  questions_requiring_review INTEGER,
  ai_accuracy_rate DECIMAL(5,2),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(date, template_id, role_category)
);

-- =============================================
-- VIEWS FOR EASY QUERYING
-- =============================================

-- Comprehensive Candidate Dashboard View
CREATE VIEW candidate_assessment_dashboard AS
SELECT
  c.id,
  c.full_name,
  c.email,
  c.position_applied,
  c.role_category,
  c.overall_status,
  c.overall_score,
  c.ai_match_score,
  c.application_source,
  c.created_at as application_date,

  -- Session Info
  s.id as current_session_id,
  s.status as assessment_status,
  s.percentage_score,
  s.passed,
  s.started_at as assessment_started_at,
  s.completed_at as assessment_completed_at,

  -- Template Info
  t.name as assessment_template_name,
  t.passing_threshold,

  -- Progress
  s.current_question_index,
  s.total_questions,
  ROUND((s.current_question_index::DECIMAL / s.total_questions) * 100, 1) as progress_percentage,

  -- Review Status
  r.review_status,
  r.reviewer_recommendation,
  r.final_decision

FROM assessment_candidates c
LEFT JOIN candidate_assessment_sessions s ON c.id = s.candidate_id
LEFT JOIN assessment_templates t ON s.template_id = t.id
LEFT JOIN assessment_reviews r ON c.id = r.candidate_id
ORDER BY c.created_at DESC;

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Primary lookup indexes
CREATE INDEX idx_candidates_status ON assessment_candidates(overall_status);
CREATE INDEX idx_candidates_role_category ON assessment_candidates(role_category);
CREATE INDEX idx_candidates_application_date ON assessment_candidates(created_at);
CREATE INDEX idx_candidates_email ON assessment_candidates(email);

-- Session performance indexes
CREATE INDEX idx_sessions_candidate ON candidate_assessment_sessions(candidate_id);
CREATE INDEX idx_sessions_status ON candidate_assessment_sessions(status);
CREATE INDEX idx_sessions_template ON candidate_assessment_sessions(template_id);

-- Response analytics indexes
CREATE INDEX idx_responses_session ON candidate_responses(session_id);
CREATE INDEX idx_responses_question ON candidate_responses(question_id);
CREATE INDEX idx_responses_auto_scored ON candidate_responses(auto_scored);

-- Analytics indexes
CREATE INDEX idx_analytics_date ON assessment_analytics(date);
CREATE INDEX idx_analytics_template ON assessment_analytics(template_id);
CREATE INDEX idx_analytics_role ON assessment_analytics(role_category);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE assessment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_category_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_analytics ENABLE ROW LEVEL SECURITY;

-- Admin access policies (can see everything)
CREATE POLICY "Admins can manage assessment templates" ON assessment_templates
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage questions" ON assessment_questions
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Manager access policies (can review candidates)
CREATE POLICY "Managers can view candidates" ON assessment_candidates
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('admin', 'manager', 'hr')
  );

CREATE POLICY "Managers can review assessments" ON assessment_reviews
  FOR ALL USING (
    auth.jwt() ->> 'role' IN ('admin', 'manager', 'hr') OR
    assigned_to::text = auth.uid()::text
  );

-- Public access for widget (candidates can create accounts and take assessments)
CREATE POLICY "Candidates can create profiles" ON assessment_candidates
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Candidates can update own profile" ON assessment_candidates
  FOR UPDATE USING (auth.uid()::text = id::text);

-- =============================================
-- TRIGGER FUNCTIONS
-- =============================================

-- Update assessment template statistics
CREATE OR REPLACE FUNCTION update_template_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE assessment_templates
  SET
    total_attempts = (
      SELECT COUNT(*)
      FROM candidate_assessment_sessions
      WHERE template_id = NEW.template_id AND status IN ('completed', 'failed')
    ),
    average_score = (
      SELECT AVG(percentage_score)
      FROM candidate_assessment_sessions
      WHERE template_id = NEW.template_id AND status = 'completed'
    ),
    pass_rate = (
      SELECT
        ROUND(
          (COUNT(*) FILTER (WHERE passed = true)::DECIMAL /
           COUNT(*)::DECIMAL) * 100, 2
        )
      FROM candidate_assessment_sessions
      WHERE template_id = NEW.template_id AND status = 'completed'
    ),
    updated_at = NOW()
  WHERE id = NEW.template_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_template_stats
  AFTER INSERT OR UPDATE ON candidate_assessment_sessions
  FOR EACH ROW EXECUTE FUNCTION update_template_stats();

-- Auto-calculate candidate overall score
CREATE OR REPLACE FUNCTION calculate_candidate_overall_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE assessment_candidates
  SET
    overall_score = (
      SELECT AVG(percentage_score)
      FROM candidate_assessment_sessions
      WHERE candidate_id = NEW.candidate_id AND status = 'completed'
    ),
    updated_at = NOW()
  WHERE id = NEW.candidate_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_overall_score
  AFTER UPDATE ON candidate_assessment_sessions
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION calculate_candidate_overall_score();

-- =============================================
-- SAMPLE DATA FOR TEDDYKIDS ROLES
-- =============================================

-- Sample Assessment Templates
INSERT INTO assessment_templates (name, description, role_category, time_limit_minutes, passing_threshold)
VALUES
  ('Childcare Professional Assessment', 'Comprehensive evaluation for nursery and toddler care positions', 'childcare_staff', 45, 75),
  ('Educational Staff Evaluation', 'Assessment for BSO and early learning educators', 'educational_staff', 60, 80),
  ('Support Staff Screening', 'Basic competency test for admin, kitchen, and maintenance roles', 'support_staff', 30, 70),
  ('Leadership & Management Assessment', 'Advanced evaluation for team leads and coordinators', 'management', 90, 85),
  ('Universal TeddyKids Culture Assessment', 'Core values and cultural fit evaluation for all roles', 'universal', 20, 70);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '🧪 TeddyKids Assessment Engine successfully installed!';
  RAISE NOTICE '✅ Tables created: 9 core tables + views + indexes';
  RAISE NOTICE '✅ RLS policies configured for security';
  RAISE NOTICE '✅ Triggers added for auto-calculations';
  RAISE NOTICE '✅ Sample templates inserted for all role categories';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Ready for candidate assessments in Labs 2.0!';
END $$;