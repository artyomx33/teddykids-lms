-- =====================================================
-- REVIEWS SYSTEM v1.1 - INTEGRATION SCHEMA
-- =====================================================
-- Date: 2025-10-16
-- Phase 1: Add gamification, DISC, emotional intelligence, and goal tracking
-- Upgrades Reviews v1.0 to v1.1 (Legendary Edition)

BEGIN;

-- =====================================================
-- 1. ENHANCE staff_reviews TABLE
-- =====================================================

-- DISC Integration (3 columns)
ALTER TABLE staff_reviews
  ADD COLUMN IF NOT EXISTS disc_snapshot JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS disc_evolution TEXT,
  ADD COLUMN IF NOT EXISTS disc_questions_answered JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN staff_reviews.disc_snapshot IS 'Snapshot of DISC profile at review time: {primary: "red", secondary: "green", counts: {...}}';
COMMENT ON COLUMN staff_reviews.disc_evolution IS 'Personality shift detected: "Red->Green" or "Still Red-Green"';
COMMENT ON COLUMN staff_reviews.disc_questions_answered IS 'Responses to mini DISC questions during review';

-- Gamification Integration (3 columns)
ALTER TABLE staff_reviews
  ADD COLUMN IF NOT EXISTS xp_earned INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coins_earned INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS achievement_ids TEXT[] DEFAULT '{}';

COMMENT ON COLUMN staff_reviews.xp_earned IS 'Experience points awarded for completing this review';
COMMENT ON COLUMN staff_reviews.coins_earned IS 'Coins/stars earned from this review';
COMMENT ON COLUMN staff_reviews.achievement_ids IS 'Array of achievement IDs unlocked by this review';

-- Self-Assessment (3 columns)
ALTER TABLE staff_reviews
  ADD COLUMN IF NOT EXISTS self_assessment JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS self_rating_average NUMERIC(3,2),
  ADD COLUMN IF NOT EXISTS manager_vs_self_delta NUMERIC(3,2);

COMMENT ON COLUMN staff_reviews.self_assessment IS 'Staff self-ratings on same metrics as manager: {teamwork: 4, communication: 5, ...}';
COMMENT ON COLUMN staff_reviews.self_rating_average IS 'Average of all self-ratings (1-5)';
COMMENT ON COLUMN staff_reviews.manager_vs_self_delta IS 'Average difference between manager and self ratings (coaching opportunity indicator)';

-- Emotional Intelligence Metrics (3 columns)
ALTER TABLE staff_reviews
  ADD COLUMN IF NOT EXISTS emotional_scores JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS team_mood_impact TEXT CHECK (team_mood_impact IN ('positive', 'neutral', 'needs_support')),
  ADD COLUMN IF NOT EXISTS wellbeing_score INTEGER CHECK (wellbeing_score >= 1 AND wellbeing_score <= 5);

COMMENT ON COLUMN staff_reviews.emotional_scores IS 'Emotional intelligence metrics: {empathy: 4, stress_tolerance: 5, emotional_regulation: 4, team_support: 5, conflict_resolution: 4}';
COMMENT ON COLUMN staff_reviews.team_mood_impact IS 'How this person affects team mood: positive, neutral, or needs_support';
COMMENT ON COLUMN staff_reviews.wellbeing_score IS 'Overall wellbeing/happiness score (1-5 stars)';

-- Review Context & Triggers (2 columns)
ALTER TABLE staff_reviews
  ADD COLUMN IF NOT EXISTS review_trigger_type TEXT CHECK (review_trigger_type IN ('manual', 'auto_scheduled', 'warning', 'salary_review', 'promotion_review', 'intervention')),
  ADD COLUMN IF NOT EXISTS triggered_by_goal_id UUID;

COMMENT ON COLUMN staff_reviews.review_trigger_type IS 'What triggered this review: manual, auto_scheduled, warning, salary_review, promotion_review, intervention';
COMMENT ON COLUMN staff_reviews.triggered_by_goal_id IS 'If triggered by a goal completion or milestone';

-- Goal Completion Tracking (3 columns)
ALTER TABLE staff_reviews
  ADD COLUMN IF NOT EXISTS goal_completion_rate NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS goals_achieved INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS goals_total INTEGER DEFAULT 0;

COMMENT ON COLUMN staff_reviews.goal_completion_rate IS 'Percentage of goals achieved since last review (0-100)';
COMMENT ON COLUMN staff_reviews.goals_achieved IS 'Count of goals completed since last review';
COMMENT ON COLUMN staff_reviews.goals_total IS 'Total goals set in last review';

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_staff_reviews_xp_earned ON staff_reviews(xp_earned) WHERE xp_earned > 0;
CREATE INDEX IF NOT EXISTS idx_staff_reviews_team_mood ON staff_reviews(team_mood_impact) WHERE team_mood_impact IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_staff_reviews_trigger_type ON staff_reviews(review_trigger_type) WHERE review_trigger_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_staff_reviews_wellbeing ON staff_reviews(wellbeing_score) WHERE wellbeing_score IS NOT NULL;

-- =====================================================
-- 2. UPDATE review_templates TABLE
-- =====================================================

ALTER TABLE review_templates
  ADD COLUMN IF NOT EXISTS disc_injection_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS self_assessment_required BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS gamification_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS xp_base_reward INTEGER DEFAULT 500,
  ADD COLUMN IF NOT EXISTS emotional_metrics JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN review_templates.disc_injection_enabled IS 'Show 3 rotating DISC mini-questions in this review?';
COMMENT ON COLUMN review_templates.self_assessment_required IS 'Require staff to complete self-assessment section?';
COMMENT ON COLUMN review_templates.gamification_enabled IS 'Award XP, coins, and achievements for this review?';
COMMENT ON COLUMN review_templates.xp_base_reward IS 'Base experience points awarded for completing this review';
COMMENT ON COLUMN review_templates.emotional_metrics IS 'Array of emotional intelligence metrics to track: ["empathy", "stress_tolerance", "emotional_regulation", "team_support", "conflict_resolution"]';

-- =====================================================
-- 3. CREATE staff_goals TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS staff_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL,
  goal_text TEXT NOT NULL,
  goal_category TEXT CHECK (goal_category IN ('skill_development', 'performance', 'leadership', 'certification', 'custom')) DEFAULT 'custom',
  created_in_review_id UUID REFERENCES staff_reviews(id) ON DELETE SET NULL,
  target_date DATE,
  completed_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('active', 'completed', 'abandoned', 'revised')) DEFAULT 'active',
  xp_reward INTEGER DEFAULT 100,
  completion_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for staff_goals
CREATE INDEX IF NOT EXISTS idx_staff_goals_staff_id ON staff_goals(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_goals_status ON staff_goals(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_staff_goals_created_in_review ON staff_goals(created_in_review_id) WHERE created_in_review_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_staff_goals_target_date ON staff_goals(target_date) WHERE target_date IS NOT NULL;

COMMENT ON TABLE staff_goals IS 'Individual staff goals tracked across reviews - moved from JSONB to proper table';
COMMENT ON COLUMN staff_goals.goal_text IS 'The goal description (e.g., "Complete first aid certification")';
COMMENT ON COLUMN staff_goals.goal_category IS 'Type of goal: skill_development, performance, leadership, certification, custom';
COMMENT ON COLUMN staff_goals.created_in_review_id IS 'Which review created this goal (for tracking)';
COMMENT ON COLUMN staff_goals.xp_reward IS 'XP awarded when this goal is completed';
COMMENT ON COLUMN staff_goals.completion_notes IS 'Notes about how/when goal was completed';

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_staff_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_staff_goals_updated_at ON staff_goals;
CREATE TRIGGER trigger_staff_goals_updated_at
  BEFORE UPDATE ON staff_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_staff_goals_updated_at();

-- =====================================================
-- 4. CREATE disc_mini_questions TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS disc_mini_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'scenario' CHECK (question_type IN ('scenario', 'preference', 'reaction', 'style')),
  options JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for disc_mini_questions
CREATE INDEX IF NOT EXISTS idx_disc_questions_active ON disc_mini_questions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_disc_questions_usage ON disc_mini_questions(usage_count);

COMMENT ON TABLE disc_mini_questions IS 'Rotating DISC personality mini-questions shown during reviews (3 per review)';
COMMENT ON COLUMN disc_mini_questions.question_text IS 'The question text (e.g., "When something breaks during the day, I usually...")';
COMMENT ON COLUMN disc_mini_questions.question_type IS 'Type of question: scenario, preference, reaction, style';
COMMENT ON COLUMN disc_mini_questions.options IS 'Array of answer options: [{text: "Fix it immediately", disc_color: "red"}, ...]';
COMMENT ON COLUMN disc_mini_questions.usage_count IS 'Track how many times this question has been shown (for rotation logic)';

-- =====================================================
-- 5. CREATE HELPER VIEWS
-- =====================================================

-- View: Active Staff Goals with Progress
CREATE OR REPLACE VIEW staff_goals_active AS
SELECT 
  sg.*,
  CASE 
    WHEN sg.target_date IS NULL THEN 'no_deadline'
    WHEN sg.target_date < CURRENT_DATE THEN 'overdue'
    WHEN sg.target_date < CURRENT_DATE + INTERVAL '7 days' THEN 'due_soon'
    ELSE 'on_track'
  END as urgency_status,
  EXTRACT(DAY FROM sg.target_date - CURRENT_DATE)::INTEGER as days_until_due
FROM staff_goals sg
WHERE sg.status = 'active'
ORDER BY sg.target_date NULLS LAST;

COMMENT ON VIEW staff_goals_active IS 'Active staff goals with urgency indicators';

-- View: Goal Completion Stats per Staff
CREATE OR REPLACE VIEW staff_goal_stats AS
SELECT 
  staff_id,
  COUNT(*) as total_goals,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_goals,
  COUNT(*) FILTER (WHERE status = 'active') as active_goals,
  COUNT(*) FILTER (WHERE status = 'abandoned') as abandoned_goals,
  CASE 
    WHEN COUNT(*) > 0 THEN 
      ROUND((COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
    ELSE 0
  END as completion_rate_percent,
  MAX(completed_at) FILTER (WHERE status = 'completed') as last_goal_completed_at,
  SUM(xp_reward) FILTER (WHERE status = 'completed') as total_xp_from_goals
FROM staff_goals
GROUP BY staff_id;

COMMENT ON VIEW staff_goal_stats IS 'Goal completion statistics per staff member';

-- View: Review XP Leaderboard
CREATE OR REPLACE VIEW review_xp_leaderboard AS
SELECT 
  sr.staff_id,
  COUNT(*) as total_reviews,
  SUM(sr.xp_earned) as total_xp_earned,
  AVG(sr.xp_earned) as avg_xp_per_review,
  SUM(sr.coins_earned) as total_coins_earned,
  MAX(sr.review_date) as last_review_date,
  ARRAY_AGG(DISTINCT unnest_val) FILTER (WHERE unnest_val IS NOT NULL) as all_achievements
FROM staff_reviews sr
LEFT JOIN LATERAL unnest(sr.achievement_ids) unnest_val ON true
WHERE sr.xp_earned > 0
GROUP BY sr.staff_id
ORDER BY total_xp_earned DESC;

COMMENT ON VIEW review_xp_leaderboard IS 'XP and achievements leaderboard from reviews';

-- =====================================================
-- 6. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function: Calculate Goal Completion Rate for a Staff Member
CREATE OR REPLACE FUNCTION calculate_goal_completion_rate(
  p_staff_id UUID,
  p_since_date DATE DEFAULT NULL
)
RETURNS NUMERIC AS $$
DECLARE
  v_total INTEGER;
  v_completed INTEGER;
BEGIN
  -- Count goals since date (or all time if null)
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed')
  INTO v_total, v_completed
  FROM staff_goals
  WHERE staff_id = p_staff_id
    AND (p_since_date IS NULL OR created_at::DATE >= p_since_date);
  
  -- Calculate percentage
  IF v_total = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND((v_completed::NUMERIC / v_total::NUMERIC) * 100, 2);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_goal_completion_rate IS 'Calculate goal completion rate % for a staff member since a date';

-- Function: Get Next DISC Questions (least used, active)
CREATE OR REPLACE FUNCTION get_next_disc_questions(p_count INTEGER DEFAULT 3)
RETURNS TABLE (
  id UUID,
  question_text TEXT,
  question_type TEXT,
  options JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dmq.id,
    dmq.question_text,
    dmq.question_type,
    dmq.options
  FROM disc_mini_questions dmq
  WHERE dmq.is_active = true
  ORDER BY dmq.usage_count ASC, RANDOM()
  LIMIT p_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_next_disc_questions IS 'Get N DISC questions (prioritizing least-used, then random)';

-- Function: Increment DISC Question Usage
CREATE OR REPLACE FUNCTION increment_disc_question_usage(p_question_ids UUID[])
RETURNS VOID AS $$
BEGIN
  UPDATE disc_mini_questions
  SET usage_count = usage_count + 1
  WHERE id = ANY(p_question_ids);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment_disc_question_usage IS 'Increment usage count for shown DISC questions';

-- =====================================================
-- 7. BACKFILL HELPER FUNCTION
-- =====================================================

-- Function: Migrate Goals from JSONB to Table
CREATE OR REPLACE FUNCTION migrate_goals_to_table(p_review_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_staff_id UUID;
  v_goals_next JSONB;
  v_goal_text TEXT;
  v_count INTEGER := 0;
BEGIN
  -- Get review details
  SELECT staff_id, goals_next INTO v_staff_id, v_goals_next
  FROM staff_reviews
  WHERE id = p_review_id;
  
  -- If no goals, return
  IF v_goals_next IS NULL OR jsonb_array_length(v_goals_next) = 0 THEN
    RETURN 0;
  END IF;
  
  -- Insert each goal as a record
  FOR v_goal_text IN SELECT jsonb_array_elements_text(v_goals_next)
  LOOP
    INSERT INTO staff_goals (staff_id, goal_text, created_in_review_id, status, goal_category)
    VALUES (v_staff_id, v_goal_text, p_review_id, 'active', 'custom');
    
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION migrate_goals_to_table IS 'Migrate goals_next JSONB array to staff_goals table records';

COMMIT;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Added:
-- - 17 new columns to staff_reviews
-- - 5 new columns to review_templates
-- - staff_goals table (goal tracking)
-- - disc_mini_questions table (rotating questions)
-- - 3 helper views (active goals, stats, leaderboard)
-- - 4 helper functions (goal calc, DISC questions, migration)
--
-- Next: Run migration 20251016000003 to update templates
-- Then: Run migration 20251016000004 to seed DISC questions

