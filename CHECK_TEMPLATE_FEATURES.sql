-- Check which templates have Self-Assessment and DISC enabled
SELECT 
  name,
  type as review_type,
  jsonb_array_length(questions) as question_count,
  CASE WHEN disc_injection_enabled THEN '✅ DISC' ELSE '❌ No DISC' END as disc_status,
  CASE WHEN self_assessment_required THEN '✅ Self-Assessment' ELSE '❌ No Self-Assessment' END as self_assessment_status,
  xp_base_reward as xp_reward,
  CASE WHEN gamification_enabled THEN '✅ Gamified' ELSE '❌ Not Gamified' END as gamification_status
FROM review_templates
WHERE is_active = true
ORDER BY name;

