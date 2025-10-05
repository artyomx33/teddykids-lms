// 🎯 SHARED TYPES - Used by all temporal microservices
// NO TEMPLATE LITERALS! (Supabase Edge Function requirement)

// ============================================================================
// EMPLOYES.NL API TYPES
// ============================================================================

export interface EmployesEmployee {
  // Core identity
  id: string;
  first_name: string;
  surname: string;
  surname_prefix?: string;
  initials?: string;
  
  // Contact
  email?: string;
  phone?: string;
  mobile?: string;
  
  // Personal
  date_of_birth?: string;
  gender?: 'male' | 'female';
  nationality_id?: string;
  personal_identification_number?: string;
  
  // Address
  street?: string;
  street_name?: string;
  housenumber?: string;
  house_number?: string;
  zipcode?: string;
  city?: string;
  country_code?: string;
  
  // Employment
  employee_number?: string;
  status?: 'pending' | 'active' | 'out of service';
  department?: string;
  department_id?: string;
  location?: string;
  location_id?: string;
  position?: string;
  role?: string;
  job_title?: string;
  
  // Contract basics
  start_date?: string;
  end_date?: string;
  contract_type?: string;
  employment_type?: string;
  hours_per_week?: number;
  
  // Salary basics
  salary?: number;
  hourly_rate?: number;
  yearly_wage?: number;
  
  // Nested employment data (if fetched with relations)
  employment?: EmploymentData;
  
  // Allow any additional fields from API
  [key: string]: any;
}

export interface EmploymentData {
  id?: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  
  // Nested salary data
  salary?: SalaryData | SalaryData[];
  
  // Nested hours data
  hours?: HoursData | HoursData[];
  
  // Nested contract data
  contract?: ContractData;
  
  // Tax details
  tax_details?: TaxData;
  
  [key: string]: any;
}

export interface SalaryData {
  id?: string;
  start_date: string;
  end_date?: string;
  hour_wage?: number;
  month_wage?: number;
  yearly_wage?: number;
  is_active?: boolean;
  
  [key: string]: any;
}

export interface HoursData {
  id?: string;
  start_date: string;
  end_date?: string;
  hours_per_week: number;
  days_per_week?: number;
  is_active?: boolean;
  
  [key: string]: any;
}

export interface ContractData {
  id?: string;
  start_date: string;
  end_date?: string;
  contract_type?: string;
  employment_type?: string;
  is_active?: boolean;
  
  [key: string]: any;
}

export interface TaxData {
  is_reduction_applied?: boolean;
  reduction_start_date?: string;
  reduction_end_date?: string;
  
  [key: string]: any;
}

// ============================================================================
// TEMPORAL DATA TYPES
// ============================================================================

export interface RawDataRecord {
  id: string;
  employee_id: string;
  endpoint: string;
  api_response: any;
  data_hash: string;
  collected_at: string;
  effective_from?: string;
  effective_to?: string;
  is_latest: boolean;
  superseded_by?: string;
  supersedes?: string;
  sync_session_id?: string;
  confidence_score: number;
}

export interface ChangeRecord {
  id: string;
  employee_id: string;
  change_type: ChangeType;
  effective_date: string;
  detected_at: string;
  
  field_name?: string;
  old_value?: any;
  new_value?: any;
  diff?: any;
  
  change_amount?: number;
  change_percent?: number;
  
  change_source: string;
  confidence_score: number;
  validation_status: ValidationStatus;
  
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  
  raw_data_before?: string;
  raw_data_after?: string;
  
  requires_contract_update: boolean;
  requires_payroll_adjustment: boolean;
  requires_manager_notification: boolean;
  
  tags?: string[];
}

export type ChangeType = 
  | 'salary_change'
  | 'hours_change'
  | 'contract_change'
  | 'position_change'
  | 'location_change'
  | 'department_change'
  | 'status_change'
  | 'contract_start'
  | 'contract_end'
  | 'employment_start'
  | 'employment_end';

export type ValidationStatus = 
  | 'detected'      // Newly detected, not yet reviewed
  | 'confirmed'     // Verified as correct
  | 'suspicious'    // Needs human review
  | 'false_positive'; // Incorrect detection, should ignore

export type EndpointType = 
  | '/employee'
  | '/employments'
  | '/salary-history'
  | '/contracts'
  | '/hours'
  | '/payruns';

// ============================================================================
// SYNC & RESPONSE TYPES
// ============================================================================

export interface SyncSession {
  id: string;
  started_at: string;
  completed_at?: string;
  status: 'running' | 'completed' | 'failed';
  employees_processed: number;
  employees_failed: number;
  changes_detected: number;
  error_message?: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  session_id?: string;
  employees_processed?: number;
  records_created?: number;
  records_updated?: number;
  changes_detected?: number;
  errors?: string[];
  warnings?: string[];
}

export interface EmployesResponse<T> {
  data?: T;
  error?: string;
  status?: number;
}

export interface FetchOptions {
  page?: number;
  perPage?: number;
  filters?: Record<string, any>;
  includeRelations?: string[];
}

export interface FetchResult<T> {
  data: T[];
  total: number;
  pages: number;
  currentPage: number;
  hasMore: boolean;
}

// ============================================================================
// CHANGE DETECTION TYPES
// ============================================================================

export interface ChangeDetectionResult {
  changes: DetectedChange[];
  total_changes: number;
  by_type: Record<ChangeType, number>;
  requires_review: number;
  high_confidence: number;
}

export interface DetectedChange {
  change_type: ChangeType;
  effective_date: string;
  field_name?: string;
  old_value: any;
  new_value: any;
  change_amount?: number;
  change_percent?: number;
  confidence_score: number;
  reason: string;
}

export interface ComparisonResult {
  is_different: boolean;
  changes: DetectedChange[];
  similarity_score: number;
}

// ============================================================================
// TIMELINE TYPES
// ============================================================================

export interface EmployeeTimeline {
  employee_id: string;
  timeline: TimelineEvent[];
  total_changes: number;
  salary_changes: number;
  hours_changes: number;
  contract_changes: number;
  earliest_change?: string;
  latest_change?: string;
  avg_confidence: number;
}

export interface TimelineEvent {
  id: string;
  date: string;
  type: ChangeType;
  field?: string;
  old_value?: any;
  new_value?: any;
  change_amount?: number;
  change_percent?: number;
  source: string;
  confidence: number;
  validation: ValidationStatus;
}

// ============================================================================
// MONITORING & METRICS TYPES
// ============================================================================

export interface DataQualityMetrics {
  table_name: string;
  unique_employees: number;
  total_records: number;
  latest_records?: number;
  confirmed_records?: number;
  suspicious_records?: number;
  low_confidence_records: number;
  earliest_collection?: string;
  latest_collection?: string;
  earliest_detection?: string;
  latest_detection?: string;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  service_name: string;
  timestamp: string;
  checks: HealthCheck[];
  error?: string;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  duration_ms?: number;
}

export interface FunctionMetrics {
  function_name: string;
  execution_count: number;
  success_count: number;
  error_count: number;
  avg_execution_time_ms: number;
  last_execution: string;
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationResult {
  is_valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  confidence_score: number;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'critical';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// ============================================================================
// TEMPORAL QUERY TYPES
// ============================================================================

export interface TemporalQuery {
  employee_id: string;
  query_date: string;
  query_type: 'salary' | 'contract' | 'hours' | 'timeline';
}

export interface TemporalQueryResult {
  employee_id: string;
  query_date: string;
  result: any;
  found: boolean;
  source: string;
  confidence: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  service: string;
  context?: Record<string, any>;
  error?: any;
}

export interface PaginationInfo {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const EMPLOYES_BASE_URL = 'https://connect.employes.nl/v4';

export const TEDDY_KIDS_COMPANY_ID = 'b2328cd9-51c4-4f6a-a82c-ad3ed1db05b6';

export const ENDPOINTS: EndpointType[] = [
  '/employee',
  '/employments',
  '/salary-history',
  '/contracts',
  '/hours',
  '/payruns'
];

export const CHANGE_TYPES: ChangeType[] = [
  'salary_change',
  'hours_change',
  'contract_change',
  'position_change',
  'location_change',
  'department_change',
  'status_change',
  'contract_start',
  'contract_end',
  'employment_start',
  'employment_end'
];

export const MIN_CONFIDENCE_SCORE = 0.7; // Below this needs review

export const MAX_SALARY_INCREASE_PERCENT = 50; // Flag increases > 50%

export const DEFAULT_HOURS_PER_WEEK = 36; // Standard Dutch work week


