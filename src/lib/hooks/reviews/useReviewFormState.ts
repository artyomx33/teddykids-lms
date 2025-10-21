import { useCallback, useMemo, useState } from 'react';

import type { ReviewFormState, ReviewTemplateSnapshot } from '@/lib/reviews/reviewTypes';

interface UseReviewFormStateOptions {
  initialState: ReviewFormState;
  templates: ReviewTemplateSnapshot[];
  initialTemplateId?: string;
}

export function useReviewFormState({
  initialState,
  templates,
  initialTemplateId,
}: UseReviewFormStateOptions) {
  const [formState, setFormState] = useState<ReviewFormState>(initialState);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplateId || '');
  const [isDirty, setIsDirty] = useState(false);

  const markDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

  const selectedTemplate = useMemo(() => {
    return templates.find(template => template.id === selectedTemplateId) ?? null;
  }, [templates, selectedTemplateId]);

  const selectTemplate = useCallback(
    (templateId: string) => {
      const template = templates.find(t => t.id === templateId) ?? null;
      setSelectedTemplateId(templateId);
      setFormState(prev => ({
        ...prev,
        template_id: templateId || undefined,
        selectedTemplate: template,
        review_type: template?.type || prev.review_type,
      }));
      markDirty();
    },
    [templates, markDirty]
  );

  const updateField = useCallback(<K extends keyof ReviewFormState>(field: K, value: ReviewFormState[K]) => {
    setFormState(prev => {
      if (prev[field] === value) {
        return prev;
      }

      markDirty();
      return {
        ...prev,
        [field]: value,
      };
    });
  }, [markDirty]);

  const updateResponse = useCallback((questionKey: string | number, value: unknown) => {
    setFormState(prev => {
      const nextResponses = {
        ...prev.responses,
        [questionKey]: value,
      };

      markDirty();

      return {
        ...prev,
        responses: nextResponses,
      };
    });
  }, [markDirty]);

  const resetForm = useCallback(() => {
    const template = templates.find(t => t.id === (initialTemplateId || '')) ?? null;
    setFormState({
      ...initialState,
      selectedTemplate: template,
      template_id: initialTemplateId,
    });
    setSelectedTemplateId(initialTemplateId || '');
    setIsDirty(false);
  }, [initialState, initialTemplateId, templates]);

  return {
    formState,
    setFormState,
    selectedTemplateId,
    selectTemplate,
    selectedTemplate,
    isDirty,
    markDirty,
    updateField,
    updateResponse,
    resetForm,
  };
}
