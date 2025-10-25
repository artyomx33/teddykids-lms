/**
 * Contracts Domain Types
 * Auto-generated from Supabase schema
 * Part of types refactoring - preserves all functionality
 */

import type { Json } from './base';

export interface ContractsTables {
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
}

export interface ContractsViews {
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
}
