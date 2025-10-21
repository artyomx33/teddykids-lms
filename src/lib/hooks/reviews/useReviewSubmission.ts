import { useCallback, useState } from 'react';

import { useCreateReview, useCompleteReview, useUpdateReview } from '@/lib/hooks/useReviews';
import { buildReviewPayload } from '@/lib/reviews/reviewTransformations';
import { calculateReviewScores } from '@/lib/reviews/reviewCalculations';
import { validateReview } from '@/lib/reviews/reviewValidationRules';
import type { ReviewFormState } from '@/lib/reviews/reviewTypes';

interface UseReviewSubmissionOptions {
  mode: 'create' | 'edit' | 'complete';
  reviewId?: string;
}

export function useReviewSubmission({ mode, reviewId }: UseReviewSubmissionOptions) {
  const createReview = useCreateReview();
  const updateReview = useUpdateReview();
  const completeReview = useCompleteReview();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitReview = useCallback(
    async (state: ReviewFormState, options: { onSuccess?: () => void } = {}) => {
      setIsSubmitting(true);
      setError(null);

      try {
        const scores = calculateReviewScores(state);
        const validationErrors = validateReview({
          ...state,
          manager_vs_self_delta: scores.selfDelta,
        });

        if (Object.keys(validationErrors).length > 0) {
          throw new Error('Review validation failed');
        }

        const payload = buildReviewPayload({
          ...state,
          overall_score: scores.overallScore,
          manager_vs_self_delta: scores.selfDelta,
        });

        if (mode === 'create' || (mode === 'complete' && !reviewId)) {
          await createReview.mutateAsync(payload);
        } else if (mode === 'complete') {
          await completeReview.mutateAsync({
            reviewId: reviewId!,
            reviewData: {
              ...payload,
              signed_by_reviewer: true,
            },
          });
        } else {
          await updateReview.mutateAsync({
            reviewId: reviewId!,
            updates: payload,
          });
        }

        options.onSuccess?.();
      } catch (submissionError) {
        const message = submissionError instanceof Error
          ? submissionError.message
          : 'Failed to submit review';
        setError(message);
        throw submissionError;
      } finally {
        setIsSubmitting(false);
      }
    },
    [mode, reviewId, createReview, updateReview, completeReview]
  );

  return {
    submitReview,
    isSubmitting,
    error,
  };
}
