-- =====================================================
-- REVIEWS v1.1 SCHEMA VERIFICATION
-- =====================================================
-- Run this in Supabase SQL Editor to verify v1.1 installation
-- Project: gjlgaufihseaagzmidhc
-- Date: 2025-10-16
-- =====================================================

-- Check for v1.1 columns in staff_reviews
SELECT 
  'staff_reviews' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'staff_reviews'
  AND column_name IN (
    'disc_snapshot',
    'disc_evolution', 
    'disc_questions_answered',
    'xp_earned',
    'coins_earned',
    'achievement_ids',
    'self_assessment',
    'self_rating_average',
    'manager_vs_self_delta',
    'emotional_scores',
    'team_mood_impact',
    'wellbeing_score',
    'review_trigger_type',
    'goal_completion_rate',
    'goals_achieved',
    'goals_total',
    'triggered_by_goal_id'
  )
ORDER BY column_name;

-- Expected result: 17 rows if v1.1 is fully applied
-- If you see fewer rows, re-run RUN_IN_SUPABASE_REVIEWS_V11.sql

-- Verify staff_goals table exists
SELECT 
  'staff_goals' as table_name,
  COUNT(*) as column_count
FROM information_schema.columns
WHERE table_name = 'staff_goals';

-- Expected result: 1 row showing column_count = 11

-- Verify disc_mini_questions table exists
SELECT 
  'disc_mini_questions' as table_name,
  COUNT(*) as column_count,
  (SELECT COUNT(*) FROM disc_mini_questions) as row_count
FROM information_schema.columns
WHERE table_name = 'disc_mini_questions'
GROUP BY table_name;

-- Expected result: 1 row showing column_count = 9, row_count = 25

-- Verify review_templates has v1.1 columns
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'review_templates'
  AND column_name IN (
    'disc_injection_enabled',
    'self_assessment_required',
    'gamification_enabled',
    'xp_base_reward',
    'emotional_metrics'
  )
ORDER BY column_name;

-- Expected result: 5 rows

-- Summary
DO $$ 
DECLARE
  v11_columns INTEGER;
  goals_table INTEGER;
  disc_table INTEGER;
  template_v11 INTEGER;
BEGIN
  SELECT COUNT(*) INTO v11_columns
  FROM information_schema.columns
  WHERE table_name = 'staff_reviews'
    AND column_name IN (
      'disc_snapshot', 'disc_evolution', 'disc_questions_answered',
      'xp_earned', 'coins_earned', 'achievement_ids',
      'self_assessment', 'self_rating_average', 'manager_vs_self_delta',
      'emotional_scores', 'team_mood_impact', 'wellbeing_score',
      'review_trigger_type', 'goal_completion_rate', 'goals_achieved',
      'goals_total', 'triggered_by_goal_id'
    );
    
  SELECT COUNT(*) INTO goals_table
  FROM information_schema.tables
  WHERE table_name = 'staff_goals';
  
  SELECT COUNT(*) INTO disc_table
  FROM information_schema.tables
  WHERE table_name = 'disc_mini_questions';
  
  SELECT COUNT(*) INTO template_v11
  FROM information_schema.columns
  WHERE table_name = 'review_templates'
    AND column_name IN (
      'disc_injection_enabled', 'self_assessment_required',
      'gamification_enabled', 'xp_base_reward', 'emotional_metrics'
    );
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'REVIEWS v1.1 VERIFICATION SUMMARY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'staff_reviews v1.1 columns: % / 17 expected', v11_columns;
  RAISE NOTICE 'staff_goals table exists: %', CASE WHEN goals_table = 1 THEN 'YES ✓' ELSE 'NO ✗' END;
  RAISE NOTICE 'disc_mini_questions table exists: %', CASE WHEN disc_table = 1 THEN 'YES ✓' ELSE 'NO ✗' END;
  RAISE NOTICE 'review_templates v1.1 columns: % / 5 expected', template_v11;
  RAISE NOTICE '';
  
  IF v11_columns = 17 AND goals_table = 1 AND disc_table = 1 AND template_v11 = 5 THEN
    RAISE NOTICE '✅ Reviews v1.1 is FULLY INSTALLED!';
    RAISE NOTICE 'You can proceed with frontend integration.';
  ELSE
    RAISE NOTICE '⚠️  Reviews v1.1 is INCOMPLETE!';
    RAISE NOTICE 'Please run RUN_IN_SUPABASE_REVIEWS_V11.sql in Supabase SQL Editor.';
  END IF;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
END $$;

