-- Check current review templates in database
SELECT 
  id,
  name,
  review_type,
  jsonb_array_length(questions) as question_count,
  disc_injection_enabled,
  self_assessment_required,
  gamification_enabled,
  xp_base_reward
FROM review_templates
ORDER BY name;

-- Check questions for each template
SELECT 
  name as template_name,
  review_type,
  questions
FROM review_templates
ORDER BY name;

-- Check if v1.1 fields exist
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

