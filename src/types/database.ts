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
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: "student" | "parent";
          avatar_url: string | null;
          birth_date: string | null;
          target_airline: string | null;
          career_goal: string | null;
          home_airport: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: "student" | "parent";
          avatar_url?: string | null;
          birth_date?: string | null;
          target_airline?: string | null;
          career_goal?: string | null;
          home_airport?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: "student" | "parent";
          avatar_url?: string | null;
          birth_date?: string | null;
          target_airline?: string | null;
          career_goal?: string | null;
          home_airport?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      stages: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          order_number: number;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          order_number: number;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          order_number?: number;
        };
        Relationships: [];
      };
      missions: {
        Row: {
          id: string;
          stage_id: string;
          title: string;
          description: string | null;
          why_it_matters: string | null;
          requirements: string[] | null;
          estimated_cost: number | null;
          estimated_duration: string | null;
          order_number: number;
        };
        Insert: {
          id?: string;
          stage_id: string;
          title: string;
          description?: string | null;
          why_it_matters?: string | null;
          requirements?: string[] | null;
          estimated_cost?: number | null;
          estimated_duration?: string | null;
          order_number: number;
        };
        Update: {
          id?: string;
          stage_id?: string;
          title?: string;
          description?: string | null;
          why_it_matters?: string | null;
          requirements?: string[] | null;
          estimated_cost?: number | null;
          estimated_duration?: string | null;
          order_number?: number;
        };
        Relationships: [];
      };
      user_missions: {
        Row: {
          id: string;
          user_id: string;
          mission_id: string;
          status: "locked" | "available" | "in_progress" | "completed";
          completion_date: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          mission_id: string;
          status?: "locked" | "available" | "in_progress" | "completed";
          completion_date?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          mission_id?: string;
          status?: "locked" | "available" | "in_progress" | "completed";
          completion_date?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      calendar_events: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          type: "flight" | "study" | "test" | "medical" | "checkride" | "scholarship";
          start_date: string;
          end_date: string | null;
          description: string | null;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          type?: "flight" | "study" | "test" | "medical" | "checkride" | "scholarship";
          start_date: string;
          end_date?: string | null;
          description?: string | null;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          type?: "flight" | "study" | "test" | "medical" | "checkride" | "scholarship";
          start_date?: string;
          end_date?: string | null;
          description?: string | null;
          completed?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          category: "flight_training" | "books" | "equipment" | "medical" | "tests" | "travel";
          description: string | null;
          amount: number;
          date: string;
          receipt_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: "flight_training" | "books" | "equipment" | "medical" | "tests" | "travel";
          description?: string | null;
          amount: number;
          date?: string;
          receipt_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: "flight_training" | "books" | "equipment" | "medical" | "tests" | "travel";
          description?: string | null;
          amount?: number;
          date?: string;
          receipt_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          entry_date: string;
          mission_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          entry_date?: string;
          mission_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          entry_date?: string;
          mission_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      files: {
        Row: {
          id: string;
          user_id: string;
          category: "certificates" | "photos" | "aircraft" | "equipment" | "documents";
          file_url: string;
          file_name: string;
          description: string | null;
          bucket: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: "certificates" | "photos" | "aircraft" | "equipment" | "documents";
          file_url: string;
          file_name: string;
          description?: string | null;
          bucket: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category?: "certificates" | "photos" | "aircraft" | "equipment" | "documents";
          file_url?: string;
          file_name?: string;
          description?: string | null;
          bucket?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      student_parent_links: {
        Row: {
          id: string;
          parent_id: string;
          student_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          parent_id: string;
          student_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          parent_id?: string;
          student_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_parent_of: {
        Args: { student_id: string };
        Returns: boolean;
      };
      can_access_user_data: {
        Args: { target_user_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: "student" | "parent";
      mission_status: "locked" | "available" | "in_progress" | "completed";
      event_type: "flight" | "study" | "test" | "medical" | "checkride" | "scholarship";
      expense_category: "flight_training" | "books" | "equipment" | "medical" | "tests" | "travel";
      file_category: "certificates" | "photos" | "aircraft" | "equipment" | "documents";
    };
    CompositeTypes: Record<string, never>;
  };
}
