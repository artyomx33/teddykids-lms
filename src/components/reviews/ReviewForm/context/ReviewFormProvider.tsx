import { ReactNode, useCallback, useMemo } from 'react';

import { ReviewFormContext } from './ReviewFormContext';
import { useReviewFormState } from '@/lib/hooks/reviews/useReviewFormState';
import { useReviewValidation } from '@/lib/hooks/reviews/useReviewValidation';
import { useReviewSubmission } from '@/lib/hooks/reviews/useReviewSubmission';
import { useTemplateLogic } from '@/lib/hooks/reviews/useTemplateLogic';
import { useArrayFieldManager } from '@/lib/hooks/reviews/useArrayFieldManager';
import type { ReviewFormProps } from '../types';
import type {
  ReviewContextState,
  ReviewTemplateSnapshot,
} from '@/lib/reviews/reviewTypes';

interface ReviewFormProviderProps extends ReviewFormProps {
  initialState: ReviewContextState;
  templates: ReviewTemplateSnapshot[];
  discQuestions: ReviewContextState['discQuestions'];
  children: ReactNode;
}

export function ReviewFormProvider({
  initialState,
  templates,
  discQuestions,
  children,
  mode = 'create',
  reviewId,
  onSave,
  onCancel,
  className,
}: ReviewFormProviderProps) {
  const form = useReviewFormState({
    initialState,
    templates,
    initialTemplateId: initialState.template_id,
  });

  const arrayFields = useArrayFieldManager(form.setFormState);
  const submission = useReviewSubmission({ mode, reviewId });
  const validation = useReviewValidation(initialState);
  const templateLogic = useTemplateLogic({
    selectedTemplate: form.selectedTemplate ?? null,
    discQuestionCount: discQuestions.length,
    formState: form.formState,
  });

  const contextValue = useMemo(() => {
    const submit = async (options?: { onSuccess?: () => void }) => {
      // Merge the provided onSuccess with the onSave prop
      const mergedOptions = {
        ...options,
        onSuccess: () => {
          options?.onSuccess?.();
          onSave?.(form.formState);
        }
      };
      await submission.submitReview(form.formState, mergedOptions);
    };

    return {
      state: form.formState,
      templates,
      selectedTemplate: form.selectedTemplate ?? null,
      selectedTemplateId: form.selectedTemplateId,
      selectTemplate: form.selectTemplate,
      discQuestions,
      showSelfAssessment: templateLogic.showSelfAssessment,
      showDISC: templateLogic.showDISC,
      xpReward: templateLogic.xpReward,
      mode,
      isDirty: form.isDirty,
      updateField: form.updateField,
      updateResponse: form.updateResponse,
      handleArrayFieldChange: arrayFields.handleArrayFieldChange,
      addArrayField: arrayFields.addArrayField,
      resetForm: form.resetForm,
      submitReview: submit,
      isSubmitting: submission.isSubmitting,
      submissionError: submission.error,
      validation,
      onCancel,
      className,
    };
  }, [
    form,
    templates,
    discQuestions,
    templateLogic,
    submission,
    validation,
    arrayFields,
    mode,
    onSave,
    onCancel,
    className,
  ]);

  return (
    <ReviewFormContext.Provider value={contextValue}>
      {children}
    </ReviewFormContext.Provider>
  );
}
