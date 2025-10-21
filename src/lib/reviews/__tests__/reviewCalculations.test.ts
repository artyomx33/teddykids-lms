import { beforeAll, describe, expect, it, vi } from 'vitest';

beforeAll(() => {
  const storage: Storage = {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
    clear: () => undefined,
    key: () => null,
    length: 0,
  };

  Object.defineProperty(globalThis, 'localStorage', {
    value: storage,
    configurable: true,
  });

  Object.defineProperty(globalThis, 'sessionStorage', {
    value: storage,
    configurable: true,
  });
});

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
    },
  },
}));

import type { ReviewFormState } from '../reviewTypes';
import { calculateOverallScore, calculateReviewScores, calculateSelfVsManagerDelta } from '../reviewCalculations';

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

describe('reviewCalculations', () => {
  describe('calculateOverallScore', () => {
    it('returns 0 when no template is selected', () => {
      const state = createState({
        responses: { teamwork: 4 },
      });

      expect(calculateOverallScore(state)).toBe(0);
    });

    it('returns average rating when template uses five_star scoring', () => {
      const state = createState({
        responses: { teamwork: 4, communication: 2 },
        selectedTemplate: {
          id: 'template-1',
          scoring_method: 'five_star',
        },
      });

      expect(calculateOverallScore(state)).toBe(3);
    });
  });

  describe('calculateSelfVsManagerDelta', () => {
    it('returns 0 when no self assessment ratings', () => {
      const state = createState({
        responses: { teamwork: 4 },
        self_assessment: {
          self_ratings: {},
        },
      });

      expect(calculateSelfVsManagerDelta(state)).toBe(0);
    });

    it('calculates average absolute difference between manager and self ratings', () => {
      const state = createState({
        responses: { teamwork: 4, communication: 3 },
        self_assessment: {
          self_ratings: {
            teamwork: 2,
            communication: 4,
          },
        },
      });

      expect(calculateSelfVsManagerDelta(state)).toBe(1.5);
    });
  });

  describe('calculateReviewScores', () => {
    it('returns combined overall score and self delta', () => {
      const state = createState({
        responses: { teamwork: 5, communication: 3 },
        selectedTemplate: {
          id: 'template-1',
          scoring_method: 'five_star',
        },
        self_assessment: {
          self_ratings: {
            teamwork: 4,
            communication: 2,
          },
        },
      });

      const result = calculateReviewScores(state);

      expect(result.overallScore).toBe(4);
      expect(result.selfDelta).toBe(1);
      expect(result.discSnapshot).toBeNull();
    });

    it('returns zero values when template is not five star or no self ratings', () => {
      const result = calculateReviewScores(
        createState({
          responses: { teamwork: 5 },
          selectedTemplate: {
            id: 'template-2',
            scoring_method: 'percentage',
          },
          self_assessment: {},
        })
      );

      expect(result.overallScore).toBe(0);
      expect(result.selfDelta).toBe(0);
    });
  });
});

