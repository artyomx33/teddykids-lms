export type ReviewFormMode = 'create' | 'edit' | 'complete';

export type ReviewType =
  | 'six_month'
  | 'yearly'
  | 'performance'
  | 'probation'
  | 'exit'
  | 'promotion_review'
  | 'salary_review'
  | 'warning';

export interface ReviewFormProps {
  reviewId?: string;
  staffId?: string;
  templateId?: string;
  reviewType?: ReviewType;
  mode?: ReviewFormMode;
  onSave?: (reviewData: unknown) => void;
  onCancel?: () => void;
  className?: string;
}

export interface QuestionData {
  question: string;
  type: 'text' | 'rating' | 'boolean' | 'select';
  required: boolean;
  options?: string[];
}

export interface ReviewTemplate {
  id: string;
  name: string;
  type: string;
  questions: QuestionData[];
  criteria: Record<string, number>;
  scoring_method: 'five_star' | 'percentage' | 'qualitative';
  xp_reward?: number;
  self_assessment_required?: boolean;
  disc_injection_enabled?: boolean;
}
