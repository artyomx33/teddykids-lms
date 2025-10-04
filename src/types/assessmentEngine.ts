/**
 * 🧪 TEDDYKIDS ASSESSMENT ENGINE TYPES - LABS 2.0
 * Comprehensive TypeScript interfaces for the independent assessment system
 */

// =============================================
// CORE ENUMS & CONSTANTS
// =============================================

export type AssessmentRoleCategory =
  | 'childcare_staff'     // Nursery, toddler care
  | 'educational_staff'   // BSO, early learning
  | 'support_staff'       // Admin, kitchen, maintenance
  | 'management'          // Team leads, coordinators
  | 'universal';          // Applies to all roles

export type AssessmentQuestionType =
  | 'multiple_choice'
  | 'scenario_response'
  | 'video_response'
  | 'file_upload'
  | 'rating_scale'
  | 'time_challenge'
  | 'text_response'
  | 'emotional_intelligence'
  | 'cultural_fit';

export type AssessmentCategory =
  | 'communication_skills'
  | 'childcare_scenarios'
  | 'cultural_fit'
  | 'technical_competency'
  | 'emotional_intelligence'
  | 'emergency_response'
  | 'teamwork'
  | 'leadership'
  | 'creativity'
  | 'problem_solving';

export type CandidateAssessmentStatus =
  | 'pending_start'
  | 'in_progress'
  | 'completed'
  | 'expired'
  | 'failed'
  | 'approved_for_hire'
  | 'rejected';

export type HiringRecommendation = 'hire' | 'reject' | 'interview' | 'reassess';

export type ReviewStatus = 'pending' | 'in_review' | 'completed';

export type FinalDecision = 'approved_for_hire' | 'rejected' | 'needs_interview';

// =============================================
// ASSESSMENT TEMPLATE SYSTEM
// =============================================

export interface AssessmentTemplate {
  id: string;
  name: string;
  description?: string;
  role_category: AssessmentRoleCategory;
  version: number;

  // Configuration
  time_limit_minutes?: number;
  questions_order: number[];
  passing_threshold: number;
  weighted_scoring: boolean;

  // Metadata
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;

  // Analytics
  total_attempts: number;
  average_score?: number;
  pass_rate?: number;

  // Populated when fetched with questions
  questions?: AssessmentQuestion[];
}

export interface AssessmentQuestion {
  id: string;
  template_id: string;

  // Question Content
  question_text: string;
  question_type: AssessmentQuestionType;
  category: AssessmentCategory;

  // Question Configuration
  options: string[]; // For multiple choice, rating scales
  correct_answers: (string | number)[]; // For auto-scoring
  scenario_context?: string; // For scenario-based questions

  // Scoring
  points: number;
  weight: number;
  auto_scorable: boolean;

  // Constraints
  min_length?: number;
  max_length?: number;
  required_files: number;
  time_limit_seconds?: number;

  // Metadata
  order_sequence: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// =============================================
// CANDIDATE SYSTEM
// =============================================

export interface AssessmentCandidate {
  id: string;

  // Basic Information
  full_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;

  // Application Details
  position_applied: string;
  role_category: AssessmentRoleCategory;
  application_source: string;

  // Contact Info
  address_street?: string;
  address_city?: string;
  address_postal_code?: string;
  address_country: string;

  // Professional Background
  years_experience?: number;
  education_level?: string;
  current_position?: string;
  current_company?: string;

  // Documents
  cv_file_path?: string;
  cover_letter_path?: string;
  portfolio_path?: string;
  certificates_paths: string[];

  // Status & Tracking
  overall_status: CandidateAssessmentStatus;
  overall_score?: number;
  ai_match_score?: number;

  // Privacy & Compliance
  privacy_consent: boolean;
  privacy_consent_date?: string;
  marketing_consent: boolean;
  gdpr_data_retention_until?: string;

  // Metadata
  widget_session_id?: string;
  ip_address?: string;
  user_agent?: string;
  referrer_url?: string;

  created_at: string;
  updated_at: string;

  // Populated relations
  assessment_sessions?: CandidateAssessmentSession[];
  ai_insights?: CandidateAiInsights;
  review?: AssessmentReview;
}

export interface CandidateAssessmentSession {
  id: string;
  candidate_id: string;
  template_id: string;

  // Session Management
  status: CandidateAssessmentStatus;
  started_at?: string;
  completed_at?: string;
  expires_at?: string;

  // Progress Tracking
  current_question_index: number;
  total_questions: number;
  time_spent_minutes: number;
  time_remaining_minutes?: number;

  // Scoring
  current_score: number;
  max_possible_score: number;
  percentage_score?: number;
  passed?: boolean;

  // Session Data
  session_metadata: Record<string, any>;
  browser_tab_switches: number;
  suspicious_activity: SuspiciousActivity[];

  created_at: string;
  updated_at: string;

  // Populated relations
  template?: AssessmentTemplate;
  responses?: CandidateResponse[];
  category_scores?: CandidateCategoryScore[];
}

export interface CandidateResponse {
  id: string;
  session_id: string;
  question_id: string;

  // Response Data
  response_data: Record<string, any>;
  response_text?: string;
  file_paths: string[];

  // Scoring
  awarded_points: number;
  max_points: number;
  auto_scored: boolean;
  manual_review_needed: boolean;
  reviewer_notes?: string;

  // Timing
  time_to_answer_seconds?: number;
  started_at: string;
  submitted_at: string;

  created_at: string;

  // Populated relations
  question?: AssessmentQuestion;
}

export interface CandidateCategoryScore {
  id: string;
  session_id: string;
  category: AssessmentCategory;

  score: number;
  max_score: number;
  percentage: number;

  // Insights
  strengths: string[];
  improvement_areas: string[];
  ai_analysis?: string;

  created_at: string;
}

// =============================================
// AI INSIGHTS & ANALYTICS
// =============================================

export interface CandidateAiInsights {
  id: string;
  candidate_id: string;

  // AI Analysis
  personality_profile: PersonalityProfile;
  competency_analysis: CompetencyAnalysis;
  cultural_fit_score?: number;
  role_suitability_score?: number;

  // Recommendations
  hiring_recommendation: HiringRecommendation;
  recommendation_confidence: number; // 0.0 to 1.0
  recommendation_reasoning?: string;

  // Insights
  key_strengths: string[];
  potential_concerns: string[];
  development_suggestions: string[];
  interview_focus_areas: string[];

  // Metadata
  ai_model_version?: string;
  generated_at: string;

  created_at: string;
}

export interface PersonalityProfile {
  openness?: number;
  conscientiousness?: number;
  extraversion?: number;
  agreeableness?: number;
  neuroticism?: number;
  emotional_stability?: number;
  communication_style?: 'direct' | 'collaborative' | 'supportive' | 'analytical';
  work_preferences?: 'team' | 'individual' | 'mixed';
  stress_tolerance?: 'high' | 'medium' | 'low';
}

export interface CompetencyAnalysis {
  childcare_expertise?: number;
  educational_skills?: number;
  communication?: number;
  problem_solving?: number;
  leadership_potential?: number;
  adaptability?: number;
  emotional_intelligence?: number;
  technical_skills?: number;
  cultural_alignment?: number;
}

export interface SuspiciousActivity {
  type: 'tab_switch' | 'long_pause' | 'rapid_answers' | 'copy_paste' | 'browser_resize';
  timestamp: string;
  details?: Record<string, any>;
}

// =============================================
// REVIEW & APPROVAL SYSTEM
// =============================================

export interface AssessmentReview {
  id: string;
  candidate_id: string;
  session_id: string;

  // Review Assignment
  assigned_to?: string;
  assigned_at?: string;

  // Review Status
  review_status: ReviewStatus;
  priority_level: number; // 1=high, 3=normal, 5=low

  // Review Results
  reviewer_score?: number;
  reviewer_recommendation?: HiringRecommendation;
  reviewer_notes?: string;
  reviewed_at?: string;

  // Decision Tracking
  final_decision?: FinalDecision;
  decision_reasoning?: string;
  decided_by?: string;
  decided_at?: string;

  created_at: string;
  updated_at: string;

  // Populated relations
  candidate?: AssessmentCandidate;
  session?: CandidateAssessmentSession;
}

// =============================================
// ANALYTICS & REPORTING
// =============================================

export interface AssessmentAnalytics {
  id: string;
  date: string;
  template_id?: string;
  role_category?: AssessmentRoleCategory;

  // Volume Metrics
  total_started: number;
  total_completed: number;
  total_passed: number;
  total_failed: number;

  // Performance Metrics
  average_score?: number;
  average_completion_time?: number; // minutes
  abandonment_rate?: number;
  pass_rate?: number;

  // Quality Metrics
  average_time_per_question?: number; // seconds
  questions_requiring_review?: number;
  ai_accuracy_rate?: number;

  created_at: string;

  // Populated relations
  template?: AssessmentTemplate;
}

// =============================================
// DASHBOARD & UI TYPES
// =============================================

export interface CandidateDashboardView {
  id: string;
  full_name: string;
  email: string;
  position_applied: string;
  role_category: AssessmentRoleCategory;
  overall_status: CandidateAssessmentStatus;
  overall_score?: number;
  ai_match_score?: number;
  application_source: string;
  application_date: string;

  // Session Info
  current_session_id?: string;
  assessment_status?: CandidateAssessmentStatus;
  percentage_score?: number;
  passed?: boolean;
  assessment_started_at?: string;
  assessment_completed_at?: string;

  // Template Info
  assessment_template_name?: string;
  passing_threshold?: number;

  // Progress
  current_question_index?: number;
  total_questions?: number;
  progress_percentage?: number;

  // Review Status
  review_status?: ReviewStatus;
  reviewer_recommendation?: HiringRecommendation;
  final_decision?: FinalDecision;
}

export interface AssessmentPipelineMetrics {
  total_applications: number;
  pending_start: number;
  in_progress: number;
  completed: number;
  passed: number;
  failed: number;
  approved_for_hire: number;
  rejected: number;

  // Conversion rates
  start_rate: number; // started / applied
  completion_rate: number; // completed / started
  pass_rate: number; // passed / completed
  hire_rate: number; // hired / passed
}

export interface RoleCategoryMetrics {
  role_category: AssessmentRoleCategory;
  metrics: AssessmentPipelineMetrics;
  average_score: number;
  average_completion_time: number;
  top_strengths: string[];
  common_weaknesses: string[];
}

// =============================================
// FORM & UI COMPONENT TYPES
// =============================================

export interface AssessmentFormData {
  // Basic Information
  full_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;

  // Application Details
  position_applied: string;
  role_category: AssessmentRoleCategory;

  // Contact Info
  address_street?: string;
  address_city?: string;
  address_postal_code?: string;
  address_country: string;

  // Professional Background
  years_experience?: number;
  education_level?: string;
  current_position?: string;
  current_company?: string;

  // Documents
  cv_file?: File;
  cover_letter_file?: File;
  portfolio_file?: File;
  certificates?: File[];

  // Privacy & Compliance
  privacy_consent: boolean;
  marketing_consent: boolean;
}

export interface AssessmentSessionData {
  session_id: string;
  current_question: number;
  total_questions: number;
  time_remaining: number;
  responses: Record<string, any>;
  auto_save_enabled: boolean;
  integrity_monitoring: boolean;
}

export interface QuestionResponse {
  question_id: string;
  answer: any;
  time_spent: number;
  confidence_level?: number;
  notes?: string;
}

// =============================================
// API RESPONSE TYPES
// =============================================

export interface AssessmentApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
  metadata?: Record<string, any>;
}

export interface PaginatedAssessmentResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
  filters?: Record<string, any>;
}

// =============================================
// WIDGET & INTEGRATION TYPES
// =============================================

export interface AssessmentWidgetConfig {
  template_id: string;
  role_category: AssessmentRoleCategory;
  auto_start: boolean;
  show_progress: boolean;
  enable_save_progress: boolean;
  integrity_monitoring: boolean;
  time_warnings: boolean;
  custom_branding?: {
    logo_url?: string;
    primary_color?: string;
    accent_color?: string;
  };
}

export interface WidgetAnalyticsEvent {
  event_type: 'widget_load' | 'assessment_start' | 'question_answered' | 'assessment_complete' | 'session_pause' | 'session_resume' | 'integrity_violation';
  timestamp: string;
  session_id: string;
  question_id?: string;
  metadata?: Record<string, any>;
}

// =============================================
// TEMPLATE BUILDER TYPES
// =============================================

export interface QuestionBuilder {
  id?: string;
  question_text: string;
  question_type: AssessmentQuestionType;
  category: AssessmentCategory;
  options: string[];
  correct_answers: (string | number)[];
  scenario_context?: string;
  points: number;
  weight: number;
  auto_scorable: boolean;
  constraints: {
    min_length?: number;
    max_length?: number;
    required_files?: number;
    time_limit_seconds?: number;
  };
  order_sequence: number;
}

export interface TemplateBuilder {
  name: string;
  description?: string;
  role_category: AssessmentRoleCategory;
  time_limit_minutes?: number;
  passing_threshold: number;
  weighted_scoring: boolean;
  questions: QuestionBuilder[];
}

// =============================================
// UTILITY TYPES
// =============================================

export interface AssessmentFilters {
  role_categories?: AssessmentRoleCategory[];
  statuses?: CandidateAssessmentStatus[];
  date_range?: {
    start: string;
    end: string;
  };
  score_range?: {
    min: number;
    max: number;
  };
  search_term?: string;
  application_source?: string[];
  has_review?: boolean;
  ai_recommendation?: HiringRecommendation[];
}

export interface AssessmentSortOptions {
  field: 'application_date' | 'full_name' | 'overall_score' | 'assessment_completed_at' | 'ai_match_score';
  direction: 'asc' | 'desc';
}

// =============================================
// HOOK TYPES
// =============================================

export interface UseAssessmentEngine {
  // State
  candidates: CandidateDashboardView[];
  templates: AssessmentTemplate[];
  analytics: AssessmentAnalytics[];
  loading: boolean;
  error?: string;

  // Actions
  fetchCandidates: (filters?: AssessmentFilters) => Promise<void>;
  fetchTemplates: (role_category?: AssessmentRoleCategory) => Promise<void>;
  createCandidate: (data: AssessmentFormData) => Promise<AssessmentCandidate>;
  startAssessment: (candidate_id: string, template_id: string) => Promise<CandidateAssessmentSession>;
  submitResponse: (session_id: string, question_id: string, response: any) => Promise<void>;
  completeAssessment: (session_id: string) => Promise<void>;
  generateAiInsights: (candidate_id: string) => Promise<CandidateAiInsights>;
  scheduleReview: (candidate_id: string, priority?: number) => Promise<AssessmentReview>;
}

export interface UseAssessmentSession {
  // State
  session?: CandidateAssessmentSession;
  current_question?: AssessmentQuestion;
  responses: Record<string, any>;
  time_remaining: number;
  is_submitting: boolean;
  auto_save_status: 'saved' | 'saving' | 'error';

  // Actions
  startSession: (template_id: string) => Promise<void>;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submitResponse: (response: any) => Promise<void>;
  saveProgress: () => Promise<void>;
  completeSession: () => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
}

// =============================================
// CONSTANTS & HELPERS
// =============================================

export const ROLE_CATEGORY_LABELS: Record<AssessmentRoleCategory, string> = {
  childcare_staff: 'Childcare Staff',
  educational_staff: 'Educational Staff',
  support_staff: 'Support Staff',
  management: 'Management',
  universal: 'Universal'
};

export const QUESTION_TYPE_LABELS: Record<AssessmentQuestionType, string> = {
  multiple_choice: 'Multiple Choice',
  scenario_response: 'Scenario Response',
  video_response: 'Video Response',
  file_upload: 'File Upload',
  rating_scale: 'Rating Scale',
  time_challenge: 'Time Challenge',
  text_response: 'Text Response',
  emotional_intelligence: 'Emotional Intelligence',
  cultural_fit: 'Cultural Fit'
};

export const CATEGORY_LABELS: Record<AssessmentCategory, string> = {
  communication_skills: 'Communication Skills',
  childcare_scenarios: 'Childcare Scenarios',
  cultural_fit: 'Cultural Fit',
  technical_competency: 'Technical Competency',
  emotional_intelligence: 'Emotional Intelligence',
  emergency_response: 'Emergency Response',
  teamwork: 'Teamwork',
  leadership: 'Leadership',
  creativity: 'Creativity',
  problem_solving: 'Problem Solving'
};

export const STATUS_LABELS: Record<CandidateAssessmentStatus, string> = {
  pending_start: 'Pending Start',
  in_progress: 'In Progress',
  completed: 'Completed',
  expired: 'Expired',
  failed: 'Failed',
  approved_for_hire: 'Approved for Hire',
  rejected: 'Rejected'
};

export const STATUS_COLORS: Record<CandidateAssessmentStatus, string> = {
  pending_start: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  in_progress: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  completed: 'bg-green-500/20 text-green-300 border-green-500/30',
  expired: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  failed: 'bg-red-500/20 text-red-300 border-red-500/30',
  approved_for_hire: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  rejected: 'bg-red-500/20 text-red-300 border-red-500/30'
};