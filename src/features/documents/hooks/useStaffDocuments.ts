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

/**
 * Fetches and subscribes to staff documents with real-time updates
 * 
 * @param staffId - The staff member's ID (required)
 * @param options - Optional configuration { includeOptional?, autoRefresh? }
 * 
 * @example
 * // Basic usage
 * const { documents, loading } = useStaffDocuments(staffId);
 * 
 * // With options
 * const { documents } = useStaffDocuments(staffId, { includeOptional: false });
 */
export function useStaffDocuments(
  staffId: string,
  options: UseStaffDocumentsOptions = {}
): UseStaffDocumentsReturn {
  const { includeOptional = true, autoRefresh = true } = options;
  const queryClient = useQueryClient();

  // 🛡️ Runtime validation
  const isValidStaffId = staffId && staffId !== 'undefined' && staffId !== 'null';
  
  if (!isValidStaffId) {
    console.error('[useStaffDocuments] Invalid staffId:', staffId);
    return {
      documents: [],
      requiredDocs: [],
      optionalDocs: [],
      summary: null,
      loading: false,
      error: new Error('Invalid staffId provided'),
      refetch: () => {},
    };
  }

  // Fetch all documents
  const {
    data: documents = [],
    isLoading: documentsLoading,
    error: documentsError,
    refetch: refetchDocuments,
  } = useQuery({
    queryKey: ['staff-documents', staffId],
    queryFn: () => getStaffDocuments(staffId),
    enabled: !!isValidStaffId,
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
    enabled: !!isValidStaffId,
    staleTime: 30000,
  });

  // Real-time subscription
  useEffect(() => {
    if (!isValidStaffId || !autoRefresh) return;

    const unsubscribe = subscribeToStaffDocuments(staffId, (payload) => {
      console.log('Document change detected:', payload);
      
      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['staff-documents', staffId] });
      queryClient.invalidateQueries({ queryKey: ['staff-documents-summary', staffId] });
    });

    return unsubscribe;
  }, [isValidStaffId, staffId, autoRefresh, queryClient]);

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
 * 
 * @param staffId - The staff member's ID (required)
 * 
 * @example
 * const { documents, loading } = useRequiredDocumentsChecklist(staffId);
 */
export function useRequiredDocumentsChecklist(staffId: string) {
  // 🛡️ Runtime validation
  const isValidStaffId = staffId && staffId !== 'undefined' && staffId !== 'null';

  const {
    data: documents = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['staff-documents-checklist', staffId],
    queryFn: () => getRequiredDocumentsChecklist(staffId),
    enabled: !!isValidStaffId,
    staleTime: 30000,
  });

  return {
    documents: isValidStaffId ? documents : [],
    loading: isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Simplified hook for just the summary (for cards/badges)
 * 
 * @param staffId - The staff member's ID (required)
 * 
 * @example
 * const { summary, loading } = useDocumentSummary(staffId);
 */
export function useDocumentSummary(staffId: string) {
  // 🛡️ Runtime validation
  const isValidStaffId = staffId && staffId !== 'undefined' && staffId !== 'null';

  const {
    data: summary = null,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['staff-documents-summary', staffId],
    queryFn: () => getStaffDocumentSummary(staffId),
    enabled: !!isValidStaffId,
    staleTime: 30000,
  });

  return {
    summary: isValidStaffId ? summary : null,
    loading: isLoading,
    error: error as Error | null,
    refetch,
  };
}

