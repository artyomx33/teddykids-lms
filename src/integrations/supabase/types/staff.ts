/**
 * Staff Domain Types
 * Auto-generated from Supabase schema
 * Part of types refactoring - preserves all functionality
 */

import type { Json } from './base';

export interface StaffTables {
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

export interface StaffViews {
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
}
