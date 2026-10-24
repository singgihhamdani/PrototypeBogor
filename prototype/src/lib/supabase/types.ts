import { RoleCode, AdminBidangVariant } from "../auth-types";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      opd: {
        Row: {
          id: string;
          kode: string;
          nama: string;
          nama_pendek: string | null;
          kepala_opd: string | null;
          alamat: string | null;
          telepon: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          kode: string;
          nama: string;
          nama_pendek?: string | null;
          kepala_opd?: string | null;
          alamat?: string | null;
          telepon?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          kode?: string;
          nama?: string;
          nama_pendek?: string | null;
          kepala_opd?: string | null;
          alamat?: string | null;
          telepon?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          nama_lengkap: string;
          nip: string | null;
          jabatan: string | null;
          role: RoleCode;
          variant: AdminBidangVariant | null;
          opd_id: string | null;
          bujk_id: string | null;
          bujk_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          status: "active" | "pending" | "suspended";
          invited_by: string | null;
          permissions: Json;
          first_login: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          nama_lengkap: string;
          nip?: string | null;
          jabatan?: string | null;
          role?: RoleCode;
          variant?: AdminBidangVariant | null;
          opd_id?: string | null;
          bujk_id?: string | null;
          bujk_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          status?: "active" | "pending" | "suspended";
          invited_by?: string | null;
          permissions?: Json;
          first_login?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          nama_lengkap?: string;
          nip?: string | null;
          jabatan?: string | null;
          role?: RoleCode;
          variant?: AdminBidangVariant | null;
          opd_id?: string | null;
          bujk_id?: string | null;
          bujk_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          status?: "active" | "pending" | "suspended";
          invited_by?: string | null;
          permissions?: Json;
          first_login?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_invitations: {
        Row: {
          id: string;
          email: string;
          nama_lengkap: string;
          nip: string | null;
          role: RoleCode;
          variant: AdminBidangVariant | null;
          opd_id: string | null;
          invited_by: string | null;
          status: "pending" | "accepted" | "expired" | "cancelled";
          token: string | null;
          expires_at: string;
          accepted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          nama_lengkap: string;
          nip?: string | null;
          role: RoleCode;
          variant?: AdminBidangVariant | null;
          opd_id?: string | null;
          invited_by?: string | null;
          status?: "pending" | "accepted" | "expired" | "cancelled";
          token?: string | null;
          expires_at: string;
          accepted_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          nama_lengkap?: string;
          nip?: string | null;
          role?: RoleCode;
          variant?: AdminBidangVariant | null;
          opd_id?: string | null;
          invited_by?: string | null;
          status?: "pending" | "accepted" | "expired" | "cancelled";
          token?: string | null;
          expires_at?: string;
          accepted_at?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
