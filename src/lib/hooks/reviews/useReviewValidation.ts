import { useCallback, useMemo, useState } from 'react';

import { validateReview } from '@/lib/reviews/reviewValidationRules';
import type { ReviewFormState } from '@/lib/reviews/reviewTypes';

export function useReviewValidation(initialState: ReviewFormState) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const runValidation = useCallback((state: ReviewFormState) => {
    const nextErrors = validateReview(state);
    setErrors(nextErrors);
    return nextErrors;
  }, []);

  const validateField = useCallback(
    (field: string, state: ReviewFormState) => {
      const nextErrors = validateReview(state);
      setErrors(nextErrors);
      return nextErrors[field];
    },
    []
  );

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const resetValidation = useCallback(() => {
    setErrors(validateReview(initialState));
  }, [initialState]);

  return {
    errors,
    isValid,
    runValidation,
    validateField,
    resetValidation,
  };
}
