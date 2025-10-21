import { format } from 'date-fns';
import type { ReviewFormProps } from './types';
import { ReviewFormProvider } from './context/ReviewFormProvider';
import { ReviewFormContent } from './ReviewFormContent';
import { ReviewFormErrorBoundary } from '@/components/error-boundaries/ReviewFormErrorBoundary';
import { useReviewTemplates, useDISCMiniQuestions } from '@/lib/hooks/useReviews';
import { Card, CardContent } from '@/components/ui/card';

export function ReviewForm(props: ReviewFormProps) {
  const { staffId, reviewType = 'six_month', mode = 'create' } = props;
  
  const { data: templates = [], isLoading: templatesLoading, error: templatesError } = useReviewTemplates();
  const { data: discQuestions = [], error: discError } = useDISCMiniQuestions(3);

  // Build initial state
  const initialState = {
    staff_id: staffId || '',
    reviewer_id: '',
    review_type: reviewType,
    review_date: format(new Date(), 'yyyy-MM-dd'),
    responses: {},
    summary: '',
    goals_next: [],
    development_areas: [],
    achievements: [],
    overall_score: 0,
    star_rating: 0,
    performance_level: 'meets' as const,
    promotion_ready: false,
    salary_recommendation: 'maintain' as const,
    signed_by_employee: false,
    signed_by_reviewer: false,
    self_assessment: {
      self_ratings: {},
      proud_moment: '',
      work_on: '',
      how_supported: 0
    },
    disc_responses: {},
    emotional_scores: {
      empathy: 0,
      stress_tolerance: 0,
      emotional_regulation: 0,
      team_support: 0,
      conflict_resolution: 0
    },
    xp_earned: 0,
    review_trigger_type: 'manual' as const,
    warning_level: undefined,
    behavior_score: undefined,
    impact_score: undefined,
    support_suggestions: [],
    promotion_readiness_score: undefined,
    leadership_potential_score: undefined,
    salary_suggestion_reason: '',
    future_raise_goal: '',
    adaptability_speed: undefined,
    initiative_taken: undefined,
    team_reception_score: undefined,
    template_id: props.templateId,
    selectedTemplate: null,
    discQuestions: discQuestions,
    manager_vs_self_delta: undefined,
  };

  // Add error state handling
  if (templatesError || discError) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <p className="text-red-600 mb-2">Failed to load review data</p>
            <p className="text-sm text-muted-foreground">
              {templatesError?.message || discError?.message}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (templatesLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-pulse text-muted-foreground">Loading review form...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ReviewFormErrorBoundary>
      <ReviewFormProvider 
        {...props}
        initialState={initialState}
        templates={templates}
        discQuestions={discQuestions}
      >
        <ReviewFormContent />
      </ReviewFormProvider>
    </ReviewFormErrorBoundary>
  );
}
