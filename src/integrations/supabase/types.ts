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
      book_reviews: {
        Row: {
          book_id: string
          comments_count: number | null
          created_at: string
          id: string
          is_featured: boolean | null
          likes_count: number | null
          rating: number
          review_text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          book_id: string
          comments_count?: number | null
          created_at?: string
          id?: string
          is_featured?: boolean | null
          likes_count?: number | null
          rating: number
          review_text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          book_id?: string
          comments_count?: number | null
          created_at?: string
          id?: string
          is_featured?: boolean | null
          likes_count?: number | null
          rating?: number
          review_text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_reviews_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          author: string
          cover_image_url: string | null
          created_at: string
          description: string | null
          genre: string
          id: string
          isbn: string | null
          title: string
        }
        Insert: {
          author: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          genre: string
          id?: string
          isbn?: string | null
          title: string
        }
        Update: {
          author?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          genre?: string
          id?: string
          isbn?: string | null
          title?: string
        }
        Relationships: []
      }
      community_activities: {
        Row: {
          activity_type: string
          created_at: string
          id: string
          metadata: Json | null
          points_earned: number | null
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          id?: string
          metadata?: Json | null
          points_earned?: number | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          points_earned?: number | null
          user_id?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          id: string
          user_id: string
          content: string
          post_type: 'general' | 'review' | 'recommendation'
          book_title: string | null
          book_author: string | null
          rating: number | null
          likes_count: number
          comments_count: number
          shares_count: number
          is_featured: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          post_type?: 'general' | 'review' | 'recommendation'
          book_title?: string | null
          book_author?: string | null
          rating?: number | null
          likes_count?: number
          comments_count?: number
          shares_count?: number
          is_featured?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          post_type?: 'general' | 'review' | 'recommendation'
          book_title?: string | null
          book_author?: string | null
          rating?: number | null
          likes_count?: number
          comments_count?: number
          shares_count?: number
          is_featured?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          }
        ]
      }
      post_comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          likes_count: number
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          likes_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          likes_count?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          }
        ]
      }
      communities: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          color_gradient: string | null
          member_count: number
          post_count: number
          is_active: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          color_gradient?: string | null
          member_count?: number
          post_count?: number
          is_active?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          color_gradient?: string | null
          member_count?: number
          post_count?: number
          is_active?: boolean | null
          created_at?: string
        }
        Relationships: []
      }
      community_memberships: {
        Row: {
          id: string
          community_id: string
          user_id: string
          joined_at: string
          role: 'member' | 'moderator' | 'admin'
        }
        Insert: {
          id?: string
          community_id: string
          user_id: string
          joined_at?: string
          role?: 'member' | 'moderator' | 'admin'
        }
        Update: {
          id?: string
          community_id?: string
          user_id?: string
          joined_at?: string
          role?: 'member' | 'moderator' | 'admin'
        }
        Relationships: [
          {
            foreignKeyName: "community_memberships_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          }
        ]
      }
      nft_rewards: {
        Row: {
          created_at: string
          description: string
          id: string
          image_url: string | null
          is_active: boolean | null
          mint_criteria: Json
          name: string
          rarity: string
          redeemable_location: string | null
          value_points: number | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          mint_criteria: Json
          name: string
          rarity: string
          redeemable_location?: string | null
          value_points?: number | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          mint_criteria?: Json
          name?: string
          rarity?: string
          redeemable_location?: string | null
          value_points?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          community_points: number | null
          created_at: string
          display_name: string | null
          id: string
          reading_streak: number | null
          total_books_read: number | null
          total_nfts_earned: number | null
          total_reviews: number | null
          total_likes_received: number | null
          total_comments_received: number | null
          total_shares_received: number | null
          updated_at: string
          user_id: string
          username: string | null
          wallet_address: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          community_points?: number | null
          created_at?: string
          display_name?: string | null
          id?: string
          reading_streak?: number | null
          total_books_read?: number | null
          total_nfts_earned?: number | null
          total_reviews?: number | null
          total_likes_received?: number | null
          total_comments_received?: number | null
          total_shares_received?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
          wallet_address?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          community_points?: number | null
          created_at?: string
          display_name?: string | null
          id?: string
          reading_streak?: number | null
          total_books_read?: number | null
          total_nfts_earned?: number | null
          total_reviews?: number | null
          total_likes_received?: number | null
          total_comments_received?: number | null
          total_shares_received?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      user_nfts: {
        Row: {
          earned_at: string
          id: string
          is_redeemed: boolean | null
          nft_reward_id: string
          redeemed_at: string | null
          token_id: string | null
          user_id: string
        }
        Insert: {
          earned_at?: string
          id?: string
          is_redeemed?: boolean | null
          nft_reward_id: string
          redeemed_at?: string | null
          token_id?: string | null
          user_id: string
        }
        Update: {
          earned_at?: string
          id?: string
          is_redeemed?: boolean | null
          nft_reward_id?: string
          redeemed_at?: string | null
          token_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_nfts_nft_reward_id_fkey"
            columns: ["nft_reward_id"]
            isOneToOne: false
            referencedRelation: "nft_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_community_points: {
        Args: { points: number; user_id: string }
        Returns: undefined
      }
      increment_user_nfts: {
        Args: { user_id: string }
        Returns: undefined
      }
      track_engagement_activity: {
        Args: {
          user_id: string
          activity_type: string
          points_earned?: number
          metadata?: Json
        }
        Returns: string[]
      }
      join_community: {
        Args: {
          user_id: string
          community_id: string
        }
        Returns: boolean
      }
      get_user_engagement_stats: {
        Args: { user_id: string }
        Returns: {
          total_posts: number
          total_likes_given: number
          total_comments_given: number
          communities_joined: number
          engagement_score: number
        }[]
      }
      update_reading_stats: {
        Args: {
          books_increment?: number
          reviews_increment?: number
          streak_days?: number
          user_id: string
        }
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