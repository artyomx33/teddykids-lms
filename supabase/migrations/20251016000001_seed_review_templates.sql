-- =====================================================
-- SEED DEFAULT REVIEW TEMPLATES
-- =====================================================
-- This migration creates default templates for each review type
-- Date: 2025-10-16
-- Phase 1: Debug & Fix Current System

-- =====================================================
-- 1. PROBATION REVIEW TEMPLATE (1-2 months)
-- =====================================================

INSERT INTO review_templates (name, type, description, questions, criteria, scoring_method, is_active)
VALUES (
  'Probation Period Review',
  'probation',
  'Standard review template for employees during their probation period',
  '[
    {
      "question": "How well has the employee adapted to the role and company culture?",
      "type": "rating",
      "required": true
    },
    {
      "question": "Has the employee demonstrated the core competencies required for this position?",
      "type": "boolean",
      "required": true
    },
    {
      "question": "What are the employee''s key strengths observed so far?",
      "type": "text",
      "required": true
    },
    {
      "question": "Are there any areas where additional training or support is needed?",
      "type": "text",
      "required": false
    },
    {
      "question": "Rate the employee''s communication and teamwork",
      "type": "rating",
      "required": true
    },
    {
      "question": "Rate the employee''s work quality and attention to detail",
      "type": "rating",
      "required": true
    },
    {
      "question": "Should this employee''s probation period be confirmed?",
      "type": "select",
      "required": true,
      "options": ["Confirm employment", "Extend probation period", "Terminate employment"]
    }
  ]'::jsonb,
  '{
    "adaptation": 20,
    "competencies": 20,
    "communication": 20,
    "work_quality": 20,
    "teamwork": 20
  }'::jsonb,
  'five_star',
  true
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 2. SIX-MONTH REVIEW TEMPLATE
-- =====================================================

INSERT INTO review_templates (name, type, description, questions, criteria, scoring_method, is_active)
VALUES (
  '6-Month Performance Review',
  'six_month',
  'Standard 6-month check-in review for all employees',
  '[
    {
      "question": "How would you rate the employee''s overall performance in the past 6 months?",
      "type": "rating",
      "required": true
    },
    {
      "question": "What are the employee''s most significant achievements?",
      "type": "text",
      "required": true
    },
    {
      "question": "Rate the quality and consistency of work delivered",
      "type": "rating",
      "required": true
    },
    {
      "question": "Rate the employee''s initiative and problem-solving ability",
      "type": "rating",
      "required": true
    },
    {
      "question": "Rate teamwork and collaboration with colleagues",
      "type": "rating",
      "required": true
    },
    {
      "question": "Rate communication skills (verbal and written)",
      "type": "rating",
      "required": true
    },
    {
      "question": "What areas should the employee focus on for development?",
      "type": "text",
      "required": true
    },
    {
      "question": "Are the employee''s goals from the last review being met?",
      "type": "boolean",
      "required": false
    }
  ]'::jsonb,
  '{
    "overall_performance": 20,
    "work_quality": 20,
    "initiative": 15,
    "teamwork": 15,
    "communication": 15,
    "goal_achievement": 15
  }'::jsonb,
  'five_star',
  true
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. YEARLY REVIEW TEMPLATE
-- =====================================================

INSERT INTO review_templates (name, type, description, questions, criteria, scoring_method, is_active)
VALUES (
  'Annual Performance Review',
  'yearly',
  'Comprehensive annual review template with focus on achievements, goals, and career development',
  '[
    {
      "question": "Overall performance rating for the year",
      "type": "rating",
      "required": true
    },
    {
      "question": "What were the employee''s most significant accomplishments this year?",
      "type": "text",
      "required": true
    },
    {
      "question": "Were the goals set in the previous review achieved?",
      "type": "select",
      "required": true,
      "options": ["All goals achieved", "Most goals achieved", "Some goals achieved", "Goals not achieved"]
    },
    {
      "question": "Rate job knowledge and expertise",
      "type": "rating",
      "required": true
    },
    {
      "question": "Rate quality of work and attention to detail",
      "type": "rating",
      "required": true
    },
    {
      "question": "Rate productivity and time management",
      "type": "rating",
      "required": true
    },
    {
      "question": "Rate leadership and mentoring (if applicable)",
      "type": "rating",
      "required": false
    },
    {
      "question": "Rate adaptability and learning agility",
      "type": "rating",
      "required": true
    },
    {
      "question": "Rate communication and interpersonal skills",
      "type": "rating",
      "required": true
    },
    {
      "question": "What are the key development areas for the coming year?",
      "type": "text",
      "required": true
    },
    {
      "question": "What are the employee''s career aspirations?",
      "type": "text",
      "required": false
    },
    {
      "question": "Is the employee ready for promotion or increased responsibilities?",
      "type": "boolean",
      "required": false
    },
    {
      "question": "Salary recommendation",
      "type": "select",
      "required": true,
      "options": ["Recommend increase", "Maintain current", "Under review", "Not recommended"]
    }
  ]'::jsonb,
  '{
    "overall_performance": 15,
    "job_knowledge": 15,
    "work_quality": 15,
    "productivity": 15,
    "communication": 10,
    "adaptability": 10,
    "leadership": 10,
    "goal_achievement": 10
  }'::jsonb,
  'five_star',
  true
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. PERFORMANCE REVIEW TEMPLATE (Ad-hoc)
-- =====================================================

INSERT INTO review_templates (name, type, description, questions, criteria, scoring_method, is_active)
VALUES (
  'Performance Improvement Review',
  'performance',
  'Special review template for addressing performance concerns or tracking improvement',
  '[
    {
      "question": "What is the primary reason for this performance review?",
      "type": "text",
      "required": true
    },
    {
      "question": "Have the previously identified performance issues improved?",
      "type": "select",
      "required": true,
      "options": ["Significant improvement", "Some improvement", "No improvement", "Worsened"]
    },
    {
      "question": "Rate current performance level",
      "type": "rating",
      "required": true
    },
    {
      "question": "What specific concerns need to be addressed?",
      "type": "text",
      "required": true
    },
    {
      "question": "What support or resources have been provided?",
      "type": "text",
      "required": true
    },
    {
      "question": "What are the clear expectations and goals going forward?",
      "type": "text",
      "required": true
    },
    {
      "question": "Timeline for next performance review",
      "type": "select",
      "required": true,
      "options": ["1 month", "2 months", "3 months"]
    },
    {
      "question": "What are the consequences if improvement is not demonstrated?",
      "type": "text",
      "required": true
    }
  ]'::jsonb,
  '{
    "current_performance": 30,
    "improvement_progress": 30,
    "goal_clarity": 20,
    "engagement": 20
  }'::jsonb,
  'five_star',
  true
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 5. EXIT REVIEW TEMPLATE
-- =====================================================

INSERT INTO review_templates (name, type, description, questions, criteria, scoring_method, is_active)
VALUES (
  'Exit Interview Review',
  'exit',
  'Exit interview template for departing employees to gather feedback and insights',
  '[
    {
      "question": "What is the primary reason for leaving?",
      "type": "select",
      "required": true,
      "options": ["Career advancement", "Better compensation", "Work-life balance", "Relocation", "Company culture", "Management issues", "Personal reasons", "Other"]
    },
    {
      "question": "Would you recommend this company as a place to work?",
      "type": "boolean",
      "required": true
    },
    {
      "question": "Rate your overall satisfaction with your role",
      "type": "rating",
      "required": true
    },
    {
      "question": "Rate your satisfaction with management and leadership",
      "type": "rating",
      "required": true
    },
    {
      "question": "Rate the work environment and company culture",
      "type": "rating",
      "required": true
    },
    {
      "question": "Rate professional development and growth opportunities",
      "type": "rating",
      "required": true
    },
    {
      "question": "What did you enjoy most about working here?",
      "type": "text",
      "required": false
    },
    {
      "question": "What could the company improve?",
      "type": "text",
      "required": true
    },
    {
      "question": "Did you feel supported in your role?",
      "type": "boolean",
      "required": true
    },
    {
      "question": "Would you consider returning to the company in the future?",
      "type": "boolean",
      "required": false
    },
    {
      "question": "Any additional feedback or comments?",
      "type": "text",
      "required": false
    }
  ]'::jsonb,
  '{
    "role_satisfaction": 25,
    "management_satisfaction": 25,
    "culture_rating": 25,
    "development_opportunities": 25
  }'::jsonb,
  'five_star',
  true
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. CUSTOM REVIEW TEMPLATE (Flexible)
-- =====================================================

INSERT INTO review_templates (name, type, description, questions, criteria, scoring_method, is_active)
VALUES (
  'Custom Review Template',
  'custom',
  'Flexible template for custom review situations',
  '[
    {
      "question": "What is the purpose of this review?",
      "type": "text",
      "required": true
    },
    {
      "question": "Overall performance rating",
      "type": "rating",
      "required": true
    },
    {
      "question": "Key strengths demonstrated",
      "type": "text",
      "required": true
    },
    {
      "question": "Areas for development",
      "type": "text",
      "required": true
    },
    {
      "question": "Additional notes and observations",
      "type": "text",
      "required": false
    }
  ]'::jsonb,
  '{
    "overall_performance": 50,
    "strengths": 25,
    "development": 25
  }'::jsonb,
  'five_star',
  true
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Created 6 default review templates:
-- 1. Probation Period Review
-- 2. 6-Month Performance Review
-- 3. Annual Performance Review
-- 4. Performance Improvement Review
-- 5. Exit Interview Review
-- 6. Custom Review Template

