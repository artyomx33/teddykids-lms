-- =====================================================
-- FIX REVIEW TEMPLATES - FULL v1.1 QUESTIONS
-- =====================================================
-- Run this in Supabase SQL Editor to add all v1.1 questions
-- Date: 2025-10-16
--
-- This will DELETE old templates and INSERT new ones with
-- full questions, DISC injection, and self-assessment
-- =====================================================

BEGIN;

-- Delete old templates (we'll recreate them fresh)
DELETE FROM review_templates;

-- =====================================================
-- 1. FIRST-MONTH REVIEW (Probation)
-- =====================================================
INSERT INTO review_templates (
  name, description, type, questions, criteria, scoring_method,
  disc_injection_enabled, self_assessment_required,
  gamification_enabled, xp_base_reward, emotional_metrics,
  is_active
) VALUES (
  'First-Month Review',
  'Initial impressions, onboarding success, and early engagement assessment',
  'probation',
  '[
    {
      "question": "How well has the employee adapted to the role and company culture?",
      "type": "rating",
      "required": true,
      "category": "adaptation"
    },
    {
      "question": "Rate adaptability speed (learning new routines, adjusting to environment)",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "Rate initiative taken (asking questions, suggesting improvements)",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "Has the employee demonstrated the core competencies required for this position?",
      "type": "boolean",
      "required": true,
      "category": "competencies"
    },
    {
      "question": "How well has the team received this person?",
      "type": "text",
      "required": true,
      "category": "team_fit"
    },
    {
      "question": "What are the employee''s key strengths observed so far?",
      "type": "text",
      "required": true,
      "category": "strengths"
    },
    {
      "question": "Are there any areas where additional training or support is needed?",
      "type": "text",
      "required": false,
      "category": "development"
    },
    {
      "question": "Rate the employee''s communication and teamwork",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "Rate the employee''s work quality and attention to detail",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "Should this employee''s probation period be confirmed?",
      "type": "select",
      "required": true,
      "category": "decision",
      "options": ["Confirm employment", "Extend probation period", "Terminate employment"]
    }
  ]'::jsonb,
  '{"adaptation": 20, "competencies": 20, "communication": 20, "work_quality": 20, "teamwork": 20}'::jsonb,
  'five_star',
  true,  -- disc_injection_enabled
  true,  -- self_assessment_required
  true,  -- gamification_enabled
  250,   -- xp_base_reward
  '["adaptability", "team_reception", "stress_handling"]'::jsonb,
  true   -- is_active
);

-- =====================================================
-- 2. SIX-MONTH REVIEW
-- =====================================================
INSERT INTO review_templates (
  name, description, type, questions, criteria, scoring_method,
  disc_injection_enabled, self_assessment_required,
  gamification_enabled, xp_base_reward, emotional_metrics,
  is_active
) VALUES (
  'Six Month Review',
  'Performance assessment, team fit evaluation, and goal progress tracking',
  'six_month',
  '[
    {
      "question": "Rate overall job performance",
      "type": "rating",
      "required": true,
      "category": "performance"
    },
    {
      "question": "Rate teamwork and collaboration",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "Rate communication skills",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "Rate reliability and consistency",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "Rate initiative and proactivity",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "Rate flexibility with schedule and changes",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "Rate professional behavior (timing, dress, boundaries)",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "Rate energy and positivity",
      "type": "rating",
      "required": true,
      "category": "ei"
    },
    {
      "question": "Rate ability to follow routines correctly",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "Rate safety awareness",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "Rate conflict handling (with kids, colleagues, parents)",
      "type": "rating",
      "required": true,
      "category": "ei"
    },
    {
      "question": "What are the key achievements since starting?",
      "type": "text",
      "required": true,
      "category": "achievements"
    },
    {
      "question": "What areas need improvement?",
      "type": "text",
      "required": true,
      "category": "development"
    },
    {
      "question": "What goals should be set for the next period?",
      "type": "text",
      "required": true,
      "category": "goals"
    }
  ]'::jsonb,
  '{"performance": 25, "teamwork": 15, "communication": 15, "reliability": 15, "initiative": 15, "professionalism": 15}'::jsonb,
  'five_star',
  true,  -- disc_injection_enabled
  true,  -- self_assessment_required
  true,  -- gamification_enabled
  500,   -- xp_base_reward
  '["energy", "positivity", "conflict_handling", "team_support"]'::jsonb,
  true
);

-- =====================================================
-- 3. YEARLY REVIEW (Annual)
-- =====================================================
INSERT INTO review_templates (
  name, description, type, questions, criteria, scoring_method,
  disc_injection_enabled, self_assessment_required,
  gamification_enabled, xp_base_reward, emotional_metrics,
  is_active
) VALUES (
  'Yearly Review',
  'Comprehensive annual performance review with growth planning and DISC evolution tracking',
  'yearly',
  '[
    {
      "question": "Rate overall performance this year",
      "type": "rating",
      "required": true,
      "category": "performance"
    },
    {
      "question": "Rate teamwork and collaboration",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "Rate communication skills",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "Rate reliability and consistency",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "Rate initiative and proactivity",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "Rate professional development and growth",
      "type": "rating",
      "required": true,
      "category": "development"
    },
    {
      "question": "Rate leadership and mentoring (if applicable)",
      "type": "rating",
      "required": false,
      "category": "leadership"
    },
    {
      "question": "What were the major achievements this year?",
      "type": "text",
      "required": true,
      "category": "achievements"
    },
    {
      "question": "What goals were completed? (Goal completion rate)",
      "type": "text",
      "required": true,
      "category": "goals"
    },
    {
      "question": "What challenges were overcome?",
      "type": "text",
      "required": false,
      "category": "challenges"
    },
    {
      "question": "What areas need improvement in the coming year?",
      "type": "text",
      "required": true,
      "category": "development"
    },
    {
      "question": "What would you like to become within Teddy Kids?",
      "type": "text",
      "required": false,
      "category": "aspirations"
    },
    {
      "question": "What are your goals for next year?",
      "type": "text",
      "required": true,
      "category": "goals"
    }
  ]'::jsonb,
  '{"performance": 30, "growth": 20, "teamwork": 15, "leadership": 15, "goals": 20}'::jsonb,
  'five_star',
  true,  -- disc_injection_enabled
  true,  -- self_assessment_required
  true,  -- gamification_enabled
  1000,  -- xp_base_reward
  '["growth_mindset", "resilience", "aspirations", "wellbeing"]'::jsonb,
  true
);

-- =====================================================
-- 4. PERFORMANCE IMPROVEMENT REVIEW
-- =====================================================
INSERT INTO review_templates (
  name, description, type, questions, criteria, scoring_method,
  disc_injection_enabled, self_assessment_required,
  gamification_enabled, xp_base_reward, emotional_metrics,
  is_active
) VALUES (
  'Performance Improvement Review',
  'Focused review for addressing performance issues and setting improvement goals',
  'performance',
  '[
    {
      "question": "What is the primary reason for this performance review?",
      "type": "text",
      "required": true,
      "category": "context"
    },
    {
      "question": "Have the previously identified performance issues improved?",
      "type": "select",
      "required": true,
      "category": "progress",
      "options": ["Significant improvement", "Some improvement", "No change", "Worsened"]
    },
    {
      "question": "Rate current performance level",
      "type": "rating",
      "required": true,
      "category": "performance"
    },
    {
      "question": "Rate attendance and punctuality",
      "type": "rating",
      "required": true,
      "category": "reliability"
    },
    {
      "question": "Rate teamwork and cooperation",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "Rate communication with team and parents",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "What specific areas need immediate improvement?",
      "type": "text",
      "required": true,
      "category": "improvement"
    },
    {
      "question": "What support or resources are needed to improve?",
      "type": "text",
      "required": true,
      "category": "support"
    },
    {
      "question": "What are the measurable goals for the next 30/60/90 days?",
      "type": "text",
      "required": true,
      "category": "goals"
    },
    {
      "question": "What are the consequences if improvement targets are not met?",
      "type": "text",
      "required": true,
      "category": "expectations"
    }
  ]'::jsonb,
  '{"performance": 30, "reliability": 20, "teamwork": 20, "communication": 15, "improvement": 15}'::jsonb,
  'five_star',
  false,  -- disc_injection_enabled (focus on performance)
  true,   -- self_assessment_required
  false,  -- gamification_enabled (serious review)
  0,      -- xp_base_reward
  '["stress_tolerance", "receptiveness", "accountability"]'::jsonb,
  true
);

-- =====================================================
-- 5. EXIT REVIEW
-- =====================================================
INSERT INTO review_templates (
  name, description, type, questions, criteria, scoring_method,
  disc_injection_enabled, self_assessment_required,
  gamification_enabled, xp_base_reward, emotional_metrics,
  is_active
) VALUES (
  'Exit Review',
  'Final review for departing employees to gather feedback and ensure smooth transition',
  'exit',
  '[
    {
      "question": "What is the reason for leaving?",
      "type": "select",
      "required": true,
      "category": "reason",
      "options": ["Career growth", "Relocation", "Personal reasons", "Work environment", "Compensation", "Other"]
    },
    {
      "question": "Rate overall job satisfaction during employment",
      "type": "rating",
      "required": true,
      "category": "satisfaction"
    },
    {
      "question": "Rate relationship with team and management",
      "type": "rating",
      "required": true,
      "category": "relationships"
    },
    {
      "question": "Rate work-life balance",
      "type": "rating",
      "required": false,
      "category": "balance"
    },
    {
      "question": "What did you enjoy most about working here?",
      "type": "text",
      "required": true,
      "category": "positive"
    },
    {
      "question": "What could we improve as an organization?",
      "type": "text",
      "required": true,
      "category": "feedback"
    },
    {
      "question": "Would you recommend Teddy Kids as a place to work?",
      "type": "boolean",
      "required": true,
      "category": "recommendation"
    },
    {
      "question": "Any final comments or suggestions?",
      "type": "text",
      "required": false,
      "category": "comments"
    }
  ]'::jsonb,
  '{"satisfaction": 25, "relationships": 25, "feedback": 25, "professionalism": 25}'::jsonb,
  'five_star',
  false,  -- disc_injection_enabled
  true,   -- self_assessment_required
  false,  -- gamification_enabled
  0,      -- xp_base_reward
  '["satisfaction", "wellbeing", "relationships"]'::jsonb,
  true
);

-- =====================================================
-- 6. CUSTOM REVIEW TEMPLATE
-- =====================================================
INSERT INTO review_templates (
  name, description, type, questions, criteria, scoring_method,
  disc_injection_enabled, self_assessment_required,
  gamification_enabled, xp_base_reward, emotional_metrics,
  is_active
) VALUES (
  'Custom Review Template',
  'Flexible template for ad-hoc reviews and special circumstances',
  'custom',
  '[
    {
      "question": "Rate overall performance",
      "type": "rating",
      "required": true,
      "category": "performance"
    },
    {
      "question": "Rate teamwork and collaboration",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "Rate communication skills",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "What are the key points to discuss?",
      "type": "text",
      "required": true,
      "category": "discussion"
    },
    {
      "question": "What are the action items or next steps?",
      "type": "text",
      "required": true,
      "category": "actions"
    }
  ]'::jsonb,
  '{"performance": 40, "teamwork": 30, "communication": 30}'::jsonb,
  'five_star',
  true,   -- disc_injection_enabled
  true,   -- self_assessment_required
  true,   -- gamification_enabled
  300,    -- xp_base_reward
  '["adaptability", "openness"]'::jsonb,
  true
);

COMMIT;

-- Verification query
SELECT 
  id,
  name,
  type as review_type,
  jsonb_array_length(questions) as question_count,
  disc_injection_enabled,
  self_assessment_required,
  gamification_enabled,
  xp_base_reward
FROM review_templates
ORDER BY name;

-- Success message
DO $$ BEGIN
  RAISE NOTICE '✅ Review templates fixed! All 6 templates now have full v1.1 questions.';
  RAISE NOTICE '📝 Each template includes:';
  RAISE NOTICE '   - Multiple rating questions (star ratings)';
  RAISE NOTICE '   - Text questions for detailed feedback';
  RAISE NOTICE '   - DISC injection enabled (3 mini-questions)';
  RAISE NOTICE '   - Self-assessment required (reflect & respond section)';
  RAISE NOTICE '   - Gamification with XP rewards';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next: Refresh browser and create a new review!';
END $$;

