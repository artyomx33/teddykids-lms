/**
 * TALENT ACQUISITION TYPES - LUNA-APPROVED
 * 
 * These types match the database schema in:
 * sql/migrations/001_talent_acquisition_luna_approved.sql
 * 
 * Created: October 22, 2025
 * Agents: Component Refactoring Architect + Database Schema Guardian
 */

// =============================================================================
// CANDIDATE FLOW ENUMS
// =============================================================================

export type CandidateStatus =
  | 'application_received'  // 📩 Just applied
  | 'verified'              // 🔎 Documents checked
  | 'trial_invited'         // ✉️ Trial scheduled
  | 'trial_completed'       // ✅ Trial done
  | 'decision_finalized'    // 🟢 Hired/Rejected/Hold
  | 'offer_signed';         // 📝 Offer accepted

export type CandidateDecision =
  | 'pending'     // No decision yet
  | 'hired'       // ✅ Approved for hire
  | 'on_hold'     // ⏸️ Keep for later
  | 'not_hired'   // ❌ Rejected
  | 'withdrawn';  // Candidate withdrew

export type RoleType = 'Teacher' | 'Intern' | 'Assistant' | 'Supervisor' | 'Manager';

export type LanguageTrack = 'EN' | 'NL' | 'Bilingual';

export type GroupFitCategory = 
  | 'Babies (0-1)' 
  | '1-2 years' 
  | '3+ years' 
  | 'Multi-age' 
  | 'Administrative';

export type DISCColor = 'Red' | 'Blue' | 'Green' | 'Yellow';

// =============================================================================
// STATUS BADGE CONFIGURATION
// =============================================================================

export interface StatusBadgeConfig {
  status: CandidateStatus;
  color: 'gray' | 'blue' | 'purple' | 'yellow' | 'green' | 'gold';
  emoji: string;
  label: string;
}

export const STATUS_BADGE_CONFIG: Record<CandidateStatus, StatusBadgeConfig> = {
  application_received: {
    status: 'application_received',
    color: 'gray',
    emoji: '📩',
    label: 'Application Received',
  },
  verified: {
    status: 'verified',
    color: 'blue',
    emoji: '🔎',
    label: 'Documents Verified',
  },
  trial_invited: {
    status: 'trial_invited',
    color: 'purple',
    emoji: '✉️',
    label: 'Trial Scheduled',
  },
  trial_completed: {
    status: 'trial_completed',
    color: 'yellow',
    emoji: '✅',
    label: 'Trial Completed',
  },
  decision_finalized: {
    status: 'decision_finalized',
    color: 'green',
    emoji: '🟢',
    label: 'Decision Finalized',
  },
  offer_signed: {
    status: 'offer_signed',
    color: 'gold',
    emoji: '📝',
    label: 'Offer Signed',
  },
};

// =============================================================================
// DISC PROFILE TYPES
// =============================================================================

export interface RedFlagDetail {
  question_id: number;
  question_text: string;
  answer_given: string;
  why_flagged: string;
}

export interface DISCProfile {
  // Primary and secondary colors
  primary_color: DISCColor;
  secondary_color: DISCColor;
  
  // Score distribution (total = 40)
  color_distribution: {
    red: number;    // 0-40
    blue: number;   // 0-40
    green: number;  // 0-40
    yellow: number; // 0-40
  };
  
  // Red flag detection
  redflag_count: number;
  redflag_question_ids: number[];
  redflag_details: RedFlagDetail[];
  
  // Group fit recommendation
  group_fit: GroupFitCategory;
  group_fit_confidence: number; // 0-100%
  
  // Additional insights
  personality_traits: string[];
  strengths: string[];
  potential_challenges: string[];
}

// =============================================================================
// CANDIDATE TYPES
// =============================================================================

export interface CandidateDocuments {
  diploma_url?: string;
  id_url?: string;
  cv_url?: string;
  other_urls?: string[];
}

export interface CandidateNote {
  date: string;
  author: string;
  author_id: string;
  note: string;
  private: boolean; // If true, only HR can see
}

export interface Candidate {
  id: string;
  
  // Personal Information
  full_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  
  // Application Details
  role_applied: RoleType;
  language: LanguageTrack;
  position_applied?: string;
  application_date: string;
  
  // Document URLs
  docs_diploma_url?: string;
  docs_id_url?: string;
  docs_cv_url?: string;
  docs_other_urls?: Record<string, any>;
  
  // Status & Flow
  status: CandidateStatus;
  decision: CandidateDecision;
  decision_reason?: string;
  decision_date?: string;
  
  // Trial Information
  trial_date?: string;
  trial_location?: string;
  trial_group?: GroupFitCategory;
  trial_scheduled_at?: string;
  
  // DISC Profile
  disc_profile?: DISCProfile;
  redflag_count: number;
  group_fit?: GroupFitCategory;
  primary_disc_color?: DISCColor;
  secondary_disc_color?: DISCColor;
  
  // Assessment Scores
  assessment_answers?: Record<string, any>;
  overall_score?: number; // 0-100
  ai_match_score?: number; // 0-100
  passed?: boolean;
  
  // Internal Notes
  internal_notes?: CandidateNote[];
  hr_tags?: string[];
  
  // Conversion Tracking
  converted_to_staff: boolean;
  staff_id?: string;
  employes_id?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string;
  last_updated_by?: string;
}

// =============================================================================
// TRIAL REVIEW TYPES
// =============================================================================

export interface TrialChecklistScores {
  interaction_with_children: number; // 1-5
  communication_skills: number;      // 1-5
  follows_instructions: number;      // 1-5
  initiative: number;                // 1-5
  safety_awareness: number;          // 1-5
  punctuality: number;               // 1-5
  teamwork: number;                  // 1-5
  adaptability: number;              // 1-5
}

export interface CandidateTrialReview {
  id: string;
  candidate_id: string;
  
  // Trial Details
  trial_date: string;
  trial_location: string;
  trial_group: GroupFitCategory;
  trial_duration_hours?: number;
  trial_style?: 'observation' | 'active_participation' | 'mixed';
  
  // Supervisor Information
  supervisor_id?: string;
  supervisor_name: string;
  supervisor_email?: string;
  
  // Pre-Trial Assessment (Optional)
  pre_trial_rating?: number; // 1-5
  pre_trial_notes?: string;
  pre_trial_expectations?: string;
  
  // Trial Evaluation Checklist
  checklist_interaction_with_children: number;
  checklist_communication_skills: number;
  checklist_follows_instructions: number;
  checklist_initiative: number;
  checklist_safety_awareness: number;
  checklist_punctuality: number;
  checklist_teamwork: number;
  checklist_adaptability: number;
  
  // Post-Trial Assessment
  post_trial_rating: number; // 1-5 (required)
  post_trial_notes: string;
  
  // Overall Assessment
  overall_performance?: number; // Auto-calculated average
  would_hire?: boolean;
  hire_confidence?: number; // 1-5
  
  // Qualitative Feedback
  strengths?: string;
  concerns?: string;
  specific_incidents?: string;
  children_response?: string;
  team_fit?: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
  reviewed_by?: string;
  is_final: boolean;
}

// =============================================================================
// EMPLOYES.NL EXPORT TYPES
// =============================================================================

export interface CandidateEmployesExport {
  id: string;
  candidate_id: string;
  
  // Data for employes.nl
  full_name: string;
  email: string;
  phone?: string;
  position: string;
  department: string;
  location: string;
  manager: string;
  start_date: string;
  contract_type: 'permanent' | 'temporary' | 'internship';
  hours_per_week: number;
  salary_amount?: number;
  hourly_wage?: number;
  employee_number?: string;
  
  // Export tracking
  exported_at: string;
  exported_by?: string;
  export_package_url?: string;
  
  // Employes.nl integration
  employes_id?: string;
  employes_synced_at?: string;
  sync_status?: 'pending' | 'synced' | 'error';
  
  // Additional data
  notes?: string;
  disc_profile?: DISCProfile;
  trial_summary?: Record<string, any>;
  ai_insights?: Record<string, any>;
  
  created_at: string;
  updated_at: string;
}

// =============================================================================
// DASHBOARD METRICS TYPES
// =============================================================================

export interface CandidateDashboardMetrics {
  total_candidates: number;
  new_applications: number;
  verified: number;
  awaiting_trial: number;
  trial_completed: number;
  hired: number;
  not_hired: number;
  on_hold: number;
  with_redflags: number;
  avg_overall_score: number;
  converted_to_staff: number;
}

export interface CandidateTimeInStage {
  status: CandidateStatus;
  avg_days: number;
  min_days: number;
  max_days: number;
}

export interface DISCDistribution {
  color: DISCColor;
  count: number;
  percentage: number;
}

export interface GroupFitDistribution {
  group: GroupFitCategory;
  count: number;
  percentage: number;
}

// =============================================================================
// COMPONENT PROP TYPES
// =============================================================================

export interface CandidateBadgeProps {
  candidate: Candidate;
  showDetails?: boolean;
  onClick?: () => void;
}

export interface CandidateStatusBarProps {
  status: CandidateStatus;
  decision?: CandidateDecision;
  size?: 'sm' | 'md' | 'lg';
}

export interface TrialChecklistFormProps {
  candidateId: string;
  candidateName: string;
  trialDate: string;
  trialLocation: string;
  trialGroup: GroupFitCategory;
  onSave: (review: Partial<CandidateTrialReview>) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<CandidateTrialReview>;
}

export interface CandidateListProps {
  candidates: Candidate[];
  onCandidateSelect: (candidateId: string) => void;
  filters?: {
    status?: CandidateStatus[];
    decision?: CandidateDecision[];
    redflagsOnly?: boolean;
    dateRange?: [string, string];
  };
  sortBy?: 'application_date' | 'trial_date' | 'overall_score' | 'redflag_count';
  sortOrder?: 'asc' | 'desc';
}

// =============================================================================
// FORM DATA TYPES
// =============================================================================

export interface CandidateApplicationFormData {
  // Personal Info
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  
  // Application
  role_applied: RoleType;
  language: LanguageTrack;
  position_applied: string;
  
  // Documents (File objects before upload)
  diploma_file?: File;
  id_file?: File;
  cv_file?: File;
  other_files?: File[];
  
  // DISC Assessment (40 questions)
  disc_answers: Record<number, string>; // question_id -> answer
}

export interface TrialScheduleFormData {
  candidate_id: string;
  trial_date: string;
  trial_time: string;
  trial_location: string;
  trial_group: GroupFitCategory;
  trial_style: 'observation' | 'active_participation' | 'mixed';
  supervisor_name: string;
  supervisor_email: string;
  notes?: string;
}

export interface DecisionFormData {
  candidate_id: string;
  decision: CandidateDecision;
  decision_reason?: string;
  decision_date: string;
  next_steps?: string;
  notify_candidate?: boolean;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CandidateListResponse {
  candidates: Candidate[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

// =============================================================================
// HELPER CONSTANTS
// =============================================================================

export const DISC_COLOR_LABELS: Record<DISCColor, string> = {
  Red: 'Dominant',
  Blue: 'Conscientious',
  Green: 'Steady',
  Yellow: 'Influential',
};

export const DISC_COLOR_DESCRIPTIONS: Record<DISCColor, string> = {
  Red: 'Direct, results-oriented, firm, strong-willed, forceful',
  Blue: 'Analytical, precise, high standards, systematic, diplomatic',
  Green: 'Even-tempered, accommodating, patient, humble, tactful',
  Yellow: 'Outgoing, enthusiastic, optimistic, high-spirited, lively',
};

export const TRIAL_CHECKLIST_LABELS: Record<keyof TrialChecklistScores, string> = {
  interaction_with_children: 'Interaction with Children',
  communication_skills: 'Communication Skills',
  follows_instructions: 'Follows Instructions',
  initiative: 'Initiative & Proactiveness',
  safety_awareness: 'Safety Awareness',
  punctuality: 'Punctuality',
  teamwork: 'Teamwork & Collaboration',
  adaptability: 'Adaptability & Flexibility',
};

export const CANDIDATE_STATUS_FLOW: CandidateStatus[] = [
  'application_received',
  'verified',
  'trial_invited',
  'trial_completed',
  'decision_finalized',
  'offer_signed',
];

// =============================================================================
// TYPE GUARDS
// =============================================================================

export function isCandidateStatus(value: string): value is CandidateStatus {
  return CANDIDATE_STATUS_FLOW.includes(value as CandidateStatus);
}

export function hasTrial(candidate: Candidate): boolean {
  return !!(candidate.trial_date || candidate.status === 'trial_invited' || candidate.status === 'trial_completed');
}

export function hasRedFlags(candidate: Candidate): boolean {
  return candidate.redflag_count >= 2;
}

export function isReadyForExport(candidate: Candidate): boolean {
  return candidate.decision === 'hired' && 
         !candidate.converted_to_staff && 
         !candidate.employes_id;
}

