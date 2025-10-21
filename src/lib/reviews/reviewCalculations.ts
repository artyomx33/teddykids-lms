import { calculateAverageRating, calculateRatingDelta } from '@/lib/reviewMetrics';

import type { ReviewFormState } from './reviewTypes';

export interface ReviewScoreResult {
  overallScore: number;
  selfDelta: number;
  discSnapshot: null;
}

export function calculateReviewScores(state: ReviewFormState): ReviewScoreResult {
  const overallScore = calculateOverallScore(state);
  const selfDelta = calculateSelfVsManagerDelta(state);

  return {
    overallScore,
    selfDelta,
    discSnapshot: null,
  };
}

export function calculateOverallScore({ responses, selectedTemplate }: ReviewFormState): number {
  if (!selectedTemplate || selectedTemplate.scoring_method !== 'five_star') {
    return 0;
  }

  return calculateAverageRating(responses as Record<string, number>);
}

export function calculateSelfVsManagerDelta({ self_assessment, responses }: ReviewFormState): number {
  const selfRatings = self_assessment?.self_ratings;

  if (!selfRatings || Object.keys(selfRatings).length === 0) {
    return 0;
  }

  const managerRatings = Object.entries(responses).reduce<Record<string, number>>(
    (acc, [key, value]) => {
      if (typeof value === 'number') {
        acc[key] = value;
      }
      return acc;
    },
    {}
  );

  return calculateRatingDelta(managerRatings, selfRatings);
}

