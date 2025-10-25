import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  calculateAverageReviewScore,
  getLastReviewDate,
  hasFiveStarBadge,
  needsSixMonthReview,
  needsYearlyReview,
  calculateNextReviewDue,
} from '@/lib/staffReviewCalculations';
import type { EmployeeCurrentState } from './useEmployeeCurrentState';
import type { Database } from '@/integrations/supabase/types';

// Get the correct Row type from the generated schema
type StaffReview = Database['public']['Tables']['staff_reviews']['Row'];

// It's good practice to fetch these separately for caching,
// but for the hook, we can have dedicated fetcher functions.
const fetchStaff = async () => {
  const { data, error } = await supabase.from('employes_current_state').select('*');
  if (error) throw new Error(error.message);
  return data as EmployeeCurrentState[];
};

const fetchReviews = async () => {
  const { data, error } = await supabase.from('staff_reviews').select('*');
  if (error) throw new Error(error.message);
  return data as StaffReview[];
};

export function useEnrichedStaffList() {
  const { data: staff, isLoading: isStaffLoading, error: staffError } = useQuery({
    queryKey: ['employes_current_state'],
    queryFn: fetchStaff,
  });

  const { data: reviews, isLoading: areReviewsLoading, error: reviewsError } = useQuery({
    queryKey: ['staff_reviews'],
    queryFn: fetchReviews,
  });

  const enrichedStaff = useMemo(() => {
    if (!staff || !reviews) return [];

    return staff.map((employee) => {
      const employeeReviews = reviews.filter(
        (r) => r.staff_id === employee.employee_id, // Assuming the foreign key is staff_id
      );

      return {
        ...employee,
        // Calculated review metrics
        reviews: employeeReviews,
        avg_review_score: calculateAverageReviewScore(employeeReviews),
        last_review_date: getLastReviewDate(employeeReviews),
        has_five_star_badge: hasFiveStarBadge(employeeReviews),
        needs_six_month_review: needsSixMonthReview(employee, employeeReviews),
        needs_yearly_review: needsYearlyReview(employee, employeeReviews),
        next_review_due: calculateNextReviewDue(employee, employeeReviews),
      };
    });
  }, [staff, reviews]);

  return {
    data: enrichedStaff,
    isLoading: isStaffLoading || areReviewsLoading,
    error: staffError || reviewsError,
  };
}
