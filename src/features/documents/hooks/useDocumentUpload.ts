/**
 * useDocumentUpload Hook
 * 
 * Handles document upload with progress tracking
 * Provides upload state management and error handling
 */

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadDocument, deleteDocument } from '../services/documentService';
import type { 
  UploadDocumentRequest, 
  UploadDocumentResponse,
  DocumentActionResult,
} from '../types';
import { toast } from 'sonner';

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
}

interface UseDocumentUploadReturn {
  // State
  uploadState: UploadState;
  
  // Actions
  upload: (request: UploadDocumentRequest) => Promise<UploadDocumentResponse>;
  deleteDoc: (documentId: string) => Promise<DocumentActionResult>;
  
  // Reset
  reset: () => void;
}

export function useDocumentUpload(staffId?: string): UseDocumentUploadReturn {
  const queryClient = useQueryClient();
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: uploadDocument,
    onMutate: () => {
      setUploadState({
        uploading: true,
        progress: 0,
        error: null,
      });
    },
    onSuccess: (data) => {
      setUploadState({
        uploading: false,
        progress: 100,
        error: null,
      });
      
      // Invalidate queries to refresh data
      if (staffId) {
        queryClient.invalidateQueries({ queryKey: ['staff-documents', staffId] });
        queryClient.invalidateQueries({ queryKey: ['staff-documents-summary', staffId] });
        queryClient.invalidateQueries({ queryKey: ['staff-documents-checklist', staffId] });
      }
      
      toast.success('Document uploaded successfully!');
    },
    onError: (error: Error) => {
      setUploadState({
        uploading: false,
        progress: 0,
        error: error.message,
      });
      
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate queries to refresh data
        if (staffId) {
          queryClient.invalidateQueries({ queryKey: ['staff-documents', staffId] });
          queryClient.invalidateQueries({ queryKey: ['staff-documents-summary', staffId] });
          queryClient.invalidateQueries({ queryKey: ['staff-documents-checklist', staffId] });
        }
        
        toast.success(result.message || 'Document deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete document');
      }
    },
    onError: (error: Error) => {
      toast.error(`Delete failed: ${error.message}`);
    },
  });

  // Upload handler
  const upload = useCallback(
    async (request: UploadDocumentRequest): Promise<UploadDocumentResponse> => {
      // Simulate progress for better UX (Supabase doesn't provide upload progress)
      const progressInterval = setInterval(() => {
        setUploadState((prev) => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90),
        }));
      }, 200);

      try {
        const result = await uploadMutation.mutateAsync(request);
        clearInterval(progressInterval);
        setUploadState({
          uploading: false,
          progress: 100,
          error: null,
        });
        return result;
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      }
    },
    [uploadMutation]
  );

  // Delete handler
  const deleteDoc = useCallback(
    async (documentId: string): Promise<DocumentActionResult> => {
      return deleteMutation.mutateAsync(documentId);
    },
    [deleteMutation]
  );

  // Reset state
  const reset = useCallback(() => {
    setUploadState({
      uploading: false,
      progress: 0,
      error: null,
    });
  }, []);

  return {
    uploadState,
    upload,
    deleteDoc,
    reset,
  };
}

