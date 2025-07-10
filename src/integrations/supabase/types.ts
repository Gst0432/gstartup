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
      account_movements: {
        Row: {
          account_id: string
          amount: number
          balance_after: number
          balance_before: number
          created_at: string
          description: string | null
          id: string
          movement_type: Database["public"]["Enums"]["movement_type"]
          reference_id: string | null
          reference_table: string | null
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          balance_after: number
          balance_before: number
          created_at?: string
          description?: string | null
          id?: string
          movement_type: Database["public"]["Enums"]["movement_type"]
          reference_id?: string | null
          reference_table?: string | null
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          balance_after?: number
          balance_before?: number
          created_at?: string
          description?: string | null
          id?: string
          movement_type?: Database["public"]["Enums"]["movement_type"]
          reference_id?: string | null
          reference_table?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_movements_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          created_at: string
          current_balance: number | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          opening_balance: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_type: Database["public"]["Enums"]["account_type"]
          created_at?: string
          current_balance?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          opening_balance?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          created_at?: string
          current_balance?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          opening_balance?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      admin_plans: {
        Row: {
          created_at: string
          duration_type: string
          features: Json | null
          id: string
          is_active: boolean
          max_activations_per_year: number | null
          name: string
          price_fcfa: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_type: string
          features?: Json | null
          id?: string
          is_active?: boolean
          max_activations_per_year?: number | null
          name: string
          price_fcfa: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_type?: string
          features?: Json | null
          id?: string
          is_active?: boolean
          max_activations_per_year?: number | null
          name?: string
          price_fcfa?: number
          updated_at?: string
        }
        Relationships: []
      }
      admin_subscriptions: {
        Row: {
          activations_used: number
          admin_id: string
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean
          plan_id: string
          start_date: string
          updated_at: string
        }
        Insert: {
          activations_used?: number
          admin_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          plan_id: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          activations_used?: number
          admin_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          plan_id?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "admin_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      advertising_banners: {
        Row: {
          action_url: string | null
          created_at: string
          created_by: string
          id: string
          image_url: string | null
          is_active: boolean
          message: string
          title: string
          updated_at: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          created_by: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          message: string
          title: string
          updated_at?: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          created_by?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          message?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      commission_withdrawals: {
        Row: {
          amount_fcfa: number
          created_at: string
          id: string
          notes: string | null
          phone_number: string | null
          processed_at: string | null
          status: string
          updated_at: string
          user_id: string
          withdrawal_method: string
        }
        Insert: {
          amount_fcfa: number
          created_at?: string
          id?: string
          notes?: string | null
          phone_number?: string | null
          processed_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
          withdrawal_method?: string
        }
        Update: {
          amount_fcfa?: number
          created_at?: string
          id?: string
          notes?: string | null
          phone_number?: string | null
          processed_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          withdrawal_method?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      debt_payments: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string
          debt_id: string
          description: string | null
          id: string
          payment_date: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string
          debt_id: string
          description?: string | null
          id?: string
          payment_date?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string
          debt_id?: string
          description?: string | null
          id?: string
          payment_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debt_payments_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debt_payments_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "debts_receivables"
            referencedColumns: ["id"]
          },
        ]
      }
      debts_receivables: {
        Row: {
          account_id: string | null
          amount_paid: number | null
          category: Database["public"]["Enums"]["debt_category"] | null
          counterparty_contact: string | null
          counterparty_name: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          status: Database["public"]["Enums"]["debt_status"] | null
          total_amount: number
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount_paid?: number | null
          category?: Database["public"]["Enums"]["debt_category"] | null
          counterparty_contact?: string | null
          counterparty_name: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["debt_status"] | null
          total_amount: number
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount_paid?: number | null
          category?: Database["public"]["Enums"]["debt_category"] | null
          counterparty_contact?: string | null
          counterparty_name?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          status?: Database["public"]["Enums"]["debt_status"] | null
          total_amount?: number
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "debts_receivables_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          account_id: string | null
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string
          description: string | null
          expense_date: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          description?: string | null
          expense_date?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          description?: string | null
          expense_date?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_goals: {
        Row: {
          created_at: string
          current_amount: number | null
          deadline: string | null
          description: string | null
          goal_type: Database["public"]["Enums"]["goal_type"]
          id: string
          status: Database["public"]["Enums"]["goal_status"] | null
          target_amount: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_amount?: number | null
          deadline?: string | null
          description?: string | null
          goal_type: Database["public"]["Enums"]["goal_type"]
          id?: string
          status?: Database["public"]["Enums"]["goal_status"] | null
          target_amount: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_amount?: number | null
          deadline?: string | null
          description?: string | null
          goal_type?: Database["public"]["Enums"]["goal_type"]
          id?: string
          status?: Database["public"]["Enums"]["goal_status"] | null
          target_amount?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      password_reset_codes: {
        Row: {
          code: string
          created_at: string
          email: string
          expires_at: string
          id: string
          used: boolean | null
        }
        Insert: {
          code: string
          created_at?: string
          email: string
          expires_at: string
          id?: string
          used?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          used?: boolean | null
        }
        Relationships: []
      }
      premium_promotions: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          discount_percentage: number
          end_date: string | null
          id: string
          is_active: boolean
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          discount_percentage: number
          end_date?: string | null
          id?: string
          is_active?: boolean
          name: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          discount_percentage?: number
          end_date?: string | null
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          access_link: string | null
          alert_threshold: number | null
          category: Database["public"]["Enums"]["product_category"]
          created_at: string
          description: string | null
          download_link: string | null
          id: string
          is_active: boolean | null
          name: string
          price: number | null
          product_type: Database["public"]["Enums"]["product_type"]
          purchase_price: number | null
          selling_price: number | null
          stock_quantity: number | null
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_link?: string | null
          alert_threshold?: number | null
          category: Database["public"]["Enums"]["product_category"]
          created_at?: string
          description?: string | null
          download_link?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price?: number | null
          product_type: Database["public"]["Enums"]["product_type"]
          purchase_price?: number | null
          selling_price?: number | null
          stock_quantity?: number | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_link?: string | null
          alert_threshold?: number | null
          category?: Database["public"]["Enums"]["product_category"]
          created_at?: string
          description?: string | null
          download_link?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number | null
          product_type?: Database["public"]["Enums"]["product_type"]
          purchase_price?: number | null
          selling_price?: number | null
          stock_quantity?: number | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          is_premium: boolean | null
          phone: string | null
          premium_until: string | null
          referral_code: string | null
          referred_by_code: string | null
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          is_premium?: boolean | null
          phone?: string | null
          premium_until?: string | null
          referral_code?: string | null
          referred_by_code?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          is_premium?: boolean | null
          phone?: string | null
          premium_until?: string | null
          referral_code?: string | null
          referred_by_code?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          available_commission: number | null
          commission_earned: number | null
          created_at: string
          id: string
          is_premium: boolean | null
          last_commission_date: string | null
          referee_email: string
          referee_name: string
          referee_phone: string | null
          referrer_id: string
          total_commission_earned: number | null
        }
        Insert: {
          available_commission?: number | null
          commission_earned?: number | null
          created_at?: string
          id?: string
          is_premium?: boolean | null
          last_commission_date?: string | null
          referee_email: string
          referee_name: string
          referee_phone?: string | null
          referrer_id: string
          total_commission_earned?: number | null
        }
        Update: {
          available_commission?: number | null
          commission_earned?: number | null
          created_at?: string
          id?: string
          is_premium?: boolean | null
          last_commission_date?: string | null
          referee_email?: string
          referee_name?: string
          referee_phone?: string | null
          referrer_id?: string
          total_commission_earned?: number | null
        }
        Relationships: []
      }
      sales: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string
          customer_id: string | null
          description: string | null
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          receipt_number: string
          sale_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string
          customer_id?: string | null
          description?: string | null
          id?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          receipt_number: string
          sale_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string
          customer_id?: string | null
          description?: string | null
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          receipt_number?: string
          sale_date?: string
          updated_at?: string
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
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_renewals: {
        Row: {
          amount: number
          id: string
          new_end_date: string
          notes: string | null
          previous_end_date: string
          renewed_at: string
          subscription_id: string
          user_id: string
        }
        Insert: {
          amount: number
          id?: string
          new_end_date: string
          notes?: string | null
          previous_end_date: string
          renewed_at?: string
          subscription_id: string
          user_id: string
        }
        Update: {
          amount?: number
          id?: string
          new_end_date?: string
          notes?: string | null
          previous_end_date?: string
          renewed_at?: string
          subscription_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_renewals_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          account_id: string | null
          amount: number
          auto_renewal: boolean | null
          created_at: string
          customer_id: string
          description: string | null
          duration_months: number
          end_date: string
          id: string
          notes: string | null
          payment_frequency: string | null
          service_name: string
          service_type: Database["public"]["Enums"]["service_type"]
          start_date: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          auto_renewal?: boolean | null
          created_at?: string
          customer_id: string
          description?: string | null
          duration_months: number
          end_date: string
          id?: string
          notes?: string | null
          payment_frequency?: string | null
          service_name: string
          service_type: Database["public"]["Enums"]["service_type"]
          start_date: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          auto_renewal?: boolean | null
          created_at?: string
          customer_id?: string
          description?: string | null
          duration_months?: number
          end_date?: string
          id?: string
          notes?: string | null
          payment_frequency?: string | null
          service_name?: string
          service_type?: Database["public"]["Enums"]["service_type"]
          start_date?: string
          status?: string | null
          updated_at?: string
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
      user_payments: {
        Row: {
          amount_fcfa: number
          commission_amount: number | null
          created_at: string
          id: string
          moneroo_payment_id: string | null
          payment_method: string
          payment_status: string
          payment_url: string | null
          plan_id: string
          referrer_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_fcfa: number
          commission_amount?: number | null
          created_at?: string
          id?: string
          moneroo_payment_id?: string | null
          payment_method?: string
          payment_status?: string
          payment_url?: string | null
          plan_id: string
          referrer_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_fcfa?: number
          commission_amount?: number | null
          created_at?: string
          id?: string
          moneroo_payment_id?: string | null
          payment_method?: string
          payment_status?: string
          payment_url?: string | null
          plan_id?: string
          referrer_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "user_premium_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_premium_plans: {
        Row: {
          commission_fcfa: number
          created_at: string
          duration_days: number | null
          id: string
          is_active: boolean
          name: string
          price_fcfa: number
          updated_at: string
        }
        Insert: {
          commission_fcfa?: number
          created_at?: string
          duration_days?: number | null
          id?: string
          is_active?: boolean
          name: string
          price_fcfa: number
          updated_at?: string
        }
        Update: {
          commission_fcfa?: number
          created_at?: string
          duration_days?: number | null
          id?: string
          is_active?: boolean
          name?: string
          price_fcfa?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_premium_subscriptions: {
        Row: {
          admin_id: string
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean
          plan_type: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          plan_type: string
          start_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          plan_type?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_admin_plan: {
        Args: {
          target_admin_email: string
          plan_name: string
          duration_days?: number
        }
        Returns: undefined
      }
      can_admin_grant_premium: {
        Args: { admin_user_id: string }
        Returns: boolean
      }
      create_notification: {
        Args: {
          target_user_id: string
          notification_title: string
          notification_message: string
          notification_type?: string
          notification_action_url?: string
          notification_metadata?: Json
        }
        Returns: string
      }
      generate_receipt_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_active_banner: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          title: string
          message: string
          image_url: string
          action_url: string
        }[]
      }
      get_active_promotion: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          description: string
          discount_percentage: number
        }[]
      }
      get_admin_activations_remaining: {
        Args: { admin_user_id: string }
        Returns: number
      }
      get_admin_user_email: {
        Args: { target_user_id: string }
        Returns: string
      }
      get_user_commission_balance: {
        Args: { user_uuid: string }
        Returns: number
      }
      grant_user_premium: {
        Args: {
          target_user_email: string
          plan_type: string
          duration_days?: number
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_authorized_super_admin_for_banners: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      notify_expiring_subscriptions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      process_payment_completion: {
        Args: { payment_id: string }
        Returns: undefined
      }
      promote_user_to_admin: {
        Args: { target_user_email: string }
        Returns: undefined
      }
      renew_subscription: {
        Args: {
          subscription_id: string
          additional_months: number
          renewal_amount: number
        }
        Returns: undefined
      }
      revoke_admin_role: {
        Args: { target_user_email: string }
        Returns: undefined
      }
      revoke_user_premium: {
        Args: { target_user_email: string }
        Returns: undefined
      }
    }
    Enums: {
      account_type: "mobile_money" | "bank" | "e_wallet" | "cash" | "other"
      app_role: "admin" | "user" | "super_admin"
      debt_category: "personal" | "business" | "other"
      debt_status: "pending" | "partial" | "paid" | "overdue"
      expense_category:
        | "transport"
        | "alimentation"
        | "loyer"
        | "factures"
        | "education"
        | "sante"
        | "divertissement"
        | "business"
        | "investissement"
        | "autres"
      goal_status: "active" | "achieved" | "cancelled" | "overdue"
      goal_type: "sales" | "savings" | "expense" | "other"
      movement_type:
        | "sale"
        | "expense"
        | "subscription"
        | "debt"
        | "receivable"
        | "adjustment"
        | "transfer"
      payment_method:
        | "cash"
        | "mobile_money"
        | "bank_transfer"
        | "card"
        | "e_wallet"
        | "credit"
      product_category:
        | "software"
        | "ebook"
        | "course"
        | "template"
        | "music"
        | "video"
        | "game"
        | "app"
        | "electronics"
        | "clothing"
        | "food"
        | "books"
        | "toys"
        | "sports"
        | "health"
        | "beauty"
        | "home"
        | "automotive"
        | "other"
      product_type: "digital" | "physical"
      service_type:
        | "netflix"
        | "iptv"
        | "hosting"
        | "coaching"
        | "software"
        | "music"
        | "gaming"
        | "education"
        | "fitness"
        | "other"
      subscription_status: "active" | "expired" | "cancelled" | "pending"
      transaction_type: "debt" | "receivable"
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
      account_type: ["mobile_money", "bank", "e_wallet", "cash", "other"],
      app_role: ["admin", "user", "super_admin"],
      debt_category: ["personal", "business", "other"],
      debt_status: ["pending", "partial", "paid", "overdue"],
      expense_category: [
        "transport",
        "alimentation",
        "loyer",
        "factures",
        "education",
        "sante",
        "divertissement",
        "business",
        "investissement",
        "autres",
      ],
      goal_status: ["active", "achieved", "cancelled", "overdue"],
      goal_type: ["sales", "savings", "expense", "other"],
      movement_type: [
        "sale",
        "expense",
        "subscription",
        "debt",
        "receivable",
        "adjustment",
        "transfer",
      ],
      payment_method: [
        "cash",
        "mobile_money",
        "bank_transfer",
        "card",
        "e_wallet",
        "credit",
      ],
      product_category: [
        "software",
        "ebook",
        "course",
        "template",
        "music",
        "video",
        "game",
        "app",
        "electronics",
        "clothing",
        "food",
        "books",
        "toys",
        "sports",
        "health",
        "beauty",
        "home",
        "automotive",
        "other",
      ],
      product_type: ["digital", "physical"],
      service_type: [
        "netflix",
        "iptv",
        "hosting",
        "coaching",
        "software",
        "music",
        "gaming",
        "education",
        "fitness",
        "other",
      ],
      subscription_status: ["active", "expired", "cancelled", "pending"],
      transaction_type: ["debt", "receivable"],
    },
  },
} as const
