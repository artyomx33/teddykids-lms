/**
 * Document Management System
 * 
 * Complete document tracking solution with:
 * - File uploads & storage
 * - Expiry tracking
 * - Real-time updates
 * - Document type management
 * 
 * Usage:
 * ```tsx
 * import { DocumentStatusCard, useStaffDocuments } from '@/features/documents';
 * 
 * function StaffProfile({ staffId }) {
 *   return <DocumentStatusCard staffId={staffId} />;
 * }
 * ```
 */

// Components
export * from './components';

// Hooks
export * from './hooks';

// Types
export * from './types';

// Services (for advanced use cases)
export * as documentService from './services/documentService';

