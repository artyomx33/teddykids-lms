/**
 * DISC Profile Constants - Runtime values
 */

import type { DISCProfile } from '../types/assessment';

export const DISC_PROFILES: Record<string, DISCProfile> = {
  red: {
    title: 'The Leader',
    description: 'Direct, results-oriented, and confident',
    strengths: ['Takes charge', 'Makes quick decisions', 'Gets things done'],
    childcare_fit: 'Great with structured activities and older children'
  },
  blue: {
    title: 'The Planner',
    description: 'Analytical, detail-oriented, and systematic',
    strengths: ['Organized', 'Follows procedures', 'Quality-focused'],
    childcare_fit: 'Excellent with routines and younger children'
  },
  green: {
    title: 'The Heart',
    description: 'Patient, supportive, and empathetic',
    strengths: ['Great listener', 'Team player', 'Consistent'],
    childcare_fit: 'Works well with all age groups'
  },
  yellow: {
    title: 'The Spark',
    description: 'Enthusiastic, creative, and sociable',
    strengths: ['Energetic', 'Inspiring', 'Fun-loving'],
    childcare_fit: 'Perfect for interactive and creative activities'
  }
};
