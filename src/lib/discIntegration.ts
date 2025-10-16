/**
 * REVIEWS v1.1 - DISC INTEGRATION
 * Functions for managing DISC profiles, mini-questions, and personality evolution tracking
 */

import { supabase } from '@/integrations/supabase/client';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface DISCProfile {
  red: number;    // Dominance
  yellow: number; // Influence
  green: number;  // Steadiness
  blue: number;   // Compliance
}

export interface DISCSnapshot {
  profile: DISCProfile;
  primary_color: 'red' | 'yellow' | 'green' | 'blue';
  secondary_color?: 'red' | 'yellow' | 'green' | 'blue';
  assessment_date: string;
  assessment_type: 'full' | 'mini' | 'review_based';
  confidence_level: 'high' | 'medium' | 'low';
}

export interface DISCEvolution {
  staff_id: string;
  staff_name: string;
  snapshots: DISCSnapshot[];
  current_profile: DISCProfile;
  evolution_detected: boolean;
  significant_changes: Array<{
    color: keyof DISCProfile;
    from: number;
    to: number;
    change: number;
    date: string;
  }>;
  last_full_assessment?: string;
  needs_reassessment: boolean;
}

export interface DISCMiniQuestion {
  id: string;
  question_text: string;
  options: Array<{
    text: string;
    disc_weights: {
      red?: number;
      yellow?: number;
      green?: number;
      blue?: number;
    };
  }>;
  category: string;
  is_active: boolean;
}

// =====================================================
// DISC MINI QUESTIONS
// =====================================================

/**
 * Get random DISC mini questions for a review
 */
export async function getRandomDISCQuestions(count: number = 3): Promise<DISCMiniQuestion[]> {
  try {
    const { data, error } = await supabase
      .from('disc_mini_questions')
      .select('*')
      .eq('is_active', true)
      .order('id'); // Random would be better, but deterministic for now

    if (error || !data) {
      console.error('[getRandomDISCQuestions] Error:', error);
      return [];
    }

    // Shuffle and take N questions
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count) as DISCMiniQuestion[];
  } catch (error) {
    console.error('[getRandomDISCQuestions] Exception:', error);
    return [];
  }
}

/**
 * Calculate DISC profile from mini-question responses
 */
export function calculateDISCFromMiniQuestions(
  responses: Array<{
    question_id: string;
    selected_option_index: number;
    question: DISCMiniQuestion;
  }>
): DISCProfile {
  const profile: DISCProfile = {
    red: 0,
    yellow: 0,
    green: 0,
    blue: 0
  };

  responses.forEach(response => {
    const option = response.question.options[response.selected_option_index];
    if (!option) return;

    const weights = option.disc_weights;
    
    profile.red += weights.red || 0;
    profile.yellow += weights.yellow || 0;
    profile.green += weights.green || 0;
    profile.blue += weights.blue || 0;
  });

  // Normalize to percentages
  const total = profile.red + profile.yellow + profile.green + profile.blue;
  if (total > 0) {
    profile.red = Math.round((profile.red / total) * 100);
    profile.yellow = Math.round((profile.yellow / total) * 100);
    profile.green = Math.round((profile.green / total) * 100);
    profile.blue = Math.round((profile.blue / total) * 100);
  }

  return profile;
}

// =====================================================
// DISC PROFILE MANAGEMENT
// =====================================================

/**
 * Get staff member's current DISC profile
 */
export async function getCurrentDISCProfile(staffId: string): Promise<DISCSnapshot | null> {
  try {
    // Try to get from talent acquisition first (full assessment)
    const { data: talentData, error: talentError } = await supabase
      .from('applications')
      .select('disc_profile, created_at')
      .eq('staff_id', staffId)
      .not('disc_profile', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!talentError && talentData?.disc_profile) {
      const profile = typeof talentData.disc_profile === 'string'
        ? JSON.parse(talentData.disc_profile)
        : talentData.disc_profile;

      return {
        profile,
        primary_color: getPrimaryColor(profile),
        secondary_color: getSecondaryColor(profile),
        assessment_date: talentData.created_at,
        assessment_type: 'full',
        confidence_level: 'high'
      };
    }

    // Fall back to most recent review with DISC snapshot
    const { data: reviewData, error: reviewError } = await supabase
      .from('staff_reviews')
      .select('disc_snapshot, review_date')
      .eq('staff_id', staffId)
      .not('disc_snapshot', 'is', null)
      .order('review_date', { ascending: false })
      .limit(1)
      .single();

    if (reviewError || !reviewData?.disc_snapshot) {
      return null;
    }

    const snapshot = typeof reviewData.disc_snapshot === 'string'
      ? JSON.parse(reviewData.disc_snapshot)
      : reviewData.disc_snapshot;

    return {
      profile: snapshot.profile || snapshot,
      primary_color: getPrimaryColor(snapshot.profile || snapshot),
      secondary_color: getSecondaryColor(snapshot.profile || snapshot),
      assessment_date: reviewData.review_date,
      assessment_type: snapshot.assessment_type || 'review_based',
      confidence_level: snapshot.confidence_level || 'medium'
    };
  } catch (error) {
    console.error('[getCurrentDISCProfile] Exception:', error);
    return null;
  }
}

/**
 * Get DISC evolution for a staff member
 */
export async function getDISCEvolution(staffId: string): Promise<DISCEvolution | null> {
  try {
    // Get all reviews with DISC snapshots
    const { data: reviews, error } = await supabase
      .from('staff_reviews')
      .select('disc_snapshot, review_date')
      .eq('staff_id', staffId)
      .not('disc_snapshot', 'is', null)
      .order('review_date', { ascending: true });

    if (error || !reviews || reviews.length === 0) {
      console.error('[getDISCEvolution] Error or no data:', error);
      return null;
    }

    // Parse snapshots
    const snapshots: DISCSnapshot[] = reviews.map(review => {
      const snapshot = typeof review.disc_snapshot === 'string'
        ? JSON.parse(review.disc_snapshot)
        : review.disc_snapshot;

      const profile = snapshot.profile || snapshot;

      return {
        profile,
        primary_color: getPrimaryColor(profile),
        secondary_color: getSecondaryColor(profile),
        assessment_date: review.review_date,
        assessment_type: snapshot.assessment_type || 'review_based',
        confidence_level: snapshot.confidence_level || 'medium'
      };
    });

    // Detect significant changes
    const significantChanges: DISCEvolution['significant_changes'] = [];
    
    for (let i = 1; i < snapshots.length; i++) {
      const prev = snapshots[i - 1].profile;
      const curr = snapshots[i].profile;

      Object.keys(curr).forEach(color => {
        const key = color as keyof DISCProfile;
        const change = curr[key] - prev[key];
        
        if (Math.abs(change) >= 15) { // 15% threshold
          significantChanges.push({
            color: key,
            from: prev[key],
            to: curr[key],
            change,
            date: snapshots[i].assessment_date
          });
        }
      });
    }

    // Get staff name
    const { data: staffData } = await supabase
      .from('staff')
      .select('full_name')
      .eq('id', staffId)
      .single();

    // Check if reassessment needed (>1 year since last full assessment)
    const lastFullAssessment = snapshots
      .filter(s => s.assessment_type === 'full')
      .sort((a, b) => new Date(b.assessment_date).getTime() - new Date(a.assessment_date).getTime())[0];

    const needsReassessment = !lastFullAssessment || 
      (new Date().getTime() - new Date(lastFullAssessment.assessment_date).getTime()) > 365 * 24 * 60 * 60 * 1000;

    return {
      staff_id: staffId,
      staff_name: staffData?.full_name || 'Unknown',
      snapshots,
      current_profile: snapshots[snapshots.length - 1].profile,
      evolution_detected: significantChanges.length > 0,
      significant_changes: significantChanges,
      last_full_assessment: lastFullAssessment?.assessment_date,
      needs_reassessment: needsReassessment
    };
  } catch (error) {
    console.error('[getDISCEvolution] Exception:', error);
    return null;
  }
}

/**
 * Save DISC snapshot to review
 */
export async function saveDISCSnapshotToReview(
  reviewId: string,
  snapshot: DISCSnapshot
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('staff_reviews')
      .update({
        disc_snapshot: JSON.stringify(snapshot),
        disc_evolution: snapshot.primary_color !== snapshot.secondary_color ? 'evolving' : 'stable'
      })
      .eq('id', reviewId);

    if (error) {
      console.error('[saveDISCSnapshotToReview] Error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[saveDISCSnapshotToReview] Exception:', error);
    return false;
  }
}

// =====================================================
// DISC ANALYSIS
// =====================================================

/**
 * Get primary DISC color
 */
export function getPrimaryColor(profile: DISCProfile): 'red' | 'yellow' | 'green' | 'blue' {
  const colors = Object.entries(profile) as [keyof DISCProfile, number][];
  colors.sort((a, b) => b[1] - a[1]);
  return colors[0][0];
}

/**
 * Get secondary DISC color
 */
export function getSecondaryColor(profile: DISCProfile): 'red' | 'yellow' | 'green' | 'blue' | undefined {
  const colors = Object.entries(profile) as [keyof DISCProfile, number][];
  colors.sort((a, b) => b[1] - a[1]);
  
  // Only return secondary if it's significant (>20%)
  return colors[1][1] >= 20 ? colors[1][0] : undefined;
}

/**
 * Get DISC color description
 */
export function getDISCColorDescription(color: keyof DISCProfile): {
  name: string;
  traits: string[];
  strengths: string[];
  challenges: string[];
} {
  const descriptions = {
    red: {
      name: 'Dominance (Red)',
      traits: ['Direct', 'Results-oriented', 'Decisive', 'Problem-solver'],
      strengths: ['Takes charge', 'Makes quick decisions', 'Drives results', 'Accepts challenges'],
      challenges: ['May be impatient', 'Can be blunt', 'May overlook details', 'Can be confrontational']
    },
    yellow: {
      name: 'Influence (Yellow)',
      traits: ['Enthusiastic', 'Optimistic', 'Persuasive', 'Energetic'],
      strengths: ['Builds relationships', 'Motivates others', 'Creative thinker', 'Great communicator'],
      challenges: ['May be impulsive', 'Can be disorganized', 'May talk too much', 'Can avoid conflict']
    },
    green: {
      name: 'Steadiness (Green)',
      traits: ['Patient', 'Reliable', 'Calm', 'Supportive'],
      strengths: ['Great listener', 'Team player', 'Consistent', 'Loyal'],
      challenges: ['May resist change', 'Can be indecisive', 'May avoid conflict', 'Can be overly accommodating']
    },
    blue: {
      name: 'Compliance (Blue)',
      traits: ['Analytical', 'Systematic', 'Precise', 'Quality-focused'],
      strengths: ['Detail-oriented', 'Follows procedures', 'High standards', 'Logical thinker'],
      challenges: ['May be perfectionistic', 'Can be critical', 'May overanalyze', 'Can be reserved']
    }
  };

  return descriptions[color];
}

/**
 * Format DISC profile for display
 */
export function formatDISCProfileForDisplay(snapshot: DISCSnapshot): {
  displayText: string;
  colors: Array<{ name: string; percentage: number; color: string }>;
  badge: string;
  description: string;
} {
  const { profile, primary_color, secondary_color } = snapshot;
  
  const colorNames = {
    red: 'Red',
    yellow: 'Yellow',
    green: 'Green',
    blue: 'Blue'
  };

  const displayText = secondary_color
    ? `${colorNames[primary_color]}-${colorNames[secondary_color]}`
    : colorNames[primary_color];

  const badge = secondary_color
    ? `${primary_color.toUpperCase()[0]}${secondary_color.toUpperCase()[0]}`
    : primary_color.toUpperCase()[0];

  const primaryDesc = getDISCColorDescription(primary_color);
  const description = `Primary: ${primaryDesc.name} - ${primaryDesc.traits.join(', ')}`;

  const colors = [
    { name: 'Red', percentage: profile.red, color: '#ef4444' },
    { name: 'Yellow', percentage: profile.yellow, color: '#eab308' },
    { name: 'Green', percentage: profile.green, color: '#22c55e' },
    { name: 'Blue', percentage: profile.blue, color: '#3b82f6' }
  ].sort((a, b) => b.percentage - a.percentage);

  return {
    displayText,
    colors,
    badge,
    description
  };
}

/**
 * Check if DISC profile needs update
 */
export function shouldUpdateDISCProfile(lastAssessmentDate: string, type: 'full' | 'mini' | 'review_based'): boolean {
  const lastDate = new Date(lastAssessmentDate);
  const now = new Date();
  const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  // Full assessments valid for 1 year
  if (type === 'full') {
    return daysSince > 365;
  }

  // Mini assessments valid for 6 months
  if (type === 'mini') {
    return daysSince > 180;
  }

  // Review-based assessments should be updated every review
  return true;
}

/**
 * Get DISC-based coaching suggestions
 */
export function getDISCCoachingSuggestions(snapshot: DISCSnapshot): string[] {
  const suggestions: string[] = [];
  const { profile, primary_color } = snapshot;

  // High Red suggestions
  if (profile.red >= 40) {
    suggestions.push('Consider slowing down to gather team input before making decisions');
    suggestions.push('Practice active listening and patience with slower-paced colleagues');
  }

  // High Yellow suggestions
  if (profile.yellow >= 40) {
    suggestions.push('Focus on following through on commitments and deadlines');
    suggestions.push('Balance enthusiasm with attention to detail');
  }

  // High Green suggestions
  if (profile.green >= 40) {
    suggestions.push('Practice assertiveness and sharing opinions even when they differ');
    suggestions.push('Embrace change as an opportunity for growth');
  }

  // High Blue suggestions
  if (profile.blue >= 40) {
    suggestions.push('Balance perfectionism with pragmatism and deadlines');
    suggestions.push('Practice flexibility when perfect information isn't available');
  }

  // Low scores (< 15) also warrant suggestions
  if (profile.red < 15) {
    suggestions.push('Consider developing assertiveness and decision-making confidence');
  }
  if (profile.yellow < 15) {
    suggestions.push('Look for opportunities to build social connections with team');
  }
  if (profile.green < 15) {
    suggestions.push('Practice patience and allow time for relationship building');
  }
  if (profile.blue < 15) {
    suggestions.push('Pay attention to details and quality standards');
  }

  return suggestions;
}

/**
 * Calculate DISC compatibility between two profiles
 */
export function calculateDISCCompatibility(
  profile1: DISCProfile,
  profile2: DISCProfile
): {
  score: number; // 0-100
  level: 'high' | 'medium' | 'low';
  insights: string[];
} {
  // Calculate similarity score
  const redDiff = Math.abs(profile1.red - profile2.red);
  const yellowDiff = Math.abs(profile1.yellow - profile2.yellow);
  const greenDiff = Math.abs(profile1.green - profile2.green);
  const blueDiff = Math.abs(profile1.blue - profile2.blue);

  const avgDiff = (redDiff + yellowDiff + greenDiff + blueDiff) / 4;
  const score = Math.round(100 - avgDiff);

  let level: 'high' | 'medium' | 'low' = 'medium';
  if (score >= 70) level = 'high';
  else if (score < 50) level = 'low';

  const insights: string[] = [];

  // Generate insights
  if (redDiff > 30) {
    insights.push('Significant difference in decision-making pace - may need communication adjustments');
  }
  if (yellowDiff > 30) {
    insights.push('Different social energy levels - respect each other\'s interaction preferences');
  }
  if (greenDiff > 30) {
    insights.push('Different change tolerance - one may need more time to adapt');
  }
  if (blueDiff > 30) {
    insights.push('Different detail orientation - clarify expectations on precision');
  }

  if (insights.length === 0) {
    insights.push('Well-matched profiles - should collaborate smoothly');
  }

  return { score, level, insights };
}

