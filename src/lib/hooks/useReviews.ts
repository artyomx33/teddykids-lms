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
  review_type: 'six_month' | 'yearly' | 'performance' | 'probation' | 'exit';
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
  type: 'six_month' | 'yearly' | 'performance' | 'probation' | 'custom';
  description?: string;
  questions: any[];
  criteria: Record<string, any>;
  scoring_method: 'five_star' | 'percentage' | 'qualitative';
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
        .select(`
          *,
          staff:staff_id(id, full_name, position),
          reviewer:reviewer_id(id, full_name),
          template:template_id(id, name, type)
        `)
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
      if (error) throw error;
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
        .select(`
          *,
          staff:staff_id(id, full_name, position, email),
          reviewer:reviewer_id(id, full_name, email),
          template:template_id(id, name, type, questions, criteria)
        `)
        .eq('id', reviewId)
        .single();

      if (error) throw error;
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

      if (error) throw error;
      return data;
    },
    staleTime: 60000, // 1 minute
  });
}

export function useReviewCalendar(month?: string, year?: number) {
  return useQuery({
    queryKey: ['review-calendar', month, year],
    queryFn: async () => {
      let query = supabase
        .from('review_calendar')
        .select('*')
        .order('due_date', { ascending: true });

      // Filter by month/year if provided
      if (month && year) {
        const startDate = `${year}-${month.padStart(2, '0')}-01`;
        const endDate = `${year}-${month.padStart(2, '0')}-31`;
        query = query.gte('due_date', startDate).lte('due_date', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
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
      if (error) throw error;
      return staffId ? data[0] : data;
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

      if (error) throw error;
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
        .select(`
          *,
          staff:staff_id(id, full_name),
          template:template_id(id, name, type)
        `)
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
    mutationFn: async (scheduleData: Omit<ReviewSchedule, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('review_schedules')
        .insert(scheduleData)
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