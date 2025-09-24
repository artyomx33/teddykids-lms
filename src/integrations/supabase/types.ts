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
      contracts: {
        Row: {
          contract_type: string | null
          created_at: string | null
          department: string | null
          employee_name: string
          id: string
          manager: string | null
          pdf_path: string | null
          query_params: Json | null
          signed_at: string | null
          status: string
        }
        Insert: {
          contract_type?: string | null
          created_at?: string | null
          department?: string | null
          employee_name: string
          id?: string
          manager?: string | null
          pdf_path?: string | null
          query_params?: Json | null
          signed_at?: string | null
          status?: string
        }
        Update: {
          contract_type?: string | null
          created_at?: string | null
          department?: string | null
          employee_name?: string
          id?: string
          manager?: string | null
          pdf_path?: string | null
          query_params?: Json | null
          signed_at?: string | null
          status?: string
        }
        Relationships: []
      }
      email_drafts: {
        Row: {
          bcc_emails: string[]
          body: string | null
          cc_emails: string[]
          created_at: string | null
          gmail_account_id: string
          id: string
          reply_to_message_id: string | null
          subject: string | null
          to_emails: string[]
          updated_at: string | null
        }
        Insert: {
          bcc_emails?: string[]
          body?: string | null
          cc_emails?: string[]
          created_at?: string | null
          gmail_account_id: string
          id?: string
          reply_to_message_id?: string | null
          subject?: string | null
          to_emails?: string[]
          updated_at?: string | null
        }
        Update: {
          bcc_emails?: string[]
          body?: string | null
          cc_emails?: string[]
          created_at?: string | null
          gmail_account_id?: string
          id?: string
          reply_to_message_id?: string | null
          subject?: string | null
          to_emails?: string[]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_drafts_gmail_account_id_fkey"
            columns: ["gmail_account_id"]
            isOneToOne: false
            referencedRelation: "gmail_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      email_label_assignments: {
        Row: {
          assigned_by_ai: boolean
          confidence_score: number | null
          created_at: string
          email_id: string
          id: string
          label_id: string
        }
        Insert: {
          assigned_by_ai?: boolean
          confidence_score?: number | null
          created_at?: string
          email_id: string
          id?: string
          label_id: string
        }
        Update: {
          assigned_by_ai?: boolean
          confidence_score?: number | null
          created_at?: string
          email_id?: string
          id?: string
          label_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_label_assignments_email_id_fkey"
            columns: ["email_id"]
            isOneToOne: false
            referencedRelation: "emails"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_label_assignments_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "email_labels"
            referencedColumns: ["id"]
          },
        ]
      }
      email_labels: {
        Row: {
          color: string
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          name: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      emails: {
        Row: {
          attachment_count: number
          attachments: Json | null
          bcc_emails: string[]
          body_html: string | null
          body_text: string | null
          cc_emails: string[]
          created_at: string
          email_type: string | null
          gmail_account_id: string
          gmail_label_ids: string[] | null
          gmail_message_id: string
          gmail_thread_id: string
          has_attachments: boolean
          id: string
          is_archived: boolean
          is_important: boolean | null
          is_read: boolean
          is_starred: boolean
          is_trashed: boolean | null
          received_at: string
          recipient_emails: string[]
          sender_email: string
          sender_name: string | null
          snippet: string | null
          subject: string | null
          updated_at: string
        }
        Insert: {
          attachment_count?: number
          attachments?: Json | null
          bcc_emails?: string[]
          body_html?: string | null
          body_text?: string | null
          cc_emails?: string[]
          created_at?: string
          email_type?: string | null
          gmail_account_id: string
          gmail_label_ids?: string[] | null
          gmail_message_id: string
          gmail_thread_id: string
          has_attachments?: boolean
          id?: string
          is_archived?: boolean
          is_important?: boolean | null
          is_read?: boolean
          is_starred?: boolean
          is_trashed?: boolean | null
          received_at: string
          recipient_emails?: string[]
          sender_email: string
          sender_name?: string | null
          snippet?: string | null
          subject?: string | null
          updated_at?: string
        }
        Update: {
          attachment_count?: number
          attachments?: Json | null
          bcc_emails?: string[]
          body_html?: string | null
          body_text?: string | null
          cc_emails?: string[]
          created_at?: string
          email_type?: string | null
          gmail_account_id?: string
          gmail_label_ids?: string[] | null
          gmail_message_id?: string
          gmail_thread_id?: string
          has_attachments?: boolean
          id?: string
          is_archived?: boolean
          is_important?: boolean | null
          is_read?: boolean
          is_starred?: boolean
          is_trashed?: boolean | null
          received_at?: string
          recipient_emails?: string[]
          sender_email?: string
          sender_name?: string | null
          snippet?: string | null
          subject?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "emails_gmail_account_id_fkey"
            columns: ["gmail_account_id"]
            isOneToOne: false
            referencedRelation: "gmail_accounts"
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
            referencedRelation: "contracts_enriched"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "employes_employee_map_lms_staff_id_fkey"
            columns: ["lms_staff_id"]
            isOneToOne: false
            referencedRelation: "contracts_enriched_mat"
            referencedColumns: ["staff_id"]
          },
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
            referencedRelation: "staff_docs_status"
            referencedColumns: ["staff_id"]
          },
        ]
      }
      employes_sync_logs: {
        Row: {
          action: string
          created_at: string | null
          employes_employee_id: string | null
          error_message: string | null
          id: number
          lms_staff_id: string | null
          payload: Json | null
          status: string
        }
        Insert: {
          action: string
          created_at?: string | null
          employes_employee_id?: string | null
          error_message?: string | null
          id?: number
          lms_staff_id?: string | null
          payload?: Json | null
          status: string
        }
        Update: {
          action?: string
          created_at?: string | null
          employes_employee_id?: string | null
          error_message?: string | null
          id?: number
          lms_staff_id?: string | null
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
          {
            foreignKeyName: "employes_wage_map_lms_contract_id_fkey"
            columns: ["lms_contract_id"]
            isOneToOne: false
            referencedRelation: "contracts_enriched_mat"
            referencedColumns: ["id"]
          },
        ]
      }
      gmail_accounts: {
        Row: {
          access_token: string
          created_at: string
          display_name: string | null
          email_address: string
          id: string
          is_active: boolean
          last_sync_at: string | null
          refresh_token: string
          token_expires_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_token: string
          created_at?: string
          display_name?: string | null
          email_address: string
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          refresh_token: string
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string
          display_name?: string | null
          email_address?: string
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          refresh_token?: string
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      staff: {
        Row: {
          birth_date: string | null
          city: string | null
          contract_type: string | null
          created_at: string | null
          email: string | null
          employee_number: number | null
          employes_id: string | null
          full_name: string
          hourly_wage: number | null
          hours_per_week: number | null
          house_number: string | null
          iban: string | null
          id: string
          intern_meta: Json | null
          intern_year: number | null
          is_intern: boolean
          last_sync_at: string | null
          location: string | null
          phone_number: string | null
          role: string | null
          staff_docs: Json | null
          start_date: string | null
          status: string | null
          street_address: string | null
          zipcode: string | null
        }
        Insert: {
          birth_date?: string | null
          city?: string | null
          contract_type?: string | null
          created_at?: string | null
          email?: string | null
          employee_number?: number | null
          employes_id?: string | null
          full_name: string
          hourly_wage?: number | null
          hours_per_week?: number | null
          house_number?: string | null
          iban?: string | null
          id?: string
          intern_meta?: Json | null
          intern_year?: number | null
          is_intern?: boolean
          last_sync_at?: string | null
          location?: string | null
          phone_number?: string | null
          role?: string | null
          staff_docs?: Json | null
          start_date?: string | null
          status?: string | null
          street_address?: string | null
          zipcode?: string | null
        }
        Update: {
          birth_date?: string | null
          city?: string | null
          contract_type?: string | null
          created_at?: string | null
          email?: string | null
          employee_number?: number | null
          employes_id?: string | null
          full_name?: string
          hourly_wage?: number | null
          hours_per_week?: number | null
          house_number?: string | null
          iban?: string | null
          id?: string
          intern_meta?: Json | null
          intern_year?: number | null
          is_intern?: boolean
          last_sync_at?: string | null
          location?: string | null
          phone_number?: string | null
          role?: string | null
          staff_docs?: Json | null
          start_date?: string | null
          status?: string | null
          street_address?: string | null
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
            referencedRelation: "contracts_enriched"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_certificates_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "contracts_enriched_mat"
            referencedColumns: ["staff_id"]
          },
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
            referencedRelation: "staff_docs_status"
            referencedColumns: ["staff_id"]
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
          is_archived: boolean
          note: string | null
          note_type: string | null
          staff_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_archived?: boolean
          note?: string | null
          note_type?: string | null
          staff_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_archived?: boolean
          note?: string | null
          note_type?: string | null
          staff_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_notes_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "contracts_enriched"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_notes_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "contracts_enriched_mat"
            referencedColumns: ["staff_id"]
          },
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
            referencedRelation: "staff_docs_status"
            referencedColumns: ["staff_id"]
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
            referencedRelation: "contracts_enriched"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "staff_reviews_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "contracts_enriched_mat"
            referencedColumns: ["staff_id"]
          },
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
            referencedRelation: "staff_docs_status"
            referencedColumns: ["staff_id"]
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
    }
    Views: {
      contracts_enriched: {
        Row: {
          avg_review_score: number | null
          birth_date: string | null
          created_at: string | null
          end_date: string | null
          first_start: string | null
          full_name: string | null
          has_five_star_badge: boolean | null
          id: string | null
          last_review_date: string | null
          location_key: string | null
          manager_key: string | null
          needs_six_month_review: boolean | null
          needs_yearly_review: boolean | null
          next_review_due: string | null
          position: string | null
          staff_id: string | null
          start_date: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      contracts_enriched_mat: {
        Row: {
          avg_review_score: number | null
          birth_date: string | null
          created_at: string | null
          end_date: string | null
          first_start: string | null
          full_name: string | null
          has_five_star_badge: boolean | null
          id: string | null
          last_review_date: string | null
          location_key: string | null
          manager_key: string | null
          needs_six_month_review: boolean | null
          needs_yearly_review: boolean | null
          next_review_due: string | null
          position: string | null
          staff_id: string | null
          start_date: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      staff_docs_missing_counts: {
        Row: {
          any_missing: number | null
          bank_card_missing: number | null
          employees_missing: number | null
          id_card_missing: number | null
          intern_missing: number | null
          pok_missing: number | null
          portobase_missing: number | null
          prk_missing: number | null
          vog_missing: number | null
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
      staff_from_contracts: {
        Row: {
          contract_count: number | null
          first_contract_start: string | null
          first_seen_at: string | null
          full_name: string | null
          manager_key: string | null
          role_guess: string | null
        }
        Relationships: []
      }
    }
    Functions: {
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
      patch_intern_meta: {
        Args: { p_patch: Json; p_staff_id: string }
        Returns: undefined
      }
      patch_staff_docs: {
        Args: { p_patch: Json; p_staff_id: string }
        Returns: undefined
      }
      sync_staff_from_contracts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "staff"
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
      app_role: ["admin", "manager", "staff"],
    },
  },
} as const
