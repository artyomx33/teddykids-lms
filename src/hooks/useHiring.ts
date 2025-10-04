/**
 * 🧪 HIRING SYSTEM HOOKS
 * TanStack Query hooks for hiring pipeline management
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hiringApi } from '@/lib/api/hiring';
import type {
  Position,
  AssessmentTemplate,
  Candidate,
  CandidateApplication,
  CandidateAssessment,
  WidgetFormData,
  AssessmentResponse,
  CandidateFilters,
  WidgetAnalytics
} from '@/types/hiring';

// =============================================
// QUERY KEYS
// =============================================

export const hiringKeys = {
  all: ['hiring'] as const,
  positions: () => [...hiringKeys.all, 'positions'] as const,
  position: (id: string) => [...hiringKeys.positions(), id] as const,
  positionWithAssessments: (id: string) => [...hiringKeys.position(id), 'assessments'] as const,

  assessments: () => [...hiringKeys.all, 'assessments'] as const,
  assessment: (id: string) => [...hiringKeys.assessments(), id] as const,
  positionAssessments: (positionId: string) => [...hiringKeys.assessments(), 'position', positionId] as const,

  candidates: () => [...hiringKeys.all, 'candidates'] as const,
  candidate: (id: string) => [...hiringKeys.candidates(), id] as const,
  candidateDetails: (id: string) => [...hiringKeys.candidate(id), 'details'] as const,
  candidatesFiltered: (filters: CandidateFilters, page: number) => [...hiringKeys.candidates(), 'filtered', filters, page] as const,

  applications: () => [...hiringKeys.all, 'applications'] as const,
  application: (id: string) => [...hiringKeys.applications(), id] as const,

  pipeline: () => [...hiringKeys.all, 'pipeline'] as const,
  pipelineStages: () => [...hiringKeys.pipeline(), 'stages'] as const,

  analytics: () => [...hiringKeys.all, 'analytics'] as const,
  conversionFunnel: (days: number) => [...hiringKeys.analytics(), 'conversion', days] as const,
  applicationSummary: () => [...hiringKeys.analytics(), 'summary'] as const,

  communications: () => [...hiringKeys.all, 'communications'] as const,
  candidateCommunications: (candidateId: string) => [...hiringKeys.communications(), candidateId] as const
};

// =============================================
// POSITION HOOKS
// =============================================

export function usePositions() {
  return useQuery({
    queryKey: hiringKeys.positions(),
    queryFn: hiringApi.positions.getActivePositions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePosition(positionId: string) {
  return useQuery({
    queryKey: hiringKeys.position(positionId),
    queryFn: () => hiringApi.positions.getPositionWithAssessments(positionId),
    enabled: !!positionId,
  });
}

export function useCreatePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: hiringApi.positions.createPosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hiringKeys.positions() });
    },
  });
}

export function useUpdatePosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Position> }) =>
      hiringApi.positions.updatePosition(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: hiringKeys.positions() });
      queryClient.invalidateQueries({ queryKey: hiringKeys.position(id) });
    },
  });
}

// =============================================
// ASSESSMENT HOOKS
// =============================================

export function useAssessments() {
  return useQuery({
    queryKey: hiringKeys.assessments(),
    queryFn: hiringApi.assessments.getActiveAssessments,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePositionAssessments(positionId: string) {
  return useQuery({
    queryKey: hiringKeys.positionAssessments(positionId),
    queryFn: () => hiringApi.assessments.getAssessmentsForPosition(positionId),
    enabled: !!positionId,
  });
}

export function useCreateAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: hiringApi.assessments.createAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hiringKeys.assessments() });
    },
  });
}

// =============================================
// CANDIDATE HOOKS
// =============================================

export function useCandidates(filters?: CandidateFilters, page = 1, limit = 50) {
  return useQuery({
    queryKey: hiringKeys.candidatesFiltered(filters || {}, page),
    queryFn: () => hiringApi.candidates.getCandidates(filters, page, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCandidateDetails(candidateId: string) {
  return useQuery({
    queryKey: hiringKeys.candidateDetails(candidateId),
    queryFn: () => hiringApi.candidates.getCandidateDetails(candidateId),
    enabled: !!candidateId,
  });
}

export function useCreateCandidate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: hiringApi.candidates.createCandidate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hiringKeys.candidates() });
    },
  });
}

export function useUpdateCandidateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ candidateId, status }: { candidateId: string; status: string }) =>
      hiringApi.candidates.updateCandidateStatus(candidateId, status),
    onSuccess: (_, { candidateId }) => {
      queryClient.invalidateQueries({ queryKey: hiringKeys.candidates() });
      queryClient.invalidateQueries({ queryKey: hiringKeys.candidateDetails(candidateId) });
    },
  });
}

// =============================================
// APPLICATION HOOKS
// =============================================

export function useSubmitApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ candidateId, positionId }: { candidateId: string; positionId: string }) =>
      hiringApi.applications.submitApplication(candidateId, positionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hiringKeys.candidates() });
      queryClient.invalidateQueries({ queryKey: hiringKeys.applications() });
    },
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, status, notes }: { applicationId: string; status: string; notes?: string }) =>
      hiringApi.applications.updateApplicationStatus(applicationId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hiringKeys.candidates() });
      queryClient.invalidateQueries({ queryKey: hiringKeys.applications() });
    },
  });
}

export function useScheduleInterview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, interviewData }: {
      applicationId: string;
      interviewData: { scheduled_at: string; interviewer_id: string };
    }) => hiringApi.applications.scheduleInterview(applicationId, interviewData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hiringKeys.candidates() });
      queryClient.invalidateQueries({ queryKey: hiringKeys.applications() });
    },
  });
}

// =============================================
// ASSESSMENT EXECUTION HOOKS
// =============================================

export function useStartAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ candidateId, applicationId, assessmentId }: {
      candidateId: string;
      applicationId: string;
      assessmentId: string;
    }) => hiringApi.assessmentExecution.startAssessment(candidateId, applicationId, assessmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hiringKeys.candidates() });
    },
  });
}

export function useSubmitAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assessmentId, responses, timeSpentMinutes }: {
      assessmentId: string;
      responses: AssessmentResponse[];
      timeSpentMinutes: number;
    }) => hiringApi.assessmentExecution.submitAssessment(assessmentId, responses, timeSpentMinutes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hiringKeys.candidates() });
    },
  });
}

export function useSaveAssessmentProgress() {
  return useMutation({
    mutationFn: ({ assessmentId, responses }: {
      assessmentId: string;
      responses: AssessmentResponse[];
    }) => hiringApi.assessmentExecution.saveAssessmentProgress(assessmentId, responses),
  });
}

// =============================================
// PIPELINE HOOKS
// =============================================

export function usePipelineStages() {
  return useQuery({
    queryKey: hiringKeys.pipelineStages(),
    queryFn: hiringApi.pipeline.getPipelineStages,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// =============================================
// FILE UPLOAD HOOKS
// =============================================

export function useUploadCV() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, candidateId }: { file: File; candidateId: string }) =>
      hiringApi.files.uploadCV(file, candidateId),
    onSuccess: (_, { candidateId }) => {
      queryClient.invalidateQueries({ queryKey: hiringKeys.candidateDetails(candidateId) });
    },
  });
}

export function useUploadCoverLetter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, candidateId }: { file: File; candidateId: string }) =>
      hiringApi.files.uploadCoverLetter(file, candidateId),
    onSuccess: (_, { candidateId }) => {
      queryClient.invalidateQueries({ queryKey: hiringKeys.candidateDetails(candidateId) });
    },
  });
}

export function useUploadPortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, candidateId }: { file: File; candidateId: string }) =>
      hiringApi.files.uploadPortfolio(file, candidateId),
    onSuccess: (_, { candidateId }) => {
      queryClient.invalidateQueries({ queryKey: hiringKeys.candidateDetails(candidateId) });
    },
  });
}

// =============================================
// ANALYTICS HOOKS
// =============================================

export function useTrackAnalytics() {
  return useMutation({
    mutationFn: hiringApi.analytics.trackEvent,
  });
}

export function useConversionFunnel(days = 30) {
  return useQuery({
    queryKey: hiringKeys.conversionFunnel(days),
    queryFn: () => hiringApi.analytics.getConversionFunnel(days),
    staleTime: 5 * 60 * 1000,
  });
}

export function useApplicationStatusSummary() {
  return useQuery({
    queryKey: hiringKeys.applicationSummary(),
    queryFn: hiringApi.analytics.getApplicationStatusSummary,
    staleTime: 5 * 60 * 1000,
  });
}

// =============================================
// COMMUNICATION HOOKS
// =============================================

export function useSendEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ candidateId, applicationId, emailData }: {
      candidateId: string;
      applicationId: string;
      emailData: { subject: string; content: string; template?: string };
    }) => hiringApi.communication.sendEmail(candidateId, applicationId, emailData),
    onSuccess: (_, { candidateId }) => {
      queryClient.invalidateQueries({ queryKey: hiringKeys.candidateCommunications(candidateId) });
    },
  });
}

export function useCommunicationHistory(candidateId: string) {
  return useQuery({
    queryKey: hiringKeys.candidateCommunications(candidateId),
    queryFn: () => hiringApi.communication.getCommunicationHistory(candidateId),
    enabled: !!candidateId,
  });
}

// =============================================
// COMPOSITE HOOKS FOR WIDGET
// =============================================

export function useHiringWidget() {
  const createCandidate = useCreateCandidate();
  const submitApplication = useSubmitApplication();
  const trackAnalytics = useTrackAnalytics();
  const uploadCV = useUploadCV();
  const uploadCoverLetter = useUploadCoverLetter();
  const uploadPortfolio = useUploadPortfolio();

  const submitCompleteApplication = useMutation({
    mutationFn: async ({ formData, positionId, sessionId }: {
      formData: WidgetFormData;
      positionId: string;
      sessionId: string;
    }) => {
      // Track form completion
      await trackAnalytics.mutateAsync({
        session_id: sessionId,
        event_type: 'form_complete',
        event_data: { position_id: positionId },
        user_agent: navigator.userAgent
      });

      // Create candidate
      const candidate = await createCandidate.mutateAsync(formData);

      // Upload files if provided
      if (formData.cv_file) {
        await uploadCV.mutateAsync({ file: formData.cv_file, candidateId: candidate.id });
      }
      if (formData.cover_letter_file) {
        await uploadCoverLetter.mutateAsync({ file: formData.cover_letter_file, candidateId: candidate.id });
      }
      if (formData.portfolio_file) {
        await uploadPortfolio.mutateAsync({ file: formData.portfolio_file, candidateId: candidate.id });
      }

      // Submit application
      const application = await submitApplication.mutateAsync({
        candidateId: candidate.id,
        positionId
      });

      return { candidate, application };
    },
  });

  return {
    submitCompleteApplication,
    trackAnalytics,
    isSubmitting: submitCompleteApplication.isPending || createCandidate.isPending || submitApplication.isPending,
    error: submitCompleteApplication.error || createCandidate.error || submitApplication.error
  };
}

// =============================================
// ASSESSMENT WIDGET HOOK
// =============================================

export function useAssessmentWidget(assessmentId: string, candidateId: string, applicationId: string) {
  const startAssessment = useStartAssessment();
  const submitAssessment = useSubmitAssessment();
  const saveProgress = useSaveAssessmentProgress();

  const completeAssessment = useMutation({
    mutationFn: async ({ responses, timeSpentMinutes }: {
      responses: AssessmentResponse[];
      timeSpentMinutes: number;
    }) => {
      return await submitAssessment.mutateAsync({
        assessmentId,
        responses,
        timeSpentMinutes
      });
    },
  });

  return {
    startAssessment: () => startAssessment.mutateAsync({ candidateId, applicationId, assessmentId }),
    completeAssessment,
    saveProgress: (responses: AssessmentResponse[]) => saveProgress.mutateAsync({ assessmentId, responses }),
    isStarting: startAssessment.isPending,
    isSubmitting: submitAssessment.isPending,
    isSaving: saveProgress.isPending,
    error: startAssessment.error || submitAssessment.error || saveProgress.error
  };
}