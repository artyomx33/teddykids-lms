-- =====================================================
-- REVIEWS SYSTEM v1.1 - COMBINED MIGRATIONS
-- =====================================================
-- Run this in Supabase SQL Editor to apply all v1.1 upgrades
-- Project: gjlgaufihseaagzmidhc
-- Date: 2025-10-16
-- 
-- IMPORTANT: Make sure v1.0 migrations are already applied!
-- (Run RUN_IN_SUPABASE_REVIEWS_MIGRATIONS.sql first if not done)
--
-- This upgrades Reviews from v1.0 to v1.1 (Legendary Edition)
-- =====================================================

-- Check if v1.0 is applied
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'staff_reviews' AND column_name = 'star_rating'
  ) THEN
    RAISE EXCEPTION 'Reviews v1.0 not found! Please run RUN_IN_SUPABASE_REVIEWS_MIGRATIONS.sql first';
  END IF;
  
  RAISE NOTICE '✅ Reviews v1.0 detected. Proceeding with v1.1 upgrade...';
END $$;

-- =====================================================
-- PART 1: INTEGRATION SCHEMA (Migration 20251016000002)
-- =====================================================

BEGIN;

RAISE NOTICE 'Installing v1.1 Integration Schema...';

-- DISC Integration (3 columns)
ALTER TABLE staff_reviews
  ADD COLUMN IF NOT EXISTS disc_snapshot JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS disc_evolution TEXT,
  ADD COLUMN IF NOT EXISTS disc_questions_answered JSONB DEFAULT '[]'::jsonb;

-- Gamification Integration (3 columns)
ALTER TABLE staff_reviews
  ADD COLUMN IF NOT EXISTS xp_earned INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coins_earned INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS achievement_ids TEXT[] DEFAULT '{}';

-- Self-Assessment (3 columns)
ALTER TABLE staff_reviews
  ADD COLUMN IF NOT EXISTS self_assessment JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS self_rating_average NUMERIC(3,2),
  ADD COLUMN IF NOT EXISTS manager_vs_self_delta NUMERIC(3,2);

-- Emotional Intelligence Metrics (3 columns)
ALTER TABLE staff_reviews
  ADD COLUMN IF NOT EXISTS emotional_scores JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS team_mood_impact TEXT CHECK (team_mood_impact IN ('positive', 'neutral', 'needs_support')),
  ADD COLUMN IF NOT EXISTS wellbeing_score INTEGER CHECK (wellbeing_score >= 1 AND wellbeing_score <= 5);

-- Review Context & Triggers (2 columns)
ALTER TABLE staff_reviews
  ADD COLUMN IF NOT EXISTS review_trigger_type TEXT CHECK (review_trigger_type IN ('manual', 'auto_scheduled', 'warning', 'salary_review', 'promotion_review', 'intervention')),
  ADD COLUMN IF NOT EXISTS triggered_by_goal_id UUID;

-- Goal Completion Tracking (3 columns)
ALTER TABLE staff_reviews
  ADD COLUMN IF NOT EXISTS goal_completion_rate NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS goals_achieved INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS goals_total INTEGER DEFAULT 0;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_staff_reviews_xp_earned ON staff_reviews(xp_earned) WHERE xp_earned > 0;
CREATE INDEX IF NOT EXISTS idx_staff_reviews_team_mood ON staff_reviews(team_mood_impact) WHERE team_mood_impact IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_staff_reviews_trigger_type ON staff_reviews(review_trigger_type) WHERE review_trigger_type IS NOT NULL;

-- Update review_templates
ALTER TABLE review_templates
  ADD COLUMN IF NOT EXISTS disc_injection_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS self_assessment_required BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS gamification_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS xp_base_reward INTEGER DEFAULT 500,
  ADD COLUMN IF NOT EXISTS emotional_metrics JSONB DEFAULT '[]'::jsonb;

-- Create staff_goals table
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

CREATE INDEX IF NOT EXISTS idx_staff_goals_staff_id ON staff_goals(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_goals_status ON staff_goals(status) WHERE status = 'active';

-- Create disc_mini_questions table
CREATE TABLE IF NOT EXISTS disc_mini_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'scenario' CHECK (question_type IN ('scenario', 'preference', 'reaction', 'style')),
  options JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disc_questions_active ON disc_mini_questions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_disc_questions_usage ON disc_mini_questions(usage_count);

COMMIT;

RAISE NOTICE '✅ Integration schema installed';

-- =====================================================
-- PART 2: ENHANCED TEMPLATES (Migration 20251016000003)
-- =====================================================

-- NOTE: Template updates removed for brevity in this combined file
-- Templates will be updated with XP rewards and new features
-- Run individual migration file for full template JSON if needed

RAISE NOTICE 'Updating review templates with v1.1 features...';

-- Enable v1.1 features on existing templates
UPDATE review_templates SET
  disc_injection_enabled = true,
  self_assessment_required = true,
  gamification_enabled = true,
  xp_base_reward = CASE type
    WHEN 'probation' THEN 250
    WHEN 'six_month' THEN 500
    WHEN 'yearly' THEN 1000
    WHEN 'performance' THEN 1500
    WHEN 'exit' THEN 0
    WHEN 'custom' THEN 500
    ELSE 500
  END,
  emotional_metrics = CASE type
    WHEN 'probation' THEN '["adaptability", "team_reception", "stress_handling"]'::jsonb
    WHEN 'six_month' THEN '["empathy", "stress_tolerance", "team_support"]'::jsonb
    WHEN 'yearly' THEN '["empathy", "stress_tolerance", "emotional_regulation", "team_support", "conflict_resolution"]'::jsonb
    WHEN 'performance' THEN '["leadership_presence", "empathy", "stress_tolerance"]'::jsonb
    WHEN 'exit' THEN '["satisfaction", "support_felt", "culture_fit"]'::jsonb
    ELSE '["overall_wellbeing"]'::jsonb
  END
WHERE is_active = true;

RAISE NOTICE '✅ Templates updated with v1.1 features';

-- =====================================================
-- PART 3: DISC QUESTIONS (Migration 20251016000004)
-- =====================================================

RAISE NOTICE 'Seeding DISC mini-questions...';

-- Sample questions (add more as needed)
INSERT INTO disc_mini_questions (question_text, question_type, options) VALUES
('When something breaks during the day, I usually...', 'scenario', 
'[
  {"text": "Fix it immediately without asking", "disc_color": "red", "points": 3},
  {"text": "Find a fun way to adapt the activity", "disc_color": "yellow", "points": 3},
  {"text": "Check the routine and make a structured plan", "disc_color": "blue", "points": 3},
  {"text": "Ask a colleague and stay calm", "disc_color": "green", "points": 3}
]'::jsonb),

('When there''s conflict in the team, I tend to...', 'reaction', 
'[
  {"text": "Step in and take control", "disc_color": "red", "points": 3},
  {"text": "Avoid it and hope it passes", "disc_color": "green", "points": 3},
  {"text": "Try to explain with facts", "disc_color": "blue", "points": 3},
  {"text": "Make a joke or break the tension", "disc_color": "yellow", "points": 3}
]'::jsonb),

('When a child is upset, my first instinct is to...', 'scenario', 
'[
  {"text": "Take charge and solve the problem quickly", "disc_color": "red", "points": 3},
  {"text": "Give them space and be patient", "disc_color": "green", "points": 3},
  {"text": "Follow the calming routine systematically", "disc_color": "blue", "points": 3},
  {"text": "Distract them with something fun", "disc_color": "yellow", "points": 3}
]'::jsonb)

ON CONFLICT DO NOTHING;

-- Note: Full set of 25 questions available in migration file 20251016000004

RAISE NOTICE '✅ DISC questions seeded';

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
  v_new_columns INTEGER;
  v_goals_table BOOLEAN;
  v_disc_table BOOLEAN;
  v_disc_count INTEGER;
BEGIN
  -- Check new columns
  SELECT COUNT(*) INTO v_new_columns
  FROM information_schema.columns
  WHERE table_name = 'staff_reviews'
    AND column_name IN ('xp_earned', 'disc_snapshot', 'self_assessment', 'emotional_scores', 'goal_completion_rate');
  
  -- Check new tables
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'staff_goals'
  ) INTO v_goals_table;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'disc_mini_questions'
  ) INTO v_disc_table;
  
  -- Check DISC questions
  SELECT COUNT(*) INTO v_disc_count FROM disc_mini_questions;
  
  -- Report
  RAISE NOTICE '';
  RAISE NOTICE '=== REVIEWS v1.1 INSTALLATION COMPLETE ===';
  RAISE NOTICE '';
  RAISE NOTICE '✅ New columns added: %', v_new_columns;
  RAISE NOTICE '✅ staff_goals table: %', CASE WHEN v_goals_table THEN 'Created' ELSE 'Failed' END;
  RAISE NOTICE '✅ disc_mini_questions table: %', CASE WHEN v_disc_table THEN 'Created' ELSE 'Failed' END;
  RAISE NOTICE '✅ DISC questions seeded: %', v_disc_count;
  RAISE NOTICE '';
  RAISE NOTICE '🎮 XP rewards enabled on all templates';
  RAISE NOTICE '🧠 DISC injection enabled on relevant templates';
  RAISE NOTICE '💭 Self-assessment enabled on all templates';
  RAISE NOTICE '❤️ Emotional intelligence metrics configured';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Ready for Phase 2: Frontend Implementation!';
  RAISE NOTICE '';
  
  -- Warnings
  IF v_new_columns < 5 THEN
    RAISE WARNING 'Some columns may not have been added. Check manually.';
  END IF;
  
  IF NOT v_goals_table OR NOT v_disc_table THEN
    RAISE WARNING 'Some tables were not created. Check for errors above.';
  END IF;
END $$;

-- =====================================================
-- QUICK QUERIES TO TEST
-- =====================================================

-- See v1.1 columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'staff_reviews' 
  AND column_name IN ('xp_earned', 'disc_snapshot', 'self_assessment', 'emotional_scores', 'goal_completion_rate', 'team_mood_impact')
ORDER BY column_name;

-- See updated templates with XP
SELECT type, name, xp_base_reward, disc_injection_enabled, self_assessment_required
FROM review_templates
WHERE is_active = true
ORDER BY xp_base_reward DESC;

-- See DISC questions
SELECT question_text, question_type, usage_count
FROM disc_mini_questions
WHERE is_active = true
ORDER BY usage_count ASC, random()
LIMIT 5;

-- Check staff_goals table
SELECT COUNT(*) as table_exists FROM staff_goals;

