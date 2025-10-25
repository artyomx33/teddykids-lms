/**
 * TypeScript interfaces for database query results
 * Provides type safety for Supabase queries
 */

/**
 * Document compliance status from staff_docs_status table
 * Requires: staff_docs_status table with is_compliant, staff_id columns
 */
export interface StaffDocsStatus {
  staff_id: string;
  is_compliant: boolean;
}

/**
 * Intern data from staff_with_lms_data view
 * Requires: staff_with_lms_data view with is_intern, intern_year columns
 */
export interface InternData {
  id: string;
  full_name: string;
  intern_year: number | null;
  is_intern: boolean;
}

/**
 * Document counts summary for widgets
 */
export interface DocumentCounts {
  any_missing: number;
  missing_count: number;
  total_staff: number;
  vog_missing?: number;
}

