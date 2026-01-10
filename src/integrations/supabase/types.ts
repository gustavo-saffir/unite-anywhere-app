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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_mentor_conversations: {
        Row: {
          created_at: string
          devotional_id: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          devotional_id?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          devotional_id?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_mentor_conversations_devotional_id_fkey"
            columns: ["devotional_id"]
            isOneToOne: false
            referencedRelation: "devotionals"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_mentor_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_mentor_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_mentor_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      bible_studies: {
        Row: {
          category_id: string | null
          content: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image_url: string | null
          subcategory_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          subcategory_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          subcategory_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bible_studies_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "study_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bible_studies_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "study_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      bible_videos: {
        Row: {
          category: string
          category_image_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number
          id: string
          subcategory: string
          subcategory_image_url: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string
        }
        Insert: {
          category?: string
          category_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          subcategory?: string
          subcategory_image_url?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url: string
        }
        Update: {
          category?: string
          category_image_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          subcategory?: string
          subcategory_image_url?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          category: string
          created_at: string
          created_by: string
          description: string
          duration_days: number
          id: string
          reward_type: string
          reward_value: string
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by: string
          description: string
          duration_days: number
          id?: string
          reward_type: string
          reward_value: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string
          description?: string
          duration_days?: number
          id?: string
          reward_type?: string
          reward_value?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_reading_quizzes: {
        Row: {
          created_at: string | null
          daily_reading_id: string
          id: string
          questions: Json
        }
        Insert: {
          created_at?: string | null
          daily_reading_id: string
          id?: string
          questions: Json
        }
        Update: {
          created_at?: string | null
          daily_reading_id?: string
          id?: string
          questions?: Json
        }
        Relationships: [
          {
            foreignKeyName: "daily_reading_quizzes_daily_reading_id_fkey"
            columns: ["daily_reading_id"]
            isOneToOne: true
            referencedRelation: "daily_readings"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_readings: {
        Row: {
          book: string
          chapter: number
          chapter_text: string
          created_at: string
          created_by: string | null
          date: string
          devotional_id: string | null
          id: string
          updated_at: string
        }
        Insert: {
          book: string
          chapter: number
          chapter_text: string
          created_at?: string
          created_by?: string | null
          date: string
          devotional_id?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          book?: string
          chapter?: number
          chapter_text?: string
          created_at?: string
          created_by?: string | null
          date?: string
          devotional_id?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_readings_devotional_id_fkey"
            columns: ["devotional_id"]
            isOneToOne: false
            referencedRelation: "devotionals"
            referencedColumns: ["id"]
          },
        ]
      }
      devotionals: {
        Row: {
          application_question: string
          central_insight: string | null
          closing_text: string | null
          context: string | null
          created_at: string
          created_by: string | null
          date: string
          id: string
          opening_text: string | null
          reflection_question: string
          updated_at: string
          verse_reference: string
          verse_text: string
        }
        Insert: {
          application_question: string
          central_insight?: string | null
          closing_text?: string | null
          context?: string | null
          created_at?: string
          created_by?: string | null
          date: string
          id?: string
          opening_text?: string | null
          reflection_question: string
          updated_at?: string
          verse_reference: string
          verse_text: string
        }
        Update: {
          application_question?: string
          central_insight?: string | null
          closing_text?: string | null
          context?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          id?: string
          opening_text?: string | null
          reflection_question?: string
          updated_at?: string
          verse_reference?: string
          verse_text?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          recipient_id: string
          replied_at: string | null
          replied_by: string | null
          reply: string | null
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          recipient_id: string
          replied_at?: string | null
          replied_by?: string | null
          reply?: string | null
          sender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          recipient_id?: string
          replied_at?: string | null
          replied_by?: string | null
          reply?: string | null
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      pastor_messages: {
        Row: {
          created_at: string
          devotional_id: string | null
          id: string
          message: string
          pastor_id: string
          responded_at: string | null
          response: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          devotional_id?: string | null
          id?: string
          message: string
          pastor_id: string
          responded_at?: string | null
          response?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          devotional_id?: string | null
          id?: string
          message?: string
          pastor_id?: string
          responded_at?: string | null
          response?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pastor_messages_devotional_id_fkey"
            columns: ["devotional_id"]
            isOneToOne: false
            referencedRelation: "devotionals"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          church_denomination: string
          created_at: string
          full_name: string
          id: string
          pastor_id: string | null
          position: Database["public"]["Enums"]["user_position"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          church_denomination: string
          created_at?: string
          full_name: string
          id: string
          pastor_id?: string | null
          position?: Database["public"]["Enums"]["user_position"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          church_denomination?: string
          created_at?: string
          full_name?: string
          id?: string
          pastor_id?: string | null
          position?: Database["public"]["Enums"]["user_position"]
          updated_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string
          endpoint: string
          id: string
          p256dh_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth_key: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth_key?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      study_categories: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          name: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "study_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity: {
        Row: {
          activity_type: string
          created_at: string
          id: string
          metadata: Json | null
          page_path: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenges: {
        Row: {
          challenge_id: string
          completed_at: string | null
          id: string
          progress: number
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          id?: string
          progress?: number
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          id?: string
          progress?: number
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_daily_readings: {
        Row: {
          completed_at: string
          daily_reading_id: string
          id: string
          reading_time_seconds: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          daily_reading_id: string
          id?: string
          reading_time_seconds?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string
          daily_reading_id?: string
          id?: string
          reading_time_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_daily_readings_daily_reading_id_fkey"
            columns: ["daily_reading_id"]
            isOneToOne: false
            referencedRelation: "daily_readings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_devotionals: {
        Row: {
          application: string | null
          completed_at: string
          devotional_id: string
          id: string
          memorization_validated: boolean | null
          reflection: string | null
          user_id: string
          verse_memorization: string | null
        }
        Insert: {
          application?: string | null
          completed_at?: string
          devotional_id: string
          id?: string
          memorization_validated?: boolean | null
          reflection?: string | null
          user_id: string
          verse_memorization?: string | null
        }
        Update: {
          application?: string | null
          completed_at?: string
          devotional_id?: string
          id?: string
          memorization_validated?: boolean | null
          reflection?: string | null
          user_id?: string
          verse_memorization?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_devotionals_devotional_id_fkey"
            columns: ["devotional_id"]
            isOneToOne: false
            referencedRelation: "devotionals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_quiz_attempts: {
        Row: {
          answers: Json
          completed_at: string | null
          id: string
          quiz_id: string
          score: number
          user_id: string
        }
        Insert: {
          answers: Json
          completed_at?: string | null
          id?: string
          quiz_id: string
          score: number
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          id?: string
          quiz_id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "daily_reading_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          created_at: string
          current_level: number
          current_streak: number
          id: string
          last_devotional_date: string | null
          longest_streak: number
          total_devotionals_completed: number
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level?: number
          current_streak?: number
          id?: string
          last_devotional_date?: string | null
          longest_streak?: number
          total_devotionals_completed?: number
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: number
          current_streak?: number
          id?: string
          last_devotional_date?: string | null
          longest_streak?: number
          total_devotionals_completed?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      video_categories: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          name: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "video_categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_pastor_info: {
        Args: never
        Returns: {
          full_name: string
          id: string
          pastor_position: string
        }[]
      }
      get_user_pastor: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      user_position: "pastor" | "lider" | "discipulo"
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
      app_role: ["admin", "user"],
      user_position: ["pastor", "lider", "discipulo"],
    },
  },
} as const
