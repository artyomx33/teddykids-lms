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
 */

import { useMemo } from 'react';

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
      const startDate = new Date(s.contract_start_date);
      const lastReviewDate = s.last_review_date ? new Date(s.last_review_date) : startDate;
      
      // Calculate time since last review or start
      const monthsSinceLastReview = Math.floor(
        (now.getTime() - lastReviewDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
      );
      
      const monthsSinceStart = Math.floor(
        (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
      );
      
      // Determine if reviews are needed
      const needsSixMonth = monthsSinceStart >= 6 && monthsSinceLastReview >= 6;
      const needsYearly = monthsSinceStart >= 12 && monthsSinceLastReview >= 12;
      
      // Calculate next review due date
      let nextReviewDue: Date | null = null;
      if (needsYearly) {
        nextReviewDue = new Date(lastReviewDate);
        nextReviewDue.setFullYear(nextReviewDue.getFullYear() + 1);
      } else if (needsSixMonth) {
        nextReviewDue = new Date(lastReviewDate);
        nextReviewDue.setMonth(nextReviewDue.getMonth() + 6);
      }
      
      // Calculate days until review
      const daysUntilReview = nextReviewDue 
        ? Math.floor((nextReviewDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
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
  const lastReview = lastReviewDate ? new Date(lastReviewDate) : startDate;
  
  const monthsSinceLastReview = Math.floor(
    (now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  );
  
  const monthsSinceStart = Math.floor(
    (now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  );
  
  return {
    needsSixMonth: monthsSinceStart >= 6 && monthsSinceLastReview >= 6,
    needsYearly: monthsSinceStart >= 12 && monthsSinceLastReview >= 12
  };
}

