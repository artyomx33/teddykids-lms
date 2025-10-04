/**
 * 🧪 HIRING SYSTEM API LAYER
 * Supabase integration for candidate management and hiring pipeline
 */

import { supabase } from '@/lib/supabase';
import type {
  Position,
  AssessmentTemplate,
  Candidate,
  CandidateApplication,
  CandidateAssessment,
  HiringPipelineStage,
  CandidatePipelineHistory,
  WidgetAnalytics,
  WidgetFormData,
  AssessmentResponse,
  CandidateFilters,
  ApiResponse,
  PaginatedResponse,
  FileUploadResult
} from '@/types/hiring';

// =============================================
// POSITION MANAGEMENT
// =============================================

export const positionApi = {
  // Get all active positions
  async getActivePositions(): Promise<Position[]> {
    const { data, error } = await supabase
      .from('position_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get position by ID with related assessments
  async getPositionWithAssessments(positionId: string) {
    const { data, error } = await supabase
      .from('position_templates')
      .select(`
        *,
        position_assessments (
          assessment_id,
          is_required,
          order_sequence,
          assessment_templates (*)
        )
      `)
      .eq('id', positionId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new position (admin only)
  async createPosition(position: Omit<Position, 'id' | 'created_at' | 'updated_at'>): Promise<Position> {
    const { data, error } = await supabase
      .from('position_templates')
      .insert(position)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update position
  async updatePosition(id: string, updates: Partial<Position>): Promise<Position> {
    const { data, error } = await supabase
      .from('position_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// =============================================
// ASSESSMENT MANAGEMENT
// =============================================

export const assessmentApi = {
  // Get all active assessments
  async getActiveAssessments(): Promise<AssessmentTemplate[]> {
    const { data, error } = await supabase
      .from('assessment_templates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get assessments for a specific position
  async getAssessmentsForPosition(positionId: string): Promise<AssessmentTemplate[]> {
    const { data, error } = await supabase
      .from('position_assessments')
      .select(`
        assessment_templates (*),
        is_required,
        order_sequence
      `)
      .eq('position_id', positionId)
      .order('order_sequence');

    if (error) throw error;
    return data?.map(item => ({
      ...item.assessment_templates,
      is_required: item.is_required,
      order_sequence: item.order_sequence
    })) || [];
  },

  // Create assessment template
  async createAssessment(assessment: Omit<AssessmentTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<AssessmentTemplate> {
    const { data, error } = await supabase
      .from('assessment_templates')
      .insert(assessment)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// =============================================
// CANDIDATE MANAGEMENT
// =============================================

export const candidateApi = {
  // Create new candidate from widget form
  async createCandidate(formData: WidgetFormData): Promise<Candidate> {
    const candidateData = {
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      date_of_birth: formData.date_of_birth,
      address_street: formData.address_street,
      address_city: formData.address_city,
      address_postal_code: formData.address_postal_code,
      address_country: formData.address_country,
      current_position: formData.current_position,
      current_company: formData.current_company,
      years_experience: formData.years_experience,
      education_level: formData.education_level,
      preferred_positions: formData.preferred_positions,
      preferred_work_type: formData.preferred_work_type,
      available_start_date: formData.available_start_date,
      salary_expectation_min: formData.salary_expectation_min,
      salary_expectation_max: formData.salary_expectation_max,
      privacy_consent: formData.privacy_consent,
      privacy_consent_date: formData.privacy_consent ? new Date().toISOString() : null,
      marketing_consent: formData.marketing_consent,
      application_source: 'widget' as const,
      application_status: 'applied' as const,
      widget_session_id: generateSessionId(),
      ip_address: await getUserIP(),
      user_agent: navigator.userAgent,
      referrer_url: document.referrer
    };

    const { data, error } = await supabase
      .from('candidates')
      .insert(candidateData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get candidates with filters
  async getCandidates(filters?: CandidateFilters, page = 1, limit = 50): Promise<PaginatedResponse<any>> {
    let query = supabase
      .from('candidate_pipeline_overview')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters?.status?.length) {
      query = query.in('application_status', filters.status);
    }
    if (filters?.position?.length) {
      query = query.in('position_title', filters.position);
    }
    if (filters?.searchTerm) {
      query = query.or(`full_name.ilike.%${filters.searchTerm}%,email.ilike.%${filters.searchTerm}%`);
    }
    if (filters?.dateRange) {
      query = query
        .gte('application_date', filters.dateRange.start)
        .lte('application_date', filters.dateRange.end);
    }

    const { data, error, count } = await query
      .order('application_date', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      pages: Math.ceil((count || 0) / limit)
    };
  },

  // Get candidate details
  async getCandidateDetails(candidateId: string) {
    const { data, error } = await supabase
      .from('candidates')
      .select(`
        *,
        candidate_applications (*,
          position_templates (*),
          candidate_assessments (*,
            assessment_templates (*)
          )
        ),
        candidate_communications (*)
      `)
      .eq('id', candidateId)
      .single();

    if (error) throw error;
    return data;
  },

  // Update candidate status
  async updateCandidateStatus(candidateId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('candidates')
      .update({ application_status: status })
      .eq('id', candidateId);

    if (error) throw error;
  }
};

// =============================================
// APPLICATION MANAGEMENT
// =============================================

export const applicationApi = {
  // Submit application for position
  async submitApplication(candidateId: string, positionId: string): Promise<CandidateApplication> {
    const applicationData = {
      candidate_id: candidateId,
      position_id: positionId,
      status: 'submitted' as const,
      application_date: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('candidate_applications')
      .insert(applicationData)
      .select()
      .single();

    if (error) throw error;

    // Create initial pipeline entry
    await pipelineApi.addToPipeline(candidateId, data.id, 'application-received');

    return data;
  },

  // Update application status
  async updateApplicationStatus(applicationId: string, status: string, notes?: string): Promise<void> {
    const updates: any = { status };
    if (notes) updates.reviewer_notes = notes;

    const { error } = await supabase
      .from('candidate_applications')
      .update(updates)
      .eq('id', applicationId);

    if (error) throw error;
  },

  // Schedule interview
  async scheduleInterview(applicationId: string, interviewData: {
    scheduled_at: string;
    interviewer_id: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('candidate_applications')
      .update({
        interview_scheduled_at: interviewData.scheduled_at,
        interviewer_id: interviewData.interviewer_id,
        status: 'interview_scheduled'
      })
      .eq('id', applicationId);

    if (error) throw error;
  }
};

// =============================================
// ASSESSMENT EXECUTION
// =============================================

export const assessmentExecutionApi = {
  // Start assessment for candidate
  async startAssessment(candidateId: string, applicationId: string, assessmentId: string): Promise<CandidateAssessment> {
    const { data, error } = await supabase
      .from('candidate_assessments')
      .insert({
        candidate_id: candidateId,
        application_id: applicationId,
        assessment_id: assessmentId,
        status: 'in_progress',
        started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Submit assessment responses
  async submitAssessment(
    assessmentId: string,
    responses: AssessmentResponse[],
    timeSpentMinutes: number
  ): Promise<CandidateAssessment> {
    // Calculate score based on responses
    const score = await calculateAssessmentScore(assessmentId, responses);

    const { data, error } = await supabase
      .from('candidate_assessments')
      .update({
        responses: responses.reduce((acc, r) => ({ ...acc, [r.question_id]: r.answer }), {}),
        score: score.totalScore,
        max_score: score.maxScore,
        percentage_score: score.percentage,
        passed: score.percentage >= 70, // Default passing score
        time_spent_minutes: timeSpentMinutes,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', assessmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Save assessment progress
  async saveAssessmentProgress(assessmentId: string, responses: AssessmentResponse[]): Promise<void> {
    const { error } = await supabase
      .from('candidate_assessments')
      .update({
        responses: responses.reduce((acc, r) => ({ ...acc, [r.question_id]: r.answer }), {}),
        session_data: { last_updated: new Date().toISOString() }
      })
      .eq('id', assessmentId);

    if (error) throw error;
  }
};

// =============================================
// PIPELINE MANAGEMENT
// =============================================

export const pipelineApi = {
  // Get pipeline stages
  async getPipelineStages(): Promise<HiringPipelineStage[]> {
    const { data, error } = await supabase
      .from('hiring_pipeline_stages')
      .select('*')
      .eq('is_active', true)
      .order('order_sequence');

    if (error) throw error;
    return data || [];
  },

  // Add candidate to pipeline stage
  async addToPipeline(candidateId: string, applicationId: string, stageKey: string): Promise<void> {
    // Get stage ID by key/name
    const { data: stage } = await supabase
      .from('hiring_pipeline_stages')
      .select('id')
      .eq('name', stageKey)
      .single();

    if (!stage) throw new Error('Pipeline stage not found');

    const { error } = await supabase
      .from('candidate_pipeline_history')
      .insert({
        candidate_id: candidateId,
        application_id: applicationId,
        stage_id: stage.id,
        entered_at: new Date().toISOString(),
        automatic_transition: true
      });

    if (error) throw error;
  },

  // Move candidate to next stage
  async moveToNextStage(candidateId: string, applicationId: string, outcome: 'passed' | 'failed'): Promise<void> {
    // Implementation for moving candidates through pipeline
    // This would include complex business logic for stage transitions
  }
};

// =============================================
// FILE UPLOAD
// =============================================

export const fileApi = {
  // Upload CV
  async uploadCV(file: File, candidateId: string): Promise<FileUploadResult> {
    return uploadFile(file, 'candidate-cvs', candidateId, 'cv');
  },

  // Upload cover letter
  async uploadCoverLetter(file: File, candidateId: string): Promise<FileUploadResult> {
    return uploadFile(file, 'candidate-cvs', candidateId, 'cover_letter');
  },

  // Upload portfolio
  async uploadPortfolio(file: File, candidateId: string): Promise<FileUploadResult> {
    return uploadFile(file, 'candidate-portfolios', candidateId, 'portfolio');
  }
};

// =============================================
// ANALYTICS & TRACKING
// =============================================

export const analyticsApi = {
  // Track widget analytics
  async trackEvent(event: Omit<WidgetAnalytics, 'id' | 'timestamp'>): Promise<void> {
    const { error } = await supabase
      .from('widget_analytics')
      .insert({
        ...event,
        timestamp: new Date().toISOString()
      });

    if (error) throw error;
  },

  // Get conversion funnel data
  async getConversionFunnel(days = 30) {
    const { data, error } = await supabase
      .from('widget_conversion_funnel')
      .select('*')
      .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get application status summary
  async getApplicationStatusSummary() {
    const { data, error } = await supabase
      .from('application_status_summary')
      .select('*');

    if (error) throw error;
    return data || [];
  }
};

// =============================================
// COMMUNICATION
// =============================================

export const communicationApi = {
  // Send email to candidate
  async sendEmail(candidateId: string, applicationId: string, emailData: {
    subject: string;
    content: string;
    template?: string;
  }): Promise<void> {
    // Log communication
    await supabase
      .from('candidate_communications')
      .insert({
        candidate_id: candidateId,
        application_id: applicationId,
        communication_type: 'email',
        direction: 'outbound',
        subject: emailData.subject,
        content: emailData.content,
        status: 'pending'
      });

    // TODO: Integrate with email service (SendGrid, etc.)
  },

  // Get communication history
  async getCommunicationHistory(candidateId: string) {
    const { data, error } = await supabase
      .from('candidate_communications')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};

// =============================================
// UTILITY FUNCTIONS
// =============================================

async function uploadFile(
  file: File,
  bucket: string,
  candidateId: string,
  type: string
): Promise<FileUploadResult> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${candidateId}/${type}-${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) throw error;

    return {
      success: true,
      file_path: data.path
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

async function calculateAssessmentScore(
  assessmentId: string,
  responses: AssessmentResponse[]
): Promise<{ totalScore: number; maxScore: number; percentage: number }> {
  // Get assessment template to calculate scoring
  const { data: assessment } = await supabase
    .from('assessment_templates')
    .select('questions, scoring_method')
    .eq('id', assessmentId)
    .single();

  if (!assessment) throw new Error('Assessment not found');

  // Simple scoring logic - in real implementation, this would be more sophisticated
  const totalQuestions = assessment.questions.length;
  let correctAnswers = 0;

  // This is a simplified scoring - real implementation would have proper scoring logic
  responses.forEach(response => {
    // Placeholder scoring logic
    if (response.answer) correctAnswers++;
  });

  const percentage = (correctAnswers / totalQuestions) * 100;

  return {
    totalScore: correctAnswers,
    maxScore: totalQuestions,
    percentage
  };
}

function generateSessionId(): string {
  return `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

async function getUserIP(): Promise<string> {
  try {
    const response = await fetch('https://ipapi.co/ip/');
    return await response.text();
  } catch {
    return '0.0.0.0';
  }
}

// =============================================
// EXPORTS
// =============================================

export const hiringApi = {
  positions: positionApi,
  assessments: assessmentApi,
  candidates: candidateApi,
  applications: applicationApi,
  assessmentExecution: assessmentExecutionApi,
  pipeline: pipelineApi,
  files: fileApi,
  analytics: analyticsApi,
  communication: communicationApi
};