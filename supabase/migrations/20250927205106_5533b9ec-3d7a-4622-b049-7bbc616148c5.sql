-- Fix the contracts_enriched view by adding missing columns
DROP VIEW IF EXISTS contracts_enriched;

CREATE VIEW contracts_enriched AS
SELECT 
    c.id,
    c.employee_name,
    c.full_name,
    c.manager,
    c.department,
    c.status,
    c.contract_type,
    c.pdf_path,
    c.created_at,
    c.signed_at,
    c.staff_id,
    
    -- Extract data from query_params JSONB
    (c.query_params->>'startDate')::date as start_date,
    (c.query_params->>'endDate')::date as end_date,
    c.query_params->>'position' as position,
    c.query_params->>'location' as location_key,
    c.query_params->>'manager' as manager_key,
    
    -- Add missing columns that were referenced in the logs
    (c.query_params->>'startDate')::date as first_start,
    COALESCE(
        (SELECT review_date + INTERVAL '1 year'
         FROM staff_reviews sr 
         WHERE sr.staff_id = c.staff_id 
         ORDER BY review_date DESC 
         LIMIT 1),
        (c.query_params->>'startDate')::date + INTERVAL '1 year'
    ) as next_review_due,
    
    COALESCE(
        (SELECT AVG(score)::numeric(3,2)
         FROM staff_reviews sr 
         WHERE sr.staff_id = c.staff_id),
        0
    ) as avg_review_score,
    
    -- Staff birth date from staff table
    s.birth_date,
    
    -- Review requirements based on contract dates
    CASE 
        WHEN (c.query_params->>'startDate')::date IS NOT NULL 
        AND (c.query_params->>'startDate')::date + INTERVAL '6 months' <= CURRENT_DATE
        AND NOT EXISTS (
            SELECT 1 FROM staff_reviews sr 
            WHERE sr.staff_id = c.staff_id 
            AND sr.review_date >= (c.query_params->>'startDate')::date + INTERVAL '5 months'
            AND sr.review_date <= (c.query_params->>'startDate')::date + INTERVAL '7 months'
        )
        THEN true 
        ELSE false 
    END as needs_six_month_review,
    
    CASE 
        WHEN (c.query_params->>'startDate')::date IS NOT NULL 
        AND (c.query_params->>'startDate')::date + INTERVAL '1 year' <= CURRENT_DATE
        AND NOT EXISTS (
            SELECT 1 FROM staff_reviews sr 
            WHERE sr.staff_id = c.staff_id 
            AND sr.review_date >= (c.query_params->>'startDate')::date + INTERVAL '11 months'
        )
        THEN true 
        ELSE false 
    END as needs_yearly_review,
    
    -- Five star badge based on recent high scores
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM staff_reviews sr 
            WHERE sr.staff_id = c.staff_id 
            AND sr.score >= 5 
            AND sr.review_date >= CURRENT_DATE - INTERVAL '1 year'
            GROUP BY sr.staff_id 
            HAVING COUNT(*) >= 2
        )
        THEN true 
        ELSE false 
    END as has_five_star_badge
    
FROM contracts c
LEFT JOIN staff s ON s.id = c.staff_id;