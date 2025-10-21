import { createContext, useContext } from 'react';

import type { DISCMiniQuestion } from '@/lib/discIntegration';
import type { ReviewFormMode } from '../types';
import type {
  ReviewContextState,
  ReviewTemplateSnapshot,
} from '@/lib/reviews/reviewTypes';

interface ReviewFormContextValue {
  state: ReviewContextState;
  templates: ReviewTemplateSnapshot[];
  selectedTemplate: ReviewTemplateSnapshot | null;
  selectedTemplateId: string;
  selectTemplate: (templateId: string) => void;
  discQuestions: DISCMiniQuestion[];
  showSelfAssessment: boolean;
  showDISC: boolean;
  xpReward: number;
  mode: ReviewFormMode;
  isDirty: boolean;
  updateField: <K extends keyof ReviewContextState>(field: K, value: ReviewContextState[K]) => void;
  updateResponse: (questionKey: string | number, value: unknown) => void;
  handleArrayFieldChange: (field: 'goals_next' | 'development_areas' | 'achievements', index: number, value: string) => void;
  addArrayField: (field: 'goals_next' | 'development_areas' | 'achievements') => void;
  resetForm: () => void;
  submitReview: (options?: { onSuccess?: () => void }) => Promise<void>;
  isSubmitting: boolean;
  submissionError: string | null;
  validation: {
    errors: Record<string, string>;
    isValid: boolean;
    runValidation: (state: ReviewContextState) => Record<string, string>;
    validateField: (field: string, state: ReviewContextState) => string | undefined;
    resetValidation: () => void;
  };
  onCancel?: () => void;
  className?: string;
}

const ReviewFormContext = createContext<ReviewFormContextValue | null>(null);

export function useReviewFormContext() {
  const context = useContext(ReviewFormContext);
  if (!context) {
    throw new Error('useReviewFormContext must be used within a ReviewFormProvider');
  }
  return context;
}

export { ReviewFormContext };

