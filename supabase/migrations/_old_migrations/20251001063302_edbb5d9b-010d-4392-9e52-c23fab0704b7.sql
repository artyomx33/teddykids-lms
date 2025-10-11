
-- Clean up Adéla's Employes sync data for fresh sync
-- Staff ID: 8842f515-e4a3-40a4-bcfc-641399463ecf

-- Delete employment history
DELETE FROM staff_employment_history 
WHERE staff_id = '8842f515-e4a3-40a4-bcfc-641399463ecf';

-- Delete salary history
DELETE FROM cao_salary_history 
WHERE staff_id = '8842f515-e4a3-40a4-bcfc-641399463ecf';

-- Delete employee mapping if exists
DELETE FROM employes_employee_map 
WHERE lms_staff_id = '8842f515-e4a3-40a4-bcfc-641399463ecf';

-- Delete any sync conflicts
DELETE FROM staff_sync_conflicts 
WHERE staff_id = '8842f515-e4a3-40a4-bcfc-641399463ecf';

-- Reset Employes sync fields on staff record
UPDATE staff 
SET 
  employes_id = NULL,
  last_sync_at = NULL
WHERE id = '8842f515-e4a3-40a4-bcfc-641399463ecf';
