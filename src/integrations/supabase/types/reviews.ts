/**
 * Reviews Domain Types
 * Auto-generated from Supabase schema
 * Part of types refactoring - preserves all functionality
 */

import type { Json } from './base';

export interface ReviewsTables {
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
}

export interface ReviewsViews {
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
}
