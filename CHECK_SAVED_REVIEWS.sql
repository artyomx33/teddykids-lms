-- Check if reviews are being saved
SELECT 
  sr.id,
  sr.created_at,
  s.full_name as staff_name,
  sr.review_type,
  sr.overall_score,
  sr.xp_earned,
  sr.signed_by_reviewer,
  CASE 
    WHEN sr.responses IS NOT NULL THEN jsonb_array_length(sr.responses::jsonb)
    ELSE 0
  END as response_count,
  CASE 
    WHEN sr.self_assessment IS NOT NULL THEN 'Yes'
    ELSE 'No'
  END as has_self_assessment,
  CASE 
    WHEN sr.disc_questions_answered IS NOT NULL THEN 'Yes'
    ELSE 'No'
  END as has_disc_answers
FROM staff_reviews sr
LEFT JOIN staff s ON s.id = sr.staff_id
ORDER BY sr.created_at DESC
LIMIT 10;

-- Count total reviews
SELECT COUNT(*) as total_reviews FROM staff_reviews;

-- Check for recent inserts (last 24 hours)
SELECT COUNT(*) as reviews_last_24h 
FROM staff_reviews 
WHERE created_at > NOW() - INTERVAL '24 hours';

