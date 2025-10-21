import type { ReviewType } from '@/components/reviews/ReviewForm/types';

import type { DISCMiniQuestion, DISCSnapshot } from '@/lib/discIntegration';

export interface ReviewResponses {
  [key: string]: unknown;
}

export interface ReviewSelfAssessment {
  self_ratings?: Record<string, number>;
  proud_moment?: string;
  work_on?: string;
  how_supported?: number;
}

export interface ReviewEmotionalScores {
  empathy: number;
  stress_tolerance: number;
  emotional_regulation: number;
  team_support: number;
  conflict_resolution: number;
}

export interface ReviewTemplateSnapshot {
  id: string;
  name?: string;
  type?: ReviewType;
  xp_reward?: number;
  scoring_method?: 'five_star' | 'percentage' | 'qualitative';
  self_assessment_required?: boolean;
  disc_injection_enabled?: boolean;
  questions?: Array<{
    question: string;
    type: 'text' | 'rating' | 'boolean' | 'select';
    required: boolean;
    options?: string[];
  }>;
}

export interface ReviewFormState {
  staff_id: string;
  reviewer_id: string;
  review_type: ReviewType;
  review_date: string;
  responses: ReviewResponses;
  summary: string;
  goals_next: string[];
  development_areas: string[];
  achievements: string[];
  overall_score: number;
  star_rating: number;
  performance_level: 'exceptional' | 'exceeds' | 'meets' | 'below' | 'unsatisfactory';
  promotion_ready: boolean;
  salary_recommendation: 'increase' | 'maintain' | 'review' | 'decrease';
  signed_by_employee: boolean;
  signed_by_reviewer: boolean;
  self_assessment: ReviewSelfAssessment;
  disc_responses: Record<string, number>;
  emotional_scores: ReviewEmotionalScores;
  xp_earned: number;
  review_trigger_type: 'manual' | 'scheduled' | 'automated';
  warning_level?: number;
  behavior_score?: number;
  impact_score?: number;
  support_suggestions: string[];
  promotion_readiness_score?: number;
  leadership_potential_score?: number;
  salary_suggestion_reason: string;
  future_raise_goal: string;
  adaptability_speed?: number;
  initiative_taken?: number;
  team_reception_score?: number;
  template_id?: string;
  selectedTemplate?: ReviewTemplateSnapshot | null;
  discQuestions: DISCMiniQuestion[];
  manager_vs_self_delta?: number;
}

export interface ReviewContextState extends ReviewFormState {}

export interface ReviewCalculationsResult {
  overallScore: number;
  selfDelta: number;
  discSnapshot: DISCSnapshot | null;
}

export interface ReviewPayload {
  staff_id: string | null;
  reviewer_id: string | null;
  review_type: ReviewType;
  review_date: string;
  responses: ReviewResponses;
  summary: string | null;
  goals_next: string[] | null;
  development_areas: string[] | null;
  achievements: string[] | null;
  overall_score: number | null;
  star_rating: number | null;
  performance_level: ReviewFormState['performance_level'] | null;
  promotion_ready: boolean | null;
  salary_recommendation: ReviewFormState['salary_recommendation'] | null;
  signed_by_employee: boolean | null;
  signed_by_reviewer: boolean | null;
  template_id: string | null;
  self_assessment: ReviewSelfAssessment | null;
  manager_vs_self_delta: number | null;
  disc_snapshot: DISCSnapshot | null;
  disc_questions_answered: Array<{
    question_id: string;
    selected_option_index: number;
  }> | null;
  xp_earned: number | null;
  wellbeing_score: number | null;
  warning_level?: number | null;
  behavior_score?: number | null;
  impact_score?: number | null;
  support_suggestions?: string[] | null;
  promotion_readiness_score?: number | null;
  leadership_potential_score?: number | null;
  salary_suggestion_reason?: string | null;
  future_raise_goal?: string | null;
  adaptability_speed?: number | null;
  initiative_taken?: number | null;
  team_reception_score?: number | null;
}

