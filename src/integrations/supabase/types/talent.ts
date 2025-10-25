/**
 * Talent Domain Types
 * Auto-generated from Supabase schema
 * Part of types refactoring - preserves all functionality
 */

import type { Json } from './base';

export interface TalentTables {
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
}

export interface TalentViews {
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
}
