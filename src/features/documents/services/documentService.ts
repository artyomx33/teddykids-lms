/**
 * Document Service
 * 
 * Handles all Supabase interactions for document management
 * Provides clean API for components to use
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  StaffDocument,
  DocumentType,
  DocumentSummary,
  UploadDocumentRequest,
  UploadDocumentResponse,
  DocumentActionResult,
  DocumentListItem,
} from '../types';
import { getDaysUntilExpiry } from '../types';

// =====================================================
// DOCUMENT TYPES
// =====================================================

/**
 * Fetch all document types
 */
export async function getDocumentTypes(): Promise<DocumentType[]> {
  const { data, error } = await supabase
    .from('document_types')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('documentService', 'Error fetching document types:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get a single document type by ID
 */
export async function getDocumentTypeById(id: string): Promise<DocumentType | null> {
  const { data, error } = await supabase
    .from('document_types')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching document type:', error);
    return null;
  }

  return data;
}

/**
 * Get a document type by code
 */
export async function getDocumentTypeByCode(code: string): Promise<DocumentType | null> {
  const { data, error } = await supabase
    .from('document_types')
    .select('*')
    .eq('code', code)
    .single();

  if (error) {
    console.error('Error fetching document type by code:', error);
    return null;
  }

  return data;
}

// =====================================================
// STAFF DOCUMENTS - QUERIES
// =====================================================

/**
 * Get summary stats for a staff member
 */
export async function getStaffDocumentSummary(staffId: string): Promise<DocumentSummary | null> {
  const { data, error } = await supabase
    .rpc('get_staff_document_summary', { p_staff_id: staffId })
    .single();

  if (error) {
    console.error('Error fetching document summary:', error);
    return null;
  }

  return {
    staff_id: staffId,
    ...data,
  };
}

/**
 * Get all documents for a staff member (with full details)
 * Shows current uploaded docs AND expired docs (even if is_current=false)
 */
export async function getStaffDocuments(staffId: string): Promise<DocumentListItem[]> {
  const { data, error } = await supabase
    .from('staff_documents')
    .select(`
      *,
      document_type:document_types(*)
    `)
    .eq('staff_id', staffId)
    .or('is_current.eq.true,status.eq.expired,status.eq.missing') // Show current, expired, or missing
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching staff documents:', error);
    throw error;
  }

  // Group by document type and keep only the latest record per type
  const latestByType = new Map<string, any>();
  
  for (const doc of data || []) {
    const docType = doc.document_type as DocumentType;
    const typeId = doc.document_type_id;
    
    // If we haven't seen this type, or this doc is newer, use it
    if (!latestByType.has(typeId) || 
        new Date(doc.created_at) > new Date(latestByType.get(typeId).created_at)) {
      latestByType.set(typeId, doc);
    }
  }

  // Transform to list items
  return Array.from(latestByType.values()).map((doc): DocumentListItem => {
    const daysUntil = getDaysUntilExpiry(doc.expires_at);
    const docType = doc.document_type as DocumentType;
    
    return {
      id: doc.id,
      staff_id: doc.staff_id,
      document_type_id: doc.document_type_id, // ✅ Include for pre-selection
      
      // Type info
      code: docType.code,
      name: docType.name,
      custom_label: doc.custom_label || undefined,
      display_name: doc.custom_label || docType.name,
      icon: docType.icon,
      category: docType.category,
      is_required: docType.is_required,
      
      // Status
      status: doc.status,
      is_current: doc.is_current,
      
      // File info
      file_name: doc.file_name || undefined,
      file_path: doc.file_path || undefined,
      file_size: doc.file_size || undefined,
      mime_type: doc.mime_type || undefined,
      
      // Dates
      uploaded_at: doc.uploaded_at || undefined,
      expires_at: doc.expires_at || undefined,
      days_until_expiry: daysUntil,
      
      // Notes
      notes: doc.notes || undefined,
    };
  });
}

/**
 * Get required documents checklist for a staff member
 */
export async function getRequiredDocumentsChecklist(staffId: string): Promise<DocumentListItem[]> {
  const allDocs = await getStaffDocuments(staffId);
  return allDocs.filter(doc => doc.is_required);
}

/**
 * Get a single document by ID
 */
export async function getDocumentById(documentId: string): Promise<StaffDocument | null> {
  const { data, error } = await supabase
    .from('staff_documents')
    .select(`
      *,
      document_type:document_types(*)
    `)
    .eq('id', documentId)
    .single();

  if (error) {
    console.error('Error fetching document:', error);
    return null;
  }

  return data;
}

// =====================================================
// STAFF DOCUMENTS - MUTATIONS
// =====================================================

/**
 * Upload a new document
 */
export async function uploadDocument(
  request: UploadDocumentRequest
): Promise<UploadDocumentResponse> {
  try {
    // 1. Get document type info
    const docType = await getDocumentTypeById(request.document_type_id);
    if (!docType) {
      throw new Error('Invalid document type');
    }

    // 2. Validate custom label for "OTHER" type
    if (docType.code === 'OTHER' && !request.custom_label) {
      throw new Error('Custom label is required for "Other" document type');
    }

    // 3. Validate expiry for types that require it
    if (docType.requires_expiry && !request.expires_at) {
      throw new Error(`Expiry date is required for ${docType.name}`);
    }

    // 4. Generate file path: staff/{staff_id}/{document_type_code}_{timestamp}.{ext}
    const fileExt = request.file.name.split('.').pop();
    const timestamp = Date.now();
    const fileName = `${docType.code}_${timestamp}.${fileExt}`;
    const filePath = `staff/${request.staff_id}/${fileName}`;

    // 5. Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('staff-documents')
      .upload(filePath, request.file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    // 6. Get current user for audit trail
    const { data: { user } } = await supabase.auth.getUser();

    // 7. Create database record
    const { data: docData, error: docError } = await supabase
      .from('staff_documents')
      .insert({
        staff_id: request.staff_id,
        document_type_id: request.document_type_id,
        file_name: request.file.name,
        file_path: uploadData.path,
        file_size: request.file.size,
        mime_type: request.file.type,
        status: 'uploaded',
        is_current: true, // Trigger will mark old ones as false
        uploaded_at: new Date().toISOString(),
        expires_at: request.expires_at?.toISOString(),
        custom_label: request.custom_label,
        notes: request.notes,
        uploaded_by: user?.id, // Audit trail
      })
      .select()
      .single();

    if (docError) {
      console.error('Database insert error:', docError);
      // Clean up storage if database insert fails
      await supabase.storage.from('staff-documents').remove([uploadData.path]);
      throw docError;
    }

    // 8. Get signed download URL (private bucket)
    const { data: urlData, error: urlError } = await supabase.storage
      .from('staff-documents')
      .createSignedUrl(uploadData.path, 3600); // 1 hour expiry

    if (urlError) {
      console.error('Error creating signed URL:', urlError);
      // Don't fail upload if URL generation fails
    }

    return {
      document: docData,
      file_url: urlData?.signedUrl || '',
    };
  } catch (error) {
    console.error('Upload document error:', error);
    throw error;
  }
}

/**
 * Delete a document
 * Handles active record promotion and missing placeholder creation
 */
export async function deleteDocument(documentId: string): Promise<DocumentActionResult> {
  try {
    // 1. Get document details
    const document = await getDocumentById(documentId);
    if (!document) {
      return {
        success: false,
        error: 'Document not found',
      };
    }

    const wasCurrentDoc = document.is_current;
    const staffId = document.staff_id;
    const docTypeId = document.document_type_id;

    // 2. Delete from storage (if file exists)
    if (document.file_path) {
      const { error: storageError } = await supabase.storage
        .from('staff-documents')
        .remove([document.file_path]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        // Continue anyway - file might already be deleted
      }
    }

    // 3. Delete from database
    const { error: dbError } = await supabase
      .from('staff_documents')
      .delete()
      .eq('id', documentId);

    if (dbError) {
      console.error('Database delete error:', dbError);
      throw dbError;
    }

    // 4. If we deleted the current document, promote the next newest OR create missing placeholder
    if (wasCurrentDoc) {
      // Try to find another document of the same type
      const { data: otherDocs } = await supabase
        .from('staff_documents')
        .select('id')
        .eq('staff_id', staffId)
        .eq('document_type_id', docTypeId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (otherDocs && otherDocs.length > 0) {
        // Promote the newest remaining document
        await supabase
          .from('staff_documents')
          .update({ is_current: true })
          .eq('id', otherDocs[0].id);
      } else {
        // No other documents exist - check if this type is required
        const docType = await getDocumentTypeById(docTypeId);
        if (docType?.is_required) {
          // Create a "missing" placeholder so UI can show it
          await supabase
            .from('staff_documents')
            .insert({
              staff_id: staffId,
              document_type_id: docTypeId,
              status: 'missing',
              is_current: true,
            });
        }
      }
    }

    return {
      success: true,
      message: 'Document deleted successfully',
    };
  } catch (error) {
    console.error('Delete document error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete document',
    };
  }
}

/**
 * Update document notes
 */
export async function updateDocumentNotes(
  documentId: string,
  notes: string
): Promise<DocumentActionResult> {
  try {
    const { error } = await supabase
      .from('staff_documents')
      .update({ notes })
      .eq('id', documentId);

    if (error) throw error;

    return {
      success: true,
      message: 'Notes updated successfully',
    };
  } catch (error) {
    console.error('Update notes error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update notes',
    };
  }
}

/**
 * Get signed download URL for a document (1 hour expiry)
 */
export async function getDocumentDownloadUrl(filePath: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('staff-documents')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
      console.error('Get download URL error:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Get download URL error:', error);
    return null;
  }
}

/**
 * Mark a document as having a reminder sent
 * (For integration with Appies service)
 */
export async function markReminderSent(staffId: string, documentTypeId: string): Promise<DocumentActionResult> {
  try {
    const { error } = await supabase
      .from('staff_documents')
      .update({ 
        last_reminder_sent_at: new Date().toISOString(),
      })
      .eq('staff_id', staffId)
      .eq('document_type_id', documentTypeId)
      .eq('is_current', true);

    if (error) throw error;

    return {
      success: true,
      message: 'Reminder timestamp updated',
    };
  } catch (error) {
    console.error('Mark reminder sent error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update reminder timestamp',
    };
  }
}

// =====================================================
// ADMIN FUNCTIONS
// =====================================================

/**
 * Initialize required documents for a staff member
 * Called when new staff is created
 * Uses RPC function with proper upsert logic to prevent duplicates
 */
export async function initializeStaffDocuments(staffId: string): Promise<void> {
  try {
    // Call the database function which handles upserts properly
    const { error } = await supabase
      .rpc('initialize_staff_required_documents', { p_staff_id: staffId });

    if (error) {
      console.error('Error initializing staff documents:', error);
      throw error;
    }
  } catch (error) {
    console.error('Initialize staff documents error:', error);
    throw error;
  }
}

// =====================================================
// REAL-TIME SUBSCRIPTIONS
// =====================================================

/**
 * Subscribe to document changes for a staff member
 */
export function subscribeToStaffDocuments(
  staffId: string,
  callback: (payload: any) => void
) {
  const channel = supabase
    .channel(`staff-documents:${staffId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'staff_documents',
        filter: `staff_id=eq.${staffId}`,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

