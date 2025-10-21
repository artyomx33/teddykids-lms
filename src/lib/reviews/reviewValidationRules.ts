import type { ReviewFormState } from './reviewTypes';

export type ValidationErrors = Record<string, string>;

export function validateReview(state: ReviewFormState): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!state.staff_id) {
    errors.staff_id = 'Staff member is required';
  }

  if (!state.review_date) {
    errors.review_date = 'Review date is required';
  }

  if (!state.selectedTemplate) {
    errors.template_id = 'Please select a review template';
  }

  if (state.review_type === 'warning') {
    if (state.warning_level == null) {
      errors.warning_level = 'Warning level is required';
    }

    if (state.behavior_score == null) {
      errors.behavior_score = 'Behavior score is required';
    }

    if (state.impact_score == null) {
      errors.impact_score = 'Impact score is required';
    }
  }

  if (state.review_type === 'promotion_review') {
    if (state.promotion_readiness_score == null) {
      errors.promotion_readiness_score = 'Promotion readiness score is required';
    }

    if (state.leadership_potential_score == null) {
      errors.leadership_potential_score = 'Leadership potential score is required';
    }
  }

  if (state.review_type === 'salary_review') {
    if (!state.salary_suggestion_reason?.trim()) {
      errors.salary_suggestion_reason = 'Provide a reason for the salary recommendation';
    }

    if (!state.future_raise_goal?.trim()) {
      errors.future_raise_goal = 'Specify milestones for the next raise';
    }
  }

  return errors;
}

