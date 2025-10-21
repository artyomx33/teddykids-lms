import { useCallback } from 'react';

import type { ReviewFormState } from '@/lib/reviews/reviewTypes';

type ArrayField = 'goals_next' | 'development_areas' | 'achievements';

export function useArrayFieldManager(
  setFormState: React.Dispatch<React.SetStateAction<ReviewFormState>>
) {
  const handleArrayFieldChange = useCallback(
    (field: ArrayField, index: number, value: string) => {
      setFormState(prev => {
        const nextValues = [...prev[field]];

        if (value.trim()) {
          nextValues[index] = value;
        } else {
          nextValues.splice(index, 1);
        }

        return {
          ...prev,
          [field]: nextValues,
        };
      });
    },
    [setFormState]
  );

  const addArrayField = useCallback(
    (field: ArrayField) => {
      setFormState(prev => ({
        ...prev,
        [field]: [...prev[field], ''],
      }));
    },
    [setFormState]
  );

  return { handleArrayFieldChange, addArrayField };
}
