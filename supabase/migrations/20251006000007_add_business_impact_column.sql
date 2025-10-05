-- Add business_impact column to employes_changes table
-- This field stores the business meaning of the change (e.g., 'salary_increase', 'permanent_contract')

ALTER TABLE employes_changes 
ADD COLUMN IF NOT EXISTS business_impact TEXT;

-- Add index for filtering by business impact
CREATE INDEX IF NOT EXISTS idx_changes_business_impact 
ON employes_changes(business_impact);

-- Add comment
COMMENT ON COLUMN employes_changes.business_impact IS 
'Business meaning of change: salary_increase, salary_decrease, hours_increase, hours_decrease, permanent_contract, contract_renewal, etc.';
