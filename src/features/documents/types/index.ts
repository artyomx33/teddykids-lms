/**
 * Document Management System - Type Definitions
 * 
 * Purpose: Type-safe interfaces for document tracking
 * Features: Document types, status tracking, expiry management
 */

// =====================================================
// ENUMS & CONSTANTS
// =====================================================

export type DocumentStatus = 'missing' | 'uploaded' | 'expired';

export type DocumentCategory = 
  | 'identity' 
  | 'compliance' 
  | 'certification' 
  | 'education' 
  | 'other';

// Document type codes (matching database)
export const DOCUMENT_CODES = {
  // Required (checklist items)
  IDW: 'IDW',
  ENGLISH_TEST: 'ENGLISH_TEST',
  VOG: 'VOG',
  EHBO: 'EHBO',
  THREE_F: '3F',
  DIPLOMA: 'DIPLOMA',
  PRK: 'PRK',
  
  // Optional
  FCB: 'FCB',
  ID: 'ID',
  BANK_ACCOUNT: 'BANK_ACCOUNT',
  BSN: 'BSN',
  BABY_COURSE: 'BABY_COURSE',
  FG: 'FG',
  STINT_COURSE: 'STINT_COURSE',
  
  // Special
  OTHER: 'OTHER',
} as const;

export type DocumentCode = typeof DOCUMENT_CODES[keyof typeof DOCUMENT_CODES];

// =====================================================
// CORE INTERFACES
// =====================================================

/**
 * Document Type Definition
 * Master configuration for each type of document we track
 */
export interface DocumentType {
  id: string;
  code: DocumentCode;
  name: string;
  description?: string;
  category: DocumentCategory;
  
  // Configuration
  is_required: boolean;
  requires_expiry: boolean;
  default_expiry_months?: number;
  
  // UI
  icon?: string; // Lucide icon name
  sort_order: number;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

/**
 * Staff Document
 * Represents a single uploaded document file
 */
export interface StaffDocument {
  id: string;
  staff_id: string;
  document_type_id: string;
  
  // File info
  file_name?: string;
  file_path?: string;
  file_size?: number;
  mime_type?: string;
  
  // Status
  status: DocumentStatus;
  is_current: boolean; // Which file is the active one
  
  // Dates
  uploaded_at?: string;
  expires_at?: string;
  
  // Custom
  custom_label?: string; // For "OTHER" type
  notes?: string;
  
  // Metadata
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
  
  // Joined data (from queries)
  document_type?: DocumentType;
}

/**
 * Document Summary
 * Aggregated stats for UI cards/badges
 */
export interface DocumentSummary {
  staff_id: string;
  total_required: number;
  uploaded_count: number;
  missing_count: number;
  expired_count: number;
  expiring_soon_count: number;
}

/**
 * Document List Item
 * Flattened view for lists with all needed info
 */
export interface DocumentListItem {
  id: string;
  staff_id: string;
  document_type_id: string; // ✅ ID of the document type (for pre-selection)
  
  // Type info
  code: DocumentCode;
  name: string;
  custom_label?: string;
  display_name: string; // name or custom_label
  icon?: string;
  category: DocumentCategory;
  is_required: boolean;
  
  // Status
  status: DocumentStatus;
  is_current: boolean;
  
  // File info
  file_name?: string;
  file_path?: string;
  file_size?: number;
  mime_type?: string;
  
  // Dates
  uploaded_at?: string;
  expires_at?: string;
  days_until_expiry?: number;
  
  // Notes
  notes?: string;
}

// =====================================================
// API & FORM TYPES
// =====================================================

/**
 * Upload Document Request
 * Data needed to upload a new document
 */
export interface UploadDocumentRequest {
  staff_id: string;
  document_type_id: string;
  file: File;
  custom_label?: string; // Required if type is "OTHER"
  expires_at?: Date; // Required if type requires_expiry
  notes?: string;
}

/**
 * Upload Document Response
 * Result after successful upload
 */
export interface UploadDocumentResponse {
  document: StaffDocument;
  file_url: string;
}

/**
 * Document Filter Options
 * For filtering/sorting document lists
 */
export interface DocumentFilterOptions {
  status?: DocumentStatus | 'all';
  category?: DocumentCategory | 'all';
  is_required?: boolean;
  expiring_within_days?: number;
  search_term?: string;
  sort_by?: 'name' | 'status' | 'uploaded_at' | 'expires_at';
  sort_direction?: 'asc' | 'desc';
}

/**
 * Document Action Result
 * Standard response for document operations
 */
export interface DocumentActionResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

// =====================================================
// UTILITY TYPES
// =====================================================

/**
 * Document Status Badge Props
 * For rendering status indicators
 */
export interface DocumentStatusBadge {
  status: DocumentStatus;
  label: string;
  variant: 'default' | 'destructive' | 'outline' | 'secondary';
  icon?: string;
}

/**
 * Document Expiry Info
 * Calculated expiry details
 */
export interface DocumentExpiryInfo {
  expires_at?: Date;
  days_until_expiry?: number;
  is_expiring_soon: boolean; // < 30 days
  is_expired: boolean;
  status_label: string;
  status_color: 'green' | 'yellow' | 'red' | 'gray';
}

/**
 * Document Upload Progress
 * Track upload state
 */
export interface DocumentUploadProgress {
  file_name: string;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

// =====================================================
// HELPER TYPE GUARDS
// =====================================================

export function isUploadedDocument(doc: StaffDocument): boolean {
  return doc.status === 'uploaded' && doc.is_current;
}

export function isExpiredDocument(doc: StaffDocument): boolean {
  return doc.status === 'expired';
}

export function isMissingDocument(doc: StaffDocument): boolean {
  return doc.status === 'missing';
}

export function requiresExpiry(docType: DocumentType): boolean {
  return docType.requires_expiry;
}

export function isOtherDocument(docType: DocumentType): boolean {
  return docType.code === 'OTHER';
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Calculate days until document expiry
 */
export function getDaysUntilExpiry(expiresAt?: string): number | undefined {
  if (!expiresAt) return undefined;
  
  const expiry = new Date(expiresAt);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Get document expiry info
 */
export function getExpiryInfo(doc: StaffDocument): DocumentExpiryInfo {
  const daysUntil = getDaysUntilExpiry(doc.expires_at);
  
  if (!doc.expires_at) {
    return {
      is_expiring_soon: false,
      is_expired: false,
      status_label: 'No expiry',
      status_color: 'gray',
    };
  }
  
  const isExpired = doc.status === 'expired' || (daysUntil !== undefined && daysUntil < 0);
  const isExpiringSoon = daysUntil !== undefined && daysUntil >= 0 && daysUntil <= 30;
  
  let statusLabel = 'Valid';
  let statusColor: 'green' | 'yellow' | 'red' | 'gray' = 'green';
  
  if (isExpired) {
    statusLabel = 'Expired';
    statusColor = 'red';
  } else if (isExpiringSoon) {
    statusLabel = `Expires in ${daysUntil} days`;
    statusColor = 'yellow';
  } else if (daysUntil !== undefined) {
    statusLabel = `Expires in ${daysUntil} days`;
    statusColor = 'green';
  }
  
  return {
    expires_at: doc.expires_at ? new Date(doc.expires_at) : undefined,
    days_until_expiry: daysUntil,
    is_expiring_soon: isExpiringSoon,
    is_expired: isExpired,
    status_label: statusLabel,
    status_color: statusColor,
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes) return 'Unknown';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Get document display name (custom label or type name)
 */
export function getDocumentDisplayName(doc: StaffDocument | DocumentListItem): string {
  if ('custom_label' in doc && doc.custom_label) {
    return doc.custom_label;
  }
  
  if ('document_type' in doc && doc.document_type) {
    return doc.document_type.name;
  }
  
  if ('name' in doc) {
    return doc.name;
  }
  
  return 'Unknown Document';
}

/**
 * Get status badge configuration
 */
export function getStatusBadge(status: DocumentStatus): DocumentStatusBadge {
  switch (status) {
    case 'uploaded':
      return {
        status,
        label: 'Uploaded',
        variant: 'default',
        icon: 'CheckCircle',
      };
    case 'expired':
      return {
        status,
        label: 'Expired',
        variant: 'destructive',
        icon: 'XCircle',
      };
    case 'missing':
      return {
        status,
        label: 'Missing',
        variant: 'outline',
        icon: 'AlertCircle',
      };
  }
}

