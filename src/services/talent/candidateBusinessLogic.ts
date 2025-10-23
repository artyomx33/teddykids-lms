/**
 * 🧠 CANDIDATE BUSINESS LOGIC
 * Component Refactoring Architect - Business rules extraction
 * Preserves ALL business logic from TalentAcquisition component
 */

import type { CandidateDashboardView } from '@/types/assessmentEngine';

/**
 * Valid status transitions for candidates
 * Preserves original business rules from component
 */
export const VALID_STATUS_TRANSITIONS = {
  new: ['screening', 'rejected'],
  screening: ['interview', 'rejected'],
  interview: ['offer', 'rejected'],
  offer: ['hired', 'rejected'],
  hired: [],
  rejected: []
} as const;

/**
 * Status display configuration
 * Maps database statuses to UI display
 */
export const STATUS_CONFIG = {
  new: {
    label: 'New Application',
    color: 'blue',
    icon: 'UserPlus',
    description: 'Newly submitted application'
  },
  screening: {
    label: 'Under Review',
    color: 'yellow',
    icon: 'Clock',
    description: 'Application being reviewed'
  },
  interview: {
    label: 'Interview',
    color: 'purple',
    icon: 'MessageSquare',
    description: 'Scheduled for interview'
  },
  offer: {
    label: 'Offer Extended',
    color: 'green',
    icon: 'CheckCircle',
    description: 'Job offer sent'
  },
  hired: {
    label: 'Hired',
    color: 'emerald',
    icon: 'Award',
    description: 'Successfully hired'
  },
  rejected: {
    label: 'Not Selected',
    color: 'red',
    icon: 'XCircle',
    description: 'Application rejected'
  }
} as const;

/**
 * DISC profile color meanings
 * Preserves DISC assessment business logic
 */
export const DISC_PROFILES = {
  D: {
    name: 'Dominance',
    color: 'red',
    traits: ['Decisive', 'Results-oriented', 'Bold'],
    childcareStrength: 'Strong leadership in group activities'
  },
  I: {
    name: 'Influence',
    color: 'yellow',
    traits: ['Enthusiastic', 'Social', 'Optimistic'],
    childcareStrength: 'Excellent at engaging children and building relationships'
  },
  S: {
    name: 'Steadiness',
    color: 'green',
    traits: ['Patient', 'Supportive', 'Calm'],
    childcareStrength: 'Creates stable, nurturing environment'
  },
  C: {
    name: 'Conscientiousness',
    color: 'blue',
    traits: ['Analytical', 'Detail-oriented', 'Systematic'],
    childcareStrength: 'Maintains high safety and quality standards'
  }
} as const;

/**
 * Assessment scoring thresholds
 * Preserves original scoring business rules
 */
export const ASSESSMENT_THRESHOLDS = {
  excellent: 90,
  good: 75,
  pass: 60,
  fail: 59
} as const;

/**
 * AI match score interpretation
 * Maps scores to hiring recommendations
 */
export const AI_MATCH_LEVELS = {
  exceptional: { min: 95, label: 'Exceptional Match', action: 'Fast-track' },
  excellent: { min: 85, label: 'Excellent Match', action: 'High Priority' },
  good: { min: 70, label: 'Good Match', action: 'Consider' },
  fair: { min: 60, label: 'Fair Match', action: 'Review Carefully' },
  poor: { min: 0, label: 'Poor Match', action: 'Reconsider' }
} as const;

/**
 * Candidate Business Logic Class
 * All business rules preserved from original component
 */
export class CandidateBusinessLogic {
  /**
   * Validate status transition
   * Prevents invalid status changes
   */
  static validateStatusTransition(
    currentStatus: string,
    newStatus: string
  ): boolean {
    const validTransitions = VALID_STATUS_TRANSITIONS[currentStatus as keyof typeof VALID_STATUS_TRANSITIONS];
    return validTransitions?.includes(newStatus as any) ?? false;
  }

  /**
   * Calculate overall candidate score
   * Combines assessment, AI match, and cultural fit
   */
  static calculateOverallScore(candidate: {
    percentage_score?: number | null;
    ai_match_score?: number | null;
    cultural_fit_score?: number;
  }): number {
    const assessmentScore = candidate.percentage_score || 0;
    const aiScore = candidate.ai_match_score || 0;
    const culturalScore = candidate.cultural_fit_score || 0;

    // Weighted average: 40% assessment, 40% AI, 20% cultural
    const weighted = (assessmentScore * 0.4) + (aiScore * 0.4) + (culturalScore * 0.2);
    
    return Math.round(weighted);
  }

  /**
   * Determine hiring recommendation
   * Based on overall score and specific criteria
   */
  static determineHiringRecommendation(
    overallScore: number,
    passed: boolean,
    redFlagCount: number = 0
  ): 'hire' | 'maybe' | 'no_hire' {
    // Red flags automatically disqualify
    if (redFlagCount > 0) return 'no_hire';
    
    // Must pass assessment
    if (!passed) return 'no_hire';
    
    // Score-based recommendation
    if (overallScore >= ASSESSMENT_THRESHOLDS.excellent) return 'hire';
    if (overallScore >= ASSESSMENT_THRESHOLDS.good) return 'maybe';
    
    return 'no_hire';
  }

  /**
   * Get next recommended action for candidate
   * Preserves workflow business logic
   */
  static getNextSteps(candidate: Partial<CandidateDashboardView>): string[] {
    const steps: string[] = [];
    const status = candidate.overall_status || candidate.application_status || 'new';

    switch (status) {
      case 'new':
        steps.push('Review application documents');
        steps.push('Complete initial screening');
        if (!candidate.assessment_status || candidate.assessment_status === 'not_started') {
          steps.push('Send assessment invitation');
        }
        break;
      
      case 'screening':
        if (candidate.assessment_status === 'completed') {
          steps.push('Review assessment results');
        }
        if (candidate.passed) {
          steps.push('Schedule interview');
        } else {
          steps.push('Send rejection email');
        }
        break;
      
      case 'interview':
        steps.push('Conduct interview');
        steps.push('Gather interviewer feedback');
        if (candidate.overall_score && candidate.overall_score >= ASSESSMENT_THRESHOLDS.good) {
          steps.push('Prepare job offer');
        }
        break;
      
      case 'offer':
        steps.push('Follow up on offer status');
        steps.push('Prepare onboarding materials');
        break;
      
      case 'hired':
        steps.push('Complete onboarding');
        steps.push('Convert to staff record');
        break;
      
      case 'rejected':
        steps.push('Archive application');
        break;
    }

    return steps;
  }

  /**
   * Categorize candidate by performance level
   * Used for filtering and priority sorting
   */
  static categorizeCandidateLevel(score: number): {
    level: 'exceptional' | 'excellent' | 'good' | 'fair' | 'poor';
    label: string;
    priority: number;
  } {
    if (score >= AI_MATCH_LEVELS.exceptional.min) {
      return { level: 'exceptional', label: 'Top Candidate', priority: 1 };
    }
    if (score >= AI_MATCH_LEVELS.excellent.min) {
      return { level: 'excellent', label: 'Strong Candidate', priority: 2 };
    }
    if (score >= AI_MATCH_LEVELS.good.min) {
      return { level: 'good', label: 'Qualified Candidate', priority: 3 };
    }
    if (score >= AI_MATCH_LEVELS.fair.min) {
      return { level: 'fair', label: 'Consider Further', priority: 4 };
    }
    return { level: 'poor', label: 'Not Recommended', priority: 5 };
  }

  /**
   * Interpret DISC profile for childcare role
   * Provides insights specific to childcare positions
   */
  static interpretDiscProfile(
    primaryColor: string,
    secondaryColor?: string
  ): {
    strengths: string[];
    challenges: string[];
    idealRole: string;
  } {
    const primary = DISC_PROFILES[primaryColor as keyof typeof DISC_PROFILES];
    const secondary = secondaryColor ? DISC_PROFILES[secondaryColor as keyof typeof DISC_PROFILES] : null;

    if (!primary) {
      return {
        strengths: ['Profile needs assessment'],
        challenges: [],
        idealRole: 'Not yet determined'
      };
    }

    return {
      strengths: [
        primary.childcareStrength,
        ...(secondary ? [secondary.childcareStrength] : [])
      ],
      challenges: this.getDiscChallenges(primaryColor),
      idealRole: this.getIdealChildcareRole(primaryColor, secondaryColor)
    };
  }

  /**
   * Get potential challenges for DISC type
   * Internal helper method
   */
  private static getDiscChallenges(discType: string): string[] {
    const challenges = {
      D: ['May need to develop patience with slower-paced activities'],
      I: ['Should maintain focus on structured routines'],
      S: ['Could benefit from assertiveness training for challenging situations'],
      C: ['Might need to embrace flexibility in dynamic childcare environment']
    };
    return challenges[discType as keyof typeof challenges] || [];
  }

  /**
   * Determine ideal childcare role based on DISC
   * Matches personality to specific positions
   */
  private static getIdealChildcareRole(primary: string, secondary?: string): string {
    if (primary === 'I') return 'Lead Educator - Engagement Specialist';
    if (primary === 'S') return 'Infant/Toddler Care Specialist';
    if (primary === 'C') return 'Education Coordinator';
    if (primary === 'D') return 'Group Leader';
    
    return 'Childcare Professional';
  }

  /**
   * Filter candidates by criteria
   * Preserves filtering business logic
   */
  static filterCandidates(
    candidates: CandidateDashboardView[],
    filters: {
      status?: string;
      minScore?: number;
      passed?: boolean;
      hasAiInsights?: boolean;
    }
  ): CandidateDashboardView[] {
    return candidates.filter(candidate => {
      if (filters.status && candidate.overall_status !== filters.status) {
        return false;
      }
      if (filters.minScore !== undefined && 
          (candidate.overall_score || 0) < filters.minScore) {
        return false;
      }
      if (filters.passed !== undefined && candidate.passed !== filters.passed) {
        return false;
      }
      if (filters.hasAiInsights && !candidate.ai_match_score) {
        return false;
      }
      return true;
    });
  }

  /**
   * Sort candidates by priority
   * Used for dashboard display ordering
   */
  static sortCandidatesByPriority(
    candidates: CandidateDashboardView[]
  ): CandidateDashboardView[] {
    return [...candidates].sort((a, b) => {
      // Prioritize by status (earlier stages first)
      const statusOrder = ['new', 'screening', 'interview', 'offer', 'hired', 'rejected'];
      const aStatusIndex = statusOrder.indexOf(a.overall_status || 'new');
      const bStatusIndex = statusOrder.indexOf(b.overall_status || 'new');
      
      if (aStatusIndex !== bStatusIndex) {
        return aStatusIndex - bStatusIndex;
      }

      // Then by overall score (higher first)
      const aScore = a.overall_score || 0;
      const bScore = b.overall_score || 0;
      
      return bScore - aScore;
    });
  }

  /**
   * Validate candidate data completeness
   * Checks if all required fields are present
   */
  static validateCandidateData(candidate: Partial<CandidateDashboardView>): {
    isValid: boolean;
    missingFields: string[];
  } {
    const requiredFields = ['full_name', 'email', 'position_applied'];
    const missingFields: string[] = [];

    requiredFields.forEach(field => {
      if (!candidate[field as keyof typeof candidate]) {
        missingFields.push(field);
      }
    });

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  }
}

/**
 * Export business logic utilities
 */
export default CandidateBusinessLogic;

