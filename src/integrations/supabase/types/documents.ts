/**
 * Documents Domain Types
 * Auto-generated from Supabase schema
 * Part of types refactoring - preserves all functionality
 */

import type { Json } from './base';

export interface DocumentsTables {
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
}

export interface DocumentsViews {
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
}
