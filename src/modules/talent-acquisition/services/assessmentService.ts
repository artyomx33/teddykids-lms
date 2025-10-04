/**
 * 🧪 ASSESSMENT SERVICE - TALENT ACQUISITION
 * Service for saving DISC assessment results to database
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
   * Save complete assessment submission
   */
  async saveAssessment(
    formData: ApplicantFormData,
    answers: Record<number, string>,
    results: AssessmentResults
  ) {
    try {
      // Generate reference code
      const refCode = `TK${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // 1. Create applicant record
      const { data: applicant, error: applicantError } = await supabase
        .from('ta_applicants')
        .insert({
          ref_code: refCode,
          role: formData.role,
          language_track: formData.languageTrack,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          city: formData.city,
          start_date: formData.startDate,

          // DISC Results
          color_primary: results.primaryColor,
          color_secondary: results.secondaryColor,
          color_counts: results.colorCounts,
          red_flag_count: results.redFlagCount,
          red_flag_items: results.redFlagQuestions,

          // Assessment completion
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (applicantError) {
        console.error('Error creating applicant:', applicantError);
        throw applicantError;
      }

      // 2. Save individual answers
      const answerRecords: AssessmentAnswer[] = Object.entries(answers).map(([questionIdStr, choice]) => {
        const questionId = parseInt(questionIdStr);
        // Note: This would need the actual question data to determine sections, colors, etc.
        // For now, storing basic data
        return {
          questionId,
          choice,
          section: 'unknown' // Would be populated from question data
        };
      });

      const { error: answersError } = await supabase
        .from('ta_assessment_answers')
        .insert(
          answerRecords.map(answer => ({
            applicant_id: applicant.id,
            question_id: answer.questionId,
            selected_choice: answer.choice,
            question_section: answer.section,
            is_color_question: answer.isColorQuestion || false,
            is_red_flag: answer.isRedFlag || false,
            color_mapped: answer.colorMapped,
            risk_flag: answer.riskFlag || false
          }))
        );

      if (answersError) {
        console.error('Error saving answers:', answersError);
        throw answersError;
      }

      console.log('Assessment saved successfully:', {
        applicantId: applicant.id,
        refCode: applicant.ref_code,
        profile: `${results.primaryColor}/${results.secondaryColor}`,
        redFlags: results.redFlagCount
      });

      return {
        success: true,
        applicantId: applicant.id,
        refCode: applicant.ref_code,
        results
      };

    } catch (error) {
      console.error('Assessment save failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * Get applicant by reference code
   */
  async getApplicant(refCode: string) {
    const { data, error } = await supabase
      .from('ta_applicants')
      .select('*')
      .eq('ref_code', refCode)
      .single();

    if (error) {
      console.error('Error fetching applicant:', error);
      return null;
    }

    return data;
  }
};