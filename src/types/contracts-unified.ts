/**
 * UNIFIED CONTRACT SYSTEM - PHASE 2 ARCHITECTURE
 *
 * This represents the complete contract lifecycle management system
 * that unifies Overview and Journey tabs with proper state management
 */

export interface UnifiedContract {
  // Core Identity
  id: string;
  staff_id: string; // REQUIRED - links to staff table
  employee_name: string; // Denormalized for compatibility

  // Contract Metadata
  contract_number: number; // Sequential number for this employee
  contract_type: ContractType;
  employment_type: EmploymentType;
  status: ContractStatus;

  // Dutch Labor Law Compliance
  chain_sequence: number; // Position in chain (1, 2, 3...)
  requires_permanent: boolean; // Auto-calculated based on chain rules
  compliance_warnings: ComplianceWarning[];

  // Timeline & Lifecycle
  created_at: string;
  signed_at: string | null;
  start_date: string;
  end_date: string | null; // NULL for permanent contracts
  termination_notice_deadline: string | null; // Auto-calculated

  // Financial Terms
  salary_info: SalaryInfo;
  working_hours: WorkingHours;

  // Document Management
  pdf_path: string | null;
  template_version: string; // For contract template versioning

  // Integration Data
  employes_contract_id: string | null; // Link to Employes.nl
  query_params: Record<string, any> | null; // Legacy compatibility

  // Audit Trail
  created_by: string;
  last_modified_by: string;
  last_modified_at: string;

  // Computed Fields (not stored, calculated on read)
  days_until_start?: number;
  days_until_end?: number;
  days_until_termination_deadline?: number;
  is_chain_compliant?: boolean;
  next_review_date?: string;
}

export type ContractType =
  | 'temporary'      // Tijdelijk contract
  | 'permanent'      // Vast contract
  | 'intern'         // Stage contract
  | 'freelance'      // Freelance/ZZP
  | 'trial'          // Proeftijd contract
  | 'replacement';   // Vervangings contract

export type EmploymentType =
  | 'fulltime'       // 36+ hours
  | 'parttime'       // <36 hours
  | 'flex'           // Flexible hours
  | 'on_call';       // Oproepkracht

export type ContractStatus =
  | 'draft'          // Being prepared
  | 'pending'        // Awaiting signatures
  | 'active'         // Currently active
  | 'expiring'       // Expires within 60 days
  | 'expired'        // Past end date
  | 'terminated'     // Ended early
  | 'renewed'        // Replaced by newer contract
  | 'cancelled';     // Cancelled before start

export interface SalaryInfo {
  scale: string;                    // CAO scale (e.g., "P3")
  trede: string;                   // Step within scale (e.g., "5")
  hourly_wage: number;             // €/hour
  monthly_wage: number;            // €/month
  yearly_wage: number;             // €/year
  overtime_rate: number;           // Multiplier for overtime
  vacation_allowance: number;      // Percentage
  thirteenth_month: boolean;       // 13e maand
  pension_contribution: number;    // Percentage
  last_increase_date: string | null;
  next_review_date: string | null;
}

export interface WorkingHours {
  hours_per_week: number;
  days_per_week: number;
  flexible_hours: boolean;
  remote_work_allowed: boolean;
  overtime_allowed: boolean;
  weekend_work_required: boolean;
}

export interface ComplianceWarning {
  type: 'chain_rule' | 'termination_notice' | 'renewal_decision' | 'document_missing';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  deadline: string | null;
  auto_action: string | null; // Automated action to take
}

export interface ContractTimeline {
  employee_id: string;
  employee_name: string;
  contracts: UnifiedContract[];
  total_employment_months: number;
  chain_rule_status: ChainRuleStatus;
  salary_progression: SalaryChange[];
  upcoming_deadlines: TimelineDeadline[];
  compliance_score: number; // 0-100
}

export interface ChainRuleStatus {
  current_chain_length: number;
  total_employment_months: number;
  max_allowed_contracts: number;
  max_allowed_months: number;
  requires_permanent_next: boolean;
  warning_level: 'safe' | 'warning' | 'critical' | 'permanent_required';
  recommendation: string;
}

export interface SalaryChange {
  date: string;
  contract_id: string;
  old_monthly: number;
  new_monthly: number;
  increase_percent: number;
  reason: 'contract_start' | 'annual_increase' | 'promotion' | 'review_raise' | 'cao_adjustment';
  notes: string | null;
}

export interface TimelineDeadline {
  type: 'contract_start' | 'contract_end' | 'termination_deadline' | 'review_due' | 'chain_limit';
  date: string;
  days_remaining: number;
  severity: 'info' | 'warning' | 'critical';
  action_required: string;
  auto_reminder: boolean;
}

/**
 * CONTRACT WORKFLOW STATES
 *
 * These represent the business process states for contract management
 */
export interface ContractWorkflow {
  contract_id: string;
  current_step: WorkflowStep;
  steps_completed: WorkflowStep[];
  next_steps: WorkflowStep[];
  can_progress: boolean;
  blocking_issues: string[];
}

export type WorkflowStep =
  | 'draft_creation'
  | 'data_validation'
  | 'legal_review'
  | 'manager_approval'
  | 'hr_approval'
  | 'employee_signature'
  | 'manager_signature'
  | 'hr_signature'
  | 'contract_activation'
  | 'employes_sync';

/**
 * INTEGRATION INTERFACES
 *
 * For connecting with external systems
 */
export interface EmployesIntegration {
  sync_status: 'pending' | 'synced' | 'error' | 'manual';
  employes_id: string | null;
  last_sync_at: string | null;
  sync_errors: string[];
  manual_override: boolean;
}

export interface ReviewSystemIntegration {
  next_review_due: string | null;
  review_frequency_months: number;
  auto_schedule_reviews: boolean;
  performance_linked_raises: boolean;
  review_template_id: string | null;
}

/**
 * ANALYTICS & REPORTING
 */
export interface ContractAnalytics {
  total_contracts: number;
  active_contracts: number;
  expiring_soon: number;
  compliance_issues: number;
  average_contract_duration: number;
  chain_rule_violations: number;
  pending_terminations: number;
  salary_budget_total: number;
  contract_distribution: Record<ContractType, number>;
  status_distribution: Record<ContractStatus, number>;
}