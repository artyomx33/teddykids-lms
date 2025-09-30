-- TEDDYKIDS CONTRACT SYSTEM V2 MIGRATION
-- This migration unifies contract management and fixes data inconsistencies

-- 1. ADD MISSING COLUMNS TO EXISTING CONTRACTS TABLE
ALTER TABLE contracts
ADD COLUMN IF NOT EXISTS staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS contract_number INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS employment_type VARCHAR(20) DEFAULT 'fulltime',
ADD COLUMN IF NOT EXISTS chain_sequence INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS requires_permanent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS termination_notice_deadline DATE,
ADD COLUMN IF NOT EXISTS template_version VARCHAR(10) DEFAULT 'v1.0',
ADD COLUMN IF NOT EXISTS employes_contract_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS last_modified_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS last_modified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. CREATE SALARY INFO TABLE (normalized from JSON)
CREATE TABLE IF NOT EXISTS contract_salary_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    scale VARCHAR(10),
    trede VARCHAR(10),
    hourly_wage DECIMAL(10,2),
    monthly_wage DECIMAL(10,2),
    yearly_wage DECIMAL(10,2),
    overtime_rate DECIMAL(4,2) DEFAULT 1.5,
    vacation_allowance DECIMAL(4,2) DEFAULT 8.0,
    thirteenth_month BOOLEAN DEFAULT false,
    pension_contribution DECIMAL(4,2) DEFAULT 0.0,
    last_increase_date DATE,
    next_review_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREATE WORKING HOURS TABLE (normalized from JSON)
CREATE TABLE IF NOT EXISTS contract_working_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    hours_per_week INTEGER DEFAULT 40,
    days_per_week INTEGER DEFAULT 5,
    flexible_hours BOOLEAN DEFAULT false,
    remote_work_allowed BOOLEAN DEFAULT false,
    overtime_allowed BOOLEAN DEFAULT true,
    weekend_work_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE COMPLIANCE WARNINGS TABLE
CREATE TABLE IF NOT EXISTS contract_compliance_warnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    warning_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'warning',
    message TEXT NOT NULL,
    deadline DATE,
    auto_action TEXT,
    resolved BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CREATE CONTRACT WORKFLOW TABLE
CREATE TABLE IF NOT EXISTS contract_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    current_step VARCHAR(50) NOT NULL,
    steps_completed JSONB DEFAULT '[]',
    next_steps JSONB DEFAULT '[]',
    can_progress BOOLEAN DEFAULT true,
    blocking_issues JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CREATE INTEGRATION STATUS TABLE
CREATE TABLE IF NOT EXISTS contract_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    sync_status VARCHAR(20) DEFAULT 'pending',
    employes_id VARCHAR(100),
    last_sync_at TIMESTAMP WITH TIME ZONE,
    sync_errors JSONB DEFAULT '[]',
    manual_override BOOLEAN DEFAULT false,
    next_review_due DATE,
    review_frequency_months INTEGER DEFAULT 12,
    auto_schedule_reviews BOOLEAN DEFAULT true,
    performance_linked_raises BOOLEAN DEFAULT true,
    review_template_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ADD INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_contracts_staff_id ON contracts(staff_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_start_date ON contracts(start_date);
CREATE INDEX IF NOT EXISTS idx_contracts_end_date ON contracts(end_date);
CREATE INDEX IF NOT EXISTS idx_contracts_employee_name ON contracts(employee_name);
CREATE INDEX IF NOT EXISTS idx_contract_salary_contract_id ON contract_salary_info(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_hours_contract_id ON contract_working_hours(contract_id);
CREATE INDEX IF NOT EXISTS idx_compliance_warnings_contract_id ON contract_compliance_warnings(contract_id);
CREATE INDEX IF NOT EXISTS idx_compliance_warnings_resolved ON contract_compliance_warnings(resolved);
CREATE INDEX IF NOT EXISTS idx_workflows_contract_id ON contract_workflows(contract_id);
CREATE INDEX IF NOT EXISTS idx_workflows_current_step ON contract_workflows(current_step);
CREATE INDEX IF NOT EXISTS idx_integrations_contract_id ON contract_integrations(contract_id);
CREATE INDEX IF NOT EXISTS idx_integrations_employes_id ON contract_integrations(employes_id);

-- 8. ADD CONSTRAINTS AND VALIDATION
ALTER TABLE contracts
ADD CONSTRAINT contracts_contract_type_check
CHECK (contract_type IN ('temporary', 'permanent', 'intern', 'freelance', 'trial', 'replacement')),
ADD CONSTRAINT contracts_employment_type_check
CHECK (employment_type IN ('fulltime', 'parttime', 'flex', 'on_call')),
ADD CONSTRAINT contracts_status_check
CHECK (status IN ('draft', 'pending', 'active', 'expiring', 'expired', 'terminated', 'renewed', 'cancelled'));

ALTER TABLE contract_compliance_warnings
ADD CONSTRAINT warnings_type_check
CHECK (warning_type IN ('chain_rule', 'termination_notice', 'renewal_decision', 'document_missing')),
ADD CONSTRAINT warnings_severity_check
CHECK (severity IN ('info', 'warning', 'critical'));

ALTER TABLE contract_integrations
ADD CONSTRAINT integrations_sync_status_check
CHECK (sync_status IN ('pending', 'synced', 'error', 'manual'));

-- 9. CREATE FUNCTIONS FOR CONTRACT MANAGEMENT

-- Function to calculate chain sequence for a new contract
CREATE OR REPLACE FUNCTION calculate_contract_chain_sequence(p_staff_id UUID)
RETURNS INTEGER AS $$
DECLARE
    max_sequence INTEGER;
BEGIN
    SELECT COALESCE(MAX(chain_sequence), 0) INTO max_sequence
    FROM contracts
    WHERE staff_id = p_staff_id;

    RETURN max_sequence + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to check if permanent contract is required
CREATE OR REPLACE FUNCTION check_permanent_required(p_staff_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    contract_count INTEGER;
    employment_months INTEGER;
    first_start_date DATE;
BEGIN
    -- Get contract count and first start date
    SELECT COUNT(*), MIN(start_date) INTO contract_count, first_start_date
    FROM contracts
    WHERE staff_id = p_staff_id AND status IN ('active', 'expired', 'terminated');

    -- Calculate employment months
    SELECT EXTRACT(YEAR FROM AGE(CURRENT_DATE, first_start_date)) * 12 +
           EXTRACT(MONTH FROM AGE(CURRENT_DATE, first_start_date))
    INTO employment_months;

    -- Dutch labor law: max 3 contracts or 3 years
    RETURN (contract_count >= 3 OR employment_months >= 36);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate termination notice deadline
CREATE OR REPLACE FUNCTION calculate_termination_deadline(p_end_date DATE)
RETURNS DATE AS $$
BEGIN
    -- Dutch labor law: 30 days notice for temporary contracts
    RETURN p_end_date - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- 10. CREATE TRIGGERS FOR AUTOMATIC CALCULATIONS

-- Trigger to set chain_sequence and requires_permanent on contract insert
CREATE OR REPLACE FUNCTION contracts_before_insert_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Set chain sequence
    IF NEW.chain_sequence IS NULL OR NEW.chain_sequence = 0 THEN
        NEW.chain_sequence := calculate_contract_chain_sequence(NEW.staff_id);
    END IF;

    -- Set requires_permanent flag
    NEW.requires_permanent := check_permanent_required(NEW.staff_id);

    -- Set termination notice deadline for temporary contracts
    IF NEW.end_date IS NOT NULL THEN
        NEW.termination_notice_deadline := calculate_termination_deadline(NEW.end_date);
    END IF;

    -- Set contract number (sequential per employee)
    IF NEW.contract_number IS NULL OR NEW.contract_number = 0 THEN
        SELECT COALESCE(MAX(contract_number), 0) + 1 INTO NEW.contract_number
        FROM contracts WHERE staff_id = NEW.staff_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contracts_before_insert
    BEFORE INSERT ON contracts
    FOR EACH ROW
    EXECUTE FUNCTION contracts_before_insert_trigger();

-- Trigger to update last_modified_at
CREATE OR REPLACE FUNCTION update_last_modified()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contracts_update_modified
    BEFORE UPDATE ON contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_last_modified();

-- 11. CREATE RLS POLICIES (if not already exists)
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_salary_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_compliance_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_integrations ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read contracts
CREATE POLICY IF NOT EXISTS "Users can read contracts" ON contracts
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to modify contracts (refine as needed)
CREATE POLICY IF NOT EXISTS "Users can modify contracts" ON contracts
    FOR ALL USING (auth.role() = 'authenticated');

-- Similar policies for related tables
CREATE POLICY IF NOT EXISTS "Users can read salary info" ON contract_salary_info
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Users can modify salary info" ON contract_salary_info
    FOR ALL USING (auth.role() = 'authenticated');

-- 12. CREATE VIEWS FOR EASY QUERYING

-- Unified contract view with all related data
CREATE OR REPLACE VIEW contracts_unified AS
SELECT
    c.*,
    s.scale,
    s.trede,
    s.hourly_wage,
    s.monthly_wage,
    s.yearly_wage,
    s.overtime_rate,
    s.vacation_allowance,
    s.thirteenth_month,
    s.pension_contribution,
    s.last_increase_date,
    s.next_review_date,
    h.hours_per_week,
    h.days_per_week,
    h.flexible_hours,
    h.remote_work_allowed,
    h.overtime_allowed,
    h.weekend_work_required,
    i.sync_status,
    i.employes_id,
    i.last_sync_at,
    i.next_review_due,
    i.review_frequency_months,
    staff.full_name as staff_full_name,
    staff.email as staff_email,
    -- Calculated fields
    CASE
        WHEN c.start_date IS NOT NULL THEN
            EXTRACT(DAY FROM (c.start_date - CURRENT_DATE))::INTEGER
        ELSE NULL
    END as days_until_start,
    CASE
        WHEN c.end_date IS NOT NULL THEN
            EXTRACT(DAY FROM (c.end_date - CURRENT_DATE))::INTEGER
        ELSE NULL
    END as days_until_end,
    CASE
        WHEN c.termination_notice_deadline IS NOT NULL THEN
            EXTRACT(DAY FROM (c.termination_notice_deadline - CURRENT_DATE))::INTEGER
        ELSE NULL
    END as days_until_termination_deadline
FROM contracts c
LEFT JOIN contract_salary_info s ON s.contract_id = c.id
LEFT JOIN contract_working_hours h ON h.contract_id = c.id
LEFT JOIN contract_integrations i ON i.contract_id = c.id
LEFT JOIN staff ON staff.id = c.staff_id;

-- Active compliance warnings view
CREATE OR REPLACE VIEW active_compliance_warnings AS
SELECT
    w.*,
    c.employee_name,
    c.status as contract_status,
    staff.full_name as staff_name,
    staff.email as staff_email
FROM contract_compliance_warnings w
JOIN contracts c ON c.id = w.contract_id
LEFT JOIN staff ON staff.id = c.staff_id
WHERE w.resolved = false
ORDER BY
    CASE w.severity
        WHEN 'critical' THEN 1
        WHEN 'warning' THEN 2
        ELSE 3
    END,
    w.deadline ASC NULLS LAST;

-- Contract analytics view
CREATE OR REPLACE VIEW contract_analytics AS
SELECT
    COUNT(*) as total_contracts,
    COUNT(*) FILTER (WHERE status = 'active') as active_contracts,
    COUNT(*) FILTER (WHERE status = 'expiring') as expiring_contracts,
    COUNT(*) FILTER (WHERE end_date IS NOT NULL AND end_date <= CURRENT_DATE + INTERVAL '60 days') as expiring_soon,
    COUNT(*) FILTER (WHERE requires_permanent = true) as requiring_permanent,
    AVG(s.monthly_wage) FILTER (WHERE s.monthly_wage IS NOT NULL) as avg_monthly_wage,
    SUM(s.monthly_wage) FILTER (WHERE c.status = 'active' AND s.monthly_wage IS NOT NULL) as total_monthly_budget
FROM contracts c
LEFT JOIN contract_salary_info s ON s.contract_id = c.id;

-- 13. INSERT DEFAULT DATA FOR EXISTING CONTRACTS (if needed)

-- Create default salary info for contracts that don't have it
INSERT INTO contract_salary_info (contract_id, monthly_wage, yearly_wage)
SELECT
    c.id,
    COALESCE((c.query_params->>'grossMonthly')::DECIMAL(10,2), 0),
    COALESCE((c.query_params->>'grossMonthly')::DECIMAL(10,2) * 12, 0)
FROM contracts c
LEFT JOIN contract_salary_info s ON s.contract_id = c.id
WHERE s.id IS NULL AND c.query_params IS NOT NULL
ON CONFLICT DO NOTHING;

-- Create default working hours for contracts that don't have it
INSERT INTO contract_working_hours (contract_id, hours_per_week, days_per_week)
SELECT
    c.id,
    COALESCE((c.query_params->>'hoursPerWeek')::INTEGER, 40),
    COALESCE((c.query_params->>'daysPerWeek')::INTEGER, 5)
FROM contracts c
LEFT JOIN contract_working_hours h ON h.contract_id = c.id
WHERE h.id IS NULL
ON CONFLICT DO NOTHING;

-- Create default integration records
INSERT INTO contract_integrations (contract_id)
SELECT c.id
FROM contracts c
LEFT JOIN contract_integrations i ON i.contract_id = c.id
WHERE i.id IS NULL
ON CONFLICT DO NOTHING;

-- 14. REFRESH MATERIALIZED VIEWS (if any exist)
-- REFRESH MATERIALIZED VIEW IF EXISTS staff_contract_summary;

COMMIT;