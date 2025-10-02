export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      cao_salary_history: {
        Row: {
          bruto36h: number | null
          cao_effective_date: string
          created_at: string | null
          created_by: string | null
          data_source: string | null
          employes_employee_id: string
          gross_monthly: number
          hourly_wage: number | null
          hours_per_week: number
          id: string
          scale: string | null
          trede: string | null
          valid_from: string
          valid_to: string | null
          yearly_wage: number | null
        }
        Insert: {
          bruto36h?: number | null
          cao_effective_date: string
          created_at?: string | null
          created_by?: string | null
          data_source?: string | null
          employes_employee_id: string
          gross_monthly: number
          hourly_wage?: number | null
          hours_per_week: number
          id?: string
          scale?: string | null
          trede?: string | null
          valid_from: string
          valid_to?: string | null
          yearly_wage?: number | null
        }
        Update: {
          bruto36h?: number | null
          cao_effective_date?: string
          created_at?: string | null
          created_by?: string | null
          data_source?: string | null
          employes_employee_id?: string
          gross_monthly?: number
          hourly_wage?: number | null
          hours_per_week?: number
          id?: string
          scale?: string | null
          trede?: string | null
          valid_from?: string
          valid_to?: string | null
          yearly_wage?: number | null
        }
        Relationships: []
      }
      contract_access_tokens: {
        Row: {
          contract_id: string
          created_at: string | null
          created_by: string | null
          current_uses: number | null
          expires_at: string
          id: string
          is_revoked: boolean | null
          last_accessed_at: string | null
          max_uses: number | null
          token: string
        }
        Insert: {
          contract_id: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          expires_at?: string
          id?: string
          is_revoked?: boolean | null
          last_accessed_at?: string | null
          max_uses?: number | null
          token?: string
        }
        Update: {
          contract_id?: string
          created_at?: string | null
          created_by?: string | null
          current_uses?: number | null
          expires_at?: string
          id?: string
          is_revoked?: boolean | null
          last_accessed_at?: string | null
          max_uses?: number | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_access_tokens_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_access_tokens_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts_enriched_v2"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_financials: {
        Row: {
          bruto36h_encrypted: string | null
          cao_effective_date: string | null
          contract_id: string
          data_source: string | null
          encrypted_at: string | null
          encrypted_by: string | null
          gross_monthly_encrypted: string | null
          hours_per_week_encrypted: string | null
          id: string
          last_verified_at: string | null
          reiskosten_encrypted: string | null
          scale_encrypted: string | null
          trede_encrypted: string | null
        }
        Insert: {
          bruto36h_encrypted?: string | null
          cao_effective_date?: string | null
          contract_id: string
          data_source?: string | null
          encrypted_at?: string | null
          encrypted_by?: string | null
          gross_monthly_encrypted?: string | null
          hours_per_week_encrypted?: string | null
          id?: string
          last_verified_at?: string | null
          reiskosten_encrypted?: string | null
          scale_encrypted?: string | null
          trede_encrypted?: string | null
        }
        Update: {
          bruto36h_encrypted?: string | null
          cao_effective_date?: string | null
          contract_id?: string
          data_source?: string | null
          encrypted_at?: string | null
          encrypted_by?: string | null
          gross_monthly_encrypted?: string | null
          hours_per_week_encrypted?: string | null
          id?: string
          last_verified_at?: string | null
          reiskosten_encrypted?: string | null
          scale_encrypted?: string | null
          trede_encrypted?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_financials_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: true
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_financials_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: true
            referencedRelation: "contracts_enriched_v2"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          contract_type: string | null
          created_at: string | null
          department: string | null
          employee_name: string
          employes_employee_id: string | null
          full_name: string | null
          id: string
          manager: string | null
          pdf_path: string | null
          query_params: Json | null
          signed_at: string | null
          staff_id: string | null
          status: string
        }
        Insert: {
          contract_type?: string | null
          created_at?: string | null
          department?: string | null
          employee_name: string
          employes_employee_id?: string | null
          full_name?: string | null
          id?: string
          manager?: string | null
          pdf_path?: string | null
          query_params?: Json | null
          signed_at?: string | null
          staff_id?: string | null
          status?: string
        }
        Update: {
          contract_type?: string | null
          created_at?: string | null
          department?: string | null
          employee_name?: string
          employes_employee_id?: string | null
          full_name?: string | null
          id?: string
          manager?: string | null
          pdf_path?: string | null
          query_params?: Json | null
          signed_at?: string | null
          staff_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "contracts_expiring_soon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_docs_missing_counts"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "contracts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_docs_status"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "contracts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_legacy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_secure_view"
            referencedColumns: ["id"]
          },
        ]
      }
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
            referencedRelation: "staff_docs_status"
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
          created_at: string | null
          data_hash: string
          employee_id: string
          endpoint: string
          id: string
          is_latest: boolean | null
        }
        Insert: {
          api_response: Json
          collected_at?: string | null
          created_at?: string | null
          data_hash: string
          employee_id: string
          endpoint: string
          id?: string
          is_latest?: boolean | null
        }
        Update: {
          api_response?: Json
          collected_at?: string | null
          created_at?: string | null
          data_hash?: string
          employee_id?: string
          endpoint?: string
          id?: string
          is_latest?: boolean | null
        }
        Relationships: []
      }
      employes_sync_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          employes_employee_id: string | null
          error_message: string | null
          id: number
          lms_staff_id: string | null
          message: string | null
          payload: Json | null
          status: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          employes_employee_id?: string | null
          error_message?: string | null
          id?: number
          lms_staff_id?: string | null
          message?: string | null
          payload?: Json | null
          status: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          employes_employee_id?: string | null
          error_message?: string | null
          id?: number
          lms_staff_id?: string | null
          message?: string | null
          payload?: Json | null
          status?: string
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
          {
            foreignKeyName: "employes_wage_map_lms_contract_id_fkey"
            columns: ["lms_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts_enriched_v2"
            referencedColumns: ["id"]
          },
        ]
      }
      encryption_keys: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_name: string
          key_value: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_name: string
          key_value: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_name?: string
          key_value?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          address: string
          code: string
          created_at: string | null
          name: string
        }
        Insert: {
          address: string
          code: string
          created_at?: string | null
          name: string
        }
        Update: {
          address?: string
          code?: string
          created_at?: string | null
          name?: string
        }
        Relationships: []
      }
      managers: {
        Row: {
          can_edit_reviews: boolean | null
          can_view_salary: boolean | null
          created_at: string | null
          id: string
          manager_name: string
          staff_id: string | null
          user_id: string | null
        }
        Insert: {
          can_edit_reviews?: boolean | null
          can_view_salary?: boolean | null
          created_at?: string | null
          id?: string
          manager_name: string
          staff_id?: string | null
          user_id?: string | null
        }
        Update: {
          can_edit_reviews?: boolean | null
          can_view_salary?: boolean | null
          created_at?: string | null
          id?: string
          manager_name?: string
          staff_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "managers_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: true
            referencedRelation: "contracts_expiring_soon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "managers_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: true
            referencedRelation: "staff_docs_missing_counts"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "managers_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: true
            referencedRelation: "staff_docs_status"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "managers_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: true
            referencedRelation: "staff_legacy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "managers_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: true
            referencedRelation: "staff_secure_view"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_archived: boolean | null
          is_read: boolean | null
          message: string
          metadata: Json | null
          severity: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          severity: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_archived?: boolean | null
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          severity?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          created_at: string | null
          employes_employee_id: string
          id: string
          metric_name: string
          metric_value: number | null
          review_id: string | null
        }
        Insert: {
          created_at?: string | null
          employes_employee_id: string
          id?: string
          metric_name: string
          metric_value?: number | null
          review_id?: string | null
        }
        Update: {
          created_at?: string | null
          employes_employee_id?: string
          id?: string
          metric_name?: string
          metric_value?: number | null
          review_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_review"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "staff_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_notes: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          review_id: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          review_id: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          review_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "contracts_expiring_soon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "staff_docs_missing_counts"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "review_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "staff_docs_status"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "review_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "staff_legacy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "staff_secure_view"
            referencedColumns: ["id"]
          },
        ]
      }
      review_schedules: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          next_due_date: string
          staff_id: string
          template_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          next_due_date: string
          staff_id: string
          template_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          next_due_date?: string
          staff_id?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_schedules_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "contracts_expiring_soon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_schedules_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_docs_missing_counts"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "review_schedules_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_docs_status"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "review_schedules_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_legacy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_schedules_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_secure_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_schedules_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "review_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      review_templates: {
        Row: {
          created_at: string | null
          criteria: Json | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          questions: Json | null
          type: string
        }
        Insert: {
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          questions?: Json | null
          type: string
        }
        Update: {
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          questions?: Json | null
          type?: string
        }
        Relationships: []
      }
      sensitive_data_access_log: {
        Row: {
          access_type: string
          accessed_at: string | null
          contract_id: string | null
          data_type: string
          id: string
          ip_address: unknown | null
          staff_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          access_type: string
          accessed_at?: string | null
          contract_id?: string | null
          data_type: string
          id?: string
          ip_address?: unknown | null
          staff_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          access_type?: string
          accessed_at?: string | null
          contract_id?: string | null
          data_type?: string
          id?: string
          ip_address?: unknown | null
          staff_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sensitive_data_access_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensitive_data_access_log_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts_enriched_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensitive_data_access_log_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "contracts_expiring_soon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensitive_data_access_log_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_docs_missing_counts"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "sensitive_data_access_log_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_docs_status"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "sensitive_data_access_log_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_legacy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensitive_data_access_log_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_secure_view"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_certificates: {
        Row: {
          employes_employee_id: string
          file_path: string | null
          id: string
          title: string | null
          uploaded_at: string | null
        }
        Insert: {
          employes_employee_id: string
          file_path?: string | null
          id?: string
          title?: string | null
          uploaded_at?: string | null
        }
        Update: {
          employes_employee_id?: string
          file_path?: string | null
          id?: string
          title?: string | null
          uploaded_at?: string | null
        }
        Relationships: []
      }
      staff_employment_history: {
        Row: {
          change_type: string
          created_at: string | null
          created_by: string | null
          effective_date: string
          employes_employee_id: string | null
          id: string
          new_data: Json | null
          previous_data: Json | null
          staff_id: string
        }
        Insert: {
          change_type: string
          created_at?: string | null
          created_by?: string | null
          effective_date: string
          employes_employee_id?: string | null
          id?: string
          new_data?: Json | null
          previous_data?: Json | null
          staff_id: string
        }
        Update: {
          change_type?: string
          created_at?: string | null
          created_by?: string | null
          effective_date?: string
          employes_employee_id?: string | null
          id?: string
          new_data?: Json | null
          previous_data?: Json | null
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_employment_history_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "contracts_expiring_soon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_employment_history_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_docs_missing_counts"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_employment_history_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_docs_status"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_employment_history_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_legacy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_employment_history_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_secure_view"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_knowledge_completion: {
        Row: {
          attempts: number
          completed_at: string
          doc_id: string
          id: string
          passed: boolean
          score: number | null
          section_id: string | null
          staff_id: string
        }
        Insert: {
          attempts?: number
          completed_at?: string
          doc_id: string
          id?: string
          passed?: boolean
          score?: number | null
          section_id?: string | null
          staff_id: string
        }
        Update: {
          attempts?: number
          completed_at?: string
          doc_id?: string
          id?: string
          passed?: boolean
          score?: number | null
          section_id?: string | null
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_knowledge_completion_doc_id_fkey"
            columns: ["doc_id"]
            isOneToOne: false
            referencedRelation: "tk_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_knowledge_completion_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "tk_document_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_legacy: {
        Row: {
          address_encrypted: string | null
          birth_date: string | null
          birth_date_encrypted: string | null
          bsn_encrypted: string | null
          city: string | null
          contract_type: string | null
          created_at: string | null
          department: string | null
          email: string | null
          employee_number: number | null
          employes_id: string | null
          employment_end_date: string | null
          employment_start_date: string | null
          employment_status: string | null
          encrypted_by: string | null
          full_name: string
          hourly_wage: number | null
          hours_per_week: number | null
          house_number: string | null
          iban: string | null
          iban_encrypted: string | null
          id: string
          intern_year: number | null
          is_intern: boolean | null
          last_sync_at: string | null
          location: string | null
          manager_id: string | null
          nationality: string | null
          phone_encrypted: string | null
          phone_number: string | null
          role: string | null
          salary_amount: number | null
          sensitive_data_encrypted_at: string | null
          staff_docs: Json | null
          start_date: string | null
          status: string | null
          street_address: string | null
          working_hours_per_week: number | null
          zipcode: string | null
        }
        Insert: {
          address_encrypted?: string | null
          birth_date?: string | null
          birth_date_encrypted?: string | null
          bsn_encrypted?: string | null
          city?: string | null
          contract_type?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          employee_number?: number | null
          employes_id?: string | null
          employment_end_date?: string | null
          employment_start_date?: string | null
          employment_status?: string | null
          encrypted_by?: string | null
          full_name: string
          hourly_wage?: number | null
          hours_per_week?: number | null
          house_number?: string | null
          iban?: string | null
          iban_encrypted?: string | null
          id?: string
          intern_year?: number | null
          is_intern?: boolean | null
          last_sync_at?: string | null
          location?: string | null
          manager_id?: string | null
          nationality?: string | null
          phone_encrypted?: string | null
          phone_number?: string | null
          role?: string | null
          salary_amount?: number | null
          sensitive_data_encrypted_at?: string | null
          staff_docs?: Json | null
          start_date?: string | null
          status?: string | null
          street_address?: string | null
          working_hours_per_week?: number | null
          zipcode?: string | null
        }
        Update: {
          address_encrypted?: string | null
          birth_date?: string | null
          birth_date_encrypted?: string | null
          bsn_encrypted?: string | null
          city?: string | null
          contract_type?: string | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          employee_number?: number | null
          employes_id?: string | null
          employment_end_date?: string | null
          employment_start_date?: string | null
          employment_status?: string | null
          encrypted_by?: string | null
          full_name?: string
          hourly_wage?: number | null
          hours_per_week?: number | null
          house_number?: string | null
          iban?: string | null
          iban_encrypted?: string | null
          id?: string
          intern_year?: number | null
          is_intern?: boolean | null
          last_sync_at?: string | null
          location?: string | null
          manager_id?: string | null
          nationality?: string | null
          phone_encrypted?: string | null
          phone_number?: string | null
          role?: string | null
          salary_amount?: number | null
          sensitive_data_encrypted_at?: string | null
          staff_docs?: Json | null
          start_date?: string | null
          status?: string | null
          street_address?: string | null
          working_hours_per_week?: number | null
          zipcode?: string | null
        }
        Relationships: []
      }
      staff_notes: {
        Row: {
          created_at: string | null
          employes_employee_id: string
          id: string
          is_archived: boolean | null
          note: string | null
          note_type: string | null
        }
        Insert: {
          created_at?: string | null
          employes_employee_id: string
          id?: string
          is_archived?: boolean | null
          note?: string | null
          note_type?: string | null
        }
        Update: {
          created_at?: string | null
          employes_employee_id?: string
          id?: string
          is_archived?: boolean | null
          note?: string | null
          note_type?: string | null
        }
        Relationships: []
      }
      staff_reviews: {
        Row: {
          created_at: string | null
          employes_employee_id: string
          id: string
          overall_score: number | null
          raise: boolean | null
          review_date: string
          review_type: string | null
          score: number | null
          star_rating: number | null
          status: string | null
          summary: string | null
          template_id: string | null
        }
        Insert: {
          created_at?: string | null
          employes_employee_id: string
          id?: string
          overall_score?: number | null
          raise?: boolean | null
          review_date: string
          review_type?: string | null
          score?: number | null
          star_rating?: number | null
          status?: string | null
          summary?: string | null
          template_id?: string | null
        }
        Update: {
          created_at?: string | null
          employes_employee_id?: string
          id?: string
          overall_score?: number | null
          raise?: boolean | null
          review_date?: string
          review_type?: string | null
          score?: number | null
          star_rating?: number | null
          status?: string | null
          summary?: string | null
          template_id?: string | null
        }
        Relationships: []
      }
      staff_sync_conflicts: {
        Row: {
          conflict_type: string
          created_at: string | null
          employes_data: Json | null
          employes_employee_id: string
          id: string
          lms_data: Json | null
          resolution_status: string | null
          resolved_at: string | null
          resolved_by: string | null
          staff_id: string | null
        }
        Insert: {
          conflict_type: string
          created_at?: string | null
          employes_data?: Json | null
          employes_employee_id: string
          id?: string
          lms_data?: Json | null
          resolution_status?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          staff_id?: string | null
        }
        Update: {
          conflict_type?: string
          created_at?: string | null
          employes_data?: Json | null
          employes_employee_id?: string
          id?: string
          lms_data?: Json | null
          resolution_status?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          staff_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_sync_conflicts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "contracts_expiring_soon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_sync_conflicts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_docs_missing_counts"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_sync_conflicts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_docs_status"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_sync_conflicts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_legacy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_sync_conflicts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_secure_view"
            referencedColumns: ["id"]
          },
        ]
      }
      tk_document_sections: {
        Row: {
          content: string
          created_at: string
          doc_id: string
          id: string
          key_points: Json
          questions: Json
          section_number: number
          summary: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          doc_id: string
          id?: string
          key_points?: Json
          questions?: Json
          section_number: number
          summary: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          doc_id?: string
          id?: string
          key_points?: Json
          questions?: Json
          section_number?: number
          summary?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tk_document_sections_doc_id_fkey"
            columns: ["doc_id"]
            isOneToOne: false
            referencedRelation: "tk_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      tk_documents: {
        Row: {
          created_at: string
          description: string | null
          id: string
          pdf_path: string | null
          required: boolean
          slug: string
          title: string
          updated_at: string
          version: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          pdf_path?: string | null
          required?: boolean
          slug: string
          title: string
          updated_at?: string
          version?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          pdf_path?: string | null
          required?: boolean
          slug?: string
          title?: string
          updated_at?: string
          version?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      contracts_enriched_v2: {
        Row: {
          avg_review_score: number | null
          birth_date: string | null
          contract_type: string | null
          created_at: string | null
          department: string | null
          email: string | null
          employee_name: string | null
          employes_employee_id: string | null
          employment_end_date: string | null
          employment_status: string | null
          end_date: string | null
          first_start: string | null
          full_name: string | null
          has_five_star_badge: boolean | null
          hours_per_week: number | null
          id: string | null
          last_review_date: string | null
          location_key: string | null
          manager: string | null
          needs_six_month_review: boolean | null
          needs_yearly_review: boolean | null
          next_review_due: string | null
          pdf_path: string | null
          phone_number: string | null
          position: string | null
          query_params: Json | null
          salary_amount: number | null
          signed_at: string | null
          staff_department: string | null
          staff_full_name: string | null
          start_date: string | null
          status: string | null
        }
        Relationships: []
      }
      contracts_expiring_soon: {
        Row: {
          contract_type: string | null
          days_until_expiry: number | null
          employment_end_date: string | null
          employment_start_date: string | null
          full_name: string | null
          id: string | null
          location: string | null
          role: string | null
          urgency_level: string | null
        }
        Insert: {
          contract_type?: string | null
          days_until_expiry?: never
          employment_end_date?: string | null
          employment_start_date?: string | null
          full_name?: string | null
          id?: string | null
          location?: string | null
          role?: string | null
          urgency_level?: never
        }
        Update: {
          contract_type?: string | null
          days_until_expiry?: never
          employment_end_date?: string | null
          employment_start_date?: string | null
          full_name?: string | null
          id?: string | null
          location?: string | null
          role?: string | null
          urgency_level?: never
        }
        Relationships: []
      }
      recent_employment_changes: {
        Row: {
          change_type: string | null
          created_at: string | null
          effective_date: string | null
          employes_employee_id: string | null
          full_name: string | null
          id: string | null
          new_data: Json | null
          previous_data: Json | null
          staff_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_employment_history_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "contracts_expiring_soon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_employment_history_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_docs_missing_counts"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_employment_history_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_docs_status"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_employment_history_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_legacy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_employment_history_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_secure_view"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          birth_date: string | null
          contract_type: string | null
          created_at: string | null
          department: string | null
          email: string | null
          employes_id: string | null
          employment_end_date: string | null
          employment_start_date: string | null
          full_name: string | null
          hourly_wage: number | null
          hours_per_week: number | null
          id: string | null
          last_sync_at: string | null
          location: string | null
          phone_number: string | null
          role: string | null
          salary_amount: number | null
          status: string | null
        }
        Relationships: []
      }
      staff_docs_missing_counts: {
        Row: {
          full_name: string | null
          missing_count: number | null
          staff_id: string | null
        }
        Insert: {
          full_name?: string | null
          missing_count?: never
          staff_id?: string | null
        }
        Update: {
          full_name?: string | null
          missing_count?: never
          staff_id?: string | null
        }
        Relationships: []
      }
      staff_docs_status: {
        Row: {
          bank_card_missing: boolean | null
          employees_missing: boolean | null
          full_name: string | null
          id_card_missing: boolean | null
          intern_year: number | null
          is_intern: boolean | null
          missing_count: number | null
          pok_missing: boolean | null
          portobase_missing: boolean | null
          prk_missing: boolean | null
          staff_id: string | null
          vog_missing: boolean | null
        }
        Insert: {
          bank_card_missing?: never
          employees_missing?: never
          full_name?: string | null
          id_card_missing?: never
          intern_year?: number | null
          is_intern?: boolean | null
          missing_count?: never
          pok_missing?: never
          portobase_missing?: never
          prk_missing?: never
          staff_id?: string | null
          vog_missing?: never
        }
        Update: {
          bank_card_missing?: never
          employees_missing?: never
          full_name?: string | null
          id_card_missing?: never
          intern_year?: number | null
          is_intern?: boolean | null
          missing_count?: never
          pok_missing?: never
          portobase_missing?: never
          prk_missing?: never
          staff_id?: string | null
          vog_missing?: never
        }
        Relationships: []
      }
      staff_secure_view: {
        Row: {
          address: string | null
          bsn: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          iban: string | null
          id: string | null
          location: string | null
          role: string | null
          status: string | null
        }
        Insert: {
          address?: never
          bsn?: never
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          iban?: never
          id?: string | null
          location?: string | null
          role?: string | null
          status?: string | null
        }
        Update: {
          address?: never
          bsn?: never
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          iban?: never
          id?: string | null
          location?: string | null
          role?: string | null
          status?: string | null
        }
        Relationships: []
      }
      unresolved_sync_conflicts: {
        Row: {
          conflict_type: string | null
          created_at: string | null
          employes_data: Json | null
          employes_employee_id: string | null
          full_name: string | null
          id: string | null
          lms_data: Json | null
          resolution_status: string | null
          staff_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_sync_conflicts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "contracts_expiring_soon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_sync_conflicts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_docs_missing_counts"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_sync_conflicts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_docs_status"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_sync_conflicts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_legacy"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_sync_conflicts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_secure_view"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      can_view_sensitive_data: {
        Args: { target_staff_id: string }
        Returns: boolean
      }
      decrypt_sensitive: {
        Args: { ciphertext: string }
        Returns: string
      }
      encrypt_sensitive: {
        Args: { plaintext: string }
        Returns: string
      }
      gbt_bit_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_bool_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_bool_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_bpchar_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_bytea_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_cash_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_cash_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_date_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_date_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_enum_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_enum_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_float4_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_float4_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_float8_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_float8_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_inet_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_int2_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_int2_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_int4_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_int4_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_int8_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_int8_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_intv_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_intv_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_intv_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_macad_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_macad_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_macad8_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_macad8_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_numeric_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_oid_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_oid_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_text_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_time_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_time_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_timetz_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_ts_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_ts_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_tstz_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_uuid_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_uuid_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_var_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbt_var_fetch: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey_var_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey_var_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey16_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey16_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey2_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey2_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey32_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey32_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey4_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey4_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey8_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gbtreekey8_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      generate_contract_access_token: {
        Args: {
          hours_valid?: number
          max_downloads?: number
          target_contract_id: string
        }
        Returns: string
      }
      get_current_salary: {
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
      get_encryption_key: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_staff_list_optimized: {
        Args: Record<PropertyKey, never>
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
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_manager_of: {
        Args: { target_staff_id: string }
        Returns: boolean
      }
      process_background_jobs: {
        Args: Record<PropertyKey, never>
        Returns: {
          failed_count: number
          job_results: Json[]
          processed_count: number
        }[]
      }
      refresh_contracts_enriched_v2: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      schedule_auto_sync: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      validate_contract_access_token: {
        Args: { access_token: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

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
    Enums: {},
  },
} as const
