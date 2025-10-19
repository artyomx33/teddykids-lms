import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// =============================================
// TYPE DEFINITIONS
// =============================================

export interface Review {
  id: string;
  staff_id: string;
  template_id?: string;
  reviewer_id?: string;
  review_type: 'six_month' | 'yearly' | 'performance' | 'probation' | 'exit' | 'promotion_review' | 'salary_review' | 'warning';
  review_period_start?: string;
  review_period_end?: string;
  review_date: string;
  due_date?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  responses?: Record<string, any>;
  summary?: string;
  goals_previous?: any[];
  goals_next?: any[];
  development_areas?: string[];
  achievements?: string[];
  overall_score?: number;
  score_breakdown?: Record<string, any>;
  star_rating?: number;
  performance_level?: 'exceptional' | 'exceeds' | 'meets' | 'below' | 'unsatisfactory';
  promotion_ready?: boolean;
  salary_recommendation?: 'increase' | 'maintain' | 'review' | 'decrease';
  signed_by_employee?: boolean;
  signed_by_reviewer?: boolean;
  employee_signature_date?: string;
  reviewer_signature_date?: string;
  document_path?: string;
  created_at: string;
  updated_at: string;

  // ===== v1.1 FIELDS - GAMIFICATION =====
  xp_earned?: number;
  gamification_level_achieved?: number;
  gamification_badges_unlocked?: string[]; // Array of badge IDs or names
  gamification_achievements?: any[]; // JSONB array of achievement objects
  
  // ===== v1.1 FIELDS - DISC =====
  disc_snapshot?: any; // JSONB: { profile: DISCProfile, primary_color, secondary_color, etc. }
  disc_evolution?: string; // TEXT: 'evolving' | 'stable' | 'significant_change'
  disc_questions_answered?: any[]; // JSONB array of mini-questions answered
  disc_responses?: Record<string, any>; // JSONB: responses to mini-questions
  
  // ===== v1.1 FIELDS - EMOTIONAL INTELLIGENCE =====
  emotional_scores?: any; // JSONB: { empathy, stress_tolerance, emotional_regulation, team_support, conflict_resolution }
  wellbeing_score?: number; // DECIMAL: overall EI rating 1-5
  
  // ===== v1.1 FIELDS - SELF ASSESSMENT =====
  self_assessment?: any; // JSONB: { self_ratings, proud_moment, work_on, how_supported }
  self_assessment_responses?: Record<string, any>; // JSONB: full self-assessment data
  manager_vs_self_delta?: number; // DECIMAL: calculated difference between manager and self ratings
  
  // ===== v1.1 FIELDS - REVIEW TRIGGERS =====
  review_trigger_type?: 'manual' | 'auto' | 'warning' | 'salary' | 'promotion';
  
  // ===== v1.1 FIELDS - WARNING/INTERVENTION =====
  warning_level?: number; // INT: 1, 2, or 3
  behavior_score?: number; // DECIMAL: behavior rating
  impact_score?: number; // DECIMAL: impact of behavior
  support_suggestions?: string[]; // JSONB array of support/coaching suggestions
  
  // ===== v1.1 FIELDS - PROMOTION =====
  promotion_readiness_score?: number; // DECIMAL: readiness for promotion
  leadership_potential_score?: number; // DECIMAL: leadership potential
  
  // ===== v1.1 FIELDS - SALARY =====
  salary_suggestion_reason?: string; // TEXT: why salary change suggested
  future_raise_goal?: string; // TEXT: what to achieve for next raise
  
  // ===== v1.1 FIELDS - FIRST MONTH SPECIFIC =====
  adaptability_speed?: number; // DECIMAL: how quickly they adapted
  initiative_taken?: number; // DECIMAL: initiative shown
  team_reception_score?: number; // DECIMAL: how well team received them
  
  // ===== v1.1 FIELDS - GOAL TRACKING =====
  goal_completion_rate?: number; // DECIMAL: percentage of goals completed

  // Joined data
  staff?: {
    id: string;
    full_name: string;
    department?: string;
    location?: string;
  };
  reviewer?: {
    id: string;
    full_name: string;
  };
  template?: {
    id: string;
    name: string;
    type: string;
  };
}

export interface ReviewTemplate {
  id: string;
  name: string;
  type: 'six_month' | 'yearly' | 'performance' | 'probation' | 'custom' | 'promotion_review' | 'salary_review' | 'warning';
  description?: string;
  questions: any[];
  criteria: Record<string, any>;
  scoring_method: 'five_star' | 'percentage' | 'qualitative';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // ===== v1.1 TEMPLATE SETTINGS =====
  disc_injection_enabled?: boolean; // Show DISC mini-questions?
  self_assessment_required?: boolean; // Require self-assessment section?
  xp_reward?: number; // XP awarded on completion
  badge_unlocked?: string; // Badge ID unlocked on completion
  emotional_intelligence_metrics?: string[]; // Which EI metrics to include
  gamification_metrics?: string[]; // Which gamification metrics to show
  goal_tracking_enabled?: boolean; // Enable goal tracking section?
  warning_levels_enabled?: boolean; // For warning reviews
  promotion_criteria?: any; // JSONB: criteria for promotion readiness
  salary_review_fields?: string[]; // Which fields to show in salary reviews
}

export interface ReviewSchedule {
  id: string;
  staff_id: string;
  template_id: string;
  frequency_months: number;
  next_due_date: string;
  auto_schedule: boolean;
  grace_period_days: number;
  reminder_days_before: number;
  is_active: boolean;
  last_completed_review_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateReviewData {
  staff_id: string;
  template_id?: string;
  reviewer_id?: string;
  review_type: Review['review_type'];
  review_date: string;
  due_date?: string;
  review_period_start?: string;
  review_period_end?: string;
}

export interface UpdateReviewData {
  responses?: Record<string, any>;
  summary?: string;
  goals_next?: any[];
  development_areas?: string[];
  achievements?: string[];
  overall_score?: number;
  star_rating?: number;
  performance_level?: Review['performance_level'];
  promotion_ready?: boolean;
  salary_recommendation?: Review['salary_recommendation'];
  status?: Review['status'];
  
  // ===== v1.1 UPDATE FIELDS =====
  xp_earned?: number;
  gamification_level_achieved?: number;
  gamification_badges_unlocked?: string[];
  gamification_achievements?: any[];
  disc_snapshot?: any;
  disc_evolution?: string;
  disc_questions_answered?: any[];
  disc_responses?: Record<string, any>;
  emotional_scores?: any;
  wellbeing_score?: number;
  self_assessment?: any;
  self_assessment_responses?: Record<string, any>;
  manager_vs_self_delta?: number;
  review_trigger_type?: Review['review_trigger_type'];
  warning_level?: number;
  behavior_score?: number;
  impact_score?: number;
  support_suggestions?: string[];
  promotion_readiness_score?: number;
  leadership_potential_score?: number;
  salary_suggestion_reason?: string;
  future_raise_goal?: string;
  adaptability_speed?: number;
  initiative_taken?: number;
  team_reception_score?: number;
  goal_completion_rate?: number;
}

// =============================================
// QUERY HOOKS
// =============================================

export function useReviews(params?: {
  staffId?: string;
  reviewerId?: string;
  status?: Review['status'];
  reviewType?: Review['review_type'];
  limit?: number;
}) {
  return useQuery({
    queryKey: ['reviews', params],
    queryFn: async () => {
      let query = supabase
        .from('staff_reviews')
        .select('*')
        .order('review_date', { ascending: false });

      // Apply filters
      if (params?.staffId) {
        query = query.eq('staff_id', params.staffId);
      }
      if (params?.reviewerId) {
        query = query.eq('reviewer_id', params.reviewerId);
      }
      if (params?.status) {
        query = query.eq('status', params.status);
      }
      if (params?.reviewType) {
        query = query.eq('review_type', params.reviewType);
      }
      if (params?.limit) {
        query = query.limit(params.limit);
      }

      const { data, error } = await query;
      if (error) {
        // Handle missing tables or foreign key issues gracefully
        if (error.code === 'PGRST116' || error.message?.includes('does not exist') || error.code === '42703' || error.message?.includes('foreign key')) {
          console.log('[useReviews] Review system not available, returning empty array');
          return [];
        }
        console.warn('[useReviews] Query failed:', error);
        return [];
      }
      return data as Review[];
    },
    staleTime: 30000, // 30 seconds
  });
}

export function useReview(reviewId: string) {
  return useQuery({
    queryKey: ['review', reviewId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_reviews')
        .select('*')
        .eq('id', reviewId)
        .single();

      if (error) {
        // Handle missing tables or foreign key issues gracefully
        if (error.code === 'PGRST116' || error.message?.includes('does not exist') || error.code === '42703' || error.message?.includes('foreign key')) {
          console.log('[useReview] Review system not available, returning null');
          return null;
        }
        console.warn('[useReview] Query failed:', error);
        return null;
      }
      return data as Review;
    },
    enabled: !!reviewId,
  });
}

export function useOverdueReviews() {
  return useQuery({
    queryKey: ['overdue-reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('overdue_reviews')
        .select('*')
        .order('days_overdue', { ascending: false });

      if (error) {
        // Handle missing views gracefully
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.log('[useOverdueReviews] Review views not available, returning empty array');
          return [];
        }
        throw error;
      }
      return data;
    },
    staleTime: 60000, // 1 minute
  });
}

export function useReviewCalendar(month?: string, year?: number, staffId?: string) {
  return useQuery({
    queryKey: ['review-calendar', month, year, staffId],
    queryFn: async () => {
      const monthNumber = month ? Number.parseInt(month, 10) : undefined;
      const hasWindow = Boolean(monthNumber && year);

      const windowStart = hasWindow ? new Date(year!, monthNumber! - 1, 1) : undefined;
      const windowEnd = hasWindow ? new Date(year!, monthNumber!, 0, 23, 59, 59, 999) : undefined;

      const withinWindow = (value?: string | null) => {
        if (!value) return false;
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return false;
        if (!windowStart || !windowEnd) {
          return true;
        }
        return date >= windowStart && date <= windowEnd;
      };

      const reviewFields = 'id, staff_id, review_type, status, review_date, due_date, summary';
      let reviewQuery = supabase.from('staff_reviews').select(reviewFields);
      if (staffId) {
        reviewQuery = reviewQuery.eq('staff_id', staffId);
      }

      const scheduleFields = 'id, staff_id, template_id, next_due_date, is_active';
      let scheduleQuery = supabase.from('review_schedules').select(scheduleFields);
      if (staffId) {
        scheduleQuery = scheduleQuery.eq('staff_id', staffId);
      }

      const timelinePromise = staffId
        ? supabase
            .from('employes_timeline_v2')
            .select('id, employee_id, event_type, event_title, event_description, manual_notes, event_date, contract_start_date')
            .eq('employee_id', staffId)
        : Promise.resolve({ data: [], error: null });

      const [reviewsResult, schedulesResult, timelineResult] = await Promise.all([
        reviewQuery,
        scheduleQuery,
        timelinePromise,
      ]);

      if (reviewsResult.error) throw reviewsResult.error;
      if (schedulesResult.error) throw schedulesResult.error;
      if (timelineResult.error) throw timelineResult.error;

      const reviews = (reviewsResult.data ?? []).filter((review) => {
        if (!hasWindow) return true;
        return withinWindow(review.review_date) || withinWindow(review.due_date);
      });

      const schedules = (schedulesResult.data ?? []).filter((schedule) => {
        if (!hasWindow) return true;
        return withinWindow(schedule.next_due_date);
      });

      const timelineEvents = (timelineResult.data ?? []).filter((event) => {
        if (!hasWindow) return true;
        return withinWindow(event.event_date) || withinWindow(event.contract_start_date);
      });

      const staffIds = new Set<string>();
      reviews.forEach((review: any) => review.staff_id && staffIds.add(review.staff_id));
      schedules.forEach((schedule: any) => schedule.staff_id && staffIds.add(schedule.staff_id));
      timelineEvents.forEach((timeline: any) => timeline.employee_id && staffIds.add(timeline.employee_id));

      const staffLookup: Record<string, string> = {};
      if (staffIds.size > 0) {
        const { data: staffRows, error: staffError } = await supabase
          .from('staff')
          .select('id, full_name')
          .in('id', Array.from(staffIds));

        if (!staffError && staffRows) {
          for (const row of staffRows) {
            staffLookup[row.id] = row.full_name;
          }
        }
      }

      const events: Array<{
        event_id: string;
        event_date: string;
        event_day: string;
        event_type: string;
        label: string;
        description?: string;
        metadata?: Record<string, any>;
      }> = [];

      const toDateOnly = (value?: string | null) => {
        if (!value) return null;
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return null;
        return date.toISOString().slice(0, 10);
      };

      const titleCase = (input?: string | null) => {
        if (!input) return 'Review';
        return input
          .replace(/_/g, ' ')
          .replace(/\b(\w)/g, (_, letter) => letter.toUpperCase());
      };

      for (const review of reviews as any[]) {
        const staffName = staffLookup[review.staff_id] ?? review.staff_id ?? 'Unknown Staff';
        const reviewLabel = `${titleCase(review.review_type)} • ${staffName}`;
        const reviewDate = toDateOnly(review.review_date);
        const dueDate = toDateOnly(review.due_date);
        const status = (review.status || '').toLowerCase();
        const isWarning = ['warning', 'exit'].includes((review.review_type || '').toLowerCase());
        const isCompleted = ['completed', 'approved'].includes(status);

        if (reviewDate) {
          events.push({
            event_id: `review-${review.id}-completed`,
            event_date: review.review_date,
            event_day: reviewDate,
            event_type: isWarning ? 'review_warning' : 'review_completed',
            label: reviewLabel,
            description: review.summary ?? (isCompleted ? 'Review completed' : undefined),
            metadata: {
              review_id: review.id,
              staff_id: review.staff_id,
              type: review.review_type,
            },
          });
        }

        if (dueDate && ['draft', 'scheduled', 'in_progress'].includes(status)) {
          events.push({
            event_id: `review-${review.id}-scheduled`,
            event_date: review.due_date,
            event_day: dueDate,
            event_type: 'review_scheduled',
            label: reviewLabel,
            description: review.summary ?? 'Scheduled review',
            metadata: {
              review_id: review.id,
              staff_id: review.staff_id,
              type: review.review_type,
            },
          });
        }
      }

      for (const schedule of schedules as any[]) {
        const day = toDateOnly(schedule.next_due_date);
        if (!day) continue;

        const staffName = staffLookup[schedule.staff_id] ?? schedule.staff_id ?? 'Unknown Staff';
        events.push({
          event_id: `schedule-${schedule.id}`,
          event_date: schedule.next_due_date,
          event_day: day,
          event_type: 'review_scheduled',
          label: `Scheduled Review • ${staffName}`,
          description: schedule.is_active ? 'Auto-generated review schedule' : undefined,
          metadata: {
            schedule_id: schedule.id,
            staff_id: schedule.staff_id,
          },
        });
      }

      for (const timeline of timelineEvents as any[]) {
        const day = toDateOnly(timeline.event_date) ?? toDateOnly(timeline.contract_start_date);
        if (!day) continue;

        const staffName = staffLookup[timeline.employee_id] ?? timeline.employee_id ?? 'Unknown Staff';
        const typeLabel = titleCase(timeline.event_type) || 'Contract Update';
        const label = `${typeLabel} • ${staffName}`;

        events.push({
          event_id: `timeline-${timeline.id}`,
          event_date: timeline.event_date ?? timeline.contract_start_date,
          event_day: day,
          event_type: 'contract_event',
          label,
          description: timeline.event_description || timeline.manual_notes || undefined,
          metadata: {
            timeline_event_id: timeline.id,
            staff_id: timeline.employee_id,
            timeline_event_type: timeline.event_type,
          },
        });
      }

      events.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

      return events;
    },
    staleTime: 60000, // 1 minute
  });
}

export function useStaffReviewSummary(staffId?: string) {
  return useQuery({
    queryKey: ['staff-review-summary', staffId],
    queryFn: async () => {
      let query = supabase
        .from('staff_review_summary')
        .select('*');

      if (staffId) {
        query = query.eq('staff_id', staffId);
      }

      const { data, error } = await query;
      if (error) {
        // Handle missing summary view gracefully
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.log('[useStaffReviewSummary] Review summary view not available, returning null');
          return staffId ? null : [];
        }
        throw error;
      }
      return staffId ? (data?.[0] || null) : (data || []);
    },
  });
}

export function usePerformanceTrends(staffId: string) {
  return useQuery({
    queryKey: ['performance-trends', staffId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('performance_trends')
        .select('*')
        .eq('staff_id', staffId)
        .order('review_year', { ascending: true })
        .order('review_quarter', { ascending: true });

      if (error) {
        // Handle missing performance trends view gracefully
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.log('[usePerformanceTrends] Performance trends view not available, returning empty array');
          return [];
        }
        throw error;
      }
      return data;
    },
    enabled: !!staffId,
  });
}

// =============================================
// TEMPLATE HOOKS
// =============================================

export function useReviewTemplates(activeOnly = true) {
  return useQuery({
    queryKey: ['review-templates', activeOnly],
    queryFn: async () => {
      let query = supabase
        .from('review_templates')
        .select('*')
        .order('type');

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ReviewTemplate[];
    },
  });
}

export function useReviewTemplate(templateId: string) {
  return useQuery({
    queryKey: ['review-template', templateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('review_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;
      return data as ReviewTemplate;
    },
    enabled: !!templateId,
  });
}

// =============================================
// MUTATION HOOKS
// =============================================

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewData: CreateReviewData) => {
      const { data, error } = await supabase
        .from('staff_reviews')
        .insert(reviewData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['staff-review-summary'] });
      queryClient.invalidateQueries({ queryKey: ['review-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['overdue-reviews'] });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, updates }: { reviewId: string; updates: UpdateReviewData }) => {
      const { data, error } = await supabase
        .from('staff_reviews')
        .update(updates)
        .eq('id', reviewId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate specific review and lists
      queryClient.invalidateQueries({ queryKey: ['review', data.id] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['staff-review-summary'] });
      queryClient.invalidateQueries({ queryKey: ['performance-trends', data.staff_id] });
    },
  });
}

export function useCompleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      reviewData
    }: {
      reviewId: string;
      reviewData: UpdateReviewData & { signed_by_reviewer?: boolean; signed_by_employee?: boolean; }
    }) => {
      const updates = {
        ...reviewData,
        status: 'completed' as const,
        completed_at: new Date().toISOString(),
        reviewer_signature_date: reviewData.signed_by_reviewer ? new Date().toISOString() : undefined,
      };

      const { data, error } = await supabase
        .from('staff_reviews')
        .update(updates)
        .eq('id', reviewId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Comprehensive cache invalidation
      queryClient.invalidateQueries({ queryKey: ['review', data.id] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['staff-review-summary'] });
      queryClient.invalidateQueries({ queryKey: ['overdue-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review-calendar'] });
      queryClient.invalidateQueries({ queryKey: ['performance-trends', data.staff_id] });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('staff_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
      return reviewId;
    },
    onSuccess: () => {
      // Invalidate all review-related queries
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['staff-review-summary'] });
      queryClient.invalidateQueries({ queryKey: ['overdue-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review-calendar'] });
    },
  });
}

// =============================================
// SCHEDULE HOOKS
// =============================================

export function useReviewSchedules(staffId?: string) {
  return useQuery({
    queryKey: ['review-schedules', staffId],
    queryFn: async () => {
      let query = supabase
        .from('review_schedules')
        .select('*')
        .eq('is_active', true);

      if (staffId) {
        query = query.eq('staff_id', staffId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ReviewSchedule[];
    },
  });
}

export function useCreateReviewSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (scheduleData: {
      staff_id: string;
      template_id: string;
      next_due_date: string;
      is_active?: boolean;
    }) => {
      const payload = {
        staff_id: scheduleData.staff_id,
        template_id: scheduleData.template_id,
        next_due_date: scheduleData.next_due_date,
        is_active: scheduleData.is_active ?? true,
      };

      const { data, error } = await supabase
        .from('review_schedules')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review-schedules'] });
    },
  });
}

// =============================================
// v1.1 HOOKS - GOALS
// =============================================

export function useStaffGoals(staffId: string, includeCompleted = false) {
  return useQuery({
    queryKey: ['staff-goals', staffId, includeCompleted],
    queryFn: async () => {
      let query = supabase
        .from('staff_goals')
        .select('*')
        .eq('staff_id', staffId)
        .order('created_at', { ascending: false });

      if (!includeCompleted) {
        query = query.eq('status', 'active');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!staffId,
  });
}

export function useGoalCompletionStats(staffId: string) {
  return useQuery({
    queryKey: ['goal-stats', staffId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('staff_goal_stats')
        .select('*')
        .eq('staff_id', staffId)
        .single();

      if (error) {
        // Return default stats if view doesn't exist or no data
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          return {
            total_goals: 0,
            completed_goals: 0,
            active_goals: 0,
            abandoned_goals: 0,
            completion_rate_percent: 0,
            total_xp_from_goals: 0
          };
        }
        throw error;
      }
      return data;
    },
    enabled: !!staffId,
  });
}

// =============================================
// v1.1 HOOKS - DISC
// =============================================

export function useDISCMiniQuestions(count: number = 3) {
  return useQuery({
    queryKey: ['disc-mini-questions', count],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('disc_mini_questions')
        .select('*')
        .eq('is_active', true)
        .limit(count * 3); // Get more so we can randomize

      if (error) throw error;
      
      // Shuffle and return requested count
      const shuffled = [...(data || [])].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count);
    },
  });
}

export function useDISCProfile(staffId: string) {
  return useQuery({
    queryKey: ['disc-profile', staffId],
    queryFn: async () => {
      // Try to get latest DISC from reviews first
      const { data: reviewData, error: reviewError } = await supabase
        .from('staff_reviews')
        .select('disc_snapshot, review_date')
        .eq('staff_id', staffId)
        .not('disc_snapshot', 'is', null)
        .order('review_date', { ascending: false })
        .limit(1)
        .single();

      if (!reviewError && reviewData?.disc_snapshot) {
        return {
          ...reviewData.disc_snapshot,
          source: 'review',
          date: reviewData.review_date
        };
      }

      // Fall back to talent acquisition
      const { data: talentData, error: talentError } = await supabase
        .from('applications')
        .select('disc_profile, created_at')
        .eq('staff_id', staffId)
        .not('disc_profile', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (talentError || !talentData?.disc_profile) {
        return null;
      }

      return {
        ...talentData.disc_profile,
        source: 'talent_acquisition',
        date: talentData.created_at
      };
    },
    enabled: !!staffId,
  });
}

// =============================================
// v1.1 HOOKS - EMOTIONAL INTELLIGENCE
// =============================================

export function useEIProfile(staffId: string) {
  return useQuery({
    queryKey: ['ei-profile', staffId],
    queryFn: async () => {
      // Get last 2 reviews with EI data
      const { data, error } = await supabase
        .from('staff_reviews')
        .select('emotional_scores, wellbeing_score, review_date')
        .eq('staff_id', staffId)
        .not('emotional_scores', 'is', null)
        .order('review_date', { ascending: false })
        .limit(2);

      if (error || !data || data.length === 0) {
        return null;
      }

      const current = data[0];
      const previous = data[1] || null;

      return {
        current_scores: current.emotional_scores,
        current_wellbeing: current.wellbeing_score,
        previous_scores: previous?.emotional_scores,
        previous_wellbeing: previous?.wellbeing_score,
        last_assessment: current.review_date,
        has_trend: !!previous
      };
    },
    enabled: !!staffId,
  });
}

export function useTeamMood(location?: string, department?: string) {
  return useQuery({
    queryKey: ['team-mood', location, department],
    queryFn: async () => {
      let query = supabase
        .from('staff_reviews')
        .select(`
          wellbeing_score,
          emotional_scores,
          review_date,
          staff!inner(location, department)
        `)
        .not('wellbeing_score', 'is', null)
        .gte('review_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

      if (location) {
        query = query.eq('staff.location', location);
      }
      if (department) {
        query = query.eq('staff.department', department);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Calculate aggregate
      if (!data || data.length === 0) {
        return null;
      }

      const wellbeingScores = data
        .map(r => r.wellbeing_score)
        .filter((s): s is number => s !== null && s !== undefined);

      const avgWellbeing = wellbeingScores.reduce((sum, s) => sum + s, 0) / wellbeingScores.length;
      
      return {
        location,
        department,
        average_wellbeing: Math.round(avgWellbeing * 100) / 100,
        total_reviews: data.length,
        mood_trend: avgWellbeing >= 4.0 ? 'positive' : avgWellbeing < 3.0 ? 'concerning' : 'neutral',
        last_updated: new Date().toISOString()
      };
    },
    staleTime: 300000, // 5 minutes
  });
}