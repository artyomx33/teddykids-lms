/**
 * TALENT ACQUISITION API - LUNA-APPROVED
 * 
 * API endpoints for candidate management, trial reviews, and employes.nl export
 * 
 * Agent: Database Schema Guardian + Component Refactoring Architect
 */

import { supabase } from '@/lib/supabase';
import type {
  Candidate,
  CandidateStatus,
  CandidateDecision,
  CandidateTrialReview,
  CandidateEmployesExport,
  CandidateDashboardMetrics,
} from '@/types/talentAcquisition';

// =============================================================================
// CANDIDATE CRUD OPERATIONS
// =============================================================================

export const candidateAPI = {
  /**
   * Get all candidates with optional filters
   */
  async getCandidates(filters?: {
    status?: CandidateStatus[];
    decision?: CandidateDecision[];
    redflagsOnly?: boolean;
    dateRange?: [string, string];
    limit?: number;
    offset?: number;
  }): Promise<{ candidates: Candidate[]; total: number }> {
    let query = supabase
      .from('candidates')
      .select('*', { count: 'exact' });
    
    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }
    
    if (filters?.decision && filters.decision.length > 0) {
      query = query.in('decision', filters.decision);
    }
    
    if (filters?.redflagsOnly) {
      query = query.gte('redflag_count', 2);
    }
    
    if (filters?.dateRange) {
      query = query
        .gte('application_date', filters.dateRange[0])
        .lte('application_date', filters.dateRange[1]);
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      candidates: (data || []) as Candidate[],
      total: count || 0,
    };
  },
  
  /**
   * Get single candidate by ID
   */
  async getCandidate(id: string): Promise<Candidate | null> {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as Candidate | null;
  },
  
  /**
   * Create new candidate
   */
  async createCandidate(candidate: Omit<Candidate, 'id' | 'created_at' | 'updated_at'>): Promise<Candidate> {
    const { data, error } = await supabase
      .from('candidates')
      .insert(candidate)
      .select()
      .single();
    
    if (error) throw error;
    return data as Candidate;
  },
  
  /**
   * Update candidate
   */
  async updateCandidate(id: string, updates: Partial<Candidate>): Promise<Candidate> {
    const { data, error } = await supabase
      .from('candidates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Candidate;
  },
  
  /**
   * Update candidate status
   */
  async updateStatus(id: string, status: CandidateStatus): Promise<Candidate> {
    return this.updateCandidate(id, { status });
  },
  
  /**
   * Update candidate decision
   */
  async updateDecision(
    id: string,
    decision: CandidateDecision,
    reason?: string
  ): Promise<Candidate> {
    return this.updateCandidate(id, {
      decision,
      decision_reason: reason,
      decision_date: new Date().toISOString().split('T')[0],
    });
  },
  
  /**
   * Delete candidate
   */
  async deleteCandidate(id: string): Promise<void> {
    const { error } = await supabase
      .from('candidates')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
  
  /**
   * Get candidates with trial summaries (uses view)
   */
  async getCandidatesWithTrials(): Promise<any[]> {
    const { data, error } = await supabase
      .from('candidates_with_trials')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
  
  /**
   * Get candidates ready for export (uses view)
   */
  async getCandidatesReadyForExport(): Promise<any[]> {
    const { data, error } = await supabase
      .from('candidates_ready_for_export')
      .select('*')
      .order('decision_date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
};

// =============================================================================
// TRIAL REVIEW OPERATIONS
// =============================================================================

export const trialReviewAPI = {
  /**
   * Get all trial reviews for a candidate
   */
  async getTrialReviews(candidateId: string): Promise<CandidateTrialReview[]> {
    const { data, error } = await supabase
      .from('candidate_trial_reviews')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('trial_date', { ascending: false });
    
    if (error) throw error;
    return (data || []) as CandidateTrialReview[];
  },
  
  /**
   * Get single trial review
   */
  async getTrialReview(id: string): Promise<CandidateTrialReview | null> {
    const { data, error } = await supabase
      .from('candidate_trial_reviews')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as CandidateTrialReview | null;
  },
  
  /**
   * Get latest trial review for candidate
   */
  async getLatestTrialReview(candidateId: string): Promise<CandidateTrialReview | null> {
    const { data, error } = await supabase
      .from('candidate_trial_reviews')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('trial_date', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as CandidateTrialReview | null;
  },
  
  /**
   * Create trial review
   */
  async createTrialReview(
    review: Omit<CandidateTrialReview, 'id' | 'created_at' | 'updated_at' | 'overall_performance'>
  ): Promise<CandidateTrialReview> {
    const { data, error } = await supabase
      .from('candidate_trial_reviews')
      .insert(review)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update candidate status to trial_completed
    await candidateAPI.updateStatus(review.candidate_id, 'trial_completed');
    
    return data as CandidateTrialReview;
  },
  
  /**
   * Update trial review
   */
  async updateTrialReview(
    id: string,
    updates: Partial<CandidateTrialReview>
  ): Promise<CandidateTrialReview> {
    const { data, error } = await supabase
      .from('candidate_trial_reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as CandidateTrialReview;
  },
  
  /**
   * Delete trial review
   */
  async deleteTrialReview(id: string): Promise<void> {
    const { error } = await supabase
      .from('candidate_trial_reviews')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
  
  /**
   * Mark trial review as final
   */
  async finalizeTrialReview(id: string): Promise<CandidateTrialReview> {
    return this.updateTrialReview(id, { is_final: true });
  },
};

// =============================================================================
// EMPLOYES.NL EXPORT OPERATIONS
// =============================================================================

export const employesExportAPI = {
  /**
   * Create export record
   */
  async createExport(
    candidateId: string,
    exportData: Omit<CandidateEmployesExport, 'id' | 'created_at' | 'updated_at' | 'candidate_id'>
  ): Promise<CandidateEmployesExport> {
    const { data, error } = await supabase
      .from('candidate_employes_export')
      .insert({
        candidate_id: candidateId,
        ...exportData,
        sync_status: 'pending',
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Update candidate status
    await candidateAPI.updateCandidate(candidateId, {
      converted_to_staff: false, // Not yet converted, just exported
    });
    
    return data as CandidateEmployesExport;
  },
  
  /**
   * Get export record for candidate
   */
  async getExport(candidateId: string): Promise<CandidateEmployesExport | null> {
    const { data, error } = await supabase
      .from('candidate_employes_export')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data as CandidateEmployesExport | null;
  },
  
  /**
   * Mark as entered in employes.nl
   */
  async markAsEntered(
    exportId: string,
    employesId: string
  ): Promise<CandidateEmployesExport> {
    const { data, error } = await supabase
      .from('candidate_employes_export')
      .update({
        employes_id: employesId,
        employes_synced_at: new Date().toISOString(),
        sync_status: 'synced',
      })
      .eq('id', exportId)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update candidate with employes_id
    const exportData = data as CandidateEmployesExport;
    await candidateAPI.updateCandidate(exportData.candidate_id, {
      employes_id: employesId,
    });
    
    return exportData;
  },
  
  /**
   * Get all pending exports
   */
  async getPendingExports(): Promise<CandidateEmployesExport[]> {
    const { data, error } = await supabase
      .from('candidate_employes_export')
      .select('*')
      .eq('sync_status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []) as CandidateEmployesExport[];
  },
  
  /**
   * Get all synced exports
   */
  async getSyncedExports(): Promise<CandidateEmployesExport[]> {
    const { data, error } = await supabase
      .from('candidate_employes_export')
      .select('*')
      .eq('sync_status', 'synced')
      .order('employes_synced_at', { ascending: false });
    
    if (error) throw error;
    return (data || []) as CandidateEmployesExport[];
  },
};

// =============================================================================
// DASHBOARD METRICS
// =============================================================================

export const dashboardAPI = {
  /**
   * Get dashboard metrics (uses view)
   */
  async getMetrics(): Promise<CandidateDashboardMetrics> {
    const { data, error } = await supabase
      .from('candidate_dashboard_metrics')
      .select('*')
      .single();
    
    if (error) throw error;
    return data as CandidateDashboardMetrics;
  },
  
  /**
   * Get DISC distribution
   */
  async getDISCDistribution(): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('candidates')
      .select('primary_disc_color')
      .not('primary_disc_color', 'is', null);
    
    if (error) throw error;
    
    const distribution: Record<string, number> = {
      Red: 0,
      Blue: 0,
      Green: 0,
      Yellow: 0,
    };
    
    data?.forEach((row: any) => {
      if (row.primary_disc_color in distribution) {
        distribution[row.primary_disc_color]++;
      }
    });
    
    return distribution;
  },
  
  /**
   * Get group fit distribution
   */
  async getGroupFitDistribution(): Promise<Record<string, number>> {
    const { data, error } = await supabase
      .from('candidates')
      .select('group_fit')
      .not('group_fit', 'is', null);
    
    if (error) throw error;
    
    const distribution: Record<string, number> = {};
    
    data?.forEach((row: any) => {
      if (row.group_fit) {
        distribution[row.group_fit] = (distribution[row.group_fit] || 0) + 1;
      }
    });
    
    return distribution;
  },
  
  /**
   * Get time in stage metrics
   */
  async getTimeInStageMetrics(): Promise<Record<CandidateStatus, { avg_days: number; count: number }>> {
    // This would require a more complex query with timestamp tracking
    // For now, return placeholder
    // TODO: Implement proper time tracking when candidates move between stages
    return {
      application_received: { avg_days: 0, count: 0 },
      verified: { avg_days: 0, count: 0 },
      trial_invited: { avg_days: 0, count: 0 },
      trial_completed: { avg_days: 0, count: 0 },
      decision_finalized: { avg_days: 0, count: 0 },
      offer_signed: { avg_days: 0, count: 0 },
    };
  },
  
  /**
   * Get redflag statistics
   */
  async getRedFlagStats(): Promise<{
    total_with_redflags: number;
    avg_redflags: number;
    by_severity: Record<string, number>;
  }> {
    const { data, error } = await supabase
      .from('candidates')
      .select('redflag_count')
      .gt('redflag_count', 0);
    
    if (error) throw error;
    
    const total_with_redflags = data?.length || 0;
    const total_redflags = data?.reduce((sum: number, row: any) => sum + row.redflag_count, 0) || 0;
    const avg_redflags = total_with_redflags > 0 ? total_redflags / total_with_redflags : 0;
    
    const by_severity = {
      low: data?.filter((row: any) => row.redflag_count === 1).length || 0,
      medium: data?.filter((row: any) => row.redflag_count === 2).length || 0,
      high: data?.filter((row: any) => row.redflag_count >= 3).length || 0,
    };
    
    return {
      total_with_redflags,
      avg_redflags,
      by_severity,
    };
  },
};

// =============================================================================
// NOTES & INTERNAL COMMUNICATION
// =============================================================================

export const notesAPI = {
  /**
   * Add internal note to candidate
   */
  async addNote(
    candidateId: string,
    note: string,
    isPrivate: boolean = false
  ): Promise<Candidate> {
    const candidate = await candidateAPI.getCandidate(candidateId);
    if (!candidate) throw new Error('Candidate not found');
    
    const newNote = {
      date: new Date().toISOString(),
      author: 'Current User', // TODO: Get from auth context
      author_id: 'current_user_id', // TODO: Get from auth context
      note,
      private: isPrivate,
    };
    
    const updatedNotes = [...(candidate.internal_notes || []), newNote];
    
    return candidateAPI.updateCandidate(candidateId, {
      internal_notes: updatedNotes,
    });
  },
  
  /**
   * Add HR tag to candidate
   */
  async addTag(candidateId: string, tag: string): Promise<Candidate> {
    const candidate = await candidateAPI.getCandidate(candidateId);
    if (!candidate) throw new Error('Candidate not found');
    
    const updatedTags = [...(candidate.hr_tags || []), tag];
    
    return candidateAPI.updateCandidate(candidateId, {
      hr_tags: updatedTags,
    });
  },
  
  /**
   * Remove HR tag from candidate
   */
  async removeTag(candidateId: string, tag: string): Promise<Candidate> {
    const candidate = await candidateAPI.getCandidate(candidateId);
    if (!candidate) throw new Error('Candidate not found');
    
    const updatedTags = (candidate.hr_tags || []).filter(t => t !== tag);
    
    return candidateAPI.updateCandidate(candidateId, {
      hr_tags: updatedTags,
    });
  },
};

// =============================================================================
// EXPORT ALL APIs
// =============================================================================

export default {
  candidates: candidateAPI,
  trialReviews: trialReviewAPI,
  employesExport: employesExportAPI,
  dashboard: dashboardAPI,
  notes: notesAPI,
};

