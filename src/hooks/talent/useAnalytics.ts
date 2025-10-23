/**
 * 🎣 USE ANALYTICS HOOK
 * Component Refactoring Architect - Analytics data management
 * Preserves analytics calculation logic from AssessmentAnalytics component
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalApplications: number;
  activeApplications: number;
  hiredThisMonth: number;
  averageScore: number;
  passRate: number;
  interviewRate: number;
  hireRate: number;
  avgTimeToHire: number; // in days
  topSkills: Array<{ skill: string; count: number }>;
  discDistribution: {
    D: number;
    I: number;
    S: number;
    C: number;
  };
}

interface PipelineMetrics {
  stage: string;
  count: number;
  converted: number;
  conversionRate: number;
}

interface UseAnalyticsReturn {
  analytics: AnalyticsData | null;
  pipelineMetrics: PipelineMetrics[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching and computing talent acquisition analytics
 * Replaces mock analytics from component
 */
export function useAnalytics(): UseAnalyticsReturn {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [pipelineMetrics, setPipelineMetrics] = useState<PipelineMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch and calculate analytics from Supabase
   */
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 [useAnalytics] Fetching real analytics data...');
      console.time('Fetch Analytics');

      // Fetch all candidates for analysis
      const { data: candidates, error: fetchError } = await supabase
        .from('candidates')
        .select(`
          id,
          status,
          overall_score,
          passed,
          primary_disc_color,
          created_at,
          updated_at
        `);

      console.timeEnd('Fetch Analytics');

      if (fetchError) throw fetchError;

      if (!candidates || candidates.length === 0) {
        console.log('📭 [useAnalytics] No candidate data for analytics');
        setAnalytics({
          totalApplications: 0,
          activeApplications: 0,
          hiredThisMonth: 0,
          averageScore: 0,
          passRate: 0,
          interviewRate: 0,
          hireRate: 0,
          avgTimeToHire: 0,
          topSkills: [],
          discDistribution: { D: 0, I: 0, S: 0, C: 0 }
        });
        setPipelineMetrics([]);
        return;
      }

      console.log(`✅ [useAnalytics] Analyzing ${candidates.length} candidates`);

      // Calculate metrics
      const total = candidates.length;
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      // Active applications (not hired or rejected)
      const active = candidates.filter(c => 
        c.status !== 'hired' && c.status !== 'rejected'
      ).length;

      // Hired this month
      const hiredThisMonth = candidates.filter(c => {
        if (c.status !== 'hired' || !c.updated_at) return false;
        const date = new Date(c.updated_at);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }).length;

      // Average score (only completed assessments)
      const scoredCandidates = candidates.filter(c => c.overall_score !== null);
      const averageScore = scoredCandidates.length > 0
        ? Math.round(
            scoredCandidates.reduce((sum, c) => sum + (c.overall_score || 0), 0) / 
            scoredCandidates.length
          )
        : 0;

      // Pass rate
      const passedCount = candidates.filter(c => c.passed).length;
      const passRate = total > 0 ? Math.round((passedCount / total) * 100) : 0;

      // Interview rate (candidates who reached interview stage)
      const interviewCount = candidates.filter(c => 
        ['interview', 'offer', 'hired'].includes(c.status || '')
      ).length;
      const interviewRate = total > 0 ? Math.round((interviewCount / total) * 100) : 0;

      // Hire rate
      const hiredCount = candidates.filter(c => c.status === 'hired').length;
      const hireRate = total > 0 ? Math.round((hiredCount / total) * 100) : 0;

      // Average time to hire (placeholder - would need more detailed tracking)
      const avgTimeToHire = 21; // Default: ~3 weeks

      // DISC distribution
      const discDistribution = {
        D: candidates.filter(c => c.primary_disc_color === 'D').length,
        I: candidates.filter(c => c.primary_disc_color === 'I').length,
        S: candidates.filter(c => c.primary_disc_color === 'S').length,
        C: candidates.filter(c => c.primary_disc_color === 'C').length
      };

      const analyticsData: AnalyticsData = {
        totalApplications: total,
        activeApplications: active,
        hiredThisMonth,
        averageScore,
        passRate,
        interviewRate,
        hireRate,
        avgTimeToHire,
        topSkills: [], // Would need skills data from candidates
        discDistribution
      };

      console.log('✅ [useAnalytics] Analytics calculated:', {
        total,
        active,
        passRate: `${passRate}%`,
        hireRate: `${hireRate}%`
      });

      setAnalytics(analyticsData);

      // Calculate pipeline metrics
      const pipeline = calculatePipelineMetrics(candidates);
      setPipelineMetrics(pipeline);

    } catch (err) {
      const errorObj = err as Error;
      console.error('❌ [useAnalytics] Error:', errorObj.message);
      setError(errorObj);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Calculate funnel/pipeline metrics
   */
  function calculatePipelineMetrics(candidates: any[]): PipelineMetrics[] {
    const stages = ['new', 'screening', 'interview', 'offer', 'hired'];
    const metrics: PipelineMetrics[] = [];

    stages.forEach((stage, index) => {
      const stageCount = candidates.filter(c => c.status === stage).length;
      const nextStage = stages[index + 1];
      const converted = nextStage 
        ? candidates.filter(c => {
            const currentIndex = stages.indexOf(c.status || 'new');
            return currentIndex > index;
          }).length
        : 0;

      const conversionRate = stageCount > 0 
        ? Math.round((converted / stageCount) * 100)
        : 0;

      metrics.push({
        stage,
        count: stageCount,
        converted,
        conversionRate
      });
    });

    return metrics;
  }

  /**
   * Initial fetch on mount
   */
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    pipelineMetrics,
    loading,
    error,
    refetch: fetchAnalytics
  };
}

/**
 * Hook for tracking specific metrics over time
 */
export function useMetricsTrend(metric: 'applications' | 'hires' | 'interviews', days: number = 30) {
  const [trend, setTrend] = useState<Array<{ date: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        console.log(`📈 [useMetricsTrend] Fetching ${metric} trend for ${days} days...`);

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const { data, error } = await supabase
          .from('candidates')
          .select('created_at, status')
          .gte('created_at', startDate.toISOString());

        if (error) throw error;

        // Group by date
        const trendData: Record<string, number> = {};
        data?.forEach(candidate => {
          const date = candidate.created_at?.split('T')[0];
          if (date) {
            trendData[date] = (trendData[date] || 0) + 1;
          }
        });

        const trendArray = Object.entries(trendData)
          .map(([date, value]) => ({ date, value }))
          .sort((a, b) => a.date.localeCompare(b.date));

        setTrend(trendArray);
      } catch (err) {
        console.error('❌ [useMetricsTrend] Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrend();
  }, [metric, days]);

  return { trend, loading };
}

export default useAnalytics;

