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
      organizations: {
        Row: {
          id: string;
          clerk_org_id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          clerk_org_id: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          clerk_org_id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          clerk_user_id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          clerk_user_id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          clerk_user_id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      org_members: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          role: "admin" | "member" | "viewer";
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          role?: "admin" | "member" | "viewer";
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string;
          role?: "admin" | "member" | "viewer";
          created_at?: string;
        };
      };
      folders: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          parent_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          parent_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          parent_id?: string | null;
          created_at?: string;
        };
      };
      files: {
        Row: {
          id: string;
          org_id: string;
          uploader_id: string;
          name: string;
          storage_path: string;
          mime_type: string;
          size_bytes: number;
          folder_id: string | null;
          note_id: string | null;
          is_shared: boolean;
          shared_with: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          uploader_id: string;
          name: string;
          storage_path: string;
          mime_type: string;
          size_bytes: number;
          folder_id?: string | null;
          note_id?: string | null;
          is_shared?: boolean;
          shared_with?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          uploader_id?: string;
          name?: string;
          storage_path?: string;
          mime_type?: string;
          size_bytes?: number;
          folder_id?: string | null;
          note_id?: string | null;
          is_shared?: boolean;
          shared_with?: string[];
          created_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          org_id: string;
          author_id: string;
          title: string;
          content: Json;
          folder_id: string | null;
          is_shared: boolean;
          shared_with: string[];
          tags: string[];
          embedding: number[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          author_id: string;
          title: string;
          content?: Json;
          folder_id?: string | null;
          is_shared?: boolean;
          shared_with?: string[];
          tags?: string[];
          embedding?: number[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          author_id?: string;
          title?: string;
          content?: Json;
          folder_id?: string | null;
          is_shared?: boolean;
          shared_with?: string[];
          tags?: string[];
          embedding?: number[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      emails: {
        Row: {
          id: string;
          org_id: string;
          sender_id: string;
          to_addresses: string[];
          cc_addresses: string[];
          bcc_addresses: string[];
          subject: string;
          body: Json;
          body_html: string;
          attachments: Json;
          status: "draft" | "sent" | "failed";
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          sender_id: string;
          to_addresses: string[];
          cc_addresses?: string[];
          bcc_addresses?: string[];
          subject: string;
          body?: Json;
          body_html?: string;
          attachments?: Json;
          status?: "draft" | "sent" | "failed";
          sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          sender_id?: string;
          to_addresses?: string[];
          cc_addresses?: string[];
          bcc_addresses?: string[];
          subject?: string;
          body?: Json;
          body_html?: string;
          attachments?: Json;
          status?: "draft" | "sent" | "failed";
          sent_at?: string | null;
          created_at?: string;
        };
      };
      email_templates: {
        Row: {
          id: string;
          org_id: string;
          creator_id: string;
          name: string;
          subject: string;
          body: Json;
          is_shared: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          creator_id: string;
          name: string;
          subject: string;
          body?: Json;
          is_shared?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          creator_id?: string;
          name?: string;
          subject?: string;
          body?: Json;
          is_shared?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      match_notes: {
        Args: {
          query_embedding: number[];
          match_threshold: number;
          match_count: number;
          org_id: string;
        };
        Returns: {
          id: string;
          title: string;
          content: Json;
          similarity: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
