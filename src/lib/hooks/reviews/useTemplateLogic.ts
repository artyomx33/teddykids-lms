import { useMemo } from 'react';

import type { ReviewContextState, ReviewTemplateSnapshot } from '@/lib/reviews/reviewTypes';

interface UseTemplateLogicOptions {
  selectedTemplate: ReviewTemplateSnapshot | null;
  discQuestionCount: number;
  formState: ReviewContextState;
}

export function useTemplateLogic({ selectedTemplate, discQuestionCount, formState }: UseTemplateLogicOptions) {
  const showSelfAssessment = useMemo(() => {
    return selectedTemplate?.self_assessment_required !== false;
  }, [selectedTemplate]);

  const showDISC = useMemo(() => {
    return selectedTemplate?.disc_injection_enabled !== false && discQuestionCount > 0;
  }, [selectedTemplate, discQuestionCount]);

  const xpReward = useMemo(() => {
    return selectedTemplate?.xp_reward ?? 100;
  }, [selectedTemplate]);

  return {
    showSelfAssessment,
    showDISC,
    xpReward,
    selectedTemplate,
    reviewType: formState.review_type,
  };
}

