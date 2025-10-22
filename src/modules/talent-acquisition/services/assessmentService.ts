/**
 * 🧪 ASSESSMENT SERVICE - TALENT ACQUISITION (LUNA-APPROVED)
 * Service for saving DISC assessment results to NEW candidates table
 * Updated: October 22, 2025
 */

import { supabase } from '@/integrations/supabase/client';

export interface ApplicantFormData {
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  languageTrack: string;
  city?: string;
  startDate?: string;
}

export interface AssessmentResults {
  colorCounts: Record<string, number>;
  colorPercentages: Record<string, number>;
  primaryColor: string;
  secondaryColor: string;
  redFlagCount: number;
  redFlagQuestions: number[];
}

export interface AssessmentAnswer {
  questionId: number;
  choice: string;
  section: string;
  isColorQuestion?: boolean;
  isRedFlag?: boolean;
  colorMapped?: string;
  riskFlag?: boolean;
}

export const assessmentService = {
  /**
   * Save complete assessment submission to NEW candidates table
   * Luna-approved schema with full DISC profile
   */
  async saveAssessment(
    formData: ApplicantFormData,
    answers: Record<number, string>,
    results: AssessmentResults
  ) {
    try {
      // Build Luna-approved DISC profile object
      const discProfile = {
        primary_color: results.primaryColor,
        secondary_color: results.secondaryColor,
        color_distribution: {
          red: results.colorCounts.red || 0,
          blue: results.colorCounts.blue || 0,
          green: results.colorCounts.green || 0,
          yellow: results.colorCounts.yellow || 0,
        },
        redflag_count: results.redFlagCount,
        redflag_question_ids: results.redFlagQuestions,
        redflag_details: results.redFlagQuestions.map(qId => ({
          question_id: qId,
          question_text: `Question ${qId}`, // Would come from actual question data
          answer_given: answers[qId],
          why_flagged: 'Behavioral concern detected',
        })),
        // Simple group fit logic (can be enhanced with AI later)
        group_fit: this.determineGroupFit(results.primaryColor, results.secondaryColor),
        group_fit_confidence: 75,
        personality_traits: this.getPersonalityTraits(results.primaryColor),
        strengths: this.getStrengths(results.primaryColor),
        potential_challenges: this.getChallenges(results.primaryColor),
      };

      // 1. Create candidate record in NEW candidates table
      const { data: candidate, error: candidateError } = await supabase
        .from('candidates')
        .insert({
          // Personal info
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          
          // Application details
          role_applied: formData.role,
          language: formData.languageTrack,
          position_applied: formData.role, // Same as role for now
          application_date: new Date().toISOString().split('T')[0],
          
          // Status (Luna's 6-stage flow)
          status: 'application_received', // 📩 Stage 1
          decision: 'pending',
          
          // DISC Profile (JSONB - Luna-approved structure)
          disc_profile: discProfile,
          
          // Quick access fields (denormalized for queries)
          redflag_count: results.redFlagCount,
          group_fit: discProfile.group_fit,
          primary_disc_color: results.primaryColor,
          secondary_disc_color: results.secondaryColor,
          
          // Assessment answers (all 40 Q&A pairs)
          assessment_answers: answers,
          
          // Auto-calculated scores
          overall_score: this.calculateOverallScore(results),
          passed: results.redFlagCount < 3, // Pass if less than 3 red flags
        })
        .select()
        .single();

      if (candidateError) {
        console.error('Error creating candidate:', candidateError);
        throw candidateError;
      }

      console.log('✅ Candidate saved successfully:', {
        candidateId: candidate.id,
        name: candidate.full_name,
        profile: `${results.primaryColor}/${results.secondaryColor}`,
        groupFit: discProfile.group_fit,
        redFlags: results.redFlagCount,
        badge: candidate.badge_title, // Auto-assigned by trigger!
      });

      return {
        success: true,
        candidateId: candidate.id,
        candidate: candidate,
        results
      };

    } catch (error) {
      console.error('❌ Candidate save failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * Get candidate by ID
   */
  async getCandidate(candidateId: string) {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', candidateId)
      .single();

    if (error) {
      console.error('Error fetching candidate:', error);
      return null;
    }

    return data;
  },

  /**
   * Get candidate by email
   */
  async getCandidateByEmail(email: string) {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') { // Ignore "not found"
      console.error('Error fetching candidate:', error);
      return null;
    }

    return data;
  },

  /**
   * Helper: Determine group fit based on DISC profile
   */
  determineGroupFit(primary: string, secondary: string): string {
    // Simple logic - can be enhanced with AI later
    const profile = `${primary}/${secondary}`;
    
    const groupFitMap: Record<string, string> = {
      'Green/Yellow': '1-2 years', // Warm, patient, playful
      'Green/Blue': 'Babies (0-1)', // Calm, methodical, patient
      'Yellow/Green': '1-2 years', // Energetic but caring
      'Yellow/Red': '3+ years', // High energy, dynamic
      'Red/Yellow': '3+ years', // Bold, energetic
      'Blue/Green': 'Babies (0-1)', // Structured, careful
      'Blue/Red': 'Administrative', // Analytical, driven
      'Red/Blue': 'Administrative', // Results-focused, detail-oriented
    };
    
    return groupFitMap[profile] || 'Multi-age';
  },

  /**
   * Helper: Get personality traits
   */
  getPersonalityTraits(primaryColor: string): string[] {
    const traits: Record<string, string[]> = {
      Red: ['Direct', 'Task-oriented', 'Results-driven', 'Decisive'],
      Blue: ['Analytical', 'Precise', 'Systematic', 'Detail-focused'],
      Green: ['Patient', 'Supportive', 'Even-tempered', 'Team-player'],
      Yellow: ['Enthusiastic', 'Outgoing', 'Optimistic', 'People-focused'],
    };
    return traits[primaryColor] || [];
  },

  /**
   * Helper: Get strengths
   */
  getStrengths(primaryColor: string): string[] {
    const strengths: Record<string, string[]> = {
      Red: ['Leadership', 'Quick decision-making', 'Goal achievement'],
      Blue: ['Problem-solving', 'Quality control', 'Planning'],
      Green: ['Active listening', 'Patience', 'Consistency'],
      Yellow: ['Communication', 'Team motivation', 'Creativity'],
    };
    return strengths[primaryColor] || [];
  },

  /**
   * Helper: Get challenges
   */
  getChallenges(primaryColor: string): string[] {
    const challenges: Record<string, string[]> = {
      Red: ['May be too direct', 'Impatient with details', 'Can overlook feelings'],
      Blue: ['May overanalyze', 'Slow to make decisions', 'Reserved in social situations'],
      Green: ['May avoid conflict', 'Slow to adapt to change', 'Difficulty saying no'],
      Yellow: ['May talk too much', 'Impulsive decisions', 'Overlooks details'],
    };
    return challenges[primaryColor] || [];
  },

  /**
   * Helper: Calculate overall score
   */
  calculateOverallScore(results: AssessmentResults): number {
    // Simple scoring: 100 points minus 10 per red flag
    const baseScore = 100;
    const penaltyPerFlag = 10;
    const score = Math.max(0, baseScore - (results.redFlagCount * penaltyPerFlag));
    return score;
  }
};