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
            referencedRelation: "contracts_enriched"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_financials: {
        Row: {
          bruto36h_encrypted: string | null
          contract_id: string
          encrypted_at: string | null
          encrypted_by: string | null
          gross_monthly_encrypted: string | null
          hours_per_week_encrypted: string | null
          id: string
          reiskosten_encrypted: string | null
          scale_encrypted: string | null
          trede_encrypted: string | null
        }
        Insert: {
          bruto36h_encrypted?: string | null
          contract_id: string
          encrypted_at?: string | null
          encrypted_by?: string | null
          gross_monthly_encrypted?: string | null
          hours_per_week_encrypted?: string | null
          id?: string
          reiskosten_encrypted?: string | null
          scale_encrypted?: string | null
          trede_encrypted?: string | null
        }
        Update: {
          bruto36h_encrypted?: string | null
          contract_id?: string
          encrypted_at?: string | null
          encrypted_by?: string | null
          gross_monthly_encrypted?: string | null
          hours_per_week_encrypted?: string | null
          id?: string
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
            referencedRelation: "contracts_enriched"
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
            referencedRelation: "staff"
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
            referencedRelation: "staff_secure_view"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "staff"
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
            referencedRelation: "staff_secure_view"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "contracts_enriched"
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
            referencedRelation: "staff"
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
            referencedRelation: "staff_secure_view"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "contracts_enriched"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensitive_data_access_log_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
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
            referencedRelation: "staff_secure_view"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
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
      staff_certificates: {
        Row: {
          file_path: string | null
          id: string
          staff_id: string
          title: string | null
          uploaded_at: string | null
        }
        Insert: {
          file_path?: string | null
          id?: string
          staff_id: string
          title?: string | null
          uploaded_at?: string | null
        }
        Update: {
          file_path?: string | null
          id?: string
          staff_id?: string
          title?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_certificates_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_certificates_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_docs_missing_counts"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_certificates_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_docs_status"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_certificates_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_secure_view"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "staff"
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
      staff_notes: {
        Row: {
          created_at: string | null
          id: string
          is_archived: boolean | null
          note: string | null
          note_type: string | null
          staff_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          note?: string | null
          note_type?: string | null
          staff_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_archived?: boolean | null
          note?: string | null
          note_type?: string | null
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_notes_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_notes_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_docs_missing_counts"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_notes_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_docs_status"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_notes_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_secure_view"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_reviews: {
        Row: {
          created_at: string | null
          id: string
          raise: boolean | null
          review_date: string
          review_type: string | null
          score: number | null
          staff_id: string
          summary: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          raise?: boolean | null
          review_date: string
          review_type?: string | null
          score?: number | null
          staff_id: string
          summary?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          raise?: boolean | null
          review_date?: string
          review_type?: string | null
          score?: number | null
          staff_id?: string
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_reviews_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_reviews_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_docs_missing_counts"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_reviews_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_docs_status"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_reviews_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_secure_view"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "staff"
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
      contracts_enriched: {
        Row: {
          birth_date: string | null
          contract_type: string | null
          created_at: string | null
          department: string | null
          employee_name: string | null
          end_date: string | null
          full_name: string | null
          has_five_star_badge: boolean | null
          id: string | null
          location_key: string | null
          manager: string | null
          manager_key: string | null
          needs_six_month_review: boolean | null
          needs_yearly_review: boolean | null
          pdf_path: string | null
          position: string | null
          signed_at: string | null
          staff_id: string | null
          start_date: string | null
          status: string | null
        }
        Insert: {
          birth_date?: never
          contract_type?: string | null
          created_at?: string | null
          department?: string | null
          employee_name?: string | null
          end_date?: never
          full_name?: string | null
          has_five_star_badge?: never
          id?: string | null
          location_key?: never
          manager?: string | null
          manager_key?: never
          needs_six_month_review?: never
          needs_yearly_review?: never
          pdf_path?: string | null
          position?: never
          signed_at?: string | null
          staff_id?: string | null
          start_date?: never
          status?: string | null
        }
        Update: {
          birth_date?: never
          contract_type?: string | null
          created_at?: string | null
          department?: string | null
          employee_name?: string | null
          end_date?: never
          full_name?: string | null
          has_five_star_badge?: never
          id?: string | null
          location_key?: never
          manager?: string | null
          manager_key?: never
          needs_six_month_review?: never
          needs_yearly_review?: never
          pdf_path?: string | null
          position?: never
          signed_at?: string | null
          staff_id?: string | null
          start_date?: never
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
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
            referencedRelation: "staff_secure_view"
            referencedColumns: ["id"]
          },
        ]
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
      generate_contract_access_token: {
        Args: {
          hours_valid?: number
          max_downloads?: number
          target_contract_id: string
        }
        Returns: string
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
