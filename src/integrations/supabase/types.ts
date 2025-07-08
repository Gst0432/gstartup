export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          balance: number
          created_at: string | null
          id: string
          name: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ad_campaigns: {
        Row: {
          channel: string
          created_at: string | null
          daily_budget: number
          duration: number
          id: string
          start_date: string
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          channel: string
          created_at?: string | null
          daily_budget: number
          duration: number
          id?: string
          start_date: string
          status: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          channel?: string
          created_at?: string | null
          daily_budget?: number
          duration?: number
          id?: string
          start_date?: string
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ad_sales: {
        Row: {
          amount: number
          campaign_id: string
          created_at: string | null
          date: string
          id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          campaign_id: string
          created_at?: string | null
          date: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          campaign_id?: string
          created_at?: string | null
          date?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ad_sales_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "ad_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_actions: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: string
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      affiliates: {
        Row: {
          created_at: string | null
          earnings: number | null
          email: string
          id: string
          referral_count: number | null
          referred_by: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          earnings?: number | null
          email: string
          id?: string
          referral_count?: number | null
          referred_by?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          earnings?: number | null
          email?: string
          id?: string
          referral_count?: number | null
          referred_by?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      balance_history: {
        Row: {
          account_id: string
          change_amount: number
          change_type: string
          created_at: string | null
          id: string
          new_balance: number
          previous_balance: number
          transaction_id: string | null
        }
        Insert: {
          account_id: string
          change_amount: number
          change_type: string
          created_at?: string | null
          id?: string
          new_balance: number
          previous_balance: number
          transaction_id?: string | null
        }
        Update: {
          account_id?: string
          change_amount?: number
          change_type?: string
          created_at?: string | null
          id?: string
          new_balance?: number
          previous_balance?: number
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "balance_history_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      banned_users: {
        Row: {
          banned_until: string
          created_at: string | null
          reason: string
          user_id: string
        }
        Insert: {
          banned_until: string
          created_at?: string | null
          reason: string
          user_id: string
        }
        Update: {
          banned_until?: string
          created_at?: string | null
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "banned_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      community_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          post_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          post_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          post_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts_with_authors"
            referencedColumns: ["id"]
          },
        ]
      }
      community_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts_with_authors"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          status: string
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          status?: string
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          status?: string
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: string
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          nif: string
          phone: string
          rccm: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          nif: string
          phone: string
          rccm: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          nif?: string
          phone?: string
          rccm?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      debts_credits: {
        Row: {
          account_id: string | null
          amount: number
          category: string
          created_at: string | null
          description: string
          due_date: string
          id: string
          paid_amount: number
          person_name: string
          status: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category: string
          created_at?: string | null
          description: string
          due_date: string
          id?: string
          paid_amount?: number
          person_name: string
          status: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category?: string
          created_at?: string | null
          description?: string
          due_date?: string
          id?: string
          paid_amount?: number
          person_name?: string
          status?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debts_credits_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          client_id: string
          company_id: string
          created_at: string | null
          date: string
          id: string
          items: Json
          notes: string | null
          number: string
          sale_id: string | null
          status: string
          subtotal: number
          total_ttc: number
          tva_amount: number
          tva_rate: number
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_id: string
          company_id: string
          created_at?: string | null
          date: string
          id?: string
          items?: Json
          notes?: string | null
          number: string
          sale_id?: string | null
          status: string
          subtotal: number
          total_ttc: number
          tva_amount: number
          tva_rate: number
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_id?: string
          company_id?: string
          created_at?: string | null
          date?: string
          id?: string
          items?: Json
          notes?: string | null
          number?: string
          sale_id?: string | null
          status?: string
          subtotal?: number
          total_ttc?: number
          tva_amount?: number
          tva_rate?: number
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string | null
          current_amount: number
          deadline: string
          description: string | null
          id: string
          target_amount: number
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_amount?: number
          deadline: string
          description?: string | null
          id?: string
          target_amount: number
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_amount?: number
          deadline?: string
          description?: string | null
          id?: string
          target_amount?: number
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      idea_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          idea_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          idea_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          idea_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idea_comments_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_comments_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      idea_likes: {
        Row: {
          created_at: string | null
          id: string
          idea_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          idea_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          idea_id?: string
          user_id?: string
        }
        Relationships: []
      }
      idea_reports: {
        Row: {
          created_at: string | null
          id: string
          idea_id: string | null
          reason: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          idea_id?: string | null
          reason: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          idea_id?: string | null
          reason?: string
          user_id?: string | null
        }
        Relationships: []
      }
      idea_votes: {
        Row: {
          created_at: string
          id: string
          idea_id: string
          user_id: string
          vote_type: number
        }
        Insert: {
          created_at?: string
          id?: string
          idea_id: string
          user_id: string
          vote_type: number
        }
        Update: {
          created_at?: string
          id?: string
          idea_id?: string
          user_id?: string
          vote_type?: number
        }
        Relationships: [
          {
            foreignKeyName: "idea_votes_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "idea_votes_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas: {
        Row: {
          created_at: string
          description: string
          id: string
          status: string
          title: string
          updated_at: string
          user_id: string
          votes_count: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
          votes_count?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          votes_count?: number
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string
          created_at: string | null
          id: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      physical_products: {
        Row: {
          alert_threshold: number
          category: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          other_category: string | null
          purchase_price: number
          quantity: number
          sale_price: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alert_threshold?: number
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          other_category?: string | null
          purchase_price: number
          quantity?: number
          sale_price: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alert_threshold?: number
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          other_category?: string | null
          purchase_price?: number
          quantity?: number
          sale_price?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      premium_status_logs: {
        Row: {
          action: string
          created_at: string | null
          created_by: string | null
          id: string
          new_status: Json | null
          previous_status: Json | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          new_status?: Json | null
          previous_status?: Json | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          new_status?: Json | null
          previous_status?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      premium_users: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          is_active: boolean
          start_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          start_date?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          start_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string
          created_at: string | null
          description: string
          id: string
          link: string
          name: string
          price: number | null
          tags: string[]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          id?: string
          link: string
          name: string
          price?: number | null
          tags?: string[]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          link?: string
          name?: string
          price?: number | null
          tags?: string[]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          role: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          name: string
          phone?: string | null
          role?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_premium: boolean | null
          name: string
          phone: string
          referrer_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          is_premium?: boolean | null
          name: string
          phone: string
          referrer_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_premium?: boolean | null
          name?: string
          phone?: string
          referrer_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sales: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string | null
          customer_address: string | null
          customer_name: string
          customer_phone: string
          date: string
          description: string
          digital_product_id: string | null
          id: string
          payment_method: string
          physical_product_id: string | null
          product_type: string | null
          quantity: number | null
          receipt_number: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string | null
          customer_address?: string | null
          customer_name: string
          customer_phone: string
          date?: string
          description: string
          digital_product_id?: string | null
          id?: string
          payment_method: string
          physical_product_id?: string | null
          product_type?: string | null
          quantity?: number | null
          receipt_number: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string | null
          customer_address?: string | null
          customer_name?: string
          customer_phone?: string
          date?: string
          description?: string
          digital_product_id?: string | null
          id?: string
          payment_method?: string
          physical_product_id?: string | null
          product_type?: string | null
          quantity?: number | null
          receipt_number?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_digital_product_id_fkey"
            columns: ["digital_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_physical_product_id_fkey"
            columns: ["physical_product_id"]
            isOneToOne: false
            referencedRelation: "physical_products"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_products: {
        Row: {
          created_at: string | null
          description: string
          id: string
          image_url: string
          name: string
          price: number
          slug: string
          updated_at: string | null
          user_id: string
          whatsapp_number: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          image_url: string
          name: string
          price: number
          slug: string
          updated_at?: string | null
          user_id: string
          whatsapp_number: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string
          name?: string
          price?: number
          slug?: string
          updated_at?: string | null
          user_id?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string | null
          customer_id: string
          end_date: string
          id: string
          service_name: string | null
          service_type: string
          start_date: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string | null
          customer_id: string
          end_date: string
          id?: string
          service_name?: string | null
          service_type: string
          start_date: string
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string | null
          customer_id?: string
          end_date?: string
          id?: string
          service_name?: string | null
          service_type?: string
          start_date?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          category: string
          created_at: string | null
          date: string
          description: string
          id: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          category: string
          created_at?: string | null
          date?: string
          description: string
          id?: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          category?: string
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_banned: boolean | null
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_banned?: boolean | null
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_banned?: boolean | null
          phone?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      affiliate_referrals: {
        Row: {
          referral_date: string | null
          referral_email: string | null
          referral_name: string | null
          referrer_id: string | null
        }
        Relationships: []
      }
      community_leaderboard: {
        Row: {
          id: string | null
          likes_received: number | null
          name: string | null
          points: number | null
          posts_count: number | null
        }
        Relationships: []
      }
      community_posts_with_authors: {
        Row: {
          author_name: string | null
          content: string | null
          created_at: string | null
          id: string | null
          liked_by_user: boolean | null
          likes_count: number | null
          status: string | null
          title: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
      ideas_with_details: {
        Row: {
          author_name: string | null
          comments: Json | null
          created_at: string | null
          description: string | null
          has_voted: boolean | null
          id: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          user_vote: number | null
          votes_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      activate_premium: {
        Args: {
          user_id: string
          duration_months?: number
          payment_token?: string
          payment_method?: string
          admin_id?: string
        }
        Returns: boolean
      }
      admin_extend_trial_period: {
        Args: { target_user_id: string; days_to_add: number }
        Returns: boolean
      }
      audit_premium_statuses: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
          previous_status: string
          new_status: string
          action: string
        }[]
      }
      check_premium_status: {
        Args: { user_id: string }
        Returns: boolean
      }
      check_table_exists: {
        Args: { table_name: string }
        Returns: boolean
      }
      check_trial_status: {
        Args: { user_id: string }
        Returns: Json
      }
      convert_trial_to_premium: {
        Args: { user_id: string; duration_months?: number }
        Returns: boolean
      }
      create_premium_expiry_trigger: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_premium_users_table: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      deactivate_premium: {
        Args: { user_id: string; admin_id?: string }
        Returns: boolean
      }
      extend_trial_period: {
        Args: { user_id: string; days_to_add: number; admin_id?: string }
        Returns: boolean
      }
      generate_premium_status_report: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_all_trial_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          email: string
          name: string
          trial_end_date: string
          days_left: number
          is_in_trial: boolean
        }[]
      }
      get_trial_statistics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      is_admin: {
        Args: Record<PropertyKey, never> | { user_id: string }
        Returns: boolean
      }
      promote_to_admin: {
        Args: { user_email: string }
        Returns: undefined
      }
      verify_payment_and_activate_premium: {
        Args: {
          payment_token: string
          user_id: string
          duration_months?: number
        }
        Returns: boolean
      }
    }
    Enums: {
      idea_category:
        | "feature_request"
        | "bug_report"
        | "improvement"
        | "business"
        | "technical"
        | "other"
      idea_status: "pending" | "approved" | "rejected" | "implemented"
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
      idea_category: [
        "feature_request",
        "bug_report",
        "improvement",
        "business",
        "technical",
        "other",
      ],
      idea_status: ["pending", "approved", "rejected", "implemented"],
    },
  },
} as const
