/**
 * Frontend Review Calculations Hook
 * 
 * Purpose: Calculate review needs on frontend instead of database
 * Replaces: needs_six_month_review, needs_yearly_review computed fields
 * 
 * Why Frontend?: 
 * - Business logic in code (easy to change!)
 * - No database overhead (no subqueries)
 * - Flexible (change periods without migrations)
 * - Testable (unit tests!)
 * 
 * Uses: staffReviewCalculations.ts for consistent date logic (date-fns based)
 */

import { useMemo } from 'react';
import { differenceInDays, addMonths, addYears } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type StaffReview = Database['public']['Tables']['staff_reviews']['Row'];

export interface StaffReviewData {
  employee_id: string;
  employee_name: string;
  contract_start_date: string;
  employment_status?: string;
  last_review_date?: string | null;
}

export interface ReviewCalculationResult extends StaffReviewData {
  needs_six_month_review: boolean;
  needs_yearly_review: boolean;
  needs_any_review: boolean;
  next_review_due: Date | null;
  days_until_review: number | null;
  is_overdue: boolean;
}

export function useReviewCalculations(staff: StaffReviewData[]) {
  return useMemo(() => {
    const now = new Date();
    
    const staffWithReviews = staff.map(s => {
      // Validate contract start date
      if (!s.contract_start_date) {
        console.warn(`Employee ${s.employee_id} missing contract_start_date - skipping review calculation`);
        return {
          ...s,
          needs_six_month_review: false,
          needs_yearly_review: false,
          needs_any_review: false,
          next_review_due: null,
          days_until_review: null,
          is_overdue: false
        };
      }
      
      const startDate = new Date(s.contract_start_date);
      const lastReviewDate = s.last_review_date ? new Date(s.last_review_date) : null;
      
      // Use date-fns for accurate calculations (no manual math!)
      const sixMonthsFromStart = addMonths(startDate, 6);
      const lastReview = lastReviewDate || startDate;
      const sixMonthsSinceReview = addMonths(lastReview, 6);
      const oneYearSinceReview = addYears(lastReview, 1);
      
      // Determine if reviews are needed (CORRECTED LOGIC!)
      const needsSixMonth = (
        now >= sixMonthsFromStart &&  // Employed 6+ months
        (!lastReviewDate || now >= sixMonthsSinceReview)  // No review OR 6 months since last
      );
      
      const needsYearly = (
        lastReviewDate && now >= oneYearSinceReview  // 1 year since last review
      );
      
      // Calculate next review due date
      let nextReviewDue: Date | null = null;
      if (lastReviewDate) {
        nextReviewDue = addYears(lastReviewDate, 1);  // Annual reviews
      } else {
        nextReviewDue = sixMonthsFromStart;  // First review at 6 months
      }
      
      // Calculate days until review
      const daysUntilReview = nextReviewDue 
        ? differenceInDays(nextReviewDue, now)
        : null;
      
      const isOverdue = daysUntilReview !== null && daysUntilReview < 0;
      
      return {
        ...s,
        needs_six_month_review: needsSixMonth,
        needs_yearly_review: needsYearly,
        needs_any_review: needsSixMonth || needsYearly,
        next_review_due: nextReviewDue,
        days_until_review: daysUntilReview,
        is_overdue: isOverdue
      };
    });
    
    // Aggregate statistics
    const needingReview = staffWithReviews.filter(s => s.needs_any_review);
    const overdue = staffWithReviews.filter(s => s.is_overdue);
    const needingSixMonth = staffWithReviews.filter(s => s.needs_six_month_review);
    const needingYearly = staffWithReviews.filter(s => s.needs_yearly_review);
    
    return {
      staffWithReviews,
      needingReview,
      overdue,
      needingSixMonth,
      needingYearly,
      stats: {
        total: staff.length,
        needingReview: needingReview.length,
        overdue: overdue.length,
        needingSixMonth: needingSixMonth.length,
        needingYearly: needingYearly.length,
      }
    };
  }, [staff]);
}

/**
 * Helper: Calculate if staff needs review based on dates
 * Can be used standalone without React
 * Uses date-fns for accurate date calculations (no manual math!)
 */
export function calculateReviewNeed(
  contractStartDate: string,
  lastReviewDate?: string | null
): {
  needsSixMonth: boolean;
  needsYearly: boolean;
} {
  const now = new Date();
  const startDate = new Date(contractStartDate);
  const sixMonthsFromStart = addMonths(startDate, 6);
  
  // Check if employed for 6+ months
  if (now < sixMonthsFromStart) {
    return { needsSixMonth: false, needsYearly: false };
  }
  
  const lastReview = lastReviewDate ? new Date(lastReviewDate) : null;
  
  // 6-month review needed if:
  // - Employed 6+ months AND no review yet
  // - OR 6 months passed since last review
  const sixMonthsSinceReview = lastReview ? addMonths(lastReview, 6) : sixMonthsFromStart;
  const needsSixMonth = !lastReview || now >= sixMonthsSinceReview;
  
  // Yearly review needed if 1 year passed since last review
  const oneYearSinceReview = lastReview ? addYears(lastReview, 1) : addYears(startDate, 1);
  const needsYearly = now >= oneYearSinceReview;
  
  return {
    needsSixMonth,
    needsYearly
  };
}

