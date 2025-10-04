-- ====================================================
-- 🧪 TEDDYKIDS TALENT ACQUISITION - PUBLIC SCHEMA TABLES
-- Complete database schema for Labs 2.0 hiring widget
-- All tables in public schema with ta_ prefix for API access
-- ====================================================

-- Clean up previous schema if exists
DROP SCHEMA IF EXISTS talent_acquisition CASCADE;

-- ====================================================
-- CORE TABLES (PUBLIC SCHEMA WITH ta_ PREFIX)
-- ====================================================

-- Table: ta_applicants (main candidate profile with inline DISC results)
CREATE TABLE ta_applicants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ref_code TEXT UNIQUE NOT NULL, -- Public reference code for candidates

    -- Role and Language
    role TEXT NOT NULL CHECK (role IN ('intern', 'teacher')),
    language_track TEXT NOT NULL CHECK (language_track IN ('en', 'nl', 'bi')),
    preferred_group TEXT CHECK (preferred_group IN ('babies', 'one_two', 'three_plus', 'mixed')),

    -- Personal Information
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    nationality TEXT,
    city TEXT,

    -- Legal Requirements
    vog_eligible BOOLEAN NOT NULL DEFAULT true,
    work_permit TEXT NOT NULL DEFAULT 'yes' CHECK (work_permit IN ('yes', 'no', 'processing')),

    -- Timing
    start_date DATE,
    availability JSONB DEFAULT '{}', -- {mon: true, tue: false, ...}

    -- DISC Results (inline for simplicity)
    color_primary TEXT CHECK (color_primary IN ('red', 'blue', 'green', 'yellow')),
    color_secondary TEXT CHECK (color_secondary IN ('red', 'blue', 'green', 'yellow')),
    color_counts JSONB DEFAULT '{}', -- {red: 8, blue: 12, green: 15, yellow: 5}

    -- Risk Assessment
    red_flag_count INTEGER DEFAULT 0,
    red_flag_items JSONB DEFAULT '[]', -- [21, 23, 27] question IDs

    -- Assessment completion
    completed_at TIMESTAMPTZ,

    -- System Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
);

-- Table: ta_assessment_answers (individual question responses)
CREATE TABLE ta_assessment_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    applicant_id UUID NOT NULL REFERENCES ta_applicants(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL,
    question_section TEXT,
    selected_choice TEXT NOT NULL CHECK (selected_choice IN ('A', 'B', 'C', 'D')),
    answer_text TEXT,
    is_color_question BOOLEAN DEFAULT false,
    is_red_flag BOOLEAN DEFAULT false,
    color_mapped TEXT CHECK (color_mapped IN ('red', 'blue', 'green', 'yellow')),
    risk_flag BOOLEAN DEFAULT false,
    time_taken_seconds INTEGER,
    question_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: ta_assessment_questions (Luna's 40 questions)
CREATE TABLE ta_assessment_questions (
    id INTEGER PRIMARY KEY,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('disc_color', 'red_flag', 'age_group', 'competency')),

    -- Answer Options
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT,
    option_d TEXT,

    -- Scoring Configuration
    color_mapping JSONB, -- {A: 'red', B: 'blue', C: 'green', D: 'yellow'}
    red_flag_mapping JSONB, -- {A: false, B: true, C: false, D: true}
    age_group_mapping JSONB, -- {A: 'babies', B: 'one_two', C: 'three_plus'}
    competency_mapping JSONB, -- {A: {patience: 1}, B: {creativity: 2}, ...}

    -- Metadata
    category TEXT, -- 'childcare_scenarios', 'communication', 'safety', etc.
    difficulty_level INTEGER DEFAULT 1, -- 1-5
    time_limit_seconds INTEGER DEFAULT 60,
    required BOOLEAN DEFAULT true,

    -- System Fields
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: ta_widget_analytics (conversion tracking)
CREATE TABLE ta_widget_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Event Tracking
    event_type TEXT NOT NULL CHECK (event_type IN (
        'widget_loaded',
        'step_completed',
        'assessment_started',
        'assessment_completed',
        'application_submitted',
        'document_uploaded',
        'conversion'
    )),

    -- Session Data
    session_id UUID,
    applicant_id UUID REFERENCES ta_applicants(id),
    step_name TEXT,

    -- Source Tracking
    source_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,

    -- Performance Metrics
    load_time_ms INTEGER,
    completion_time_ms INTEGER,

    -- Metadata
    metadata JSONB DEFAULT '{}', -- Additional event data

    -- Timing
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================
-- INDEXES FOR PERFORMANCE
-- ====================================================

-- Applicants indexes
CREATE INDEX idx_ta_applicants_ref_code ON ta_applicants(ref_code);
CREATE INDEX idx_ta_applicants_role_language ON ta_applicants(role, language_track);
CREATE INDEX idx_ta_applicants_created_at ON ta_applicants(created_at);
CREATE INDEX idx_ta_applicants_email ON ta_applicants(email);
CREATE INDEX idx_ta_applicants_color_primary ON ta_applicants(color_primary);

-- Assessment answers indexes
CREATE INDEX idx_ta_assessment_answers_applicant ON ta_assessment_answers(applicant_id);
CREATE INDEX idx_ta_assessment_answers_question ON ta_assessment_answers(question_id);

-- Ensure one answer per question per applicant
CREATE UNIQUE INDEX idx_ta_assessment_answers_unique ON ta_assessment_answers(applicant_id, question_id);

-- Analytics indexes
CREATE INDEX idx_ta_analytics_event_type ON ta_widget_analytics(event_type);
CREATE INDEX idx_ta_analytics_created_at ON ta_widget_analytics(created_at);
CREATE INDEX idx_ta_analytics_session_id ON ta_widget_analytics(session_id);

-- ====================================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================================

-- Enable RLS on all tables
ALTER TABLE ta_applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ta_assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ta_assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ta_widget_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow public access for assessment submission)
-- Applicants policies
CREATE POLICY "ta_applicants_insert" ON ta_applicants
    FOR INSERT WITH CHECK (true);

CREATE POLICY "ta_applicants_select" ON ta_applicants
    FOR SELECT USING (true);

CREATE POLICY "ta_applicants_update" ON ta_applicants
    FOR UPDATE USING (true);

-- Assessment answers policies
CREATE POLICY "ta_assessment_answers_insert" ON ta_assessment_answers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "ta_assessment_answers_select" ON ta_assessment_answers
    FOR SELECT USING (true);

-- Assessment questions policies (read-only)
CREATE POLICY "ta_assessment_questions_select" ON ta_assessment_questions
    FOR SELECT USING (true);

-- Analytics policies
CREATE POLICY "ta_analytics_insert" ON ta_widget_analytics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "ta_analytics_select" ON ta_widget_analytics
    FOR SELECT USING (true);

-- ====================================================
-- FUNCTIONS & TRIGGERS
-- ====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ta_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_ta_applicants_updated_at
    BEFORE UPDATE ON ta_applicants
    FOR EACH ROW EXECUTE FUNCTION update_ta_updated_at_column();

-- ====================================================
-- SEED DATA - LUNA'S 40 ASSESSMENT QUESTIONS
-- ====================================================

-- Insert Luna's assessment questions
INSERT INTO ta_assessment_questions (id, question_text, question_type, option_a, option_b, option_c, option_d, color_mapping, red_flag_mapping, category) VALUES

-- DISC Color Questions (Q1-Q20)
(1, 'When working with children who are upset, I prefer to:', 'disc_color',
 'Take charge and solve the problem quickly', 'Follow established calming procedures', 'Listen and provide emotional support', 'Use creative distractions and games',
 '{"A": "red", "B": "blue", "C": "green", "D": "yellow"}', NULL, 'childcare_scenarios'),

(2, 'In a team meeting, I typically:', 'disc_color',
 'Lead the discussion and make decisions', 'Organize the agenda and take notes', 'Make sure everyone feels heard', 'Suggest new ideas and creative solutions',
 '{"A": "red", "B": "blue", "C": "green", "D": "yellow"}', NULL, 'communication'),

(3, 'When a child refuses to follow the daily routine, I:', 'disc_color',
 'Firmly but kindly enforce the rules', 'Explain why the routine is important', 'Try to understand their feelings first', 'Make the routine more fun and engaging',
 '{"A": "red", "B": "blue", "C": "green", "D": "yellow"}', NULL, 'childcare_scenarios'),

(4, 'My ideal work environment is:', 'disc_color',
 'Fast-paced with clear goals', 'Well-organized and predictable', 'Collaborative and supportive', 'Creative and flexible',
 '{"A": "red", "B": "blue", "C": "green", "D": "yellow"}', NULL, 'work_environment'),

(5, 'When planning activities for children, I focus on:', 'disc_color',
 'Activities that build skills quickly', 'Structured activities with clear learning goals', 'Activities that help children bond', 'Fun, imaginative activities',
 '{"A": "red", "B": "blue", "C": "green", "D": "yellow"}', NULL, 'activity_planning'),

(6, 'If a parent disagrees with my approach, I:', 'disc_color',
 'Confidently explain my professional reasoning', 'Provide documentation and research', 'Listen to their concerns with empathy', 'Find a creative compromise together',
 '{"A": "red", "B": "blue", "C": "green", "D": "yellow"}', NULL, 'parent_communication'),

(7, 'When children are playing freely, I prefer to:', 'disc_color',
 'Guide them toward productive activities', 'Monitor safety and provide structure', 'Observe and support their social interactions', 'Join in and spark their imagination',
 '{"A": "red", "B": "blue", "C": "green", "D": "yellow"}', NULL, 'childcare_scenarios'),

(8, 'Under pressure, I tend to:', 'disc_color',
 'Take control and push through', 'Stick to proven methods', 'Seek support from colleagues', 'Find innovative solutions',
 '{"A": "red", "B": "blue", "C": "green", "D": "yellow"}', NULL, 'stress_management'),

(9, 'My communication style with children is:', 'disc_color',
 'Direct and encouraging', 'Clear and instructional', 'Warm and patient', 'Playful and expressive',
 '{"A": "red", "B": "blue", "C": "green", "D": "yellow"}', NULL, 'communication'),

(10, 'When introducing a new child to the group, I:', 'disc_color',
 'Help them jump right in', 'Follow our integration procedure', 'Take time to understand their needs', 'Make it a fun welcome celebration',
 '{"A": "red", "B": "blue", "C": "green", "D": "yellow"}', NULL, 'childcare_scenarios'),

(11, 'At the end of a busy day, I feel most satisfied when:', 'disc_color',
 'We accomplished all our goals', 'Everything went according to plan', 'All children felt happy and cared for', 'We had some magical moments together',
 '{"A": "red", "B": "blue", "C": "green", "D": "yellow"}', NULL, 'job_satisfaction'),

(12, 'When children have conflicts, I:', 'disc_color',
 'Help them resolve it quickly', 'Use established conflict resolution steps', 'Focus on their emotional needs', 'Turn it into a learning game',
 '{"A": "red", "B": "blue", "C": "green", "D": "yellow"}', NULL, 'conflict_resolution'),

(13, 'My approach to child development is:', 'disc_color',
 'Push them to reach their potential', 'Follow developmental milestones', 'Support their individual journey', 'Inspire their natural curiosity',
 '{"A": "red", "B": "blue", "C": "green", "D": "yellow"}', NULL, 'child_development'),

(14, 'When documenting child observations, I:', 'disc_color',
 'Focus on achievements and progress', 'Record detailed, objective notes', 'Include emotional and social aspects', 'Capture their unique personality',
 '{"A": "red", "B": "blue", "C": "green", "D": "yellow"}', NULL, 'documentation'),

(15, 'If a child is having a difficult day, I:', 'disc_color',
 'Help them overcome the challenge', 'Provide extra structure and support', 'Offer comfort and understanding', 'Find ways to brighten their mood',
 '{"A": "red", "B": "blue", "C": "green", "D": "yellow"}', NULL, 'childcare_scenarios'),

(16, 'My leadership style is:', 'disc_color',
 'Decisive and goal-oriented', 'Organized and systematic', 'Collaborative and inclusive', 'Inspiring and innovative',
 '{"A": "red", "B": "blue", "C": "green", "D": "yellow"}', NULL, 'leadership'),

(17, 'When changes are made to procedures, I:', 'disc_color',
 'Adapt quickly and move forward', 'Want to understand the details first', 'Consider how it affects everyone', 'See opportunities for improvement',
 '{"A": "red", "B": "blue", "C": "green", "D": "yellow"}', NULL, 'adaptability'),

(18, 'During meal times with children, I:', 'disc_color',
 'Encourage them to try everything', 'Follow nutritional guidelines carefully', 'Make it a social bonding time', 'Make eating fun and enjoyable',
 '{"A": "red", "B": "blue", "C": "green", "D": "yellow"}', NULL, 'childcare_scenarios'),

(19, 'My motivation at work comes from:', 'disc_color',
 'Achieving results and making progress', 'Doing quality work correctly', 'Building relationships and helping others', 'Creating and discovering new things',
 '{"A": "red", "B": "blue", "C": "green", "D": "yellow"}', NULL, 'motivation'),

(20, 'When planning my day with children, I prefer:', 'disc_color',
 'A clear schedule with specific goals', 'A structured routine with some flexibility', 'To go with the flow of their needs', 'To leave room for spontaneous adventures',
 '{"A": "red", "B": "blue", "C": "green", "D": "yellow"}', NULL, 'planning'),

-- Red Flag Questions (Q21-Q30) - Child Safety & Behavior
(21, 'When a child repeatedly misbehaves, the best approach is:', 'red_flag',
 'Set clear consequences and follow through', 'Ignore the behavior until they stop', 'Use physical discipline when necessary', 'Always give them what they want to keep peace',
 NULL, '{"A": false, "B": false, "C": true, "D": true}', 'behavior_management'),

(22, 'If I suspect a child is being mistreated at home, I should:', 'red_flag',
 'Report it to appropriate authorities immediately', 'Wait to gather more evidence first', 'Confront the parents directly', 'Mind my own business',
 NULL, '{"A": false, "B": true, "C": true, "D": true}', 'child_protection'),

(23, 'When children are playing rough and someone might get hurt:', 'red_flag',
 'Intervene immediately to ensure safety', 'Let them work it out themselves', 'Only step in if someone actually gets hurt', 'Join in to show them how to play properly',
 NULL, '{"A": false, "B": true, "C": true, "D": false}', 'safety'),

(24, 'Personal information about children and families should be:', 'red_flag',
 'Kept strictly confidential', 'Shared with close friends for advice', 'Discussed openly with other parents', 'Posted on social media to celebrate children',
 NULL, '{"A": false, "B": true, "C": true, "D": true}', 'confidentiality'),

(25, 'If a child makes me very angry, I should:', 'red_flag',
 'Take a moment to calm down before responding', 'Show them how upset they made me', 'Give them time-out in isolation', 'Raise my voice so they understand',
 NULL, '{"A": false, "B": true, "C": false, "D": true}', 'emotional_regulation'),

(26, 'When a child refuses to eat their lunch, I should:', 'red_flag',
 'Respect their choice and offer alternatives', 'Force them to eat for their health', 'Withhold other activities until they eat', 'Make them sit alone until they comply',
 NULL, '{"A": false, "B": true, "C": true, "D": true}', 'food_and_nutrition'),

(27, 'If I notice bruises on a child, I should:', 'red_flag',
 'Document and report according to policy', 'Ask the child how they got hurt', 'Assume it''s from normal play', 'Take photos for evidence',
 NULL, '{"A": false, "B": false, "C": true, "D": false}', 'child_protection'),

(28, 'When changing diapers or helping with bathroom needs:', 'red_flag',
 'Follow proper hygiene and privacy protocols', 'It''s fine to have the door closed for privacy', 'Other children can help and watch', 'Take photos to document cleanliness',
 NULL, '{"A": false, "B": true, "C": true, "D": true}', 'hygiene_and_privacy'),

(29, 'If a parent asks me to use discipline methods I''m uncomfortable with:', 'red_flag',
 'Discuss alternative approaches professionally', 'Do what they ask to keep them happy', 'Use their methods only when they''re watching', 'Agree but continue my own methods',
 NULL, '{"A": false, "B": true, "C": true, "D": false}', 'professional_boundaries'),

(30, 'When children are sleeping or resting, I should:', 'red_flag',
 'Maintain constant visual supervision', 'Use this time for personal phone calls', 'Step outside for a quick break', 'Take a nap myself if tired',
 NULL, '{"A": false, "B": true, "C": true, "D": true}', 'supervision'),

-- Age Group Preference Questions (Q31-Q40)
(31, 'I feel most comfortable working with children who:', 'age_group',
 'Need lots of physical care (0-1 years)', 'Are learning to walk and explore (1-2 years)', 'Can communicate and play games (3+ years)', 'Are at any developmental stage',
 NULL, NULL, 'age_preference'),

(32, 'The most rewarding part of childcare for me is:', 'age_group',
 'Nurturing and bonding with babies', 'Watching toddlers discover the world', 'Teaching and learning with older children', 'Supporting families through all stages',
 NULL, NULL, 'job_satisfaction'),

(33, 'When it comes to developmental activities, I prefer:', 'age_group',
 'Sensory and motor development for babies', 'Language and mobility for toddlers', 'Creative and educational projects for older kids', 'Age-appropriate activities for any group',
 NULL, NULL, 'activity_preference'),

(34, 'My patience level is highest with children who:', 'age_group',
 'Need frequent feeding and diaper changes', 'Are going through toddler tantrums', 'Ask lots of questions and test boundaries', 'I adapt my patience to each child''s needs',
 NULL, NULL, 'patience_and_temperament'),

(35, 'The type of communication I enjoy most is:', 'age_group',
 'Non-verbal bonding and baby talk', 'Early language development and simple words', 'Conversations and storytelling', 'All forms of communication',
 NULL, NULL, 'communication_preference'),

(36, 'When planning my day, I prefer activities that involve:', 'age_group',
 'Feeding, sleeping, and gentle play routines', 'Exploration, climbing, and sensory play', 'Arts, crafts, and structured learning', 'A mix of activities for different ages',
 NULL, NULL, 'activity_planning'),

(37, 'The noise level I''m most comfortable with is:', 'age_group',
 'Quiet environments with gentle sounds', 'Moderate activity with some babbling', 'Lively environments with talking and laughter', 'I adapt to any noise level needed',
 NULL, NULL, 'environment_preference'),

(38, 'My ideal group size to work with is:', 'age_group',
 'Small groups of babies (2-4 children)', 'Small groups of toddlers (4-6 children)', 'Larger groups of older children (8+ children)', 'Any group size depending on needs',
 NULL, NULL, 'group_size_preference'),

(39, 'The physical demands I''m most prepared for include:', 'age_group',
 'Lifting and carrying babies frequently', 'Chasing active toddlers all day', 'Standing and facilitating activities', 'Any physical demands of childcare',
 NULL, NULL, 'physical_readiness'),

(40, 'When children need guidance, I prefer to:', 'age_group',
 'Provide gentle physical comfort and care', 'Use simple words and redirection', 'Have conversations about choices and consequences', 'Use age-appropriate guidance methods',
 NULL, NULL, 'guidance_style');

-- Grant permissions to access tables
GRANT SELECT, INSERT, UPDATE ON ta_applicants TO anon;
GRANT SELECT, INSERT ON ta_assessment_answers TO anon;
GRANT SELECT ON ta_assessment_questions TO anon;
GRANT SELECT, INSERT ON ta_widget_analytics TO anon;

GRANT ALL ON ta_applicants TO authenticated;
GRANT ALL ON ta_assessment_answers TO authenticated;
GRANT ALL ON ta_assessment_questions TO authenticated;
GRANT ALL ON ta_widget_analytics TO authenticated;

GRANT ALL ON ta_applicants TO service_role;
GRANT ALL ON ta_assessment_answers TO service_role;
GRANT ALL ON ta_assessment_questions TO service_role;
GRANT ALL ON ta_widget_analytics TO service_role;

-- Verify the setup
SELECT 'Talent Acquisition public schema setup completed successfully! 🎉' as status;