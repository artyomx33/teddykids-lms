/**
 * 🧪 TALENT ACQUISITION - TYPE DEFINITIONS
 * Complete isolated type system for Labs 2.0 hiring widget
 */

// ====================================================
// CORE TYPES - Luna's Specifications
// ====================================================

export type Role = 'intern' | 'teacher';
export type LanguageTrack = 'en' | 'nl' | 'bi';
export type GroupFit = 'babies' | 'one_two' | 'three_plus' | 'mixed';
export type WorkPermitStatus = 'yes' | 'no' | 'processing';

export type ApplicationStatus =
  | 'application_received'
  | 'docs_verified'
  | 'assessment_scored'
  | 'trial_planned'
  | 'pre_trial_rating'
  | 'post_trial_rating'
  | 'decision'
  | 'offer_sent'
  | 'offer_accepted'
  | 'offer_rejected'
  | 'hired'
  | 'rejected';

export type DISCColor = 'red' | 'blue' | 'green' | 'yellow';
export type Decision = 'hire' | 'hold' | 'reject';

// ====================================================
// APPLICANT INTERFACES
// ====================================================

export interface ApplicantProfile {
  id?: string;
  ref_code?: string;

  // Role and Language
  role: Role;
  language_track: LanguageTrack;
  preferred_group?: GroupFit;

  // Personal Information
  full_name: string;
  email: string;
  phone?: string;
  nationality?: string;
  city?: string;

  // Legal Requirements
  vog_eligible: boolean;
  work_permit: WorkPermitStatus;

  // Timing
  start_date?: string;
  availability: {
    mon?: boolean;
    tue?: boolean;
    wed?: boolean;
    thu?: boolean;
    fri?: boolean;
  };

  // System Fields
  created_at?: string;
  updated_at?: string;
}

export interface ApplicantDocument {
  id: string;
  applicant_id: string;
  type: 'diploma' | 'id' | 'cv' | 'reference' | 'other';
  url: string;
  original_filename?: string;
  file_size?: number;
  mime_type?: string;
  verified: boolean;
  verifier?: string;
  verified_at?: string;
  verification_notes?: string;
  created_at: string;
}

export interface ApplicantProgress {
  id: string;
  applicant_id: string;
  status: ApplicationStatus;

  // Trial Information
  trial_date?: string;
  trial_location?: string; // RBW, RB3/5, LRZ, ZML
  trial_group?: string;
  pre_trial_rating?: number; // 1-5
  post_trial_rating?: number; // 1-5

  // Decision Making
  decision?: Decision;
  decision_reason?: string;
  decision_made_by?: string;
  decision_date?: string;

  // Management
  interviewer: string[];
  notes_manager?: string;
  salary_band_hint?: string;

  // Timeline
  history_json: ProgressHistoryItem[];

  created_at: string;
  updated_at: string;
}

export interface ProgressHistoryItem {
  timestamp: string;
  status: ApplicationStatus;
  notes?: string;
  user: string;
}

// ====================================================
// ASSESSMENT INTERFACES - Luna's DISC System
// ====================================================

export interface AssessmentAnswer {
  id: number;
  choice: 'A' | 'B' | 'C' | 'D';
}

export interface AssessmentQuestion {
  id: number;
  question_text: string;
  question_type: 'disc_color' | 'red_flag' | 'age_group' | 'competency';
  option_a: string;
  option_b: string;
  option_c?: string;
  option_d?: string;

  // Scoring Configuration
  color_mapping?: Record<string, DISCColor>;
  red_flag_mapping?: Record<string, boolean>;
  age_group_mapping?: Record<string, GroupFit>;
  competency_mapping?: Record<string, Record<string, number>>;

  // Metadata
  category?: string;
  difficulty_level: number;
  time_limit_seconds: number;
  required: boolean;
}

export interface AssessmentResult {
  // Primary Results
  color_primary: DISCColor;
  color_secondary: DISCColor;
  color_counts: Record<DISCColor, number>;

  // Risk Assessment
  red_flag_count: number;
  red_flag_items: number[];

  // Age Group Fit
  age_fit: GroupFit;
  age_fit_confidence: number; // 0.0 - 1.0

  // Scoring
  overall_score: number; // 0-100
  competency_scores: Record<string, number>;
}

export interface ApplicantAssessment {
  id: string;
  applicant_id: string;

  // Raw Data
  answers_json: AssessmentAnswer[];

  // Results
  color_primary?: DISCColor;
  color_secondary?: DISCColor;
  color_counts: Record<string, number>;
  red_flag_count: number;
  red_flag_items: number[];
  age_fit?: GroupFit;
  age_fit_confidence?: number;
  overall_score?: number;
  competency_scores: Record<string, number>;

  // Timing
  started_at: string;
  completed_at?: string;
  time_taken_minutes?: number;
}

// ====================================================
// DISC COLOR PROFILES - Luna's Specifications
// ====================================================

export interface DISCProfile {
  color: DISCColor;
  title: string;
  description: string;
  strengths: string[];
  ideal_environment: string[];
  childcare_fit: string;
  development_areas: string[];
}

export const DISC_PROFILES: Record<DISCColor, DISCProfile> = {
  red: {
    color: 'red',
    title: 'Captain Energy',
    description: 'Fast decisions, leads in chaos, loves responsibility',
    strengths: [
      'Natural leadership in emergencies',
      'Quick problem-solving',
      'Goal-oriented with children',
      'Confident decision-making',
      'Drives progress and results'
    ],
    ideal_environment: [
      'Active, challenging situations',
      'Leadership opportunities',
      'Goal-focused activities',
      'Independence in decision-making'
    ],
    childcare_fit: 'Excellent for guiding older children (3+) through structured activities and managing dynamic group situations.',
    development_areas: [
      'Patience with slower learners',
      'Collaborative teamwork',
      'Gentle communication styles'
    ]
  },
  blue: {
    color: 'blue',
    title: 'The Planner',
    description: 'Structure, safety, consistency, routines',
    strengths: [
      'Exceptional attention to detail',
      'Consistent routines and safety',
      'Thorough documentation',
      'Reliable and organized',
      'Quality-focused care'
    ],
    ideal_environment: [
      'Well-structured environments',
      'Clear procedures and guidelines',
      'Predictable schedules',
      'Focus on safety protocols'
    ],
    childcare_fit: 'Perfect for babies and toddlers who thrive on routine, and excellent for maintaining safety standards.',
    development_areas: [
      'Flexibility with unexpected changes',
      'Comfort with creative play',
      'Spontaneous interaction skills'
    ]
  },
  green: {
    color: 'green',
    title: 'The Heart',
    description: 'Calm presence, social glue, empathy',
    strengths: [
      'Deep emotional intelligence',
      'Exceptional listening skills',
      'Calm during conflicts',
      'Builds strong relationships',
      'Supportive team member'
    ],
    ideal_environment: [
      'Collaborative teams',
      'Stable, supportive settings',
      'Focus on relationships',
      'Harmony and cooperation'
    ],
    childcare_fit: 'Ideal for all age groups, especially excels at emotional support and building secure attachments.',
    development_areas: [
      'Assertiveness when needed',
      'Handling time pressure',
      'Direct communication'
    ]
  },
  yellow: {
    color: 'yellow',
    title: 'Spark Maker',
    description: 'Creative play, stories, music, engagement',
    strengths: [
      'Boundless creativity',
      'Natural storyteller',
      'Engaging and enthusiastic',
      'Adaptable and flexible',
      'Inspires imagination'
    ],
    ideal_environment: [
      'Creative, flexible spaces',
      'Variety and stimulation',
      'Social interaction',
      'Freedom to innovate'
    ],
    childcare_fit: 'Excellent for inspiring creativity and engagement across all age groups, especially through play and learning.',
    development_areas: [
      'Focus on detailed tasks',
      'Following structured routines',
      'Attention to administrative duties'
    ]
  }
};

// ====================================================
// WIDGET & ANALYTICS INTERFACES
// ====================================================

export interface WidgetAnalytics {
  id: string;
  event_type: 'widget_loaded' | 'step_completed' | 'assessment_started' | 'assessment_completed' | 'application_submitted' | 'document_uploaded' | 'conversion';
  session_id?: string;
  applicant_id?: string;
  step_name?: string;
  source_url?: string;
  referrer?: string;
  user_agent?: string;
  ip_address?: string;
  load_time_ms?: number;
  completion_time_ms?: number;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ConversionFunnel {
  widget_loads: number;
  assessments_started: number;
  assessments_completed: number;
  applications_submitted: number;
  conversion_rate: number;
}

export interface PipelineOverview {
  status: ApplicationStatus;
  count: number;
  avg_days_in_status: number;
}

// ====================================================
// COMMUNICATION INTERFACES
// ====================================================

export interface CommunicationLog {
  id: string;
  applicant_id: string;
  type: 'email' | 'sms' | 'phone' | 'in_person';
  direction: 'outbound' | 'inbound';
  subject?: string;
  content?: string;
  from_address?: string;
  to_address?: string;
  cc_addresses?: string[];
  status: 'draft' | 'sent' | 'delivered' | 'read' | 'bounced' | 'failed';
  delivered_at?: string;
  read_at?: string;
  sent_by?: string;
  created_at: string;
}

// ====================================================
// API RESPONSE INTERFACES
// ====================================================

export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface ApplicantWithRelations extends ApplicantProfile {
  documents: ApplicantDocument[];
  assessment?: ApplicantAssessment;
  progress: ApplicantProgress;
  communications: CommunicationLog[];
}

// ====================================================
// COMPONENT PROP INTERFACES
// ====================================================

export interface CandidateCardProps {
  applicant: ApplicantWithRelations;
  onSelect?: (applicantId: string) => void;
  onStatusChange?: (applicantId: string, newStatus: ApplicationStatus) => void;
  onReviewAssign?: (applicantId: string, reviewerId: string) => void;
  compact?: boolean;
}

export interface AssessmentWidgetProps {
  questions: AssessmentQuestion[];
  onComplete: (answers: AssessmentAnswer[], result: AssessmentResult) => void;
  onProgress?: (step: number, totalSteps: number) => void;
  timeLimit?: number;
  showProgress?: boolean;
}

export interface DISCResultProps {
  result: AssessmentResult;
  profile: DISCProfile;
  showDetails?: boolean;
  compact?: boolean;
}

// ====================================================
// FORM INTERFACES
// ====================================================

export interface ApplicationFormData extends ApplicantProfile {
  // Additional form-specific fields
  terms_accepted: boolean;
  privacy_accepted: boolean;
  marketing_consent?: boolean;
}

export interface DocumentUploadData {
  type: ApplicantDocument['type'];
  file: File;
  notes?: string;
}

export interface TrialPlanningData {
  trial_date: string;
  trial_location: string;
  trial_group: string;
  notes?: string;
  interviewer: string[];
}

// ====================================================
// SEARCH & FILTER INTERFACES
// ====================================================

export interface CandidateFilters {
  status?: ApplicationStatus[];
  role?: Role[];
  language_track?: LanguageTrack[];
  color_primary?: DISCColor[];
  overall_score_min?: number;
  overall_score_max?: number;
  red_flag_count_max?: number;
  date_from?: string;
  date_to?: string;
  search_query?: string;
}

export interface SortOption {
  field: 'created_at' | 'full_name' | 'overall_score' | 'status';
  direction: 'asc' | 'desc';
}

// ====================================================
// WIDGET EMBEDDING INTERFACES
// ====================================================

export interface WidgetConfig {
  theme?: 'light' | 'dark';
  primary_color?: string;
  language?: LanguageTrack;
  show_progress?: boolean;
  company_name?: string;
  contact_email?: string;
  redirect_url?: string;
  analytics_enabled?: boolean;
}

export interface EmbedCode {
  html: string;
  css: string;
  javascript: string;
  instructions: string[];
}

// ====================================================
// SUCCESS FLOW INTERFACES
// ====================================================

export interface ApplicationSuccess {
  ref_code: string;
  qr_code_url: string;
  status_page_url: string;
  estimated_response_time: string;
  next_steps: string[];
  color_result?: {
    primary: DISCColor;
    secondary: DISCColor;
    description: string;
  };
}

// ====================================================
// EXPORT ALL TYPES
// ====================================================


// Type guards for runtime type checking
export const isValidRole = (role: string): role is Role =>
  ['intern', 'teacher'].includes(role);

export const isValidLanguageTrack = (track: string): track is LanguageTrack =>
  ['en', 'nl', 'bi'].includes(track);

export const isValidDISCColor = (color: string): color is DISCColor =>
  ['red', 'blue', 'green', 'yellow'].includes(color);

export const isValidApplicationStatus = (status: string): status is ApplicationStatus => {
  const validStatuses: ApplicationStatus[] = [
    'application_received', 'docs_verified', 'assessment_scored',
    'trial_planned', 'pre_trial_rating', 'post_trial_rating',
    'decision', 'offer_sent', 'offer_accepted', 'offer_rejected',
    'hired', 'rejected'
  ];
  return validStatuses.includes(status as ApplicationStatus);
};