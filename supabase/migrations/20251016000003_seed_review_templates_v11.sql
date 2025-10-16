-- =====================================================
-- REVIEWS SYSTEM v1.1 - ENHANCED TEMPLATES
-- =====================================================
-- Date: 2025-10-16
-- Phase 1: Update review templates with Luna's enhanced metrics
-- Includes: XP rewards, DISC injection, self-assessment, emotional metrics

BEGIN;

-- =====================================================
-- UPDATE EXISTING TEMPLATES WITH v1.1 FEATURES
-- =====================================================

-- 1. PROBATION REVIEW → FIRST-MONTH REVIEW
UPDATE review_templates
SET 
  name = 'First-Month Review',
  description = 'Initial impressions, onboarding success, and early engagement assessment',
  questions = '[
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
  criteria = '{
    "adaptation": 20,
    "competencies": 20,
    "communication": 20,
    "work_quality": 20,
    "teamwork": 20
  }'::jsonb,
  scoring_method = 'five_star',
  disc_injection_enabled = true,
  self_assessment_required = true,
  gamification_enabled = true,
  xp_base_reward = 250,
  emotional_metrics = '["adaptability", "team_reception", "stress_handling"]'::jsonb
WHERE type = 'probation'
  AND is_active = true;

-- 2. SIX-MONTH REVIEW (Enhanced)
UPDATE review_templates
SET 
  description = 'Standard 6-month check-in with self-assessment and goal tracking',
  questions = '[
    {
      "question": "How would you rate the employee''s overall performance in the past 6 months?",
      "type": "rating",
      "required": true,
      "category": "overall"
    },
    {
      "question": "What are the employee''s most significant achievements?",
      "type": "text",
      "required": true,
      "category": "achievements"
    },
    {
      "question": "Rate the quality and consistency of work delivered",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "Rate the employee''s initiative and problem-solving ability",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "Rate teamwork and collaboration with colleagues",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "Rate communication skills (verbal and written)",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "Rate flexibility with schedule and unexpected situations",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "What areas should the employee focus on for development?",
      "type": "text",
      "required": true,
      "category": "development"
    },
    {
      "question": "Are the employee''s goals from the last review being met?",
      "type": "boolean",
      "required": false,
      "category": "goals"
    },
    {
      "question": "Rate conflict handling (with kids, colleagues, parents)",
      "type": "rating",
      "required": true,
      "category": "core"
    }
  ]'::jsonb,
  criteria = '{
    "overall_performance": 20,
    "work_quality": 20,
    "initiative": 15,
    "teamwork": 15,
    "communication": 15,
    "goal_achievement": 15
  }'::jsonb,
  disc_injection_enabled = true,
  self_assessment_required = true,
  gamification_enabled = true,
  xp_base_reward = 500,
  emotional_metrics = '["empathy", "stress_tolerance", "team_support"]'::jsonb
WHERE type = 'six_month'
  AND is_active = true;

-- 3. ANNUAL REVIEW (Enhanced with Career Focus)
UPDATE review_templates
SET 
  description = 'Comprehensive annual review with focus on achievements, goals, career development, and DISC evolution',
  questions = '[
    {
      "question": "Overall performance rating for the year",
      "type": "rating",
      "required": true,
      "category": "overall"
    },
    {
      "question": "What were the employee''s most significant accomplishments this year?",
      "type": "text",
      "required": true,
      "category": "achievements"
    },
    {
      "question": "Were the goals set in the previous review achieved?",
      "type": "select",
      "required": true,
      "category": "goals",
      "options": ["All goals achieved", "Most goals achieved", "Some goals achieved", "Goals not achieved"]
    },
    {
      "question": "Rate job knowledge and expertise",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "Rate quality of work and attention to detail",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "Rate productivity and time management",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "Rate leadership and mentoring (if applicable)",
      "type": "rating",
      "required": false,
      "category": "leadership"
    },
    {
      "question": "Rate adaptability and learning agility",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "Rate communication and interpersonal skills",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "Rate teamwork and collaboration",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "What are the key development areas for the coming year?",
      "type": "text",
      "required": true,
      "category": "development"
    },
    {
      "question": "What would you like to become within Teddy Kids?",
      "type": "text",
      "required": false,
      "category": "career_aspiration"
    },
    {
      "question": "What are the employee''s career aspirations?",
      "type": "text",
      "required": false,
      "category": "career"
    },
    {
      "question": "Is the employee ready for promotion or increased responsibilities?",
      "type": "boolean",
      "required": false,
      "category": "promotion"
    },
    {
      "question": "Salary recommendation",
      "type": "select",
      "required": true,
      "category": "compensation",
      "options": ["Recommend increase", "Maintain current", "Under review", "Not recommended"]
    }
  ]'::jsonb,
  criteria = '{
    "overall_performance": 15,
    "job_knowledge": 15,
    "work_quality": 15,
    "productivity": 15,
    "communication": 10,
    "adaptability": 10,
    "leadership": 10,
    "goal_achievement": 10
  }'::jsonb,
  disc_injection_enabled = true,
  self_assessment_required = true,
  gamification_enabled = true,
  xp_base_reward = 1000,
  emotional_metrics = '["empathy", "stress_tolerance", "emotional_regulation", "team_support", "conflict_resolution"]'::jsonb
WHERE type = 'yearly'
  AND is_active = true;

-- 4. PERFORMANCE REVIEW → PROMOTION REVIEW
UPDATE review_templates
SET 
  name = 'Position/Promotion Review',
  type = 'performance',
  description = 'Assessment for promotion readiness, leadership potential, and increased responsibilities',
  questions = '[
    {
      "question": "What is the primary reason for this review?",
      "type": "text",
      "required": true,
      "category": "context"
    },
    {
      "question": "Rate current performance level",
      "type": "rating",
      "required": true,
      "category": "overall"
    },
    {
      "question": "Rate leadership readiness",
      "type": "rating",
      "required": true,
      "category": "leadership"
    },
    {
      "question": "Rate team impact and influence",
      "type": "rating",
      "required": true,
      "category": "leadership"
    },
    {
      "question": "Rate problem-solving maturity",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "Rate initiative and ownership",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "Why this person could lead others? (Open pitch)",
      "type": "text",
      "required": true,
      "category": "leadership_pitch"
    },
    {
      "question": "What specific strengths make them suitable for promotion?",
      "type": "text",
      "required": true,
      "category": "strengths"
    },
    {
      "question": "What areas need development before promotion?",
      "type": "text",
      "required": false,
      "category": "development"
    },
    {
      "question": "Recommended timeline for promotion",
      "type": "select",
      "required": true,
      "category": "timeline",
      "options": ["Ready now", "Ready in 3 months", "Ready in 6 months", "Not ready yet"]
    }
  ]'::jsonb,
  criteria = '{
    "current_performance": 25,
    "leadership_readiness": 25,
    "team_impact": 20,
    "problem_solving": 15,
    "initiative": 15
  }'::jsonb,
  disc_injection_enabled = true,
  self_assessment_required = true,
  gamification_enabled = true,
  xp_base_reward = 1500,
  emotional_metrics = '["leadership_presence", "empathy", "stress_tolerance", "team_support"]'::jsonb
WHERE type = 'performance'
  AND is_active = true;

-- 5. EXIT REVIEW (Enhanced)
UPDATE review_templates
SET 
  description = 'Exit interview to gather feedback, insights, and maintain positive relationships',
  disc_injection_enabled = false,
  self_assessment_required = false,
  gamification_enabled = false,
  xp_base_reward = 0,
  emotional_metrics = '["satisfaction", "support_felt", "culture_fit"]'::jsonb
WHERE type = 'exit'
  AND is_active = true;

-- 6. CUSTOM REVIEW → Keep flexible
UPDATE review_templates
SET 
  disc_injection_enabled = false,
  self_assessment_required = true,
  gamification_enabled = true,
  xp_base_reward = 500,
  emotional_metrics = '["overall_wellbeing"]'::jsonb
WHERE type = 'custom'
  AND is_active = true;

-- =====================================================
-- ADD NEW TEMPLATE: SALARY REVIEW / GROWTH PLAN
-- =====================================================

INSERT INTO review_templates (
  name, 
  type, 
  description, 
  questions, 
  criteria, 
  scoring_method,
  disc_injection_enabled,
  self_assessment_required,
  gamification_enabled,
  xp_base_reward,
  emotional_metrics,
  is_active
) VALUES (
  'Salary Review / Growth Plan',
  'custom',
  'Performance stability assessment for salary review and growth planning',
  '[
    {
      "question": "Rate performance stability over the past 6-12 months",
      "type": "rating",
      "required": true,
      "category": "stability"
    },
    {
      "question": "Rate initiative and proactive behavior",
      "type": "rating",
      "required": true,
      "category": "core"
    },
    {
      "question": "Rate financial responsibility (clean handovers, routines, resources)",
      "type": "rating",
      "required": true,
      "category": "responsibility"
    },
    {
      "question": "What are the concrete examples of exceptional performance?",
      "type": "text",
      "required": true,
      "category": "evidence"
    },
    {
      "question": "Salary recommendation with reasoning",
      "type": "text",
      "required": true,
      "category": "compensation"
    },
    {
      "question": "If no raise yet, what to build toward in 3–6 months?",
      "type": "text",
      "required": false,
      "category": "growth_plan"
    },
    {
      "question": "Clear milestones for next salary review",
      "type": "text",
      "required": true,
      "category": "milestones"
    }
  ]'::jsonb,
  '{
    "performance_stability": 30,
    "initiative": 25,
    "financial_responsibility": 20,
    "growth_potential": 25
  }'::jsonb,
  'five_star',
  true,
  true,
  true,
  750,
  '["motivation", "satisfaction", "career_clarity"]'::jsonb,
  true
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- ADD NEW TEMPLATE: WARNING / INTERVENTION REVIEW
-- =====================================================

INSERT INTO review_templates (
  name, 
  type, 
  description, 
  questions, 
  criteria, 
  scoring_method,
  disc_injection_enabled,
  self_assessment_required,
  gamification_enabled,
  xp_base_reward,
  emotional_metrics,
  is_active
) VALUES (
  'Warning / Intervention Review',
  'custom',
  'Addressing performance concerns with support planning and recovery path',
  '[
    {
      "question": "What specific concerns need to be addressed?",
      "type": "text",
      "required": true,
      "category": "concerns"
    },
    {
      "question": "Concern level",
      "type": "select",
      "required": true,
      "category": "severity",
      "options": ["Yellow Flag - Minor concern", "Orange Flag - Moderate concern", "Red Flag - Serious concern"]
    },
    {
      "question": "Rate behavior (what they are doing)",
      "type": "rating",
      "required": true,
      "category": "behavior"
    },
    {
      "question": "Rate impact (how it affects team/children/organization)",
      "type": "rating",
      "required": true,
      "category": "impact"
    },
    {
      "question": "What support or resources have been provided?",
      "type": "text",
      "required": true,
      "category": "support"
    },
    {
      "question": "What are the clear expectations and goals going forward?",
      "type": "text",
      "required": true,
      "category": "expectations"
    },
    {
      "question": "Gamified recovery path (Complete X milestones by date Y)",
      "type": "text",
      "required": false,
      "category": "recovery_plan"
    },
    {
      "question": "Timeline for next review",
      "type": "select",
      "required": true,
      "category": "timeline",
      "options": ["1 month", "2 months", "3 months"]
    },
    {
      "question": "What are the consequences if improvement is not demonstrated?",
      "type": "text",
      "required": true,
      "category": "consequences"
    }
  ]'::jsonb,
  '{
    "behavior_assessment": 30,
    "impact_assessment": 30,
    "support_provided": 20,
    "goal_clarity": 20
  }'::jsonb,
  'five_star',
  false,
  true,
  false,
  0,
  '["stress_level", "support_felt", "clarity_of_expectations"]'::jsonb,
  true
)
ON CONFLICT DO NOTHING;

COMMIT;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Updated:
-- - 6 existing templates with v1.1 features
-- - Added XP rewards (250-1500 based on type)
-- - Enabled DISC injection for relevant templates
-- - Enabled self-assessment for all templates
-- - Added emotional metrics tracking
-- - Added 2 new specialized templates (Salary Review, Warning/Intervention)
--
-- Next: Run migration 20251016000004 to seed DISC mini-questions

