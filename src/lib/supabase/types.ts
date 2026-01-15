export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: Database["public"]["Enums"]["user_role"];
          full_name: string | null;
          phone: string | null;
          establishment: string | null;
          grade_level: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role?: Database["public"]["Enums"]["user_role"];
          full_name?: string | null;
          phone?: string | null;
          establishment?: string | null;
          grade_level?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: Database["public"]["Enums"]["user_role"];
          full_name?: string | null;
          phone?: string | null;
          establishment?: string | null;
          grade_level?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          address: string | null;
          city: string | null;
          postal_code: string | null;
          latitude: number | null;
          longitude: number | null;
          logo_url: string | null;
          banner_url: string | null;
          siret: string | null;
          max_capacity: number | null;
          themes: string[];
          safety_measures: string | null;
          equipment_provided: string | null;
          equipment_required: string | null;
          pmr_accessible: boolean;
          contact_name: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          status: Database["public"]["Enums"]["company_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          logo_url?: string | null;
          banner_url?: string | null;
          siret?: string | null;
          max_capacity?: number | null;
          themes?: string[];
          safety_measures?: string | null;
          equipment_provided?: string | null;
          equipment_required?: string | null;
          pmr_accessible?: boolean;
          contact_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          status?: Database["public"]["Enums"]["company_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          logo_url?: string | null;
          banner_url?: string | null;
          siret?: string | null;
          max_capacity?: number | null;
          themes?: string[];
          safety_measures?: string | null;
          equipment_provided?: string | null;
          equipment_required?: string | null;
          pmr_accessible?: boolean;
          contact_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          status?: Database["public"]["Enums"]["company_status"];
          created_at?: string;
          updated_at?: string;
        };
      };
      company_photos: {
        Row: {
          id: string;
          company_id: string;
          photo_url: string;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          photo_url: string;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          photo_url?: string;
          order_index?: number;
          created_at?: string;
        };
      };
      time_slots: {
        Row: {
          id: string;
          company_id: string;
          start_datetime: string;
          end_datetime: string;
          capacity: number;
          available_spots: number;
          visit_type: string;
          description: string | null;
          specific_instructions: string | null;
          requires_manual_validation: boolean;
          status: Database["public"]["Enums"]["time_slot_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          start_datetime: string;
          end_datetime: string;
          capacity: number;
          available_spots: number;
          visit_type: string;
          description?: string | null;
          specific_instructions?: string | null;
          requires_manual_validation?: boolean;
          status?: Database["public"]["Enums"]["time_slot_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          start_datetime?: string;
          end_datetime?: string;
          capacity?: number;
          available_spots?: number;
          visit_type?: string;
          description?: string | null;
          specific_instructions?: string | null;
          requires_manual_validation?: boolean;
          status?: Database["public"]["Enums"]["time_slot_status"];
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          time_slot_id: string;
          user_id: string;
          booking_type: Database["public"]["Enums"]["booking_type"];
          number_of_participants: number;
          teacher_name: string | null;
          special_needs: string | null;
          status: Database["public"]["Enums"]["booking_status"];
          parental_authorization: boolean;
          cancellation_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          time_slot_id: string;
          user_id: string;
          booking_type?: Database["public"]["Enums"]["booking_type"];
          number_of_participants?: number;
          teacher_name?: string | null;
          special_needs?: string | null;
          status?: Database["public"]["Enums"]["booking_status"];
          parental_authorization?: boolean;
          cancellation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          time_slot_id?: string;
          user_id?: string;
          booking_type?: Database["public"]["Enums"]["booking_type"];
          number_of_participants?: number;
          teacher_name?: string | null;
          special_needs?: string | null;
          status?: Database["public"]["Enums"]["booking_status"];
          parental_authorization?: boolean;
          cancellation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          company_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_id?: string;
          created_at?: string;
        };
      };
      themes: {
        Row: {
          id: string;
          name: string;
          slug: string;
          icon: string | null;
          color: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          icon?: string | null;
          color?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          icon?: string | null;
          color?: string | null;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          recipient_id: string;
          booking_id: string | null;
          subject: string | null;
          content: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          recipient_id: string;
          booking_id?: string | null;
          subject?: string | null;
          content: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          recipient_id?: string;
          booking_id?: string | null;
          subject?: string | null;
          content?: string;
          read?: boolean;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          link: string | null;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          link?: string | null;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          title?: string;
          message?: string;
          link?: string | null;
          read?: boolean;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: "visitor" | "company" | "admin";
      company_status: "pending" | "approved" | "rejected";
      time_slot_status: "open" | "full" | "cancelled" | "completed";
      booking_status: "pending" | "confirmed" | "rejected" | "cancelled";
      booking_type: "individual" | "group";
    };
    CompositeTypes: Record<string, never>;
  };
};
