/**
 * useStaffDocuments Hook
 * 
 * Fetches and subscribes to staff documents
 * Provides real-time updates when documents change
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getStaffDocuments,
  getStaffDocumentSummary,
  getRequiredDocumentsChecklist,
  subscribeToStaffDocuments,
} from '../services/documentService';
import type { DocumentListItem, DocumentSummary } from '../types';

interface UseStaffDocumentsOptions {
  staffId: string;
  includeOptional?: boolean; // Include non-required docs
  autoRefresh?: boolean; // Subscribe to real-time updates
}

interface UseStaffDocumentsReturn {
  // Data
  documents: DocumentListItem[];
  requiredDocs: DocumentListItem[];
  optionalDocs: DocumentListItem[];
  summary: DocumentSummary | null;
  
  // States
  loading: boolean;
  error: Error | null;
  
  // Actions
  refetch: () => void;
}

export function useStaffDocuments(
  options: UseStaffDocumentsOptions
): UseStaffDocumentsReturn {
  const { staffId, includeOptional = true, autoRefresh = true } = options;
  const queryClient = useQueryClient();

  // Fetch all documents
  const {
    data: documents = [],
    isLoading: documentsLoading,
    error: documentsError,
    refetch: refetchDocuments,
  } = useQuery({
    queryKey: ['staff-documents', staffId],
    queryFn: () => getStaffDocuments(staffId),
    enabled: !!staffId,
    staleTime: 30000, // 30 seconds
  });

  // Fetch summary
  const {
    data: summary = null,
    isLoading: summaryLoading,
    error: summaryError,
  } = useQuery({
    queryKey: ['staff-documents-summary', staffId],
    queryFn: () => getStaffDocumentSummary(staffId),
    enabled: !!staffId,
    staleTime: 30000,
  });

  // Real-time subscription
  useEffect(() => {
    if (!staffId || !autoRefresh) return;

    const unsubscribe = subscribeToStaffDocuments(staffId, (payload) => {
      console.log('Document change detected:', payload);
      
      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['staff-documents', staffId] });
      queryClient.invalidateQueries({ queryKey: ['staff-documents-summary', staffId] });
    });

    return unsubscribe;
  }, [staffId, autoRefresh, queryClient]);

  // Split documents into required and optional
  const requiredDocs = documents.filter(doc => doc.is_required);
  const optionalDocs = documents.filter(doc => !doc.is_required);

  // Combine loading states
  const loading = documentsLoading || summaryLoading;
  const error = (documentsError || summaryError) as Error | null;

  // Refetch all data
  const refetch = useCallback(() => {
    refetchDocuments();
    queryClient.invalidateQueries({ queryKey: ['staff-documents-summary', staffId] });
  }, [refetchDocuments, queryClient, staffId]);

  return {
    documents: includeOptional ? documents : requiredDocs,
    requiredDocs,
    optionalDocs,
    summary,
    loading,
    error,
    refetch,
  };
}

/**
 * Simplified hook for just the checklist (required docs)
 */
export function useRequiredDocumentsChecklist(staffId: string) {
  const {
    data: documents = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['staff-documents-checklist', staffId],
    queryFn: () => getRequiredDocumentsChecklist(staffId),
    enabled: !!staffId,
    staleTime: 30000,
  });

  return {
    documents,
    loading: isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Simplified hook for just the summary (for cards/badges)
 */
export function useDocumentSummary(staffId: string) {
  const {
    data: summary = null,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['staff-documents-summary', staffId],
    queryFn: () => getStaffDocumentSummary(staffId),
    enabled: !!staffId,
    staleTime: 30000,
  });

  return {
    summary,
    loading: isLoading,
    error: error as Error | null,
    refetch,
  };
}

