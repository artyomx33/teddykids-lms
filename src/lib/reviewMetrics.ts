/**
 * REVIEWS v1.1 - CORE METRICS FRAMEWORK
 * Comprehensive metric definitions for all review types
 * Includes: Core, Gamification, and Emotional Intelligence metrics
 */

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface MetricDefinition {
  id: string;
  label: string;
  category: 'performance' | 'collaboration' | 'adaptability' | 'conduct' | 'safety' | 'childcare' | 'relationships' | 'emotional_intelligence';
  required?: boolean;
  type: 'rating' | 'text' | 'boolean' | 'select';
  description?: string;
  minRating?: number;
  maxRating?: number;
}

export interface GamificationMetric {
  id: string;
  label: string;
  source: 'gamification_system' | 'staff_goals' | 'disc_profile';
  valueType: 'number' | 'percentage' | 'text';
  description: string;
}

export interface EmotionalIntelligenceMetric {
  id: string;
  label: string;
  max: number;
  description: string;
  category: 'self_awareness' | 'self_management' | 'social_awareness' | 'relationship_management';
}

// =====================================================
// CORE REVIEW METRICS
// =====================================================

export const CORE_METRICS: Record<string, MetricDefinition> = {
  // Performance Metrics
  teamwork: {
    id: 'teamwork',
    label: 'Teamwork',
    category: 'collaboration',
    type: 'rating',
    required: true,
    description: 'Collaboration and cooperation with colleagues',
    minRating: 1,
    maxRating: 5
  },
  
  communication: {
    id: 'communication',
    label: 'Communication',
    category: 'collaboration',
    type: 'rating',
    required: true,
    description: 'Verbal and written communication effectiveness',
    minRating: 1,
    maxRating: 5
  },
  
  reliability: {
    id: 'reliability',
    label: 'Reliability / Consistency',
    category: 'performance',
    type: 'rating',
    required: true,
    description: 'Dependability and consistent performance',
    minRating: 1,
    maxRating: 5
  },
  
  initiative: {
    id: 'initiative',
    label: 'Initiative',
    category: 'performance',
    type: 'rating',
    required: true,
    description: 'Proactive behavior and taking ownership',
    minRating: 1,
    maxRating: 5
  },
  
  flexibility: {
    id: 'flexibility',
    label: 'Flexibility with Schedule/Chaos',
    category: 'adaptability',
    type: 'rating',
    required: true,
    description: 'Adapting to unexpected situations and changes',
    minRating: 1,
    maxRating: 5
  },
  
  // Professional Behavior
  professional_behavior: {
    id: 'professional_behavior',
    label: 'Professional Behavior',
    category: 'conduct',
    type: 'rating',
    required: true,
    description: 'Timing, dress, hygiene, and professional boundaries',
    minRating: 1,
    maxRating: 5
  },
  
  energy_positivity: {
    id: 'energy_positivity',
    label: 'Energy / Positivity',
    category: 'conduct',
    type: 'rating',
    required: true,
    description: 'Enthusiasm, attitude, and positive presence',
    minRating: 1,
    maxRating: 5
  },
  
  routines_followed: {
    id: 'routines_followed',
    label: 'Routines Followed Correctly',
    category: 'performance',
    type: 'rating',
    required: true,
    description: 'Adherence to established procedures and routines',
    minRating: 1,
    maxRating: 5
  },
  
  safety_awareness: {
    id: 'safety_awareness',
    label: 'Safety Awareness',
    category: 'safety',
    type: 'rating',
    required: true,
    description: 'Child safety vigilance and protocol following',
    minRating: 1,
    maxRating: 5
  },
  
  // Childcare-Specific Metrics
  conflict_handling_kids: {
    id: 'conflict_handling_kids',
    label: 'Conflict Handling (Kids)',
    category: 'childcare',
    type: 'rating',
    required: true,
    description: 'Managing disputes and conflicts between children',
    minRating: 1,
    maxRating: 5
  },
  
  conflict_handling_colleagues: {
    id: 'conflict_handling_colleagues',
    label: 'Conflict Handling (Colleagues)',
    category: 'collaboration',
    type: 'rating',
    required: true,
    description: 'Professional conflict resolution with team members',
    minRating: 1,
    maxRating: 5
  },
  
  conflict_handling_parents: {
    id: 'conflict_handling_parents',
    label: 'Conflict Handling (Parents)',
    category: 'childcare',
    type: 'rating',
    required: true,
    description: 'Managing difficult conversations with parents',
    minRating: 1,
    maxRating: 5
  },
  
  trust_from_team: {
    id: 'trust_from_team',
    label: 'Trust from Team',
    category: 'relationships',
    type: 'rating',
    required: true,
    description: 'Confidence and trust shown by colleagues',
    minRating: 1,
    maxRating: 5
  }
};

// =====================================================
// GAMIFICATION METRICS
// =====================================================

export const GAMIFICATION_METRICS: Record<string, GamificationMetric> = {
  coins_earned: {
    id: 'coins_earned',
    label: 'Coins/Stars Earned',
    source: 'gamification_system',
    valueType: 'number',
    description: 'Total coins earned from gamification system'
  },
  
  goals_completed_rate: {
    id: 'goals_completed_rate',
    label: 'Goals Completed %',
    source: 'staff_goals',
    valueType: 'percentage',
    description: 'Percentage of goals achieved since last review'
  },
  
  disc_insights: {
    id: 'disc_insights',
    label: 'DISC Color Balance',
    source: 'disc_profile',
    valueType: 'text',
    description: 'Primary and secondary DISC personality colors'
  },
  
  xp_total: {
    id: 'xp_total',
    label: 'Total XP Earned',
    source: 'gamification_system',
    valueType: 'number',
    description: 'Total experience points from all reviews'
  },
  
  achievements_unlocked: {
    id: 'achievements_unlocked',
    label: 'Achievements Unlocked',
    source: 'gamification_system',
    valueType: 'number',
    description: 'Number of achievements earned through reviews'
  }
};

// =====================================================
// EMOTIONAL INTELLIGENCE METRICS
// =====================================================

export const EMOTIONAL_INTELLIGENCE_METRICS: Record<string, EmotionalIntelligenceMetric> = {
  empathy: {
    id: 'empathy',
    label: 'Empathy',
    max: 5,
    category: 'social_awareness',
    description: 'Understanding and sharing feelings of others (children, colleagues, parents)'
  },
  
  stress_tolerance: {
    id: 'stress_tolerance',
    label: 'Stress Tolerance',
    max: 5,
    category: 'self_management',
    description: 'Managing pressure and maintaining composure in challenging situations'
  },
  
  emotional_regulation: {
    id: 'emotional_regulation',
    label: 'Emotional Regulation',
    max: 5,
    category: 'self_management',
    description: 'Managing and controlling own emotions effectively'
  },
  
  team_support: {
    id: 'team_support',
    label: 'Team Support',
    max: 5,
    category: 'relationship_management',
    description: 'Providing emotional support and encouragement to colleagues'
  },
  
  conflict_resolution: {
    id: 'conflict_resolution',
    label: 'Conflict Resolution',
    max: 5,
    category: 'relationship_management',
    description: 'Resolving tensions and finding constructive solutions'
  }
};

// =====================================================
// METRIC CATEGORIES
// =====================================================

export const METRIC_CATEGORIES = {
  performance: 'Performance',
  collaboration: 'Collaboration',
  adaptability: 'Adaptability',
  conduct: 'Professional Conduct',
  safety: 'Safety',
  childcare: 'Childcare Excellence',
  relationships: 'Relationships',
  emotional_intelligence: 'Emotional Intelligence'
} as const;

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get metrics by category
 */
export function getMetricsByCategory(category: keyof typeof METRIC_CATEGORIES) {
  return Object.values(CORE_METRICS).filter(metric => metric.category === category);
}

/**
 * Get all required metrics
 */
export function getRequiredMetrics() {
  return Object.values(CORE_METRICS).filter(metric => metric.required);
}

/**
 * Calculate average rating from metric responses
 */
export function calculateAverageRating(responses: Record<string, number>): number {
  const ratingValues = Object.entries(responses)
    .filter(([key]) => CORE_METRICS[key]?.type === 'rating')
    .map(([, value]) => value)
    .filter(value => typeof value === 'number' && value >= 1 && value <= 5);
  
  if (ratingValues.length === 0) return 0;
  
  const average = ratingValues.reduce((sum, value) => sum + value, 0) / ratingValues.length;
  return Math.round(average * 100) / 100; // Round to 2 decimals
}

/**
 * Get metrics for specific review type
 */
export function getMetricsForReviewType(reviewType: string): MetricDefinition[] {
  switch (reviewType) {
    case 'probation':
      return [
        CORE_METRICS.teamwork,
        CORE_METRICS.communication,
        CORE_METRICS.reliability,
        CORE_METRICS.flexibility,
        CORE_METRICS.professional_behavior,
        CORE_METRICS.safety_awareness
      ];
    
    case 'six_month':
      return [
        CORE_METRICS.teamwork,
        CORE_METRICS.communication,
        CORE_METRICS.reliability,
        CORE_METRICS.initiative,
        CORE_METRICS.flexibility,
        CORE_METRICS.conflict_handling_kids,
        CORE_METRICS.conflict_handling_colleagues,
        CORE_METRICS.trust_from_team
      ];
    
    case 'yearly':
      return Object.values(CORE_METRICS); // All metrics
    
    case 'performance':
    case 'promotion_review':
      return [
        CORE_METRICS.initiative,
        CORE_METRICS.reliability,
        CORE_METRICS.trust_from_team,
        CORE_METRICS.conflict_resolution
      ];
    
    default:
      return getRequiredMetrics();
  }
}

/**
 * Get emotional intelligence metrics for review type
 */
export function getEIMetricsForReviewType(reviewType: string): EmotionalIntelligenceMetric[] {
  switch (reviewType) {
    case 'probation':
      return [
        EMOTIONAL_INTELLIGENCE_METRICS.empathy,
        EMOTIONAL_INTELLIGENCE_METRICS.stress_tolerance
      ];
    
    case 'six_month':
    case 'yearly':
      return Object.values(EMOTIONAL_INTELLIGENCE_METRICS);
    
    case 'performance':
    case 'promotion_review':
      return [
        EMOTIONAL_INTELLIGENCE_METRICS.emotional_regulation,
        EMOTIONAL_INTELLIGENCE_METRICS.team_support,
        EMOTIONAL_INTELLIGENCE_METRICS.conflict_resolution
      ];
    
    default:
      return [];
  }
}

/**
 * Calculate manager vs self rating delta
 */
export function calculateRatingDelta(
  managerRatings: Record<string, number>,
  selfRatings: Record<string, number>
): number {
  const commonKeys = Object.keys(managerRatings).filter(key => 
    selfRatings[key] !== undefined && 
    CORE_METRICS[key]?.type === 'rating'
  );
  
  if (commonKeys.length === 0) return 0;
  
  const deltas = commonKeys.map(key => 
    Math.abs(managerRatings[key] - selfRatings[key])
  );
  
  const averageDelta = deltas.reduce((sum, delta) => sum + delta, 0) / deltas.length;
  return Math.round(averageDelta * 100) / 100; // Round to 2 decimals
}

/**
 * Interpret rating delta
 */
export function interpretRatingDelta(delta: number): {
  level: 'aligned' | 'minor_gap' | 'significant_gap';
  description: string;
  color: string;
} {
  if (delta < 0.5) {
    return {
      level: 'aligned',
      description: 'Manager and self-ratings are well aligned',
      color: 'green'
    };
  } else if (delta < 1.0) {
    return {
      level: 'minor_gap',
      description: 'Minor differences in perception',
      color: 'yellow'
    };
  } else {
    return {
      level: 'significant_gap',
      description: 'Significant gap - coaching opportunity',
      color: 'red'
    };
  }
}

/**
 * Get performance level from rating
 */
export function getPerformanceLevel(rating: number): {
  level: 'exceptional' | 'exceeds' | 'meets' | 'below' | 'unsatisfactory';
  label: string;
  color: string;
} {
  if (rating >= 4.5) {
    return { level: 'exceptional', label: 'Exceptional', color: 'green' };
  } else if (rating >= 3.5) {
    return { level: 'exceeds', label: 'Exceeds Expectations', color: 'blue' };
  } else if (rating >= 2.5) {
    return { level: 'meets', label: 'Meets Expectations', color: 'yellow' };
  } else if (rating >= 1.5) {
    return { level: 'below', label: 'Below Expectations', color: 'orange' };
  } else {
    return { level: 'unsatisfactory', label: 'Unsatisfactory', color: 'red' };
  }
}

