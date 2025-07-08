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
      cart_items: {
        Row: {
          cart_id: string
          created_at: string
          id: string
          product_id: string
          quantity: number
          updated_at: string
          variant_id: string | null
        }
        Insert: {
          cart_id: string
          created_at?: string
          id?: string
          product_id: string
          quantity: number
          updated_at?: string
          variant_id?: string | null
        }
        Update: {
          cart_id?: string
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          created_at: string
          id: string
          session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      moneroo_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          moneroo_response: Json | null
          order_id: string
          payment_method: string | null
          reference_code: string
          status: string
          transaction_id: string
          updated_at: string
          webhook_data: Json | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          moneroo_response?: Json | null
          order_id: string
          payment_method?: string | null
          reference_code: string
          status?: string
          transaction_id: string
          updated_at?: string
          webhook_data?: Json | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          moneroo_response?: Json | null
          order_id?: string
          payment_method?: string | null
          reference_code?: string
          status?: string
          transaction_id?: string
          updated_at?: string
          webhook_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "moneroo_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      moneyfusion_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          customer_name: string
          customer_phone: string
          frais: number | null
          id: string
          moneyfusion_response: Json | null
          montant: number | null
          moyen: string | null
          numero_transaction: string | null
          order_id: string
          reference_code: string
          status: string
          token_pay: string
          updated_at: string
          webhook_data: Json | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          customer_name: string
          customer_phone: string
          frais?: number | null
          id?: string
          moneyfusion_response?: Json | null
          montant?: number | null
          moyen?: string | null
          numero_transaction?: string | null
          order_id: string
          reference_code: string
          status?: string
          token_pay: string
          updated_at?: string
          webhook_data?: Json | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          customer_name?: string
          customer_phone?: string
          frais?: number | null
          id?: string
          moneyfusion_response?: Json | null
          montant?: number | null
          moyen?: string | null
          numero_transaction?: string | null
          order_id?: string
          reference_code?: string
          status?: string
          token_pay?: string
          updated_at?: string
          webhook_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "moneyfusion_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price: number
          product_id: string
          product_name: string
          quantity: number
          total: number
          variant_id: string | null
          variant_name: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price: number
          product_id: string
          product_name: string
          quantity: number
          total: number
          variant_id?: string | null
          variant_name?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          product_name?: string
          quantity?: number
          total?: number
          variant_id?: string | null
          variant_name?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          created_at: string
          currency: string
          customer_notes: string | null
          discount_amount: number | null
          fulfillment_status: string
          id: string
          order_number: string
          payment_status: string
          reference_code: string | null
          shipping_address: Json | null
          shipping_amount: number | null
          status: string
          subtotal: number
          tax_amount: number | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string
          currency?: string
          customer_notes?: string | null
          discount_amount?: number | null
          fulfillment_status?: string
          id?: string
          order_number: string
          payment_status?: string
          reference_code?: string | null
          shipping_address?: Json | null
          shipping_amount?: number | null
          status?: string
          subtotal: number
          tax_amount?: number | null
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_address?: Json | null
          created_at?: string
          currency?: string
          customer_notes?: string | null
          discount_amount?: number | null
          fulfillment_status?: string
          id?: string
          order_number?: string
          payment_status?: string
          reference_code?: string | null
          shipping_address?: Json | null
          shipping_amount?: number | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      payment_gateways: {
        Row: {
          api_key: string | null
          api_secret: string | null
          config: Json | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          supported_currencies: string[]
          test_mode: boolean
          type: string
          updated_at: string
          webhook_secret: string | null
        }
        Insert: {
          api_key?: string | null
          api_secret?: string | null
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          supported_currencies?: string[]
          test_mode?: boolean
          type: string
          updated_at?: string
          webhook_secret?: string | null
        }
        Update: {
          api_key?: string | null
          api_secret?: string | null
          config?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          supported_currencies?: string[]
          test_mode?: boolean
          type?: string
          updated_at?: string
          webhook_secret?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          gateway_response: Json | null
          id: string
          order_id: string
          payment_method: string
          payment_provider: string
          status: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency: string
          gateway_response?: Json | null
          id?: string
          order_id: string
          payment_method: string
          payment_provider: string
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          gateway_response?: Json | null
          id?: string
          order_id?: string
          payment_method?: string
          payment_provider?: string
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          barcode: string | null
          compare_price: number | null
          cost_price: number | null
          created_at: string
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price: number
          product_id: string
          quantity: number | null
          sku: string | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          barcode?: string | null
          compare_price?: number | null
          cost_price?: number | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price: number
          product_id: string
          quantity?: number | null
          sku?: string | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          barcode?: string | null
          compare_price?: number | null
          cost_price?: number | null
          created_at?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price?: number
          product_id?: string
          quantity?: number | null
          sku?: string | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          allow_backorder: boolean | null
          barcode: string | null
          category_id: string
          compare_price: number | null
          cost_price: number | null
          created_at: string
          demo_url: string | null
          description: string
          digital_file_url: string | null
          id: string
          images: string[] | null
          is_active: boolean
          is_digital: boolean | null
          is_featured: boolean | null
          meta_description: string | null
          meta_title: string | null
          name: string
          preview_url: string | null
          price: number
          quantity: number | null
          requires_shipping: boolean | null
          short_description: string | null
          sku: string | null
          sort_order: number | null
          tags: string[] | null
          track_quantity: boolean | null
          updated_at: string
          vendor_id: string
          weight: number | null
        }
        Insert: {
          allow_backorder?: boolean | null
          barcode?: string | null
          category_id: string
          compare_price?: number | null
          cost_price?: number | null
          created_at?: string
          demo_url?: string | null
          description: string
          digital_file_url?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          is_digital?: boolean | null
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          preview_url?: string | null
          price: number
          quantity?: number | null
          requires_shipping?: boolean | null
          short_description?: string | null
          sku?: string | null
          sort_order?: number | null
          tags?: string[] | null
          track_quantity?: boolean | null
          updated_at?: string
          vendor_id: string
          weight?: number | null
        }
        Update: {
          allow_backorder?: boolean | null
          barcode?: string | null
          category_id?: string
          compare_price?: number | null
          cost_price?: number | null
          created_at?: string
          demo_url?: string | null
          description?: string
          digital_file_url?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          is_digital?: boolean | null
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          preview_url?: string | null
          price?: number
          quantity?: number | null
          requires_shipping?: boolean | null
          short_description?: string | null
          sku?: string | null
          sort_order?: number | null
          tags?: string[] | null
          track_quantity?: boolean | null
          updated_at?: string
          vendor_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          email: string
          id: string
          is_verified: boolean
          phone: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          email: string
          id?: string
          is_verified?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          is_verified?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          content: string | null
          created_at: string
          id: string
          images: string[] | null
          is_featured: boolean | null
          is_verified: boolean | null
          order_item_id: string | null
          product_id: string
          rating: number
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          order_item_id?: string | null
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          order_item_id?: string | null
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string | null
          api_key: string | null
          api_secret: string | null
          api_settings: Json | null
          business_name: string
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_verified: boolean
          logo_url: string | null
          payment_config: Json | null
          phone: string | null
          rating: number | null
          subdomain: string | null
          total_sales: number | null
          updated_at: string
          user_id: string
          webhook_secret: string | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          api_key?: string | null
          api_secret?: string | null
          api_settings?: Json | null
          business_name: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_verified?: boolean
          logo_url?: string | null
          payment_config?: Json | null
          phone?: string | null
          rating?: number | null
          subdomain?: string | null
          total_sales?: number | null
          updated_at?: string
          user_id: string
          webhook_secret?: string | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          api_key?: string | null
          api_secret?: string | null
          api_settings?: Json | null
          business_name?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_verified?: boolean
          logo_url?: string | null
          payment_config?: Json | null
          phone?: string | null
          rating?: number | null
          subdomain?: string | null
          total_sales?: number | null
          updated_at?: string
          user_id?: string
          webhook_secret?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
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
      generate_order_reference_code: {
        Args: Record<PropertyKey, never>
        Returns: string
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
