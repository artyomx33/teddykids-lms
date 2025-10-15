
-- Phase 1: Clean up orphaned contracts and link them to staff
-- Fixed to use correct status values and contract types

-- Step 1: Link existing contracts to their staff members by matching employee_name
UPDATE contracts c
SET staff_id = s.id
FROM staff s
WHERE c.employee_name = s.full_name
AND c.staff_id IS NULL;

-- Step 2: Update contract status and type based on query_params
-- Status can only be: draft, generated, pending, signed
UPDATE contracts
SET 
  status = CASE 
    WHEN query_params->>'employmentStatus' = 'active' THEN 'signed'
    WHEN query_params->>'employmentStatus' = 'out of service' THEN 'draft'
    ELSE 'signed' -- Default active contracts to signed
  END,
  contract_type = CASE
    WHEN query_params->>'contractType' IS NOT NULL THEN query_params->>'contractType'
    WHEN (query_params->>'endDate') IS NULL THEN 'permanent'
    ELSE 'fixed-term'
  END
WHERE status = 'draft' AND contract_type = 'unknown';

-- Step 3: Delete duplicate contracts, keeping only the most recent one per employee
WITH ranked_contracts AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY employee_name, 
                   query_params->>'startDate',
                   query_params->>'endDate'
      ORDER BY created_at DESC
    ) as rn
  FROM contracts
)
DELETE FROM contracts
WHERE id IN (
  SELECT id FROM ranked_contracts WHERE rn > 1
);

-- Add helpful comment
COMMENT ON COLUMN contracts.staff_id IS 'Foreign key to staff table - should never be NULL for active contracts';
