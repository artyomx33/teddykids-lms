/**
 * 🧪 HIRING WIDGET SYSTEM TYPES
 * Comprehensive TypeScript interfaces for the hiring pipeline
 */

// =============================================
// CORE ENTITY TYPES
// =============================================

export interface Position {
  id: string;
  title: string;
  department: string;
  position_type: 'full_time' | 'part_time' | 'internship' | 'temporary' | 'volunteer';
  experience_level: 'entry' | 'junior' | 'mid' | 'senior' | 'expert';
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  salary_range_min?: number;
  salary_range_max?: number;
  location: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface AssessmentTemplate {
  id: string;
  name: string;
  description: string;
  assessment_type: 'skills' | 'personality' | 'general' | 'technical' | 'cultural_fit';
  questions: AssessmentQuestion[];
  scoring_method: 'percentage' | 'points' | 'qualitative';
  time_limit_minutes?: number;
  passing_score?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface AssessmentQuestion {
  id: number;
  question: string;
  type: 'multiple_choice' | 'text' | 'rating' | 'boolean' | 'select' | 'multiple_rating';
  options?: string[];
  categories?: string[];
  min?: number;
  max?: number;
  min_length?: number;
  max_length?: number;
  required: boolean;
}

export interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  nationality?: string;

  // Address
  address_street?: string;
  address_city?: string;
  address_postal_code?: string;
  address_country?: string;

  // Professional
  current_position?: string;
  current_company?: string;
  years_experience?: number;
  education_level?: 'high_school' | 'vocational' | 'bachelor' | 'master' | 'phd' | 'other';

  // Preferences
  preferred_positions?: string[];
  preferred_departments?: string[];
  preferred_work_type?: 'full_time' | 'part_time' | 'internship' | 'temporary' | 'volunteer';
  available_start_date?: string;
  salary_expectation_min?: number;
  salary_expectation_max?: number;

  // Status
  application_status: 'applied' | 'screening' | 'assessment' | 'interview' | 'offer' | 'hired' | 'rejected' | 'withdrawn';
  application_source: 'widget' | 'referral' | 'job_board' | 'social_media' | 'direct';

  // Documents
  cv_file_path?: string;
  cover_letter_file_path?: string;
  portfolio_file_path?: string;

  // GDPR
  privacy_consent: boolean;
  privacy_consent_date?: string;
  marketing_consent: boolean;
  data_retention_until?: string;

  // Metadata
  widget_session_id?: string;
  ip_address?: string;
  user_agent?: string;
  referrer_url?: string;

  created_at: string;
  updated_at: string;
}

export interface CandidateApplication {
  id: string;
  candidate_id: string;
  position_id: string;
  application_date: string;
  status: 'submitted' | 'under_review' | 'assessment_pending' | 'assessment_completed' | 'interview_scheduled' | 'interview_completed' | 'offer_made' | 'offer_accepted' | 'offer_rejected' | 'hired' | 'rejected';

  // Scoring
  overall_score?: number;
  assessment_scores?: Record<string, number>;
  reviewer_notes?: string;

  // Interview
  interview_scheduled_at?: string;
  interviewer_id?: string;
  interview_notes?: string;
  interview_rating?: number;

  // Decision
  decision?: 'hire' | 'reject' | 'hold' | 'pending';
  decision_reason?: string;
  decision_made_by?: string;
  decision_made_at?: string;

  // Offer
  offer_salary?: number;
  offer_start_date?: string;
  offer_expires_at?: string;

  created_at: string;
  updated_at: string;
}

export interface CandidateAssessment {
  id: string;
  candidate_id: string;
  application_id: string;
  assessment_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'expired' | 'skipped';
  started_at?: string;
  completed_at?: string;
  expires_at?: string;

  // Results
  responses: Record<string, any>;
  score?: number;
  max_score?: number;
  percentage_score?: number;
  passed?: boolean;

  time_spent_minutes?: number;
  session_data?: Record<string, any>;

  created_at: string;
  updated_at: string;
}

export interface HiringPipelineStage {
  id: string;
  name: string;
  description?: string;
  order_sequence: number;
  stage_type: 'application' | 'screening' | 'assessment' | 'interview' | 'decision' | 'offer' | 'onboarding';
  is_active: boolean;
  auto_transition_rules?: Record<string, any>;
  required_actions?: string[];
  created_at: string;
  updated_at: string;
}

export interface CandidatePipelineHistory {
  id: string;
  candidate_id: string;
  application_id: string;
  stage_id: string;
  entered_at: string;
  exited_at?: string;
  duration_hours?: number;
  stage_outcome?: 'passed' | 'failed' | 'pending' | 'skipped';
  notes?: string;
  moved_by?: string;
  automatic_transition: boolean;
  created_at: string;
}

export interface WidgetAnalytics {
  id: string;
  session_id: string;
  ip_address?: string;
  user_agent?: string;
  referrer_url?: string;
  event_type: 'widget_load' | 'form_start' | 'form_step' | 'form_complete' | 'form_abandon' | 'assessment_start' | 'assessment_complete' | 'file_upload';
  event_data?: Record<string, any>;
  timestamp: string;
  country?: string;
  city?: string;
  device_type?: string;
  browser?: string;
  candidate_id?: string;
  application_id?: string;
}

// =============================================
// WIDGET FORM TYPES
// =============================================

export interface WidgetFormData {
  // Step 1: Basic Information
  full_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;

  // Step 2: Address
  address_street?: string;
  address_city?: string;
  address_postal_code?: string;
  address_country: string;

  // Step 3: Professional Information
  current_position?: string;
  current_company?: string;
  years_experience?: number;
  education_level?: string;

  // Step 4: Position Preferences
  preferred_positions: string[];
  preferred_work_type?: string;
  available_start_date?: string;
  salary_expectation_min?: number;
  salary_expectation_max?: number;

  // Step 5: Documents
  cv_file?: File;
  cover_letter_file?: File;
  portfolio_file?: File;

  // Step 6: Consent
  privacy_consent: boolean;
  marketing_consent: boolean;
}

export interface WidgetFormStep {
  id: string;
  title: string;
  description: string;
  fields: string[];
  validation?: Record<string, any>;
  optional?: boolean;
}

export interface AssessmentResponse {
  question_id: number;
  answer: string | number | boolean | string[];
  time_spent_seconds?: number;
}

export interface AssessmentSession {
  assessment_id: string;
  candidate_id: string;
  application_id: string;
  current_question: number;
  responses: AssessmentResponse[];
  started_at: string;
  time_remaining_seconds?: number;
  session_data: Record<string, any>;
}

// =============================================
// API RESPONSE TYPES
// =============================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface CandidatePipelineView {
  candidate_id: string;
  full_name: string;
  email: string;
  application_status: string;
  application_id: string;
  position_title: string;
  application_status_detailed: string;
  overall_score?: number;
  application_date: string;
  current_stage_id?: string;
  current_stage_name?: string;
  stage_entered_at?: string;
  assessments_completed: number;
  total_assessments: number;
}

export interface ConversionFunnel {
  date: string;
  widget_loads: number;
  form_starts: number;
  form_completions: number;
  assessment_starts: number;
  assessment_completions: number;
  unique_candidates: number;
}

export interface ApplicationStatusSummary {
  position_title: string;
  department: string;
  total_applications: number;
  submitted: number;
  under_review: number;
  assessment_pending: number;
  interview_scheduled: number;
  offer_made: number;
  hired: number;
  rejected: number;
  avg_score?: number;
}

// =============================================
// COMPONENT PROPS TYPES
// =============================================

export interface HiringWidgetProps {
  positions?: Position[];
  onComplete?: (candidate: Candidate, application: CandidateApplication) => void;
  onAnalytics?: (event: Omit<WidgetAnalytics, 'id' | 'timestamp'>) => void;
  className?: string;
  theme?: 'light' | 'dark';
  embedded?: boolean;
  sessionId?: string;
}

export interface AssessmentWidgetProps {
  assessment: AssessmentTemplate;
  candidateId: string;
  applicationId: string;
  onComplete?: (results: CandidateAssessment) => void;
  onProgress?: (progress: number) => void;
  timeLimit?: number;
  autoSave?: boolean;
}

export interface CandidateDashboardProps {
  candidates: CandidatePipelineView[];
  loading?: boolean;
  onStatusChange?: (candidateId: string, newStatus: string) => void;
  onViewDetails?: (candidateId: string) => void;
  filters?: CandidateFilters;
  onFiltersChange?: (filters: CandidateFilters) => void;
}

export interface CandidateFilters {
  status?: string[];
  position?: string[];
  department?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  searchTerm?: string;
  scoreRange?: {
    min: number;
    max: number;
  };
}

export interface HiringAnalyticsProps {
  conversionData: ConversionFunnel[];
  applicationSummary: ApplicationStatusSummary[];
  timeRange: 'week' | 'month' | 'quarter' | 'year';
  onTimeRangeChange: (range: string) => void;
}

// =============================================
// UTILITY TYPES
// =============================================

export type WidgetStep = 'basic' | 'address' | 'professional' | 'preferences' | 'documents' | 'consent' | 'assessments' | 'complete';

export type CandidateStatus = Candidate['application_status'];
export type ApplicationStatus = CandidateApplication['status'];
export type AssessmentStatus = CandidateAssessment['status'];

export interface FormValidationError {
  field: string;
  message: string;
}

export interface FileUploadResult {
  success: boolean;
  file_path?: string;
  error?: string;
}

// =============================================
// HOOKS & CONTEXT TYPES
// =============================================

export interface HiringContextValue {
  positions: Position[];
  assessments: AssessmentTemplate[];
  candidates: CandidatePipelineView[];
  loading: boolean;
  error?: string;

  // Actions
  fetchPositions: () => Promise<void>;
  fetchAssessments: () => Promise<void>;
  fetchCandidates: (filters?: CandidateFilters) => Promise<void>;
  createCandidate: (data: WidgetFormData) => Promise<Candidate>;
  submitApplication: (candidateId: string, positionId: string) => Promise<CandidateApplication>;
  submitAssessment: (assessmentId: string, responses: AssessmentResponse[]) => Promise<CandidateAssessment>;
  uploadFile: (file: File, type: 'cv' | 'cover_letter' | 'portfolio') => Promise<FileUploadResult>;
  trackAnalytics: (event: Omit<WidgetAnalytics, 'id' | 'timestamp'>) => Promise<void>;
}

export interface UseHiringWidget {
  currentStep: WidgetStep;
  formData: WidgetFormData;
  errors: FormValidationError[];
  isSubmitting: boolean;

  // Actions
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<WidgetFormData>) => void;
  validateStep: (step: WidgetStep) => boolean;
  submitApplication: () => Promise<void>;
  reset: () => void;
}

export interface UseAssessment {
  currentQuestion: number;
  responses: AssessmentResponse[];
  timeRemaining: number;
  isSubmitting: boolean;

  // Actions
  nextQuestion: () => void;
  prevQuestion: () => void;
  updateResponse: (questionId: number, answer: any) => void;
  submitAssessment: () => Promise<void>;
  saveProgress: () => Promise<void>;
}