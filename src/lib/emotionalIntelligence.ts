/**
 * REVIEWS v1.1 - EMOTIONAL INTELLIGENCE INTEGRATION
 * Maps review data to EI profiles, team mood tracking, and wellbeing analytics
 */

import { supabase } from '@/integrations/supabase/client';
import { EMOTIONAL_INTELLIGENCE_METRICS } from './reviewMetrics';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface EmotionalIntelligenceScore {
  empathy: number;
  stress_tolerance: number;
  emotional_regulation: number;
  team_support: number;
  conflict_resolution: number;
}

export interface EmotionalIntelligenceProfile {
  staff_id: string;
  staff_name: string;
  current_scores: EmotionalIntelligenceScore;
  previous_scores?: EmotionalIntelligenceScore;
  trend: 'improving' | 'stable' | 'declining' | 'new';
  overall_ei_rating: number; // 1-5
  last_assessment_date: string;
  support_needed: boolean;
  support_level: 'low' | 'medium' | 'high';
}

export interface TeamMoodSnapshot {
  location?: string;
  department?: string;
  average_wellbeing: number; // 1-5
  average_stress_tolerance: number;
  team_support_score: number;
  total_staff: number;
  staff_needing_support: number;
  mood_trend: 'positive' | 'neutral' | 'concerning';
  last_updated: string;
}

export interface WellbeingTrend {
  staff_id: string;
  reviews: Array<{
    review_id: string;
    review_date: string;
    wellbeing_score: number;
    stress_level: number;
    support_feeling: number; // "How supported do you feel lately?" 1-5
  }>;
  trend_direction: 'improving' | 'stable' | 'declining';
  alert_level: 'none' | 'watch' | 'urgent';
}

// =====================================================
// EI SCORE EXTRACTION
// =====================================================

/**
 * Extract EI scores from review responses
 */
export function extractEIScoresFromReview(responses: Record<string, any>): Partial<EmotionalIntelligenceScore> {
  const scores: Partial<EmotionalIntelligenceScore> = {};
  
  // Map review responses to EI metrics
  if (responses.empathy !== undefined) {
    scores.empathy = Number(responses.empathy);
  }
  
  if (responses.stress_tolerance !== undefined) {
    scores.stress_tolerance = Number(responses.stress_tolerance);
  }
  
  if (responses.emotional_regulation !== undefined) {
    scores.emotional_regulation = Number(responses.emotional_regulation);
  }
  
  if (responses.team_support !== undefined) {
    scores.team_support = Number(responses.team_support);
  }
  
  if (responses.conflict_resolution !== undefined) {
    scores.conflict_resolution = Number(responses.conflict_resolution);
  }
  
  return scores;
}

/**
 * Calculate overall EI rating from individual scores
 */
export function calculateOverallEI(scores: Partial<EmotionalIntelligenceScore>): number {
  const values = Object.values(scores).filter(v => typeof v === 'number' && v > 0);
  
  if (values.length === 0) return 0;
  
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.round(average * 100) / 100; // Round to 2 decimals
}

/**
 * Get EI profile for a staff member
 */
export async function getEIProfile(staffId: string): Promise<EmotionalIntelligenceProfile | null> {
  try {
    // Get the two most recent reviews with EI scores
    const { data: reviews, error } = await supabase
      .from('staff_reviews')
      .select('id, review_date, emotional_scores, emotional_wellbeing_score, responses')
      .eq('staff_id', staffId)
      .not('emotional_scores', 'is', null)
      .order('review_date', { ascending: false })
      .limit(2);

    if (error || !reviews || reviews.length === 0) {
      console.error('[getEIProfile] Error or no data:', error);
      return null;
    }

    const currentReview = reviews[0];
    const previousReview = reviews.length > 1 ? reviews[1] : null;

    // Parse emotional scores
    const currentScores = typeof currentReview.emotional_scores === 'string'
      ? JSON.parse(currentReview.emotional_scores)
      : currentReview.emotional_scores;

    const previousScores = previousReview
      ? (typeof previousReview.emotional_scores === 'string'
          ? JSON.parse(previousReview.emotional_scores)
          : previousReview.emotional_scores)
      : undefined;

    // Calculate trends
    const currentOverall = calculateOverallEI(currentScores);
    const previousOverall = previousScores ? calculateOverallEI(previousScores) : null;

    let trend: EmotionalIntelligenceProfile['trend'] = 'new';
    if (previousOverall !== null) {
      if (currentOverall > previousOverall + 0.3) {
        trend = 'improving';
      } else if (currentOverall < previousOverall - 0.3) {
        trend = 'declining';
      } else {
        trend = 'stable';
      }
    }

    // Determine support needs
    const supportNeeded = currentOverall < 3.0 || 
                         (currentScores.stress_tolerance && currentScores.stress_tolerance < 2.5);
    
    let supportLevel: 'low' | 'medium' | 'high' = 'low';
    if (currentOverall < 2.0 || trend === 'declining') {
      supportLevel = 'high';
    } else if (currentOverall < 3.0) {
      supportLevel = 'medium';
    }

    // Get staff name
    const { data: staffData } = await supabase
      .from('staff')
      .select('full_name')
      .eq('id', staffId)
      .single();

    return {
      staff_id: staffId,
      staff_name: staffData?.full_name || 'Unknown',
      current_scores: currentScores,
      previous_scores: previousScores,
      trend,
      overall_ei_rating: currentOverall,
      last_assessment_date: currentReview.review_date,
      support_needed: supportNeeded,
      support_level: supportLevel
    };
  } catch (error) {
    console.error('[getEIProfile] Exception:', error);
    return null;
  }
}

// =====================================================
// TEAM MOOD TRACKING
// =====================================================

/**
 * Get team mood snapshot for a location/department
 */
export async function getTeamMoodSnapshot(filters?: {
  location?: string;
  department?: string;
}): Promise<TeamMoodSnapshot | null> {
  try {
    let query = supabase
      .from('staff_reviews')
      .select(`
        id,
        staff_id,
        emotional_wellbeing_score,
        emotional_scores,
        review_date,
        staff!inner(location, department)
      `)
      .not('emotional_wellbeing_score', 'is', null)
      .gte('review_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()); // Last 90 days

    if (filters?.location) {
      query = query.eq('staff.location', filters.location);
    }

    if (filters?.department) {
      query = query.eq('staff.department', filters.department);
    }

    const { data: reviews, error } = await query;

    if (error || !reviews || reviews.length === 0) {
      console.error('[getTeamMoodSnapshot] Error or no data:', error);
      return null;
    }

    // Aggregate scores
    const wellbeingScores: number[] = [];
    const stressScores: number[] = [];
    const supportScores: number[] = [];
    let staffNeedingSupport = 0;

    reviews.forEach(review => {
      if (review.emotional_wellbeing_score) {
        wellbeingScores.push(review.emotional_wellbeing_score);
        
        if (review.emotional_wellbeing_score < 3.0) {
          staffNeedingSupport++;
        }
      }

      if (review.emotional_scores) {
        const scores = typeof review.emotional_scores === 'string'
          ? JSON.parse(review.emotional_scores)
          : review.emotional_scores;

        if (scores.stress_tolerance) stressScores.push(scores.stress_tolerance);
        if (scores.team_support) supportScores.push(scores.team_support);
      }
    });

    const avgWellbeing = wellbeingScores.reduce((sum, s) => sum + s, 0) / wellbeingScores.length;
    const avgStress = stressScores.length > 0
      ? stressScores.reduce((sum, s) => sum + s, 0) / stressScores.length
      : 0;
    const avgSupport = supportScores.length > 0
      ? supportScores.reduce((sum, s) => sum + s, 0) / supportScores.length
      : 0;

    // Determine mood trend
    let moodTrend: TeamMoodSnapshot['mood_trend'] = 'neutral';
    if (avgWellbeing >= 4.0 && avgStress >= 3.5) {
      moodTrend = 'positive';
    } else if (avgWellbeing < 3.0 || avgStress < 2.5) {
      moodTrend = 'concerning';
    }

    return {
      location: filters?.location,
      department: filters?.department,
      average_wellbeing: Math.round(avgWellbeing * 100) / 100,
      average_stress_tolerance: Math.round(avgStress * 100) / 100,
      team_support_score: Math.round(avgSupport * 100) / 100,
      total_staff: new Set(reviews.map(r => r.staff_id)).size,
      staff_needing_support: staffNeedingSupport,
      mood_trend: moodTrend,
      last_updated: new Date().toISOString()
    };
  } catch (error) {
    console.error('[getTeamMoodSnapshot] Exception:', error);
    return null;
  }
}

/**
 * Get all team locations with mood data
 */
export async function getAllLocationMoods(): Promise<TeamMoodSnapshot[]> {
  try {
    const { data: locations, error } = await supabase
      .from('staff')
      .select('location')
      .not('location', 'is', null);

    if (error || !locations) {
      console.error('[getAllLocationMoods] Error:', error);
      return [];
    }

    const uniqueLocations = [...new Set(locations.map(l => l.location))];
    const moodPromises = uniqueLocations.map(location => 
      getTeamMoodSnapshot({ location: location as string })
    );

    const moods = await Promise.all(moodPromises);
    return moods.filter(mood => mood !== null) as TeamMoodSnapshot[];
  } catch (error) {
    console.error('[getAllLocationMoods] Exception:', error);
    return [];
  }
}

// =====================================================
// WELLBEING TRENDS
// =====================================================

/**
 * Get wellbeing trend for a staff member
 */
export async function getWellbeingTrend(staffId: string): Promise<WellbeingTrend | null> {
  try {
    const { data: reviews, error } = await supabase
      .from('staff_reviews')
      .select('id, review_date, emotional_wellbeing_score, emotional_scores, self_assessment')
      .eq('staff_id', staffId)
      .not('emotional_wellbeing_score', 'is', null)
      .order('review_date', { ascending: true });

    if (error || !reviews || reviews.length === 0) {
      console.error('[getWellbeingTrend] Error or no data:', error);
      return null;
    }

    // Extract data points
    const dataPoints = reviews.map(review => {
      const selfAssessment = review.self_assessment 
        ? (typeof review.self_assessment === 'string' 
            ? JSON.parse(review.self_assessment) 
            : review.self_assessment)
        : {};

      const emotionalScores = review.emotional_scores
        ? (typeof review.emotional_scores === 'string'
            ? JSON.parse(review.emotional_scores)
            : review.emotional_scores)
        : {};

      return {
        review_id: review.id,
        review_date: review.review_date,
        wellbeing_score: review.emotional_wellbeing_score || 0,
        stress_level: emotionalScores.stress_tolerance || 0,
        support_feeling: selfAssessment.how_supported || 0
      };
    });

    // Calculate trend
    let trendDirection: WellbeingTrend['trend_direction'] = 'stable';
    if (dataPoints.length >= 2) {
      const recent = dataPoints.slice(-3); // Last 3 reviews
      const older = dataPoints.slice(0, -3);

      if (older.length > 0) {
        const recentAvg = recent.reduce((sum, d) => sum + d.wellbeing_score, 0) / recent.length;
        const olderAvg = older.reduce((sum, d) => sum + d.wellbeing_score, 0) / older.length;

        if (recentAvg > olderAvg + 0.5) {
          trendDirection = 'improving';
        } else if (recentAvg < olderAvg - 0.5) {
          trendDirection = 'declining';
        }
      }
    }

    // Determine alert level
    const latestWellbeing = dataPoints[dataPoints.length - 1]?.wellbeing_score || 0;
    let alertLevel: WellbeingTrend['alert_level'] = 'none';

    if (latestWellbeing < 2.0 || trendDirection === 'declining') {
      alertLevel = 'urgent';
    } else if (latestWellbeing < 3.0) {
      alertLevel = 'watch';
    }

    return {
      staff_id: staffId,
      reviews: dataPoints,
      trend_direction: trendDirection,
      alert_level: alertLevel
    };
  } catch (error) {
    console.error('[getWellbeingTrend] Exception:', error);
    return null;
  }
}

/**
 * Get staff members needing emotional support
 */
export async function getStaffNeedingSupport(): Promise<Array<{
  staff_id: string;
  staff_name: string;
  wellbeing_score: number;
  support_level: 'medium' | 'high';
  last_review_date: string;
}>> {
  try {
    const { data: reviews, error } = await supabase
      .from('staff_reviews')
      .select(`
        id,
        staff_id,
        review_date,
        emotional_wellbeing_score,
        staff!inner(full_name)
      `)
      .not('emotional_wellbeing_score', 'is', null)
      .lt('emotional_wellbeing_score', 3.5)
      .order('review_date', { ascending: false });

    if (error || !reviews) {
      console.error('[getStaffNeedingSupport] Error:', error);
      return [];
    }

    // Get most recent review per staff member
    const staffMap = new Map();
    reviews.forEach(review => {
      if (!staffMap.has(review.staff_id)) {
        staffMap.set(review.staff_id, {
          staff_id: review.staff_id,
          staff_name: review.staff.full_name,
          wellbeing_score: review.emotional_wellbeing_score,
          support_level: review.emotional_wellbeing_score < 2.5 ? 'high' : 'medium',
          last_review_date: review.review_date
        });
      }
    });

    return Array.from(staffMap.values());
  } catch (error) {
    console.error('[getStaffNeedingSupport] Exception:', error);
    return [];
  }
}

// =====================================================
// ANALYTICS & INSIGHTS
// =====================================================

/**
 * Calculate EI improvement rate across team
 */
export async function calculateTeamEIImprovement(
  locationOrDepartment?: { location?: string; department?: string }
): Promise<{
  improving: number;
  stable: number;
  declining: number;
  average_change: number;
}> {
  try {
    let query = supabase
      .from('staff')
      .select('id');

    if (locationOrDepartment?.location) {
      query = query.eq('location', locationOrDepartment.location);
    }
    if (locationOrDepartment?.department) {
      query = query.eq('department', locationOrDepartment.department);
    }

    const { data: staff, error } = await query;

    if (error || !staff) {
      console.error('[calculateTeamEIImprovement] Error:', error);
      return { improving: 0, stable: 0, declining: 0, average_change: 0 };
    }

    const profiles = await Promise.all(
      staff.map(s => getEIProfile(s.id))
    );

    const validProfiles = profiles.filter(p => p !== null) as EmotionalIntelligenceProfile[];

    const counts = {
      improving: validProfiles.filter(p => p.trend === 'improving').length,
      stable: validProfiles.filter(p => p.trend === 'stable').length,
      declining: validProfiles.filter(p => p.trend === 'declining').length,
      average_change: 0
    };

    // Calculate average change
    const changes = validProfiles
      .filter(p => p.previous_scores)
      .map(p => {
        const current = calculateOverallEI(p.current_scores);
        const previous = calculateOverallEI(p.previous_scores!);
        return current - previous;
      });

    if (changes.length > 0) {
      counts.average_change = Math.round(
        (changes.reduce((sum, c) => sum + c, 0) / changes.length) * 100
      ) / 100;
    }

    return counts;
  } catch (error) {
    console.error('[calculateTeamEIImprovement] Exception:', error);
    return { improving: 0, stable: 0, declining: 0, average_change: 0 };
  }
}

/**
 * Format EI profile for display
 */
export function formatEIProfileForDisplay(profile: EmotionalIntelligenceProfile) {
  const trendIcon = {
    improving: '📈',
    stable: '➡️',
    declining: '📉',
    new: '🆕'
  }[profile.trend];

  const supportIcon = {
    low: '✅',
    medium: '⚠️',
    high: '🚨'
  }[profile.support_level];

  return {
    ...profile,
    trend_display: `${trendIcon} ${profile.trend}`,
    support_display: `${supportIcon} ${profile.support_level.toUpperCase()}`,
    overall_rating_display: `${profile.overall_ei_rating.toFixed(1)} / 5.0`
  };
}

