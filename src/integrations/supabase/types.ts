export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          description: string
          icon: string
          id: string
          name: string
          xp_reward: number
        }
        Insert: {
          description: string
          icon: string
          id?: string
          name: string
          xp_reward?: number
        }
        Update: {
          description?: string
          icon?: string
          id?: string
          name?: string
          xp_reward?: number
        }
        Relationships: []
      }
      ai_trainer_chats: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_user: boolean
          message: string
          session_id: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_user?: boolean
          message: string
          session_id?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_user?: boolean
          message?: string
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string
          difficulty: string
          duration: number
          end_date: string | null
          first_place_reward: number | null
          id: string
          join_price_xp: number
          second_place_reward: number | null
          start_date: string | null
          third_place_reward: number | null
          title: string
          xp_reward: number
        }
        Insert: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description: string
          difficulty: string
          duration: number
          end_date?: string | null
          first_place_reward?: number | null
          id?: string
          join_price_xp?: number
          second_place_reward?: number | null
          start_date?: string | null
          third_place_reward?: number | null
          title: string
          xp_reward?: number
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          difficulty?: string
          duration?: number
          end_date?: string | null
          first_place_reward?: number | null
          id?: string
          join_price_xp?: number
          second_place_reward?: number | null
          start_date?: string | null
          third_place_reward?: number | null
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      chat_video_recommendations: {
        Row: {
          chat_session_id: string
          created_at: string | null
          id: string
          video_id: string | null
        }
        Insert: {
          chat_session_id: string
          created_at?: string | null
          id?: string
          video_id?: string | null
        }
        Update: {
          chat_session_id?: string
          created_at?: string | null
          id?: string
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_video_recommendations_chat_session_id_fkey"
            columns: ["chat_session_id"]
            isOneToOne: false
            referencedRelation: "ai_trainer_chats"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "chat_video_recommendations_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "exercise_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_demonstrations: {
        Row: {
          animation_url: string
          created_at: string
          description: string | null
          difficulty_level: string
          exercise_name: string
          form_tips: string[] | null
          id: string
          muscle_group: string
        }
        Insert: {
          animation_url: string
          created_at?: string
          description?: string | null
          difficulty_level?: string
          exercise_name: string
          form_tips?: string[] | null
          id?: string
          muscle_group: string
        }
        Update: {
          animation_url?: string
          created_at?: string
          description?: string | null
          difficulty_level?: string
          exercise_name?: string
          form_tips?: string[] | null
          id?: string
          muscle_group?: string
        }
        Relationships: []
      }
      exercise_videos: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string
          difficulty: string
          id: string
          muscle_group: string
          name: string
          thumbnail_url: string | null
          video_url: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          description: string
          difficulty: string
          id?: string
          muscle_group: string
          name: string
          thumbnail_url?: string | null
          video_url: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          difficulty?: string
          id?: string
          muscle_group?: string
          name?: string
          thumbnail_url?: string | null
          video_url?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          experience_level: string | null
          fitness_goal: string | null
          id: string
          preferred_workout_type: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          experience_level?: string | null
          fitness_goal?: string | null
          id: string
          preferred_workout_type?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          experience_level?: string | null
          fitness_goal?: string | null
          id?: string
          preferred_workout_type?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      stripe_products: {
        Row: {
          created_at: string | null
          currency: string
          description: string | null
          features: Json | null
          id: string
          interval: string
          is_active: boolean
          name: string
          price_amount: number
          stripe_price_id: string
          stripe_product_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string
          description?: string | null
          features?: Json | null
          id?: string
          interval?: string
          is_active?: boolean
          name: string
          price_amount: number
          stripe_price_id: string
          stripe_product_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string
          description?: string | null
          features?: Json | null
          id?: string
          interval?: string
          is_active?: boolean
          name?: string
          price_amount?: number
          stripe_price_id?: string
          stripe_product_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenges: {
        Row: {
          challenge_id: string
          completed_at: string | null
          id: string
          joined_at: string
          progress: number
          rank: number | null
          reward_claimed: boolean | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          id?: string
          joined_at?: string
          progress?: number
          rank?: number | null
          reward_claimed?: boolean | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          id?: string
          joined_at?: string
          progress?: number
          rank?: number | null
          reward_claimed?: boolean | null
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
      user_stats: {
        Row: {
          last_workout_date: string | null
          level: number
          streak: number
          user_id: string
          workouts_completed: number
          xp: number
        }
        Insert: {
          last_workout_date?: string | null
          level?: number
          streak?: number
          user_id: string
          workouts_completed?: number
          xp?: number
        }
        Update: {
          last_workout_date?: string | null
          level?: number
          streak?: number
          user_id?: string
          workouts_completed?: number
          xp?: number
        }
        Relationships: []
      }
      user_workout_progress: {
        Row: {
          calories: number | null
          created_at: string
          current_exercise_index: number | null
          duration: number
          exercise_state: string | null
          id: string
          intensity: string | null
          is_completed: boolean | null
          is_resting: boolean | null
          satisfaction_rating: number | null
          user_id: string
          workout_date: string
          workout_type: string
        }
        Insert: {
          calories?: number | null
          created_at?: string
          current_exercise_index?: number | null
          duration: number
          exercise_state?: string | null
          id?: string
          intensity?: string | null
          is_completed?: boolean | null
          is_resting?: boolean | null
          satisfaction_rating?: number | null
          user_id: string
          workout_date?: string
          workout_type: string
        }
        Update: {
          calories?: number | null
          created_at?: string
          current_exercise_index?: number | null
          duration?: number
          exercise_state?: string | null
          id?: string
          intensity?: string | null
          is_completed?: boolean | null
          is_resting?: boolean | null
          satisfaction_rating?: number | null
          user_id?: string
          workout_date?: string
          workout_type?: string
        }
        Relationships: []
      }
      workouts: {
        Row: {
          calories_burned: number | null
          completed_at: string
          duration: number
          id: string
          notes: string | null
          user_id: string
          workout_type: string
        }
        Insert: {
          calories_burned?: number | null
          completed_at?: string
          duration: number
          id?: string
          notes?: string | null
          user_id: string
          workout_type: string
        }
        Update: {
          calories_burned?: number | null
          completed_at?: string
          duration?: number
          id?: string
          notes?: string | null
          user_id?: string
          workout_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_user_xp: {
        Args: { user_id_param: string; xp_amount: number }
        Returns: undefined
      }
      claim_challenge_reward: {
        Args: { challenge_id_param: string; user_id_param: string }
        Returns: undefined
      }
      deduct_user_xp: {
        Args: { user_id_param: string; xp_amount: number }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
