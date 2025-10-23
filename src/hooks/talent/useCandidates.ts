/**
 * 🎣 USE CANDIDATES HOOK
 * Component Refactoring Architect - Custom hook extraction
 * Preserves ALL data fetching logic from TalentAcquisition component
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { CandidateDashboardView } from '@/types/assessmentEngine';
import { CandidateBusinessLogic } from '@/services/talent/candidateBusinessLogic';
import { debounce } from '@/lib/debounce';
import { logger } from '@/lib/logger';

interface UseCandidatesOptions {
  autoFetch?: boolean;
  realtime?: boolean;
  filters?: {
    status?: string;
    minScore?: number;
    passed?: boolean;
  };
}

interface UseCandidatesReturn {
  candidates: CandidateDashboardView[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  stats: {
    total: number;
    new: number;
    screening: number;
    interview: number;
    offer: number;
    hired: number;
    rejected: number;
    passed: number;
    failed: number;
  };
}

/**
 * Main hook for fetching and managing candidates
 * Replaces fetchCandidates logic from TalentAcquisition.tsx
 */
export function useCandidates(options: UseCandidatesOptions = {}): UseCandidatesReturn {
  const { autoFetch = true, realtime = true, filters } = options;

  const [candidates, setCandidates] = useState<CandidateDashboardView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFetching, setIsFetching] = useState(false); // Race condition guard

  /**
   * Fetch candidates from Supabase
   * Preserves ALL original fetch logic
   */
  const fetchCandidates = useCallback(async () => {
    // Prevent race conditions - don't fetch if already fetching
    if (isFetching) {
      logger.dev('⏸️ [useCandidates] Fetch already in progress, skipping...');
      return;
    }

    try {
      setIsFetching(true);
      setLoading(true);
      setError(null);
      
      logger.dev('🔍 [useCandidates] Fetching real candidates from Supabase...');
      logger.time('Fetch Candidates');

      // Fetch from actual candidates table
      const { data, error: fetchError } = await supabase
        .from('candidates')
        .select(`
          id,
          full_name,
          email,
          phone,
          role_applied,
          position_applied,
          status,
          decision,
          overall_score,
          ai_match_score,
          percentage_score: assessment_answers,
          passed,
          disc_profile,
          primary_disc_color,
          secondary_disc_color,
          redflag_count,
          application_date,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })
        .limit(200); // Support up to 200 employees - no pagination needed

      logger.timeEnd('Fetch Candidates');

      if (fetchError) {
        throw new Error(`Supabase fetch error: ${fetchError.message}`);
      }

      // Transform data to match CandidateDashboardView interface
      const transformedCandidates: CandidateDashboardView[] = (data || []).map(candidate => ({
        id: candidate.id,
        full_name: candidate.full_name,
        email: candidate.email,
        phone: candidate.phone || undefined,
        position_applied: candidate.position_applied || candidate.role_applied || 'Not Specified',
        role_category: 'childcare_staff', // Default category
        overall_status: candidate.status || 'new',
        overall_score: candidate.overall_score || null,
        application_date: candidate.application_date || candidate.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        assessment_status: candidate.passed ? 'completed' : 'in_progress',
        percentage_score: candidate.overall_score || null,
        passed: candidate.passed || false,
        ai_match_score: candidate.ai_match_score || null,
        application_source: 'widget'
      }));

      logger.dev(`✅ [useCandidates] Fetched ${transformedCandidates.length} real candidates`);
      
      if (transformedCandidates.length > 0) {
        logger.dev('📊 [useCandidates] Sample candidate:', {
          name: transformedCandidates[0].full_name,
          status: transformedCandidates[0].overall_status,
          score: transformedCandidates[0].overall_score
        });
      } else {
        logger.dev('📭 [useCandidates] No candidates found in database');
      }

      // Apply filters if provided
      const filteredCandidates = filters 
        ? CandidateBusinessLogic.filterCandidates(transformedCandidates, filters)
        : transformedCandidates;

      setCandidates(filteredCandidates);
      
    } catch (err) {
      const errorObj = err as Error;
      logger.error('❌ [useCandidates] Fetch error:', {
        message: errorObj.message,
        stack: errorObj.stack
      });
      setError(errorObj);
      setCandidates([]); // Clear candidates on error
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [filters, isFetching]);

  /**
   * Set up real-time subscription
   * Preserves real-time functionality with debouncing
   */
  useEffect(() => {
    if (!realtime) return;

    logger.dev('🔄 [useCandidates] Setting up real-time subscription...');

    // Debounced refetch to prevent rapid updates
    const debouncedRefetch = debounce(fetchCandidates, 500);

    const channel = supabase
      .channel('candidates-realtime-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'candidates'
      }, (payload) => {
        logger.dev('🔔 [useCandidates] Real-time update detected:', {
          event: payload.eventType,
          id: payload.new?.id || payload.old?.id
        });
        
        // Debounced refetch to prevent spam
        debouncedRefetch();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          logger.dev('✅ [useCandidates] Real-time subscription active (debounced)');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ [useCandidates] Real-time subscription failed');
        }
      });

    return () => {
      logger.dev('🔌 [useCandidates] Cleaning up real-time subscription');
      channel.unsubscribe();
    };
  }, [realtime, fetchCandidates]);

  /**
   * Initial fetch on mount
   */
  useEffect(() => {
    if (autoFetch) {
      logger.dev('🚀 [useCandidates] Auto-fetching candidates on mount');
      fetchCandidates();
    }
  }, [autoFetch, fetchCandidates]);

  /**
   * Compute statistics from candidates
   * Preserves stats calculation logic
   */
  const stats = useMemo(() => {
    const total = candidates.length;
    
    return {
      total,
      new: candidates.filter(c => c.overall_status === 'new').length,
      screening: candidates.filter(c => c.overall_status === 'screening').length,
      interview: candidates.filter(c => c.overall_status === 'interview').length,
      offer: candidates.filter(c => c.overall_status === 'offer').length,
      hired: candidates.filter(c => c.overall_status === 'hired').length,
      rejected: candidates.filter(c => c.overall_status === 'rejected').length,
      passed: candidates.filter(c => c.passed).length,
      failed: candidates.filter(c => !c.passed).length
    };
  }, [candidates]);

  return {
    candidates,
    loading,
    error,
    refetch: fetchCandidates,
    stats
  };
}

/**
 * Hook for fetching a single candidate with full details
 */
export function useCandidate(candidateId: string | null) {
  const [candidate, setCandidate] = useState<CandidateDashboardView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCandidate = useCallback(async () => {
    if (!candidateId) {
      setCandidate(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      logger.dev(`🔍 [useCandidate] Fetching candidate ${candidateId}...`);

      const { data, error: fetchError } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', candidateId)
        .single();

      if (fetchError) throw fetchError;

      logger.dev('✅ [useCandidate] Candidate fetched:', data?.full_name);
      setCandidate(data);
    } catch (err) {
      console.error('❌ [useCandidate] Error:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    fetchCandidate();
  }, [fetchCandidate]);

  return {
    candidate,
    loading,
    error,
    refetch: fetchCandidate
  };
}

export default useCandidates;

