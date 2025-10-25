/**
 * Central Supabase types export
 * Merges all domain-specific types into the complete Database type
 * Preserves 100% backward compatibility
 */

import type { DatabaseBase, Json } from './base';
import type { StaffTables, StaffViews } from './staff';
import type { ReviewsTables, ReviewsViews } from './reviews';
import type { ContractsTables, ContractsViews } from './contracts';
import type { EmployesTables, EmployesViews } from './employes';
import type { TalentTables, TalentViews } from './talent';
import type { DocumentsTables, DocumentsViews } from './documents';
import type { SystemTables, SystemViews } from './system';

// Re-export Json type
export type { Json } from './base';

// Merge all domain tables
type AllTables = StaffTables & ReviewsTables & ContractsTables & EmployesTables & TalentTables & DocumentsTables & SystemTables;

// Merge all domain views
type AllViews = (StaffViews extends never ? {} : StaffViews) & 
                (ReviewsViews extends never ? {} : ReviewsViews) & 
                (ContractsViews extends never ? {} : ContractsViews) & 
                (EmployesViews extends never ? {} : EmployesViews) & 
                (TalentViews extends never ? {} : TalentViews) & 
                (DocumentsViews extends never ? {} : DocumentsViews) & 
                (SystemViews extends never ? {} : SystemViews);

// Complete Database type with all domains merged
export type Database = DatabaseBase & {
  public: {
    Tables: AllTables
    Views: AllViews
    Functions: {
      can_view_sensitive_data: {
        Args: { target_staff_id: string }
        Returns: boolean
      }
      check_document_expiry: { Args: never; Returns: undefined }
      claim_next_job: {
        Args: { p_job_type?: string }
        Returns: {
          attempts: number | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          error_details: Json | null
          error_message: string | null
          id: string
          job_type: string
          max_attempts: number | null
          payload: Json
          priority: number | null
          processing_time_ms: number | null
          result: Json | null
          started_at: string | null
          status: string | null
        }
        SetofOptions: {
          from: "*"
          to: "processing_queue"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      decrypt_sensitive: { Args: { ciphertext: string }; Returns: string }
      encrypt_sensitive: { Args: { plaintext: string }; Returns: string }
      generate_contract_access_token: {
        Args: {
          hours_valid?: number
          max_downloads?: number
          target_contract_id: string
        }
        Returns: string
      }
      generate_timeline_v2: { Args: { p_employee_id: string }; Returns: number }
      get_contract_at_date: {
        Args: { p_date?: string; p_employee_id: string }
        Returns: Json
      }
      get_current_hours: { Args: { employments_data: Json }; Returns: number }
      get_current_salary:
        | { Args: { employments_data: Json }; Returns: number }
        | {
            Args: { p_staff_id: string }
            Returns: {
              effective_date: string
              gross_monthly: number
              hourly_wage: number
              hours_per_week: number
              scale: string
              trede: string
            }[]
          }
      get_current_salary_v2: {
        Args: { p_employes_employee_id: string }
        Returns: {
          effective_date: string
          gross_monthly: number
          hourly_wage: number
          hours_per_week: number
          scale: string
          trede: string
        }[]
      }
      get_employee_timeline: {
        Args: {
          p_employee_id: string
          p_end_date?: string
          p_start_date?: string
        }
        Returns: Json
      }
      get_encryption_key: { Args: never; Returns: string }
      get_hours_at_date: {
        Args: { p_date?: string; p_employee_id: string }
        Returns: Json
      }
      get_salary_at_date: {
        Args: { p_date?: string; p_employee_id: string }
        Returns: Json
      }
      get_salary_progression: {
        Args: { p_employee_id: string }
        Returns: {
          change_amount: number
          change_percent: number
          effective_date: string
          hourly_wage: number
          monthly_wage: number
        }[]
      }
      get_staff_document_summary: {
        Args: { p_staff_id: string }
        Returns: {
          expired_count: number
          expiring_soon_count: number
          missing_count: number
          total_required: number
          uploaded_count: number
        }[]
      }
      get_staff_list_optimized: {
        Args: never
        Returns: {
          first_contract_date: string
          full_name: string
          has_recent_review: boolean
          last_review_date: string
          location: string
          role: string
          staff_id: string
          status: string
        }[]
      }
      get_system_health_score: {
        Args: never
        Returns: {
          category: string
          details: string
          score: number
          status: string
        }[]
      }
      initialize_staff_required_documents: {
        Args: { p_staff_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_manager_of: { Args: { target_staff_id: string }; Returns: boolean }
      process_background_jobs: {
        Args: never
        Returns: {
          failed_count: number
          job_results: Json[]
          processed_count: number
        }[]
      }
      refresh_contracts_enriched_v2: { Args: never; Returns: undefined }
      refresh_employes_timeline: { Args: never; Returns: undefined }
      retry_failed_jobs: { Args: { older_than?: unknown }; Returns: number }
      schedule_auto_sync: { Args: never; Returns: undefined }
      validate_contract_access_token: {
        Args: { access_token: string }
        Returns: string
      }
    }
    Enums: {
      candidate_decision:
        | "pending"
        | "hired"
        | "on_hold"
        | "not_hired"
        | "withdrawn"
      candidate_status:
        | "application_received"
        | "verified"
        | "trial_invited"
        | "trial_completed"
        | "decision_finalized"
        | "offer_signed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for Supabase Client - preserves original API
type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      candidate_decision: [
        "pending",
        "hired",
        "on_hold",
        "not_hired",
        "withdrawn",
      ],
      candidate_status: [
        "application_received",
        "verified",
        "trial_invited",
        "trial_completed",
        "decision_finalized",
        "offer_signed",
      ],
    },
  },
} as const

