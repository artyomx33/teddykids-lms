/**
 * System Domain Types
 * Auto-generated from Supabase schema
 * Part of types refactoring - preserves all functionality
 */

import type { Json } from './base';

export interface SystemTables {
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
}
