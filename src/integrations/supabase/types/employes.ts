/**
 * Employes Domain Types
 * Auto-generated from Supabase schema
 * Part of types refactoring - preserves all functionality
 */

import type { Json } from './base';

export interface EmployesTables {
      employes_background_jobs: {
        Row: {
          completed_at: string | null
          config: Json | null
          created_at: string | null
          error_message: string | null
          id: string
          job_type: string
          priority: number | null
          progress: Json | null
          scheduled_for: string | null
          snapshot_id: string | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          config?: Json | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_type: string
          priority?: number | null
          progress?: Json | null
          scheduled_for?: string | null
          snapshot_id?: string | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          config?: Json | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          job_type?: string
          priority?: number | null
          progress?: Json | null
          scheduled_for?: string | null
          snapshot_id?: string | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employes_background_jobs_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "employes_data_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      employes_change_detection: {
        Row: {
          change_type: string
          created_at: string | null
          detected_at: string | null
          employee_id: string
          endpoint: string
          id: string
          new_data: Json | null
          new_hash: string | null
          previous_data: Json | null
          previous_hash: string | null
          processed: boolean | null
          processed_at: string | null
          snapshot_id: string | null
        }
        Insert: {
          change_type: string
          created_at?: string | null
          detected_at?: string | null
          employee_id: string
          endpoint: string
          id?: string
          new_data?: Json | null
          new_hash?: string | null
          previous_data?: Json | null
          previous_hash?: string | null
          processed?: boolean | null
          processed_at?: string | null
          snapshot_id?: string | null
        }
        Update: {
          change_type?: string
          created_at?: string | null
          detected_at?: string | null
          employee_id?: string
          endpoint?: string
          id?: string
          new_data?: Json | null
          new_hash?: string | null
          previous_data?: Json | null
          previous_hash?: string | null
          processed?: boolean | null
          processed_at?: string | null
          snapshot_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employes_change_detection_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "employes_data_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      employes_changes: {
        Row: {
          change_type: string | null
          detected_at: string | null
          employee_id: string
          endpoint: string
          field_path: string
          id: string
          is_duplicate: boolean | null
          is_significant: boolean | null
          metadata: Json | null
          new_value: Json | null
          old_value: Json | null
          sync_session_id: string | null
        }
        Insert: {
          change_type?: string | null
          detected_at?: string | null
          employee_id: string
          endpoint: string
          field_path: string
          id?: string
          is_duplicate?: boolean | null
          is_significant?: boolean | null
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          sync_session_id?: string | null
        }
        Update: {
          change_type?: string | null
          detected_at?: string | null
          employee_id?: string
          endpoint?: string
          field_path?: string
          id?: string
          is_duplicate?: boolean | null
          is_significant?: boolean | null
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          sync_session_id?: string | null
        }
        Relationships: []
      }
      employes_data_snapshots: {
        Row: {
          completed_at: string | null
          created_at: string | null
          employees_processed: number | null
          endpoints_collected: Json | null
          errors: Json | null
          id: string
          metadata: Json | null
          snapshot_type: string
          started_at: string | null
          status: string | null
          total_employees: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          employees_processed?: number | null
          endpoints_collected?: Json | null
          errors?: Json | null
          id?: string
          metadata?: Json | null
          snapshot_type: string
          started_at?: string | null
          status?: string | null
          total_employees?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          employees_processed?: number | null
          endpoints_collected?: Json | null
          errors?: Json | null
          id?: string
          metadata?: Json | null
          snapshot_type?: string
          started_at?: string | null
          status?: string | null
          total_employees?: number | null
        }
        Relationships: []
      }
      employes_employee_map: {
        Row: {
          employes_employee_id: string
          id: number
          lms_staff_id: string
          synced_at: string | null
        }
        Insert: {
          employes_employee_id: string
          id?: number
          lms_staff_id: string
          synced_at?: string | null
        }
        Update: {
          employes_employee_id?: string
          id?: number
          lms_staff_id?: string
          synced_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employes_employee_map_lms_staff_id_fkey"
            columns: ["lms_staff_id"]
            isOneToOne: false
            referencedRelation: "contracts_expiring_soon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employes_employee_map_lms_staff_id_fkey"
            columns: ["lms_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_docs_missing_counts"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "employes_employee_map_lms_staff_id_fkey"
            columns: ["lms_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_docs_status_legacy"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "employes_employee_map_lms_staff_id_fkey"
            columns: ["lms_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_legacy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employes_employee_map_lms_staff_id_fkey"
            columns: ["lms_staff_id"]
            isOneToOne: false
            referencedRelation: "staff_secure_view"
            referencedColumns: ["id"]
          },
        ]
      }
      employes_raw_data: {
        Row: {
          api_response: Json
          collected_at: string | null
          collection_issues: Json | null
          confidence_score: number | null
          data_hash: string
          effective_from: string | null
          effective_to: string | null
          employee_id: string
          endpoint: string
          error_message: string | null
          http_status_code: number | null
          id: string
          is_latest: boolean | null
          is_partial: boolean | null
          last_retry_at: string | null
          last_verified_at: string | null
          retry_count: number | null
          retry_succeeded_at: string | null
          superseded_by: string | null
          supersedes: string | null
          sync_session_id: string | null
        }
        Insert: {
          api_response: Json
          collected_at?: string | null
          collection_issues?: Json | null
          confidence_score?: number | null
          data_hash: string
          effective_from?: string | null
          effective_to?: string | null
          employee_id: string
          endpoint: string
          error_message?: string | null
          http_status_code?: number | null
          id?: string
          is_latest?: boolean | null
          is_partial?: boolean | null
          last_retry_at?: string | null
          last_verified_at?: string | null
          retry_count?: number | null
          retry_succeeded_at?: string | null
          superseded_by?: string | null
          supersedes?: string | null
          sync_session_id?: string | null
        }
        Update: {
          api_response?: Json
          collected_at?: string | null
          collection_issues?: Json | null
          confidence_score?: number | null
          data_hash?: string
          effective_from?: string | null
          effective_to?: string | null
          employee_id?: string
          endpoint?: string
          error_message?: string | null
          http_status_code?: number | null
          id?: string
          is_latest?: boolean | null
          is_partial?: boolean | null
          last_retry_at?: string | null
          last_verified_at?: string | null
          retry_count?: number | null
          retry_succeeded_at?: string | null
          superseded_by?: string | null
          supersedes?: string | null
          sync_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_superseded_by"
            columns: ["superseded_by"]
            isOneToOne: false
            referencedRelation: "employes_raw_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_superseded_by"
            columns: ["superseded_by"]
            isOneToOne: false
            referencedRelation: "v_raw_data_needs_retry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_supersedes"
            columns: ["supersedes"]
            isOneToOne: false
            referencedRelation: "employes_raw_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_supersedes"
            columns: ["supersedes"]
            isOneToOne: false
            referencedRelation: "v_raw_data_needs_retry"
            referencedColumns: ["id"]
          },
        ]
      }
      employes_retry_log: {
        Row: {
          employee_id: string
          endpoint: string
          error_message: string | null
          http_status_code: number | null
          id: string
          raw_data_id: string | null
          response_time_ms: number | null
          retry_at: string | null
          retry_attempt: number
          success: boolean
          triggered_by: string | null
        }
        Insert: {
          employee_id: string
          endpoint: string
          error_message?: string | null
          http_status_code?: number | null
          id?: string
          raw_data_id?: string | null
          response_time_ms?: number | null
          retry_at?: string | null
          retry_attempt: number
          success: boolean
          triggered_by?: string | null
        }
        Update: {
          employee_id?: string
          endpoint?: string
          error_message?: string | null
          http_status_code?: number | null
          id?: string
          raw_data_id?: string | null
          response_time_ms?: number | null
          retry_at?: string | null
          retry_attempt?: number
          success?: boolean
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employes_retry_log_raw_data_id_fkey"
            columns: ["raw_data_id"]
            isOneToOne: false
            referencedRelation: "employes_raw_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employes_retry_log_raw_data_id_fkey"
            columns: ["raw_data_id"]
            isOneToOne: false
            referencedRelation: "v_raw_data_needs_retry"
            referencedColumns: ["id"]
          },
        ]
      }
      employes_state_completion_log: {
        Row: {
          completed_at: string | null
          completion_errors: Json | null
          completion_run_id: string
          employee_id: string
          events_completed: number | null
          events_processed: number | null
          id: string
          started_at: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          completion_errors?: Json | null
          completion_run_id?: string
          employee_id: string
          events_completed?: number | null
          events_processed?: number | null
          id?: string
          started_at?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          completion_errors?: Json | null
          completion_run_id?: string
          employee_id?: string
          events_completed?: number | null
          events_processed?: number | null
          id?: string
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employes_state_completion_log_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "contracts_expiring_soon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employes_state_completion_log_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "staff_docs_missing_counts"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "employes_state_completion_log_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "staff_docs_status_legacy"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "employes_state_completion_log_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "staff_legacy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employes_state_completion_log_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "staff_secure_view"
            referencedColumns: ["id"]
          },
        ]
      }
      employes_sync_logs: {
        Row: {
          details: Json | null
          function_name: string
          id: string
          logged_at: string
          operation: string
          status: string
          sync_session_id: string | null
        }
        Insert: {
          details?: Json | null
          function_name: string
          id?: string
          logged_at?: string
          operation: string
          status: string
          sync_session_id?: string | null
        }
        Update: {
          details?: Json | null
          function_name?: string
          id?: string
          logged_at?: string
          operation?: string
          status?: string
          sync_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employes_sync_logs_sync_session_id_fkey"
            columns: ["sync_session_id"]
            isOneToOne: false
            referencedRelation: "employes_sync_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employes_sync_logs_sync_session_id_fkey"
            columns: ["sync_session_id"]
            isOneToOne: false
            referencedRelation: "v_sync_session_history"
            referencedColumns: ["id"]
          },
        ]
      }
      employes_sync_metrics: {
        Row: {
          employee_id: string | null
          id: string
          metadata: Json | null
          metric_date: string
          metric_name: string
          metric_value: number | null
          session_id: string | null
        }
        Insert: {
          employee_id?: string | null
          id?: string
          metadata?: Json | null
          metric_date?: string
          metric_name: string
          metric_value?: number | null
          session_id?: string | null
        }
        Update: {
          employee_id?: string | null
          id?: string
          metadata?: Json | null
          metric_date?: string
          metric_name?: string
          metric_value?: number | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employes_sync_metrics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "employes_sync_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employes_sync_metrics_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_sync_session_history"
            referencedColumns: ["id"]
          },
        ]
      }
      employes_sync_sessions: {
        Row: {
          completed_at: string | null
          failed_records: number | null
          id: string
          notes: string | null
          session_type: string
          source: string | null
          source_function: string | null
          started_at: string
          status: string
          successful_records: number | null
          sync_details: Json | null
          total_records: number | null
          triggered_by: string | null
        }
        Insert: {
          completed_at?: string | null
          failed_records?: number | null
          id?: string
          notes?: string | null
          session_type: string
          source?: string | null
          source_function?: string | null
          started_at?: string
          status?: string
          successful_records?: number | null
          sync_details?: Json | null
          total_records?: number | null
          triggered_by?: string | null
        }
        Update: {
          completed_at?: string | null
          failed_records?: number | null
          id?: string
          notes?: string | null
          session_type?: string
          source?: string | null
          source_function?: string | null
          started_at?: string
          status?: string
          successful_records?: number | null
          sync_details?: Json | null
          total_records?: number | null
          triggered_by?: string | null
        }
        Relationships: []
      }
      employes_tokens: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string
          id: number
          refresh_token: string | null
          updated_at: string | null
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at: string
          id?: number
          refresh_token?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string
          id?: number
          refresh_token?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      employes_wage_map: {
        Row: {
          component_type: string
          employes_wage_component_id: string
          id: number
          lms_contract_id: string
          synced_at: string | null
        }
        Insert: {
          component_type: string
          employes_wage_component_id: string
          id?: number
          lms_contract_id: string
          synced_at?: string | null
        }
        Update: {
          component_type?: string
          employes_wage_component_id?: string
          id?: number
          lms_contract_id?: string
          synced_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employes_wage_map_lms_contract_id_fkey"
            columns: ["lms_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
}

export interface EmployesViews {
      employes_current_state: {
        Row: {
          email: string | null
          employee_id: string | null
          employment_data: Json | null
          employment_start: string | null
          first_name: string | null
          hourly_wage: number | null
          hours_per_week: number | null
          last_updated: string | null
          last_verified_at: string | null
          phone_number: string | null
          status: string | null
          surname: string | null
        }
        Relationships: []
      }
}
