import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('../reviewCalculations', () => ({
  calculateReviewScores: vi.fn().mockReturnValue({ overallScore: 4, selfDelta: 1, discSnapshot: null }),
}));

vi.mock('../reviewValidationRules', () => ({
  validateReview: vi.fn().mockReturnValue({}),
}));

import type { ReviewFormState } from '../reviewTypes';
import { buildReviewPayload } from '../reviewTransformations';

const createState = (overrides: Partial<ReviewFormState> = {}): ReviewFormState => ({
  staff_id: 'staff-1',
  reviewer_id: 'reviewer-1',
  review_type: 'six_month',
  review_date: '2025-01-01',
  responses: {},
  summary: '',
  goals_next: [],
  development_areas: [],
  achievements: [],
  overall_score: 0,
  star_rating: 0,
  performance_level: 'meets',
  promotion_ready: false,
  salary_recommendation: 'maintain',
  signed_by_employee: false,
  signed_by_reviewer: false,
  self_assessment: {},
  disc_responses: {},
  emotional_scores: {
    empathy: 0,
    stress_tolerance: 0,
    emotional_regulation: 0,
    team_support: 0,
    conflict_resolution: 0,
  },
  xp_earned: 0,
  review_trigger_type: 'manual',
  support_suggestions: [],
  salary_suggestion_reason: '',
  future_raise_goal: '',
  discQuestions: [],
  selectedTemplate: null,
  ...overrides,
});

beforeAll(() => {
  // Polyfill localStorage for Supabase client initialization in tests
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
      clear: () => undefined,
      key: () => null,
      length: 0,
    },
    writable: true,
  });
});

describe('reviewTransformations', () => {
  it('converts empty strings to null', () => {
    const state = createState({
      staff_id: '',
      reviewer_id: '',
      summary: '',
    });

    const payload = buildReviewPayload(state);

    expect(payload.staff_id).toBeNull();
    expect(payload.reviewer_id).toBeNull();
    expect(payload.summary).toBeNull();
  });

  it('includes DISC snapshot when all questions answered', () => {
    const state = createState({
      selectedTemplate: {
        id: 'template-1',
        scoring_method: 'five_star',
        disc_injection_enabled: true,
      },
      discQuestions: [
        {
          id: 'q1',
          question_text: 'Question 1',
          options: [
            {
              text: 'Option 1',
              disc_weights: { red: 1 },
            },
          ],
          category: 'test',
          is_active: true,
        },
      ],
      disc_responses: {
        q1: 0,
      },
    });

    const payload = buildReviewPayload(state);

    expect(payload.disc_snapshot).not.toBeNull();
    expect(payload.disc_snapshot?.profile).toEqual({
      red: 100,
      yellow: 0,
      green: 0,
      blue: 0,
    });
    expect(payload.disc_questions_answered).toEqual([
      {
        question_id: 'q1',
        selected_option_index: 0,
      },
    ]);
  });

  it('omits DISC data when not all questions answered', () => {
    const state = createState({
      selectedTemplate: {
        id: 'template-1',
        disc_injection_enabled: true,
      },
      discQuestions: [
        {
          id: 'q1',
          question_text: 'Question 1',
          options: [
            {
              text: 'Option 1',
              disc_weights: { red: 1 },
            },
          ],
          category: 'test',
          is_active: true,
        },
      ],
      disc_responses: {},
    });

    const payload = buildReviewPayload(state);

    expect(payload.disc_snapshot).toBeNull();
    expect(payload.disc_questions_answered).toBeNull();
  });
});

