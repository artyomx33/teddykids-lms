-- =====================================================
-- FIX REVIEWS V11 COMPLETE SCHEMA
-- =====================================================
-- Date: 2025-10-19
-- Purpose: Fix 4 critical database errors preventing Review System from working
-- Guardian Verified: Development-first approach (RLS disabled)
-- Architect Verified: Zero functionality loss, all fields preserved
-- =====================================================

-- =====================================================
-- PART 1: CREATE user_roles TABLE
-- =====================================================

-- Create user_roles table for permission management
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'staff')),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);

-- DISABLE RLS (Guardian philosophy: development-first)
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE user_roles IS 'RLS disabled for development. Enable before production deployment.';

-- =====================================================
-- PART 2: ADD MISSING COLUMNS TO staff_reviews
-- =====================================================

-- Add DISC snapshot column (JSONB for flexibility)
ALTER TABLE staff_reviews 
  ADD COLUMN IF NOT EXISTS disc_snapshot JSONB DEFAULT NULL;

-- Add review-specific assessment columns
ALTER TABLE staff_reviews
  ADD COLUMN IF NOT EXISTS adaptability_speed INTEGER CHECK (adaptability_speed >= 1 AND adaptability_speed <= 5),
  ADD COLUMN IF NOT EXISTS initiative_taken INTEGER CHECK (initiative_taken >= 1 AND initiative_taken <= 5),
  ADD COLUMN IF NOT EXISTS team_reception_score INTEGER CHECK (team_reception_score >= 1 AND team_reception_score <= 5);

-- Add self-assessment fields
ALTER TABLE staff_reviews
  ADD COLUMN IF NOT EXISTS self_assessment JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS manager_vs_self_delta NUMERIC(5,2);

-- Add emotional intelligence scores
ALTER TABLE staff_reviews
  ADD COLUMN IF NOT EXISTS emotional_scores JSONB DEFAULT NULL;

-- Add gamification & advanced fields
ALTER TABLE staff_reviews
  ADD COLUMN IF NOT EXISTS xp_earned INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS wellbeing_score INTEGER CHECK (wellbeing_score >= 0 AND wellbeing_score <= 100),
  ADD COLUMN IF NOT EXISTS review_trigger_type TEXT DEFAULT 'manual' CHECK (review_trigger_type IN ('manual', 'scheduled', 'automated'));

-- Add warning/performance fields
ALTER TABLE staff_reviews
  ADD COLUMN IF NOT EXISTS warning_level INTEGER CHECK (warning_level >= 1 AND warning_level <= 3),
  ADD COLUMN IF NOT EXISTS behavior_score INTEGER CHECK (behavior_score >= 0 AND behavior_score <= 100),
  ADD COLUMN IF NOT EXISTS impact_score INTEGER CHECK (impact_score >= 0 AND impact_score <= 100),
  ADD COLUMN IF NOT EXISTS support_suggestions JSONB DEFAULT '[]'::jsonb;

-- Add promotion/salary fields
ALTER TABLE staff_reviews
  ADD COLUMN IF NOT EXISTS promotion_readiness_score INTEGER CHECK (promotion_readiness_score >= 0 AND promotion_readiness_score <= 100),
  ADD COLUMN IF NOT EXISTS leadership_potential_score INTEGER CHECK (leadership_potential_score >= 0 AND leadership_potential_score <= 100),
  ADD COLUMN IF NOT EXISTS salary_suggestion_reason TEXT,
  ADD COLUMN IF NOT EXISTS future_raise_goal TEXT;

-- Add DISC questions answered tracking
ALTER TABLE staff_reviews
  ADD COLUMN IF NOT EXISTS disc_questions_answered JSONB DEFAULT NULL;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_staff_reviews_disc_snapshot ON staff_reviews(staff_id) WHERE disc_snapshot IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_staff_reviews_xp_earned ON staff_reviews(xp_earned) WHERE xp_earned > 0;

-- =====================================================
-- PART 3: CREATE applications TABLE
-- =====================================================

-- Create applications table for DISC profile history
-- NOTE: staff_id references the 'staff' VIEW, not a table
-- PostgreSQL doesn't allow FK constraints to views, so referential integrity
-- is handled at the application level (which is already the case)
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL, -- References staff VIEW (no FK constraint possible)
  disc_profile JSONB NOT NULL,
  application_status TEXT DEFAULT 'pending' CHECK (application_status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_applications_staff_id ON applications(staff_id);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_staff_disc ON applications(staff_id) WHERE disc_profile IS NOT NULL;

-- DISABLE RLS (Guardian philosophy)
ALTER TABLE applications DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE applications IS 'RLS disabled for development. Enable before production deployment.';

-- =====================================================
-- PART 4: VERIFICATION & COMMENTS
-- =====================================================

-- Verify all changes
DO $$
DECLARE
  user_roles_exists BOOLEAN;
  applications_exists BOOLEAN;
  disc_snapshot_exists BOOLEAN;
  adaptability_exists BOOLEAN;
BEGIN
  -- Check user_roles table
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'user_roles'
  ) INTO user_roles_exists;

  -- Check applications table
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'applications'
  ) INTO applications_exists;

  -- Check disc_snapshot column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'staff_reviews' AND column_name = 'disc_snapshot'
  ) INTO disc_snapshot_exists;

  -- Check adaptability_speed column
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'staff_reviews' AND column_name = 'adaptability_speed'
  ) INTO adaptability_exists;

  -- Report results
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '🔍 Migration Verification Results:';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  
  IF user_roles_exists THEN
    RAISE NOTICE '✅ user_roles table created';
  ELSE
    RAISE WARNING '⚠️ user_roles table NOT found';
  END IF;

  IF applications_exists THEN
    RAISE NOTICE '✅ applications table created';
  ELSE
    RAISE WARNING '⚠️ applications table NOT found';
  END IF;

  IF disc_snapshot_exists THEN
    RAISE NOTICE '✅ disc_snapshot column added to staff_reviews';
  ELSE
    RAISE WARNING '⚠️ disc_snapshot column NOT found';
  END IF;

  IF adaptability_exists THEN
    RAISE NOTICE '✅ adaptability_speed column added to staff_reviews';
  ELSE
    RAISE WARNING '⚠️ adaptability_speed column NOT found';
  END IF;

  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '🎉 Migration completed!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

-- Add helpful comments
COMMENT ON COLUMN staff_reviews.disc_snapshot IS 'JSONB snapshot of DISC personality assessment results';
COMMENT ON COLUMN staff_reviews.adaptability_speed IS 'Rating 1-5: How quickly employee adapts to changes';
COMMENT ON COLUMN staff_reviews.initiative_taken IS 'Rating 1-5: Level of proactive initiative demonstrated';
COMMENT ON COLUMN staff_reviews.team_reception_score IS 'Rating 1-5: How well received by team members';
COMMENT ON COLUMN staff_reviews.self_assessment IS 'JSONB containing self-assessment ratings and reflections';
COMMENT ON COLUMN staff_reviews.manager_vs_self_delta IS 'Difference between manager and self ratings';
COMMENT ON COLUMN staff_reviews.emotional_scores IS 'JSONB containing emotional intelligence scores';
COMMENT ON COLUMN staff_reviews.xp_earned IS 'Gamification: Experience points earned from this review';
COMMENT ON COLUMN staff_reviews.wellbeing_score IS 'Overall wellbeing assessment score (0-100)';
COMMENT ON COLUMN staff_reviews.review_trigger_type IS 'How this review was initiated';
COMMENT ON COLUMN staff_reviews.warning_level IS 'Warning severity level (1=low, 2=medium, 3=high)';
COMMENT ON COLUMN staff_reviews.behavior_score IS 'Behavioral assessment score (0-100)';
COMMENT ON COLUMN staff_reviews.impact_score IS 'Impact/contribution score (0-100)';
COMMENT ON COLUMN staff_reviews.support_suggestions IS 'JSONB array of support/improvement suggestions';
COMMENT ON COLUMN staff_reviews.promotion_readiness_score IS 'Readiness for promotion (0-100)';
COMMENT ON COLUMN staff_reviews.leadership_potential_score IS 'Leadership potential assessment (0-100)';
COMMENT ON COLUMN staff_reviews.salary_suggestion_reason IS 'Explanation for salary recommendation';
COMMENT ON COLUMN staff_reviews.future_raise_goal IS 'Target for future salary increases';
COMMENT ON COLUMN staff_reviews.disc_questions_answered IS 'JSONB tracking DISC mini-quiz responses';

COMMENT ON TABLE applications IS 'Stores historical DISC personality profiles from job applications';
COMMENT ON COLUMN applications.disc_profile IS 'JSONB containing complete DISC assessment results';
COMMENT ON COLUMN applications.application_status IS 'Current status of the application';

