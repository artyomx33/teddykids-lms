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
      applications: {
        Row: {
          application_status: string | null
          created_at: string | null
          disc_profile: Json
          id: string
          staff_id: string
          updated_at: string | null
        }
        Insert: {
          application_status?: string | null
          created_at?: string | null
          disc_profile: Json
          id?: string
          staff_id: string
          updated_at?: string | null
        }
        Update: {
          application_status?: string | null
          created_at?: string | null
          disc_profile?: Json
          id?: string
          staff_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      candidate_employes_export: {
        Row: {
          ai_insights: Json | null
          candidate_id: string
          contract_type: string
          created_at: string | null
          department: string
          disc_profile: Json | null
          email: string
          employee_number: string | null
          employes_id: string | null
          employes_synced_at: string | null
          export_package_url: string | null
          exported_at: string | null
          exported_by: string | null
          full_name: string
          hourly_wage: number | null
          hours_per_week: number
          id: string
          location: string
          manager: string
          notes: string | null
          phone: string | null
          position: string
          salary_amount: number | null
          start_date: string
          sync_status: string | null
          trial_summary: Json | null
          updated_at: string | null
        }
        Insert: {
          ai_insights?: Json | null
          candidate_id: string
          contract_type: string
          created_at?: string | null
          department: string
          disc_profile?: Json | null
          email: string
          employee_number?: string | null
          employes_id?: string | null
          employes_synced_at?: string | null
          export_package_url?: string | null
          exported_at?: string | null
          exported_by?: string | null
          full_name: string
          hourly_wage?: number | null
          hours_per_week: number
          id?: string
          location: string
          manager: string
          notes?: string | null
          phone?: string | null
          position: string
          salary_amount?: number | null
          start_date: string
          sync_status?: string | null
          trial_summary?: Json | null
          updated_at?: string | null
        }
        Update: {
          ai_insights?: Json | null
          candidate_id?: string
          contract_type?: string
          created_at?: string | null
          department?: string
          disc_profile?: Json | null
          email?: string
          employee_number?: string | null
          employes_id?: string | null
          employes_synced_at?: string | null
          export_package_url?: string | null
          exported_at?: string | null
          exported_by?: string | null
          full_name?: string
          hourly_wage?: number | null
          hours_per_week?: number
          id?: string
          location?: string
          manager?: string
          notes?: string | null
          phone?: string | null
          position?: string
          salary_amount?: number | null
          start_date?: string
          sync_status?: string | null
          trial_summary?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_employes_export_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_employes_export_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates_ready_for_export"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_employes_export_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates_with_trials"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_events: {
        Row: {
          candidate_id: string
          created_at: string | null
          event_description: string
          event_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          new_value: string | null
          old_value: string | null
          triggered_by: string | null
          triggered_by_name: string | null
          user_agent: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          event_description: string
          event_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_value?: string | null
          old_value?: string | null
          triggered_by?: string | null
          triggered_by_name?: string | null
          user_agent?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          event_description?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_value?: string | null
          old_value?: string | null
          triggered_by?: string | null
          triggered_by_name?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_events_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_events_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates_ready_for_export"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_events_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates_with_trials"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_trial_reviews: {
        Row: {
          candidate_id: string
          checklist_adaptability: number
          checklist_communication_skills: number
          checklist_follows_instructions: number
          checklist_initiative: number
          checklist_interaction_with_children: number
          checklist_punctuality: number
          checklist_safety_awareness: number
          checklist_teamwork: number
          children_response: string | null
          concerns: string | null
          created_at: string | null
          hire_confidence: number | null
          id: string
          is_final: boolean | null
          overall_performance: number | null
          post_trial_notes: string
          post_trial_rating: number
          pre_trial_expectations: string | null
          pre_trial_notes: string | null
          pre_trial_rating: number | null
          reviewed_by: string | null
          specific_incidents: string | null
          strengths: string | null
          supervisor_email: string | null
          supervisor_id: string | null
          supervisor_name: string
          team_fit: string | null
          trial_date: string
          trial_duration_hours: number | null
          trial_group: string
          trial_location: string
          trial_style: string | null
          updated_at: string | null
          would_hire: boolean | null
        }
        Insert: {
          candidate_id: string
          checklist_adaptability: number
          checklist_communication_skills: number
          checklist_follows_instructions: number
          checklist_initiative: number
          checklist_interaction_with_children: number
          checklist_punctuality: number
          checklist_safety_awareness: number
          checklist_teamwork: number
          children_response?: string | null
          concerns?: string | null
          created_at?: string | null
          hire_confidence?: number | null
          id?: string
          is_final?: boolean | null
          overall_performance?: number | null
          post_trial_notes: string
          post_trial_rating: number
          pre_trial_expectations?: string | null
          pre_trial_notes?: string | null
          pre_trial_rating?: number | null
          reviewed_by?: string | null
          specific_incidents?: string | null
          strengths?: string | null
          supervisor_email?: string | null
          supervisor_id?: string | null
          supervisor_name: string
          team_fit?: string | null
          trial_date: string
          trial_duration_hours?: number | null
          trial_group: string
          trial_location: string
          trial_style?: string | null
          updated_at?: string | null
          would_hire?: boolean | null
        }
        Update: {
          candidate_id?: string
          checklist_adaptability?: number
          checklist_communication_skills?: number
          checklist_follows_instructions?: number
          checklist_initiative?: number
          checklist_interaction_with_children?: number
          checklist_punctuality?: number
          checklist_safety_awareness?: number
          checklist_teamwork?: number
          children_response?: string | null
          concerns?: string | null
          created_at?: string | null
          hire_confidence?: number | null
          id?: string
          is_final?: boolean | null
          overall_performance?: number | null
          post_trial_notes?: string
          post_trial_rating?: number
          pre_trial_expectations?: string | null
          pre_trial_notes?: string | null
          pre_trial_rating?: number | null
          reviewed_by?: string | null
          specific_incidents?: string | null
          strengths?: string | null
          supervisor_email?: string | null
          supervisor_id?: string | null
          supervisor_name?: string
          team_fit?: string | null
          trial_date?: string
          trial_duration_hours?: number | null
          trial_group?: string
          trial_location?: string
          trial_style?: string | null
          updated_at?: string | null
          would_hire?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_trial_reviews_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_trial_reviews_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates_ready_for_export"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_trial_reviews_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates_with_trials"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          ai_match_score: number | null
          application_date: string
          assessment_answers: Json | null
          badge_description: string | null
          badge_emoji: string | null
          badge_title: string | null
          converted_to_staff: boolean | null
          created_at: string | null
          created_by: string | null
          date_of_birth: string | null
          decision: Database["public"]["Enums"]["candidate_decision"] | null
          decision_date: string | null
          decision_reason: string | null
          disc_profile: Json | null
          docs_cv_url: string | null
          docs_diploma_url: string | null
          docs_id_url: string | null
          docs_other_urls: Json | null
          email: string
          employes_id: string | null
          full_name: string
          group_fit: string | null
          hr_tags: string[] | null
          id: string
          internal_notes: Json | null
          language: string
          last_updated_by: string | null
          overall_score: number | null
          passed: boolean | null
          phone: string | null
          position_applied: string | null
          primary_disc_color: string | null
          redflag_count: number | null
          role_applied: string
          secondary_disc_color: string | null
          staff_id: string | null
          status: Database["public"]["Enums"]["candidate_status"]
          trial_date: string | null
          trial_group: string | null
          trial_location: string | null
          trial_scheduled_at: string | null
          updated_at: string | null
        }
        Insert: {
          ai_match_score?: number | null
          application_date?: string
          assessment_answers?: Json | null
          badge_description?: string | null
          badge_emoji?: string | null
          badge_title?: string | null
          converted_to_staff?: boolean | null
          created_at?: string | null
          created_by?: string | null
          date_of_birth?: string | null
          decision?: Database["public"]["Enums"]["candidate_decision"] | null
          decision_date?: string | null
          decision_reason?: string | null
          disc_profile?: Json | null
          docs_cv_url?: string | null
          docs_diploma_url?: string | null
          docs_id_url?: string | null
          docs_other_urls?: Json | null
          email: string
          employes_id?: string | null
          full_name: string
          group_fit?: string | null
          hr_tags?: string[] | null
          id?: string
          internal_notes?: Json | null
          language: string
          last_updated_by?: string | null
          overall_score?: number | null
          passed?: boolean | null
          phone?: string | null
          position_applied?: string | null
          primary_disc_color?: string | null
          redflag_count?: number | null
          role_applied: string
          secondary_disc_color?: string | null
          staff_id?: string | null
          status?: Database["public"]["Enums"]["candidate_status"]
          trial_date?: string | null
          trial_group?: string | null
          trial_location?: string | null
          trial_scheduled_at?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_match_score?: number | null
          application_date?: string
          assessment_answers?: Json | null
          badge_description?: string | null
          badge_emoji?: string | null
          badge_title?: string | null
          converted_to_staff?: boolean | null
          created_at?: string | null
          created_by?: string | null
          date_of_birth?: string | null
          decision?: Database["public"]["Enums"]["candidate_decision"] | null
          decision_date?: string | null
          decision_reason?: string | null
          disc_profile?: Json | null
          docs_cv_url?: string | null
          docs_diploma_url?: string | null
          docs_id_url?: string | null
          docs_other_urls?: Json | null
          email?: string
          employes_id?: string | null
          full_name?: string
          group_fit?: string | null
          hr_tags?: string[] | null
          id?: string
          internal_notes?: Json | null
          language?: string
          last_updated_by?: string | null
          overall_score?: number | null
          passed?: boolean | null
          phone?: string | null
          position_applied?: string | null
          primary_disc_color?: string | null
          redflag_count?: number | null
          role_applied?: string
          secondary_disc_color?: string | null
          staff_id?: string | null
          status?: Database["public"]["Enums"]["candidate_status"]
          trial_date?: string | null
          trial_group?: string | null
          trial_location?: string | null
          trial_scheduled_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cao_salary_history: {
        Row: {
          bruto36h: number | null
          cao_effective_date: string
          created_at: string | null
          created_by: string | null
          data_source: string | null
          gross_monthly: number
          hourly_wage: number | null
          hours_per_week: number
          id: string
          scale: string | null
          staff_id: string | null
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
          gross_monthly: number
          hourly_wage?: number | null
          hours_per_week: number
          id?: string
          scale?: string | null
          staff_id?: string | null
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
          gross_monthly?: number
          hourly_wage?: number | null
          hours_per_week?: number
          id?: string
          scale?: string | null
          staff_id?: string | null
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
            referencedRelation: "staff_docs_status_legacy"
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
      disc_mini_questions: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          options: Json
          question_text: string
          question_type: string | null
          usage_count: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          options: Json
          question_text: string
          question_type?: string | null
          usage_count?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          options?: Json
          question_text?: string
          question_type?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      document_types: {
        Row: {
          category: string
          code: string
          created_at: string | null
          default_expiry_months: number | null
          description: string | null
          icon: string | null
          id: string
          is_required: boolean | null
          name: string
          requires_expiry: boolean | null
          sort_order: number
          updated_at: string | null
        }
        Insert: {
          category: string
          code: string
          created_at?: string | null
          default_expiry_months?: number | null
          description?: string | null
          icon?: string | null
          id?: string
          is_required?: boolean | null
          name: string
          requires_expiry?: boolean | null
          sort_order: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          code?: string
          created_at?: string | null
          default_expiry_months?: number | null
          description?: string | null
          icon?: string | null
          id?: string
          is_required?: boolean | null
          name?: string
          requires_expiry?: boolean | null
          sort_order?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      employee_info: {
        Row: {
          assigned_location: string | null
          created_at: string | null
          custom_role: string | null
          intern_year: number | null
          is_intern: boolean | null
          notes: string | null
          staff_id: string
          tags: string[] | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          assigned_location?: string | null
          created_at?: string | null
          custom_role?: string | null
          intern_year?: number | null
          is_intern?: boolean | null
          notes?: string | null
          staff_id: string
          tags?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          assigned_location?: string | null
          created_at?: string | null
          custom_role?: string | null
          intern_year?: number | null
          is_intern?: boolean | null
          notes?: string | null
          staff_id?: string
          tags?: string[] | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
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
      employes_timeline_v2: {
        Row: {
          annual_salary_at_event: number | null
          birth_date_at_event: string | null
          change_amount: number | null
          change_confidence: number | null
          change_id: string | null
          change_percentage: number | null
          change_reason: string | null
          change_source: string | null
          contract_end_date: string | null
          contract_id_at_event: string | null
          contract_milestone_data: Json | null
          contract_milestone_type: string | null
          contract_pdf_path: string | null
          contract_phase: string | null
          contract_start_date: string | null
          contract_type_at_event: string | null
          cost_center_code_at_event: string | null
          cost_center_name_at_event: string | null
          created_at: string | null
          created_by: string | null
          days_per_week_at_event: number | null
          days_until_expiry: number | null
          department_at_event: string | null
          display_priority: number | null
          email_at_event: string | null
          employee_id: string
          employee_number_at_event: string | null
          employment_type_at_event: string | null
          end_time_at_event: string | null
          event_data: Json | null
          event_date: string
          event_description: string | null
          event_title: string
          event_type: string
          expiry_warning_level: string | null
          fields_changed: Json | null
          first_name_at_event: string | null
          function_name_at_event: string | null
          hour_wage_at_event: number | null
          hours_at_event: number | null
          hours_per_week_at_event: number | null
          id: string
          is_manual: boolean | null
          is_milestone: boolean | null
          is_synthetic: boolean | null
          last_name_at_event: string | null
          manager_id_at_event: string | null
          manager_name_at_event: string | null
          manual_notes: string | null
          milestone_type: string | null
          month_wage_at_event: number | null
          net_monthly_at_event: number | null
          new_value: Json | null
          notice_period_days_at_event: number | null
          parent_event_id: string | null
          phase_at_event: string | null
          previous_value: Json | null
          probation_end_date_at_event: string | null
          role_at_event: string | null
          salary_at_event: number | null
          sequence_order: number | null
          source_change_id: string | null
          start_time_at_event: string | null
          state_version: number | null
          status_at_event: string | null
        }
        Insert: {
          annual_salary_at_event?: number | null
          birth_date_at_event?: string | null
          change_amount?: number | null
          change_confidence?: number | null
          change_id?: string | null
          change_percentage?: number | null
          change_reason?: string | null
          change_source?: string | null
          contract_end_date?: string | null
          contract_id_at_event?: string | null
          contract_milestone_data?: Json | null
          contract_milestone_type?: string | null
          contract_pdf_path?: string | null
          contract_phase?: string | null
          contract_start_date?: string | null
          contract_type_at_event?: string | null
          cost_center_code_at_event?: string | null
          cost_center_name_at_event?: string | null
          created_at?: string | null
          created_by?: string | null
          days_per_week_at_event?: number | null
          days_until_expiry?: number | null
          department_at_event?: string | null
          display_priority?: number | null
          email_at_event?: string | null
          employee_id: string
          employee_number_at_event?: string | null
          employment_type_at_event?: string | null
          end_time_at_event?: string | null
          event_data?: Json | null
          event_date: string
          event_description?: string | null
          event_title: string
          event_type: string
          expiry_warning_level?: string | null
          fields_changed?: Json | null
          first_name_at_event?: string | null
          function_name_at_event?: string | null
          hour_wage_at_event?: number | null
          hours_at_event?: number | null
          hours_per_week_at_event?: number | null
          id?: string
          is_manual?: boolean | null
          is_milestone?: boolean | null
          is_synthetic?: boolean | null
          last_name_at_event?: string | null
          manager_id_at_event?: string | null
          manager_name_at_event?: string | null
          manual_notes?: string | null
          milestone_type?: string | null
          month_wage_at_event?: number | null
          net_monthly_at_event?: number | null
          new_value?: Json | null
          notice_period_days_at_event?: number | null
          parent_event_id?: string | null
          phase_at_event?: string | null
          previous_value?: Json | null
          probation_end_date_at_event?: string | null
          role_at_event?: string | null
          salary_at_event?: number | null
          sequence_order?: number | null
          source_change_id?: string | null
          start_time_at_event?: string | null
          state_version?: number | null
          status_at_event?: string | null
        }
        Update: {
          annual_salary_at_event?: number | null
          birth_date_at_event?: string | null
          change_amount?: number | null
          change_confidence?: number | null
          change_id?: string | null
          change_percentage?: number | null
          change_reason?: string | null
          change_source?: string | null
          contract_end_date?: string | null
          contract_id_at_event?: string | null
          contract_milestone_data?: Json | null
          contract_milestone_type?: string | null
          contract_pdf_path?: string | null
          contract_phase?: string | null
          contract_start_date?: string | null
          contract_type_at_event?: string | null
          cost_center_code_at_event?: string | null
          cost_center_name_at_event?: string | null
          created_at?: string | null
          created_by?: string | null
          days_per_week_at_event?: number | null
          days_until_expiry?: number | null
          department_at_event?: string | null
          display_priority?: number | null
          email_at_event?: string | null
          employee_id?: string
          employee_number_at_event?: string | null
          employment_type_at_event?: string | null
          end_time_at_event?: string | null
          event_data?: Json | null
          event_date?: string
          event_description?: string | null
          event_title?: string
          event_type?: string
          expiry_warning_level?: string | null
          fields_changed?: Json | null
          first_name_at_event?: string | null
          function_name_at_event?: string | null
          hour_wage_at_event?: number | null
          hours_at_event?: number | null
          hours_per_week_at_event?: number | null
          id?: string
          is_manual?: boolean | null
          is_milestone?: boolean | null
          is_synthetic?: boolean | null
          last_name_at_event?: string | null
          manager_id_at_event?: string | null
          manager_name_at_event?: string | null
          manual_notes?: string | null
          milestone_type?: string | null
          month_wage_at_event?: number | null
          net_monthly_at_event?: number | null
          new_value?: Json | null
          notice_period_days_at_event?: number | null
          parent_event_id?: string | null
          phase_at_event?: string | null
          previous_value?: Json | null
          probation_end_date_at_event?: string | null
          role_at_event?: string | null
          salary_at_event?: number | null
          sequence_order?: number | null
          source_change_id?: string | null
          start_time_at_event?: string | null
          state_version?: number | null
          status_at_event?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employes_timeline_v2_change_id_fkey"
            columns: ["change_id"]
            isOneToOne: false
            referencedRelation: "employes_changes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employes_timeline_v2_parent_event_id_fkey"
            columns: ["parent_event_id"]
            isOneToOne: false
            referencedRelation: "employes_timeline_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employes_timeline_v2_source_change_id_fkey"
            columns: ["source_change_id"]
            isOneToOne: false
            referencedRelation: "employes_changes"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "staff_docs_status_legacy"
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
            referencedRelation: "staff_reviews_legacy"
            referencedColumns: ["id"]
          },
        ]
      }
      processing_queue: {
        Row: {
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
        Insert: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          job_type: string
          max_attempts?: number | null
          payload: Json
          priority?: number | null
          processing_time_ms?: number | null
          result?: Json | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          error_details?: Json | null
          error_message?: string | null
          id?: string
          job_type?: string
          max_attempts?: number | null
          payload?: Json
          priority?: number | null
          processing_time_ms?: number | null
          result?: Json | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: []
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
            referencedRelation: "staff_docs_status_legacy"
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
          created_at: string
          created_by: string | null
          criteria: Json | null
          description: string | null
          disc_injection_enabled: boolean | null
          emotional_metrics: Json | null
          gamification_enabled: boolean | null
          id: string
          is_active: boolean
          name: string
          questions: Json
          scoring_method: string | null
          self_assessment_required: boolean | null
          type: string
          updated_at: string
          xp_base_reward: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          criteria?: Json | null
          description?: string | null
          disc_injection_enabled?: boolean | null
          emotional_metrics?: Json | null
          gamification_enabled?: boolean | null
          id?: string
          is_active?: boolean
          name: string
          questions?: Json
          scoring_method?: string | null
          self_assessment_required?: boolean | null
          type: string
          updated_at?: string
          xp_base_reward?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          criteria?: Json | null
          description?: string | null
          disc_injection_enabled?: boolean | null
          emotional_metrics?: Json | null
          gamification_enabled?: boolean | null
          id?: string
          is_active?: boolean
          name?: string
          questions?: Json
          scoring_method?: string | null
          self_assessment_required?: boolean | null
          type?: string
          updated_at?: string
          xp_base_reward?: number | null
        }
        Relationships: []
      }
      review_templates_legacy: {
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
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
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
            referencedRelation: "staff_docs_status_legacy"
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
          certificate_name: string
          certificate_number: string | null
          certificate_type: string | null
          expiry_date: string | null
          file_path: string
          file_size_bytes: number | null
          id: string
          is_verified: boolean
          issue_date: string | null
          issued_by: string | null
          mime_type: string | null
          notes: string | null
          staff_id: string
          uploaded_at: string
          uploaded_by: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          certificate_name: string
          certificate_number?: string | null
          certificate_type?: string | null
          expiry_date?: string | null
          file_path: string
          file_size_bytes?: number | null
          id?: string
          is_verified?: boolean
          issue_date?: string | null
          issued_by?: string | null
          mime_type?: string | null
          notes?: string | null
          staff_id: string
          uploaded_at?: string
          uploaded_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          certificate_name?: string
          certificate_number?: string | null
          certificate_type?: string | null
          expiry_date?: string | null
          file_path?: string
          file_size_bytes?: number | null
          id?: string
          is_verified?: boolean
          issue_date?: string | null
          issued_by?: string | null
          mime_type?: string | null
          notes?: string | null
          staff_id?: string
          uploaded_at?: string
          uploaded_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      staff_certificates_legacy: {
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
      staff_docs_status: {
        Row: {
          contract_signed: boolean
          contract_signed_at: string | null
          emergency_contact_provided: boolean
          iban_verified: boolean
          iban_verified_at: string | null
          id: string
          id_expiry: string | null
          id_type: string | null
          id_verified: boolean
          id_verified_at: string | null
          id_verified_by: string | null
          is_compliant: boolean | null
          latest_contract_id: string | null
          staff_id: string
          updated_at: string
          updated_by: string | null
          vog_expiry: string | null
          vog_file_path: string | null
          vog_status: string | null
          vog_verified_at: string | null
          work_permit_expiry: string | null
          work_permit_file_path: string | null
          work_permit_required: boolean
          work_permit_status: string | null
        }
        Insert: {
          contract_signed?: boolean
          contract_signed_at?: string | null
          emergency_contact_provided?: boolean
          iban_verified?: boolean
          iban_verified_at?: string | null
          id?: string
          id_expiry?: string | null
          id_type?: string | null
          id_verified?: boolean
          id_verified_at?: string | null
          id_verified_by?: string | null
          is_compliant?: boolean | null
          latest_contract_id?: string | null
          staff_id: string
          updated_at?: string
          updated_by?: string | null
          vog_expiry?: string | null
          vog_file_path?: string | null
          vog_status?: string | null
          vog_verified_at?: string | null
          work_permit_expiry?: string | null
          work_permit_file_path?: string | null
          work_permit_required?: boolean
          work_permit_status?: string | null
        }
        Update: {
          contract_signed?: boolean
          contract_signed_at?: string | null
          emergency_contact_provided?: boolean
          iban_verified?: boolean
          iban_verified_at?: string | null
          id?: string
          id_expiry?: string | null
          id_type?: string | null
          id_verified?: boolean
          id_verified_at?: string | null
          id_verified_by?: string | null
          is_compliant?: boolean | null
          latest_contract_id?: string | null
          staff_id?: string
          updated_at?: string
          updated_by?: string | null
          vog_expiry?: string | null
          vog_file_path?: string | null
          vog_status?: string | null
          vog_verified_at?: string | null
          work_permit_expiry?: string | null
          work_permit_file_path?: string | null
          work_permit_required?: boolean
          work_permit_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_docs_status_latest_contract_id_fkey"
            columns: ["latest_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_document_compliance: {
        Row: {
          bank_card_missing: boolean | null
          created_at: string | null
          employees_missing: boolean | null
          id: string
          id_card_missing: boolean | null
          missing_count: number | null
          pok_missing: boolean | null
          portobase_missing: boolean | null
          prk_missing: boolean | null
          staff_id: string
          updated_at: string | null
          vog_missing: boolean | null
        }
        Insert: {
          bank_card_missing?: boolean | null
          created_at?: string | null
          employees_missing?: boolean | null
          id?: string
          id_card_missing?: boolean | null
          missing_count?: number | null
          pok_missing?: boolean | null
          portobase_missing?: boolean | null
          prk_missing?: boolean | null
          staff_id: string
          updated_at?: string | null
          vog_missing?: boolean | null
        }
        Update: {
          bank_card_missing?: boolean | null
          created_at?: string | null
          employees_missing?: boolean | null
          id?: string
          id_card_missing?: boolean | null
          missing_count?: number | null
          pok_missing?: boolean | null
          portobase_missing?: boolean | null
          prk_missing?: boolean | null
          staff_id?: string
          updated_at?: string | null
          vog_missing?: boolean | null
        }
        Relationships: []
      }
      staff_documents: {
        Row: {
          created_at: string | null
          custom_label: string | null
          document_type_id: string
          expires_at: string | null
          file_name: string | null
          file_path: string | null
          file_size: number | null
          id: string
          is_current: boolean | null
          last_reminder_sent_at: string | null
          mime_type: string | null
          notes: string | null
          staff_id: string
          status: string
          updated_at: string | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          custom_label?: string | null
          document_type_id: string
          expires_at?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_current?: boolean | null
          last_reminder_sent_at?: string | null
          mime_type?: string | null
          notes?: string | null
          staff_id: string
          status?: string
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          custom_label?: string | null
          document_type_id?: string
          expires_at?: string | null
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_current?: boolean | null
          last_reminder_sent_at?: string | null
          mime_type?: string | null
          notes?: string | null
          staff_id?: string
          status?: string
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_documents_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "document_types"
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
            referencedRelation: "staff_docs_status_legacy"
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
      staff_goals: {
        Row: {
          completed_at: string | null
          completion_notes: string | null
          created_at: string
          created_in_review_id: string | null
          goal_category: string | null
          goal_text: string
          id: string
          staff_id: string
          status: string | null
          target_date: string | null
          updated_at: string
          xp_reward: number | null
        }
        Insert: {
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string
          created_in_review_id?: string | null
          goal_category?: string | null
          goal_text: string
          id?: string
          staff_id: string
          status?: string | null
          target_date?: string | null
          updated_at?: string
          xp_reward?: number | null
        }
        Update: {
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string
          created_in_review_id?: string | null
          goal_category?: string | null
          goal_text?: string
          id?: string
          staff_id?: string
          status?: string | null
          target_date?: string | null
          updated_at?: string
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_goals_created_in_review_id_fkey"
            columns: ["created_in_review_id"]
            isOneToOne: false
            referencedRelation: "overdue_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_goals_created_in_review_id_fkey"
            columns: ["created_in_review_id"]
            isOneToOne: false
            referencedRelation: "review_calendar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_goals_created_in_review_id_fkey"
            columns: ["created_in_review_id"]
            isOneToOne: false
            referencedRelation: "staff_reviews"
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
          created_at: string
          created_by: string | null
          id: string
          is_important: boolean
          is_private: boolean
          note: string
          note_type: string | null
          related_review_id: string | null
          staff_id: string
          tags: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_important?: boolean
          is_private?: boolean
          note: string
          note_type?: string | null
          related_review_id?: string | null
          staff_id: string
          tags?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_important?: boolean
          is_private?: boolean
          note?: string
          note_type?: string | null
          related_review_id?: string | null
          staff_id?: string
          tags?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_notes_related_review_id_fkey"
            columns: ["related_review_id"]
            isOneToOne: false
            referencedRelation: "overdue_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_notes_related_review_id_fkey"
            columns: ["related_review_id"]
            isOneToOne: false
            referencedRelation: "review_calendar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_notes_related_review_id_fkey"
            columns: ["related_review_id"]
            isOneToOne: false
            referencedRelation: "staff_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_notes_legacy: {
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
          achievement_ids: string[] | null
          achievements: Json | null
          adaptability_speed: number | null
          approved_at: string | null
          approved_by: string | null
          areas_for_improvement: string | null
          attachments: Json | null
          behavior_score: number | null
          coins_earned: number | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          development_areas: Json | null
          disc_evolution: string | null
          disc_questions_answered: Json | null
          disc_snapshot: Json | null
          document_path: string | null
          due_date: string | null
          emotional_scores: Json | null
          employee_signature_date: string | null
          future_raise_goal: string | null
          goal_completion_rate: number | null
          goals_achieved: number | null
          goals_next: Json | null
          goals_previous: Json | null
          goals_set: Json | null
          goals_total: number | null
          id: string
          impact_score: number | null
          initiative_taken: number | null
          leadership_potential_score: number | null
          manager_vs_self_delta: number | null
          notes: string | null
          overall_rating: number | null
          overall_score: number | null
          performance_level: string | null
          promotion_readiness_score: number | null
          promotion_ready: boolean | null
          responses: Json | null
          review_date: string
          review_period_end: string | null
          review_period_start: string | null
          review_trigger_type: string | null
          review_type: string
          reviewer_id: string | null
          reviewer_signature_date: string | null
          salary_recommendation: string | null
          salary_suggestion_reason: string | null
          scheduled_at: string | null
          score_breakdown: Json | null
          self_assessment: Json | null
          self_rating_average: number | null
          signed_by_employee: boolean | null
          signed_by_reviewer: boolean | null
          staff_id: string
          star_rating: number | null
          started_at: string | null
          status: string
          strengths: string | null
          summary: string | null
          support_suggestions: Json | null
          team_mood_impact: string | null
          team_reception_score: number | null
          template_id: string | null
          triggered_by_goal_id: string | null
          updated_at: string
          warning_level: number | null
          wellbeing_score: number | null
          xp_earned: number | null
        }
        Insert: {
          achievement_ids?: string[] | null
          achievements?: Json | null
          adaptability_speed?: number | null
          approved_at?: string | null
          approved_by?: string | null
          areas_for_improvement?: string | null
          attachments?: Json | null
          behavior_score?: number | null
          coins_earned?: number | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          development_areas?: Json | null
          disc_evolution?: string | null
          disc_questions_answered?: Json | null
          disc_snapshot?: Json | null
          document_path?: string | null
          due_date?: string | null
          emotional_scores?: Json | null
          employee_signature_date?: string | null
          future_raise_goal?: string | null
          goal_completion_rate?: number | null
          goals_achieved?: number | null
          goals_next?: Json | null
          goals_previous?: Json | null
          goals_set?: Json | null
          goals_total?: number | null
          id?: string
          impact_score?: number | null
          initiative_taken?: number | null
          leadership_potential_score?: number | null
          manager_vs_self_delta?: number | null
          notes?: string | null
          overall_rating?: number | null
          overall_score?: number | null
          performance_level?: string | null
          promotion_readiness_score?: number | null
          promotion_ready?: boolean | null
          responses?: Json | null
          review_date?: string
          review_period_end?: string | null
          review_period_start?: string | null
          review_trigger_type?: string | null
          review_type: string
          reviewer_id?: string | null
          reviewer_signature_date?: string | null
          salary_recommendation?: string | null
          salary_suggestion_reason?: string | null
          scheduled_at?: string | null
          score_breakdown?: Json | null
          self_assessment?: Json | null
          self_rating_average?: number | null
          signed_by_employee?: boolean | null
          signed_by_reviewer?: boolean | null
          staff_id: string
          star_rating?: number | null
          started_at?: string | null
          status?: string
          strengths?: string | null
          summary?: string | null
          support_suggestions?: Json | null
          team_mood_impact?: string | null
          team_reception_score?: number | null
          template_id?: string | null
          triggered_by_goal_id?: string | null
          updated_at?: string
          warning_level?: number | null
          wellbeing_score?: number | null
          xp_earned?: number | null
        }
        Update: {
          achievement_ids?: string[] | null
          achievements?: Json | null
          adaptability_speed?: number | null
          approved_at?: string | null
          approved_by?: string | null
          areas_for_improvement?: string | null
          attachments?: Json | null
          behavior_score?: number | null
          coins_earned?: number | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          development_areas?: Json | null
          disc_evolution?: string | null
          disc_questions_answered?: Json | null
          disc_snapshot?: Json | null
          document_path?: string | null
          due_date?: string | null
          emotional_scores?: Json | null
          employee_signature_date?: string | null
          future_raise_goal?: string | null
          goal_completion_rate?: number | null
          goals_achieved?: number | null
          goals_next?: Json | null
          goals_previous?: Json | null
          goals_set?: Json | null
          goals_total?: number | null
          id?: string
          impact_score?: number | null
          initiative_taken?: number | null
          leadership_potential_score?: number | null
          manager_vs_self_delta?: number | null
          notes?: string | null
          overall_rating?: number | null
          overall_score?: number | null
          performance_level?: string | null
          promotion_readiness_score?: number | null
          promotion_ready?: boolean | null
          responses?: Json | null
          review_date?: string
          review_period_end?: string | null
          review_period_start?: string | null
          review_trigger_type?: string | null
          review_type?: string
          reviewer_id?: string | null
          reviewer_signature_date?: string | null
          salary_recommendation?: string | null
          salary_suggestion_reason?: string | null
          scheduled_at?: string | null
          score_breakdown?: Json | null
          self_assessment?: Json | null
          self_rating_average?: number | null
          signed_by_employee?: boolean | null
          signed_by_reviewer?: boolean | null
          staff_id?: string
          star_rating?: number | null
          started_at?: string | null
          status?: string
          strengths?: string | null
          summary?: string | null
          support_suggestions?: Json | null
          team_mood_impact?: string | null
          team_reception_score?: number | null
          template_id?: string | null
          triggered_by_goal_id?: string | null
          updated_at?: string
          warning_level?: number | null
          wellbeing_score?: number | null
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_reviews_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "review_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_reviews_legacy: {
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
            referencedRelation: "staff_docs_status_legacy"
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
      ta_applicants: {
        Row: {
          availability: Json | null
          city: string | null
          color_counts: Json | null
          color_primary: string | null
          color_secondary: string | null
          completed_at: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          language_track: string
          nationality: string | null
          phone: string | null
          preferred_group: string | null
          red_flag_count: number | null
          red_flag_items: Json | null
          ref_code: string
          role: string
          start_date: string | null
          updated_at: string | null
          vog_eligible: boolean
          work_permit: string
        }
        Insert: {
          availability?: Json | null
          city?: string | null
          color_counts?: Json | null
          color_primary?: string | null
          color_secondary?: string | null
          completed_at?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          language_track: string
          nationality?: string | null
          phone?: string | null
          preferred_group?: string | null
          red_flag_count?: number | null
          red_flag_items?: Json | null
          ref_code: string
          role: string
          start_date?: string | null
          updated_at?: string | null
          vog_eligible?: boolean
          work_permit?: string
        }
        Update: {
          availability?: Json | null
          city?: string | null
          color_counts?: Json | null
          color_primary?: string | null
          color_secondary?: string | null
          completed_at?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          language_track?: string
          nationality?: string | null
          phone?: string | null
          preferred_group?: string | null
          red_flag_count?: number | null
          red_flag_items?: Json | null
          ref_code?: string
          role?: string
          start_date?: string | null
          updated_at?: string | null
          vog_eligible?: boolean
          work_permit?: string
        }
        Relationships: []
      }
      ta_assessment_answers: {
        Row: {
          answer_text: string | null
          applicant_id: string
          color_mapped: string | null
          created_at: string | null
          id: string
          is_color_question: boolean | null
          is_red_flag: boolean | null
          question_id: number
          question_order: number | null
          question_section: string | null
          risk_flag: boolean | null
          selected_choice: string
          time_taken_seconds: number | null
        }
        Insert: {
          answer_text?: string | null
          applicant_id: string
          color_mapped?: string | null
          created_at?: string | null
          id?: string
          is_color_question?: boolean | null
          is_red_flag?: boolean | null
          question_id: number
          question_order?: number | null
          question_section?: string | null
          risk_flag?: boolean | null
          selected_choice: string
          time_taken_seconds?: number | null
        }
        Update: {
          answer_text?: string | null
          applicant_id?: string
          color_mapped?: string | null
          created_at?: string | null
          id?: string
          is_color_question?: boolean | null
          is_red_flag?: boolean | null
          question_id?: number
          question_order?: number | null
          question_section?: string | null
          risk_flag?: boolean | null
          selected_choice?: string
          time_taken_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ta_assessment_answers_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "ta_applicants"
            referencedColumns: ["id"]
          },
        ]
      }
      ta_assessment_questions: {
        Row: {
          age_group_mapping: Json | null
          category: string | null
          color_mapping: Json | null
          competency_mapping: Json | null
          created_at: string | null
          difficulty_level: number | null
          id: number
          option_a: string
          option_b: string
          option_c: string | null
          option_d: string | null
          question_text: string
          question_type: string
          red_flag_mapping: Json | null
          required: boolean | null
          time_limit_seconds: number | null
        }
        Insert: {
          age_group_mapping?: Json | null
          category?: string | null
          color_mapping?: Json | null
          competency_mapping?: Json | null
          created_at?: string | null
          difficulty_level?: number | null
          id: number
          option_a: string
          option_b: string
          option_c?: string | null
          option_d?: string | null
          question_text: string
          question_type: string
          red_flag_mapping?: Json | null
          required?: boolean | null
          time_limit_seconds?: number | null
        }
        Update: {
          age_group_mapping?: Json | null
          category?: string | null
          color_mapping?: Json | null
          competency_mapping?: Json | null
          created_at?: string | null
          difficulty_level?: number | null
          id?: number
          option_a?: string
          option_b?: string
          option_c?: string | null
          option_d?: string | null
          question_text?: string
          question_type?: string
          red_flag_mapping?: Json | null
          required?: boolean | null
          time_limit_seconds?: number | null
        }
        Relationships: []
      }
      ta_widget_analytics: {
        Row: {
          applicant_id: string | null
          completion_time_ms: number | null
          created_at: string | null
          event_type: string
          id: string
          ip_address: unknown
          load_time_ms: number | null
          metadata: Json | null
          referrer: string | null
          session_id: string | null
          source_url: string | null
          step_name: string | null
          user_agent: string | null
        }
        Insert: {
          applicant_id?: string | null
          completion_time_ms?: number | null
          created_at?: string | null
          event_type: string
          id?: string
          ip_address?: unknown
          load_time_ms?: number | null
          metadata?: Json | null
          referrer?: string | null
          session_id?: string | null
          source_url?: string | null
          step_name?: string | null
          user_agent?: string | null
        }
        Update: {
          applicant_id?: string | null
          completion_time_ms?: number | null
          created_at?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown
          load_time_ms?: number | null
          metadata?: Json | null
          referrer?: string | null
          session_id?: string | null
          source_url?: string | null
          step_name?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ta_widget_analytics_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "ta_applicants"
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
      candidate_dashboard_metrics: {
        Row: {
          avg_overall_score: number | null
          awaiting_trial: number | null
          converted_to_staff: number | null
          hired: number | null
          new_applications: number | null
          not_hired: number | null
          on_hold: number | null
          total_candidates: number | null
          trial_completed: number | null
          verified: number | null
          with_redflags: number | null
        }
        Relationships: []
      }
      candidate_timeline: {
        Row: {
          candidate_email: string | null
          candidate_id: string | null
          candidate_name: string | null
          created_at: string | null
          event_description: string | null
          event_type: string | null
          id: string | null
          ip_address: string | null
          metadata: Json | null
          new_value: string | null
          old_value: string | null
          triggered_by: string | null
          triggered_by_name: string | null
          user_agent: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_events_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_events_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates_ready_for_export"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidate_events_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates_with_trials"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates_ready_for_export: {
        Row: {
          ai_match_score: number | null
          application_date: string | null
          assessment_answers: Json | null
          converted_to_staff: boolean | null
          created_at: string | null
          created_by: string | null
          date_of_birth: string | null
          decision: Database["public"]["Enums"]["candidate_decision"] | null
          decision_date: string | null
          decision_reason: string | null
          disc_profile: Json | null
          docs_cv_url: string | null
          docs_diploma_url: string | null
          docs_id_url: string | null
          docs_other_urls: Json | null
          email: string | null
          employes_id: string | null
          full_name: string | null
          group_fit: string | null
          hr_tags: string[] | null
          id: string | null
          internal_notes: Json | null
          language: string | null
          last_updated_by: string | null
          overall_performance: number | null
          overall_score: number | null
          passed: boolean | null
          phone: string | null
          position_applied: string | null
          primary_disc_color: string | null
          redflag_count: number | null
          role_applied: string | null
          secondary_disc_color: string | null
          staff_id: string | null
          status: Database["public"]["Enums"]["candidate_status"] | null
          trial_date: string | null
          trial_group: string | null
          trial_location: string | null
          trial_scheduled_at: string | null
          updated_at: string | null
          would_hire: boolean | null
        }
        Relationships: []
      }
      candidates_with_trials: {
        Row: {
          ai_match_score: number | null
          application_date: string | null
          assessment_answers: Json | null
          converted_to_staff: boolean | null
          created_at: string | null
          created_by: string | null
          date_of_birth: string | null
          decision: Database["public"]["Enums"]["candidate_decision"] | null
          decision_date: string | null
          decision_reason: string | null
          disc_profile: Json | null
          docs_cv_url: string | null
          docs_diploma_url: string | null
          docs_id_url: string | null
          docs_other_urls: Json | null
          email: string | null
          employes_id: string | null
          full_name: string | null
          group_fit: string | null
          hr_tags: string[] | null
          id: string | null
          internal_notes: Json | null
          language: string | null
          last_updated_by: string | null
          latest_supervisor: string | null
          latest_trial_date: string | null
          latest_trial_performance: number | null
          latest_trial_rating: number | null
          latest_would_hire: boolean | null
          overall_score: number | null
          passed: boolean | null
          phone: string | null
          position_applied: string | null
          primary_disc_color: string | null
          redflag_count: number | null
          role_applied: string | null
          secondary_disc_color: string | null
          staff_id: string | null
          status: Database["public"]["Enums"]["candidate_status"] | null
          trial_date: string | null
          trial_group: string | null
          trial_location: string | null
          trial_scheduled_at: string | null
          updated_at: string | null
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
      document_compliance_view: {
        Row: {
          contract_signed: boolean | null
          emergency_contact_provided: boolean | null
          iban_verified: boolean | null
          id_verified: boolean | null
          is_compliant: boolean | null
          missing_items_count: number | null
          staff_id: string | null
          vog_expired: boolean | null
          vog_expiry: string | null
          vog_status: string | null
          work_permit_required: boolean | null
          work_permit_status: string | null
        }
        Insert: {
          contract_signed?: boolean | null
          emergency_contact_provided?: boolean | null
          iban_verified?: boolean | null
          id_verified?: boolean | null
          is_compliant?: boolean | null
          missing_items_count?: never
          staff_id?: string | null
          vog_expired?: never
          vog_expiry?: string | null
          vog_status?: string | null
          work_permit_required?: boolean | null
          work_permit_status?: string | null
        }
        Update: {
          contract_signed?: boolean | null
          emergency_contact_provided?: boolean | null
          iban_verified?: boolean | null
          id_verified?: boolean | null
          is_compliant?: boolean | null
          missing_items_count?: never
          staff_id?: string | null
          vog_expired?: never
          vog_expiry?: string | null
          vog_status?: string | null
          work_permit_required?: boolean | null
          work_permit_status?: string | null
        }
        Relationships: []
      }
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
      overdue_reviews: {
        Row: {
          days_overdue: number | null
          due_date: string | null
          id: string | null
          review_date: string | null
          review_type: string | null
          reviewer_id: string | null
          staff_id: string | null
          status: string | null
          urgency_level: string | null
        }
        Insert: {
          days_overdue?: never
          due_date?: string | null
          id?: string | null
          review_date?: string | null
          review_type?: string | null
          reviewer_id?: string | null
          staff_id?: string | null
          status?: string | null
          urgency_level?: never
        }
        Update: {
          days_overdue?: never
          due_date?: string | null
          id?: string | null
          review_date?: string | null
          review_type?: string | null
          reviewer_id?: string | null
          staff_id?: string | null
          status?: string | null
          urgency_level?: never
        }
        Relationships: []
      }
      performance_trends: {
        Row: {
          avg_rating: number | null
          avg_score: number | null
          below_count: number | null
          exceeds_count: number | null
          exceptional_count: number | null
          max_rating: number | null
          max_score: number | null
          meets_count: number | null
          min_rating: number | null
          min_score: number | null
          review_count: number | null
          review_quarter: number | null
          review_year: number | null
          staff_id: string | null
          unsatisfactory_count: number | null
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
            referencedRelation: "staff_docs_status_legacy"
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
      review_calendar: {
        Row: {
          calendar_date: string | null
          due_date: string | null
          id: string | null
          review_date: string | null
          review_type: string | null
          reviewer_id: string | null
          staff_id: string | null
          status: string | null
          template_id: string | null
          urgency: string | null
        }
        Insert: {
          calendar_date?: never
          due_date?: string | null
          id?: string | null
          review_date?: string | null
          review_type?: string | null
          reviewer_id?: string | null
          staff_id?: string | null
          status?: string | null
          template_id?: string | null
          urgency?: never
        }
        Update: {
          calendar_date?: never
          due_date?: string | null
          id?: string | null
          review_date?: string | null
          review_type?: string | null
          reviewer_id?: string | null
          staff_id?: string | null
          status?: string | null
          template_id?: string | null
          urgency?: never
        }
        Relationships: [
          {
            foreignKeyName: "staff_reviews_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "review_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      review_calendar_unified: {
        Row: {
          color: string | null
          description: string | null
          event_date: string | null
          event_id: string | null
          event_type: string | null
          label: string | null
          metadata: Json | null
          review_type: string | null
          staff_id: string | null
          status: string | null
        }
        Relationships: []
      }
      staff: {
        Row: {
          address: string | null
          birth_date: string | null
          city: string | null
          country: string | null
          created_at: string | null
          department: string | null
          effective_from: string | null
          effective_to: string | null
          email: string | null
          employes_id: string | null
          full_name: string | null
          gender: string | null
          id: string | null
          last_sync_at: string | null
          location: string | null
          nationality: string | null
          phone_number: string | null
          role: string | null
          status: string | null
          updated_at: string | null
          zipcode: string | null
        }
        Insert: {
          address?: never
          birth_date?: never
          city?: never
          country?: never
          created_at?: string | null
          department?: never
          effective_from?: string | null
          effective_to?: string | null
          email?: never
          employes_id?: string | null
          full_name?: never
          gender?: never
          id?: never
          last_sync_at?: string | null
          location?: never
          nationality?: never
          phone_number?: never
          role?: never
          status?: never
          updated_at?: string | null
          zipcode?: never
        }
        Update: {
          address?: never
          birth_date?: never
          city?: never
          country?: never
          created_at?: string | null
          department?: never
          effective_from?: string | null
          effective_to?: string | null
          email?: never
          employes_id?: string | null
          full_name?: never
          gender?: never
          id?: never
          last_sync_at?: string | null
          location?: never
          nationality?: never
          phone_number?: never
          role?: never
          status?: never
          updated_at?: string | null
          zipcode?: never
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
      staff_docs_status_legacy: {
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
      staff_review_summary: {
        Row: {
          approved_reviews: number | null
          avg_overall_rating: number | null
          avg_overall_score: number | null
          avg_star_rating: number | null
          completed_reviews: number | null
          first_review_date: string | null
          five_star_count: number | null
          highest_overall_rating: number | null
          highest_star_rating: number | null
          last_review_date: string | null
          lowest_overall_rating: number | null
          next_review_due: string | null
          overdue_count: number | null
          reviews_last_year: number | null
          staff_id: string | null
          total_reviews: number | null
        }
        Relationships: []
      }
      staff_reviews_needed: {
        Row: {
          days_overdue: number | null
          department: string | null
          full_name: string | null
          last_any_review: string | null
          location: string | null
          staff_id: string | null
          suggested_review_type: string | null
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
      staff_with_lms_data: {
        Row: {
          address: string | null
          birth_date: string | null
          city: string | null
          country: string | null
          created_at: string | null
          custom_role: string | null
          department: string | null
          effective_from: string | null
          effective_to: string | null
          email: string | null
          employes_id: string | null
          employment_start_date: string | null
          full_name: string | null
          gender: string | null
          id: string | null
          intern_year: number | null
          is_intern: boolean | null
          last_sync_at: string | null
          lms_location: string | null
          lms_notes: string | null
          lms_tags: string[] | null
          lms_updated_at: string | null
          location: string | null
          mentor_name: string | null
          nationality: string | null
          phone_number: string | null
          role: string | null
          status: string | null
          updated_at: string | null
          zipcode: string | null
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
            referencedRelation: "staff_docs_status_legacy"
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
      v_collection_health: {
        Row: {
          avg_retries: number | null
          endpoint: string | null
          failed: number | null
          last_collection: string | null
          partial: number | null
          success_rate: number | null
          successful: number | null
          total_records: number | null
        }
        Relationships: []
      }
      v_collection_health_by_endpoint: {
        Row: {
          avg_retries_on_failure: number | null
          endpoint: string | null
          last_collection: string | null
          partial: number | null
          permanently_failed: number | null
          success_rate: number | null
          successful: number | null
          total_collections: number | null
        }
        Relationships: []
      }
      v_raw_data_needs_retry: {
        Row: {
          collected_at: string | null
          collection_issues: Json | null
          employee_id: string | null
          endpoint: string | null
          error_message: string | null
          hours_since_retry: number | null
          http_status_code: number | null
          id: string | null
          last_retry_at: string | null
          retry_count: number | null
        }
        Relationships: []
      }
      v_sync_session_history: {
        Row: {
          completed_at: string | null
          duration_seconds: number | null
          failed_records: number | null
          id: string | null
          session_type: string | null
          started_at: string | null
          status: string | null
          success_rate: number | null
          successful_records: number | null
          sync_details: Json | null
          total_records: number | null
        }
        Relationships: []
      }
    }
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
