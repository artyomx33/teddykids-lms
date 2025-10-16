/**
 * REVIEWS v1.1 - GOAL TRACKING SYSTEM
 * Functions for managing staff goals: create, update, complete, track completion rates
 */

import { supabase } from '@/integrations/supabase/client';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface StaffGoal {
  id: string;
  staff_id: string;
  goal_text: string;
  goal_category: 'skill_development' | 'performance' | 'leadership' | 'certification' | 'custom';
  created_in_review_id?: string;
  target_date?: string;
  completed_at?: string;
  status: 'active' | 'completed' | 'abandoned' | 'revised';
  xp_reward: number;
  completion_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface GoalCompletionStats {
  total_goals: number;
  completed_goals: number;
  active_goals: number;
  abandoned_goals: number;
  completion_rate_percent: number;
  last_goal_completed_at?: string;
  total_xp_from_goals: number;
}

// =====================================================
// GOAL CRUD OPERATIONS
// =====================================================

/**
 * Create a new goal
 */
export async function createGoal(goalData: {
  staff_id: string;
  goal_text: string;
  goal_category?: StaffGoal['goal_category'];
  created_in_review_id?: string;
  target_date?: string;
  xp_reward?: number;
}): Promise<StaffGoal | null> {
  try {
    const { data, error } = await supabase
      .from('staff_goals')
      .insert({
        staff_id: goalData.staff_id,
        goal_text: goalData.goal_text,
        goal_category: goalData.goal_category || 'custom',
        created_in_review_id: goalData.created_in_review_id,
        target_date: goalData.target_date,
        xp_reward: goalData.xp_reward || 100,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('[createGoal] Error:', error);
      return null;
    }

    return data as StaffGoal;
  } catch (error) {
    console.error('[createGoal] Exception:', error);
    return null;
  }
}

/**
 * Create multiple goals at once
 */
export async function createGoalsBatch(goals: Array<{
  staff_id: string;
  goal_text: string;
  goal_category?: StaffGoal['goal_category'];
  created_in_review_id?: string;
  target_date?: string;
  xp_reward?: number;
}>): Promise<StaffGoal[]> {
  try {
    const goalsToInsert = goals.map(goal => ({
      staff_id: goal.staff_id,
      goal_text: goal.goal_text,
      goal_category: goal.goal_category || 'custom',
      created_in_review_id: goal.created_in_review_id,
      target_date: goal.target_date,
      xp_reward: goal.xp_reward || 100,
      status: 'active' as const
    }));

    const { data, error } = await supabase
      .from('staff_goals')
      .insert(goalsToInsert)
      .select();

    if (error) {
      console.error('[createGoalsBatch] Error:', error);
      return [];
    }

    return data as StaffGoal[];
  } catch (error) {
    console.error('[createGoalsBatch] Exception:', error);
    return [];
  }
}

/**
 * Update a goal
 */
export async function updateGoal(
  goalId: string,
  updates: Partial<Pick<StaffGoal, 'goal_text' | 'target_date' | 'status' | 'completion_notes'>>
): Promise<StaffGoal | null> {
  try {
    const { data, error } = await supabase
      .from('staff_goals')
      .update(updates)
      .eq('id', goalId)
      .select()
      .single();

    if (error) {
      console.error('[updateGoal] Error:', error);
      return null;
    }

    return data as StaffGoal;
  } catch (error) {
    console.error('[updateGoal] Exception:', error);
    return null;
  }
}

/**
 * Complete a goal (awards XP)
 */
export async function completeGoal(
  goalId: string,
  completionNotes?: string
): Promise<{ goal: StaffGoal | null; xpEarned: number }> {
  try {
    // First, get the goal to check XP reward
    const { data: goal, error: fetchError } = await supabase
      .from('staff_goals')
      .select('*')
      .eq('id', goalId)
      .single();

    if (fetchError || !goal) {
      console.error('[completeGoal] Error fetching goal:', fetchError);
      return { goal: null, xpEarned: 0 };
    }

    // Update the goal to completed status
    const { data, error } = await supabase
      .from('staff_goals')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completion_notes: completionNotes
      })
      .eq('id', goalId)
      .select()
      .single();

    if (error) {
      console.error('[completeGoal] Error updating:', error);
      return { goal: null, xpEarned: 0 };
    }

    return {
      goal: data as StaffGoal,
      xpEarned: goal.xp_reward || 0
    };
  } catch (error) {
    console.error('[completeGoal] Exception:', error);
    return { goal: null, xpEarned: 0 };
  }
}

/**
 * Get goals for a staff member
 */
export async function getStaffGoals(
  staffId: string,
  options?: {
    status?: StaffGoal['status'];
    includeCompleted?: boolean;
  }
): Promise<StaffGoal[]> {
  try {
    let query = supabase
      .from('staff_goals')
      .select('*')
      .eq('staff_id', staffId)
      .order('created_at', { ascending: false });

    if (options?.status) {
      query = query.eq('status', options.status);
    } else if (!options?.includeCompleted) {
      // By default, only show active goals
      query = query.eq('status', 'active');
    }

    const { data, error } = await query;

    if (error) {
      console.error('[getStaffGoals] Error:', error);
      return [];
    }

    return data as StaffGoal[];
  } catch (error) {
    console.error('[getStaffGoals] Exception:', error);
    return [];
  }
}

/**
 * Get goals created in a specific review
 */
export async function getGoalsFromReview(reviewId: string): Promise<StaffGoal[]> {
  try {
    const { data, error } = await supabase
      .from('staff_goals')
      .select('*')
      .eq('created_in_review_id', reviewId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getGoalsFromReview] Error:', error);
      return [];
    }

    return data as StaffGoal[];
  } catch (error) {
    console.error('[getGoalsFromReview] Exception:', error);
    return [];
  }
}

// =====================================================
// GOAL COMPLETION TRACKING
// =====================================================

/**
 * Calculate goal completion rate for a staff member
 */
export async function calculateGoalCompletionRate(
  staffId: string,
  sinceDate?: Date
): Promise<number> {
  try {
    let query = supabase
      .from('staff_goals')
      .select('status')
      .eq('staff_id', staffId);

    if (sinceDate) {
      query = query.gte('created_at', sinceDate.toISOString());
    }

    const { data, error } = await query;

    if (error || !data) {
      console.error('[calculateGoalCompletionRate] Error:', error);
      return 0;
    }

    const total = data.length;
    if (total === 0) return 0;

    const completed = data.filter(goal => goal.status === 'completed').length;
    return Math.round((completed / total) * 100 * 100) / 100; // Round to 2 decimals
  } catch (error) {
    console.error('[calculateGoalCompletionRate] Exception:', error);
    return 0;
  }
}

/**
 * Get goal completion statistics
 */
export async function getGoalCompletionStats(staffId: string): Promise<GoalCompletionStats | null> {
  try {
    const { data, error } = await supabase
      .from('staff_goal_stats')
      .select('*')
      .eq('staff_id', staffId)
      .single();

    if (error) {
      console.error('[getGoalCompletionStats] Error:', error);
      return null;
    }

    return data as GoalCompletionStats;
  } catch (error) {
    console.error('[getGoalCompletionStats] Exception:', error);
    return null;
  }
}

/**
 * Get goals for previous review (to show progress)
 */
export async function getPreviousReviewGoals(
  staffId: string,
  currentReviewDate: Date
): Promise<StaffGoal[]> {
  try {
    const { data, error } = await supabase
      .from('staff_goals')
      .select('*')
      .eq('staff_id', staffId)
      .lt('created_at', currentReviewDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getPreviousReviewGoals] Error:', error);
      return [];
    }

    return data as StaffGoal[];
  } catch (error) {
    console.error('[getPreviousReviewGoals] Exception:', error);
    return [];
  }
}

// =====================================================
// MIGRATION HELPERS
// =====================================================

/**
 * Migrate goals from JSONB array to staff_goals table
 * Used for backfilling existing reviews
 */
export async function migrateReviewGoalsToTable(
  reviewId: string,
  staffId: string,
  goalsArray: string[]
): Promise<number> {
  try {
    if (!goalsArray || goalsArray.length === 0) {
      return 0;
    }

    const goalsToInsert = goalsArray.map(goalText => ({
      staff_id: staffId,
      goal_text: goalText,
      goal_category: 'custom' as const,
      created_in_review_id: reviewId,
      status: 'active' as const,
      xp_reward: 100
    }));

    const { data, error } = await supabase
      .from('staff_goals')
      .insert(goalsToInsert)
      .select();

    if (error) {
      console.error('[migrateReviewGoalsToTable] Error:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('[migrateReviewGoalsToTable] Exception:', error);
    return 0;
  }
}

/**
 * Batch migrate all review goals from JSONB to table
 */
export async function batchMigrateAllGoals(): Promise<{ success: number; failed: number }> {
  try {
    // Get all reviews with goals_next
    const { data: reviews, error } = await supabase
      .from('staff_reviews')
      .select('id, staff_id, goals_next')
      .not('goals_next', 'is', null);

    if (error || !reviews) {
      console.error('[batchMigrateAllGoals] Error fetching reviews:', error);
      return { success: 0, failed: 0 };
    }

    let successCount = 0;
    let failedCount = 0;

    for (const review of reviews) {
      try {
        const goalsArray = Array.isArray(review.goals_next) 
          ? review.goals_next 
          : JSON.parse(review.goals_next as string);

        const migrated = await migrateReviewGoalsToTable(
          review.id,
          review.staff_id,
          goalsArray
        );

        if (migrated > 0) {
          successCount += migrated;
        } else {
          failedCount++;
        }
      } catch (err) {
        console.error(`[batchMigrateAllGoals] Failed for review ${review.id}:`, err);
        failedCount++;
      }
    }

    return { success: successCount, failed: failedCount };
  } catch (error) {
    console.error('[batchMigrateAllGoals] Exception:', error);
    return { success: 0, failed: 0 };
  }
}

// =====================================================
// GOAL UTILITIES
// =====================================================

/**
 * Check if a goal is overdue
 */
export function isGoalOverdue(goal: StaffGoal): boolean {
  if (!goal.target_date || goal.status !== 'active') return false;
  return new Date(goal.target_date) < new Date();
}

/**
 * Get days until goal is due
 */
export function getDaysUntilDue(goal: StaffGoal): number | null {
  if (!goal.target_date || goal.status !== 'active') return null;
  
  const today = new Date();
  const targetDate = new Date(goal.target_date);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Get goal urgency level
 */
export function getGoalUrgency(goal: StaffGoal): 'overdue' | 'due_soon' | 'on_track' | 'no_deadline' {
  if (!goal.target_date) return 'no_deadline';
  
  const daysUntilDue = getDaysUntilDue(goal);
  
  if (daysUntilDue === null) return 'no_deadline';
  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= 7) return 'due_soon';
  return 'on_track';
}

/**
 * Format goal for display
 */
export function formatGoalForDisplay(goal: StaffGoal): {
  text: string;
  status: string;
  urgency: ReturnType<typeof getGoalUrgency>;
  daysInfo: string;
  xpReward: number;
} {
  const urgency = getGoalUrgency(goal);
  const daysUntilDue = getDaysUntilDue(goal);
  
  let daysInfo = '';
  if (goal.status === 'completed' && goal.completed_at) {
    daysInfo = `Completed ${new Date(goal.completed_at).toLocaleDateString()}`;
  } else if (daysUntilDue !== null) {
    if (daysUntilDue < 0) {
      daysInfo = `${Math.abs(daysUntilDue)} days overdue`;
    } else if (daysUntilDue === 0) {
      daysInfo = 'Due today';
    } else {
      daysInfo = `${daysUntilDue} days remaining`;
    }
  } else {
    daysInfo = 'No deadline';
  }
  
  return {
    text: goal.goal_text,
    status: goal.status,
    urgency,
    daysInfo,
    xpReward: goal.xp_reward
  };
}

