import type { EmployeeCurrentState } from '../hooks/useEmployeeCurrentState';
import type { Database } from '@/integrations/supabase/types';
import { differenceInMonths, addMonths, addYears, isPast } from 'date-fns';

// Use the correct, generated type for a staff review row
type StaffReview = Database['public']['Tables']['staff_reviews']['Row'];

/**
 * Calculates the average of the 'overall_score' from a list of reviews.
 * Returns null if there are no reviews or scores.
 */
export function calculateAverageReviewScore(reviews: StaffReview[]): number | null {
  if (!reviews || reviews.length === 0) {
    return null;
  }
  const scoredReviews = reviews.filter((r) => typeof r.overall_score === 'number');
  if (scoredReviews.length === 0) {
    return null;
  }
  const sum = scoredReviews.reduce((acc, r) => acc + r.overall_score!, 0);
  return sum / scoredReviews.length;
}

/**
 * Finds the most recent review date from a list of reviews.
 * Returns null if there are no reviews.
 */
export function getLastReviewDate(reviews: StaffReview[]): Date | null {
  if (!reviews || reviews.length === 0) {
    return null;
  }
  // Sort by date descending to find the most recent
  const sortedReviews = [...reviews].sort(
    (a, b) => new Date(b.review_date).getTime() - new Date(a.review_date).getTime(),
  );
  return new Date(sortedReviews[0].review_date);
}

/**
 * Checks if the employee has a "5-star" or "Exceptional" performance level in any review.
 */
export function hasFiveStarBadge(reviews: StaffReview[]): boolean {
  if (!reviews || reviews.length === 0) {
    return false;
  }
  return reviews.some(
    (r) => r.performance_level === '5-star' || r.performance_level === 'Exceptional',
  );
}

/**
 * Determines if a 6-month review is needed based on employment start date and last review.
 */
export function needsSixMonthReview(
  employee: EmployeeCurrentState,
  reviews: StaffReview[],
): boolean {
  if (!employee.start_date) {
    return false;
  }
  const sixMonthsFromStart = addMonths(new Date(employee.start_date), 6);
  if (!isPast(sixMonthsFromStart)) {
    // Not yet employed for 6 months
    return false;
  }

  const lastReviewDate = getLastReviewDate(reviews);
  if (!lastReviewDate) {
    // Employed > 6 months and has no reviews
    return true;
  }

  // If the last review was before the 6-month mark, they still need one
  return isPast(sixMonthsFromStart) && lastReviewDate < sixMonthsFromStart;
}

/**
 * Determines if a yearly review is needed.
 */
export function needsYearlyReview(
  employee: EmployeeCurrentState,
  reviews: StaffReview[],
): boolean {
  if (!employee.start_date) {
    return false;
  }

  const lastReviewDate = getLastReviewDate(reviews);
  const anchorDate = lastReviewDate || new Date(employee.start_date);
  const oneYearFromAnchor = addYears(anchorDate, 1);

  return isPast(oneYearFromAnchor);
}

/**
 * Calculates the next due date for a review.
 * Logic: 1 year from the last review, or 6 months from start date if no reviews yet.
 */
export function calculateNextReviewDue(
  employee: EmployeeCurrentState,
  reviews: StaffReview[],
): Date | null {
  if (!employee.start_date) {
    return null;
  }

  const lastReviewDate = getLastReviewDate(reviews);

  if (lastReviewDate) {
    return addYears(lastReviewDate, 1);
  }

  // If no reviews, the first one is due 6 months after start
  return addMonths(new Date(employee.start_date), 6);
}
