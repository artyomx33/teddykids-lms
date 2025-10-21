import type { ReviewFormState, ReviewPayload } from './reviewTypes';

const DISC_COLORS = ['red', 'yellow', 'green', 'blue'] as const;

export function buildReviewPayload(state: ReviewFormState): ReviewPayload {
  const {
    staff_id,
    reviewer_id,
    review_type,
    review_date,
    responses,
    summary,
    goals_next,
    development_areas,
    achievements,
    overall_score,
    star_rating,
    performance_level,
    promotion_ready,
    salary_recommendation,
    signed_by_employee,
    signed_by_reviewer,
    self_assessment,
    disc_responses,
    xp_earned,
    warning_level,
    behavior_score,
    impact_score,
    support_suggestions,
    promotion_readiness_score,
    leadership_potential_score,
    salary_suggestion_reason,
    future_raise_goal,
    adaptability_speed,
    initiative_taken,
    team_reception_score,
    selectedTemplate,
    discQuestions,
  } = state;

  const payload: ReviewPayload = {
    staff_id: staff_id || null,
    reviewer_id: reviewer_id || null,
    review_type,
    review_date,
    responses,
    summary: summary?.trim() || null,
    goals_next: goals_next?.length ? goals_next : null,
    development_areas: development_areas?.length ? development_areas : null,
    achievements: achievements?.length ? achievements : null,
    overall_score: overall_score || null,
    star_rating: star_rating > 0 ? star_rating : null,
    performance_level: performance_level || null,
    promotion_ready: promotion_ready ?? null,
    salary_recommendation: salary_recommendation || null,
    signed_by_employee: signed_by_employee ?? null,
    signed_by_reviewer: signed_by_reviewer ?? null,
    template_id: selectedTemplate?.id || null,
    self_assessment: self_assessment || null,
    manager_vs_self_delta: null,
    disc_snapshot: null,
    disc_questions_answered: null,
    xp_earned: xp_earned || null,
    wellbeing_score: self_assessment?.how_supported || null,
    warning_level: warning_level ?? null,
    behavior_score: behavior_score ?? null,
    impact_score: impact_score ?? null,
    support_suggestions: support_suggestions?.length ? support_suggestions : null,
    promotion_readiness_score: promotion_readiness_score ?? null,
    leadership_potential_score: leadership_potential_score ?? null,
    salary_suggestion_reason: salary_suggestion_reason?.trim() || null,
    future_raise_goal: future_raise_goal?.trim() || null,
    adaptability_speed: adaptability_speed ?? null,
    initiative_taken: initiative_taken ?? null,
    team_reception_score: team_reception_score ?? null,
  };

  if (selectedTemplate?.disc_injection_enabled !== false && discQuestions.length > 0) {
    const answeredAll = discQuestions.every(question => disc_responses[question.id] !== undefined);

    if (answeredAll) {
      const answers = discQuestions.map(question => ({
        question_id: question.id,
        selected_option_index: disc_responses[question.id],
      }));

      const profile: Record<(typeof DISC_COLORS)[number], number> = {
        red: 0,
        yellow: 0,
        green: 0,
        blue: 0,
      };

      answers.forEach(answer => {
        const question = discQuestions.find(q => q.id === answer.question_id);
        if (!question) return;

        const option = question.options[answer.selected_option_index];
        if (!option) return;

        DISC_COLORS.forEach(color => {
          const weight = option.disc_weights?.[color];
          if (typeof weight === 'number') {
            profile[color] += weight;
          }
        });
      });

      const total = DISC_COLORS.reduce((sum, color) => sum + profile[color], 0);
      if (total > 0) {
        DISC_COLORS.forEach(color => {
          profile[color] = Math.round((profile[color] / total) * 100);
        });
      }

      const [primary] = [...DISC_COLORS].sort((a, b) => profile[b] - profile[a]);

      payload.disc_snapshot = {
        profile,
        primary_color: primary,
        assessment_date: new Date().toISOString(),
        assessment_type: 'mini',
        confidence_level: 'medium',
      };

      payload.disc_questions_answered = answers;
    }
  }

  return payload;
}

