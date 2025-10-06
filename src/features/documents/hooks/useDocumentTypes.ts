/**
 * useDocumentTypes Hook
 * 
 * Fetches and caches document types
 * Provides filtered/sorted lists for UI
 */

import { useQuery } from '@tanstack/react-query';
import { getDocumentTypes, getDocumentTypeById, getDocumentTypeByCode } from '../services/documentService';
import type { DocumentType, DocumentCategory } from '../types';
import { useMemo } from 'react';

interface UseDocumentTypesReturn {
  documentTypes: DocumentType[];
  requiredTypes: DocumentType[];
  optionalTypes: DocumentType[];
  loading: boolean;
  error: Error | null;
  getTypeById: (id: string) => DocumentType | undefined;
  getTypeByCode: (code: string) => DocumentType | undefined;
  getTypesByCategory: (category: DocumentCategory) => DocumentType[];
}

export function useDocumentTypes(): UseDocumentTypesReturn {
  const {
    data: documentTypes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['document-types'],
    queryFn: getDocumentTypes,
    staleTime: Infinity, // Document types rarely change
    gcTime: Infinity, // Keep in cache indefinitely
  });

  // Memoized filtered lists
  const requiredTypes = useMemo(
    () => documentTypes.filter((t) => t.is_required),
    [documentTypes]
  );

  const optionalTypes = useMemo(
    () => documentTypes.filter((t) => !t.is_required),
    [documentTypes]
  );

  // Helper functions
  const getTypeById = useMemo(
    () => (id: string) => documentTypes.find((t) => t.id === id),
    [documentTypes]
  );

  const getTypeByCode = useMemo(
    () => (code: string) => documentTypes.find((t) => t.code === code),
    [documentTypes]
  );

  const getTypesByCategory = useMemo(
    () => (category: DocumentCategory) =>
      documentTypes.filter((t) => t.category === category),
    [documentTypes]
  );

  return {
    documentTypes,
    requiredTypes,
    optionalTypes,
    loading: isLoading,
    error: error as Error | null,
    getTypeById,
    getTypeByCode,
    getTypesByCategory,
  };
}

/**
 * Hook for fetching a single document type by ID
 */
export function useDocumentType(id: string) {
  const {
    data: documentType = null,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['document-type', id],
    queryFn: () => getDocumentTypeById(id),
    enabled: !!id,
    staleTime: Infinity,
  });

  return {
    documentType,
    loading: isLoading,
    error: error as Error | null,
  };
}

/**
 * Hook for fetching a single document type by code
 */
export function useDocumentTypeByCode(code: string) {
  const {
    data: documentType = null,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['document-type-code', code],
    queryFn: () => getDocumentTypeByCode(code),
    enabled: !!code,
    staleTime: Infinity,
  });

  return {
    documentType,
    loading: isLoading,
    error: error as Error | null,
  };
}

