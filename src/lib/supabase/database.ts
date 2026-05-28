export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string;
          icon: string | null;
          id: string;
          name: string;
          sort_order: number;
        };
        Insert: {
          created_at?: string;
          icon?: string | null;
          id?: string;
          name: string;
          sort_order?: number;
        };
        Update: {
          created_at?: string;
          icon?: string | null;
          id?: string;
          name?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      menu_items: {
        Row: {
          category_id: string;
          created_at: string;
          description: string | null;
          id: string;
          image: string | null;
          name: string;
          original_price: number;
          status: Database['public']['Enums']['menu_item_status'];
          store_id: string;
          updated_at: string;
        };
        Insert: {
          category_id: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          image?: string | null;
          name: string;
          original_price: number;
          status?: Database['public']['Enums']['menu_item_status'];
          store_id: string;
          updated_at?: string;
        };
        Update: {
          category_id?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          image?: string | null;
          name?: string;
          original_price?: number;
          status?: Database['public']['Enums']['menu_item_status'];
          store_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'menu_items_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'menu_items_store_id_fkey';
            columns: ['store_id'];
            isOneToOne: false;
            referencedRelation: 'stores';
            referencedColumns: ['id'];
          },
        ];
      };
      order_items: {
        Row: {
          created_at: string;
          discount_price: number;
          id: string;
          order_id: string;
          original_price: number;
          product_id: string;
          product_name: string;
          quantity: number;
          subtotal: number;
        };
        Insert: {
          created_at?: string;
          discount_price: number;
          id?: string;
          order_id: string;
          original_price: number;
          product_id: string;
          product_name: string;
          quantity: number;
          subtotal: number;
        };
        Update: {
          created_at?: string;
          discount_price?: number;
          id?: string;
          order_id?: string;
          original_price?: number;
          product_id?: string;
          product_name?: string;
          quantity?: number;
          subtotal?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
      orders: {
        Row: {
          cancel_reason: string | null;
          cancelled_at: string | null;
          created_at: string;
          discount_amount: number;
          expires_at: string | null;
          id: string;
          order_number: string;
          payment_amount: number;
          picked_up_at: string | null;
          pickup_at: string;
          pickup_number: string | null;
          pickup_service_date: string;
          status: Database['public']['Enums']['order_status'];
          store_id: string;
          store_order_number: string | null;
          store_order_sequence: number | null;
          total_amount: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          cancel_reason?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          discount_amount: number;
          expires_at?: string | null;
          id?: string;
          order_number: string;
          payment_amount: number;
          picked_up_at?: string | null;
          pickup_at: string;
          pickup_number?: string | null;
          pickup_service_date: string;
          status?: Database['public']['Enums']['order_status'];
          store_id: string;
          store_order_number?: string | null;
          store_order_sequence?: number | null;
          total_amount: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          cancel_reason?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          discount_amount?: number;
          expires_at?: string | null;
          id?: string;
          order_number?: string;
          payment_amount?: number;
          picked_up_at?: string | null;
          pickup_at?: string;
          pickup_number?: string | null;
          pickup_service_date?: string;
          status?: Database['public']['Enums']['order_status'];
          store_id?: string;
          store_order_number?: string | null;
          store_order_sequence?: number | null;
          total_amount?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'orders_store_id_fkey';
            columns: ['store_id'];
            isOneToOne: false;
            referencedRelation: 'stores';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'orders_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      payments: {
        Row: {
          amount: number;
          created_at: string;
          id: string;
          method: Database['public']['Enums']['payment_method'];
          method_detail: string | null;
          order_id: string;
          paid_at: string | null;
          pg_response: Json | null;
          provider: Database['public']['Enums']['payment_provider'];
          provider_order_id: string | null;
          provider_payment_key: string | null;
          refund_reason: string | null;
          refunded_at: string | null;
          status: Database['public']['Enums']['payment_status'];
          updated_at: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          id?: string;
          method: Database['public']['Enums']['payment_method'];
          method_detail?: string | null;
          order_id: string;
          paid_at?: string | null;
          pg_response?: Json | null;
          provider: Database['public']['Enums']['payment_provider'];
          provider_order_id?: string | null;
          provider_payment_key?: string | null;
          refund_reason?: string | null;
          refunded_at?: string | null;
          status: Database['public']['Enums']['payment_status'];
          updated_at?: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          id?: string;
          method?: Database['public']['Enums']['payment_method'];
          method_detail?: string | null;
          order_id?: string;
          paid_at?: string | null;
          pg_response?: Json | null;
          provider?: Database['public']['Enums']['payment_provider'];
          provider_order_id?: string | null;
          provider_payment_key?: string | null;
          refund_reason?: string | null;
          refunded_at?: string | null;
          status?: Database['public']['Enums']['payment_status'];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payments_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: true;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
        ];
      };
      products: {
        Row: {
          available_stock: number;
          category_id: string | null;
          created_at: string;
          discount_price: number;
          discount_rate: number;
          end_at: string;
          id: string;
          menu_item_id: string;
          original_price: number;
          pickup_end_time: string;
          pickup_start_time: string;
          reserved_stock: number;
          status: Database['public']['Enums']['product_status'];
          stock: number;
          store_id: string;
          updated_at: string;
        };
        Insert: {
          available_stock?: number;
          category_id?: string | null;
          created_at?: string;
          discount_price: number;
          discount_rate?: number;
          end_at: string;
          id?: string;
          menu_item_id: string;
          original_price?: number;
          pickup_end_time: string;
          pickup_start_time: string;
          reserved_stock?: number;
          status?: Database['public']['Enums']['product_status'];
          stock?: number;
          store_id: string;
          updated_at?: string;
        };
        Update: {
          available_stock?: number;
          category_id?: string | null;
          created_at?: string;
          discount_price?: number;
          discount_rate?: number;
          end_at?: string;
          id?: string;
          menu_item_id?: string;
          original_price?: number;
          pickup_end_time?: string;
          pickup_start_time?: string;
          reserved_stock?: number;
          status?: Database['public']['Enums']['product_status'];
          stock?: number;
          store_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'products_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'categories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'products_menu_item_id_fkey';
            columns: ['menu_item_id'];
            isOneToOne: false;
            referencedRelation: 'menu_items';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'products_store_id_fkey';
            columns: ['store_id'];
            isOneToOne: false;
            referencedRelation: 'stores';
            referencedColumns: ['id'];
          },
        ];
      };
      seller_application_documents: {
        Row: {
          application_id: string;
          content_type: string;
          created_at: string;
          id: string;
          original_file_name: string;
          size: number;
          storage_path: string;
          type: Database['public']['Enums']['seller_application_document_type'];
        };
        Insert: {
          application_id: string;
          content_type: string;
          created_at?: string;
          id?: string;
          original_file_name: string;
          size: number;
          storage_path: string;
          type: Database['public']['Enums']['seller_application_document_type'];
        };
        Update: {
          application_id?: string;
          content_type?: string;
          created_at?: string;
          id?: string;
          original_file_name?: string;
          size?: number;
          storage_path?: string;
          type?: Database['public']['Enums']['seller_application_document_type'];
        };
        Relationships: [
          {
            foreignKeyName: 'seller_application_documents_application_id_fkey';
            columns: ['application_id'];
            isOneToOne: false;
            referencedRelation: 'seller_applications';
            referencedColumns: ['id'];
          },
        ];
      };
      seller_applications: {
        Row: {
          business_address: string;
          business_category: string;
          business_number: string;
          business_type: string;
          company_name: string;
          created_at: string;
          id: string;
          reject_reason: string | null;
          representative_name: string;
          reviewed_at: string | null;
          status: Database['public']['Enums']['seller_application_status'];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          business_address: string;
          business_category: string;
          business_number: string;
          business_type: string;
          company_name: string;
          created_at?: string;
          id?: string;
          reject_reason?: string | null;
          representative_name: string;
          reviewed_at?: string | null;
          status?: Database['public']['Enums']['seller_application_status'];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          business_address?: string;
          business_category?: string;
          business_number?: string;
          business_type?: string;
          company_name?: string;
          created_at?: string;
          id?: string;
          reject_reason?: string | null;
          representative_name?: string;
          reviewed_at?: string | null;
          status?: Database['public']['Enums']['seller_application_status'];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'seller_applications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      social_accounts: {
        Row: {
          created_at: string;
          id: string;
          provider: Database['public']['Enums']['social_provider'];
          provider_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          provider: Database['public']['Enums']['social_provider'];
          provider_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          provider?: Database['public']['Enums']['social_provider'];
          provider_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'social_accounts_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      store_order_sequences: {
        Row: {
          created_at: string;
          last_sequence: number;
          pickup_service_date: string;
          store_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          last_sequence?: number;
          pickup_service_date: string;
          store_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          last_sequence?: number;
          pickup_service_date?: string;
          store_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'store_order_sequences_store_id_fkey';
            columns: ['store_id'];
            isOneToOne: false;
            referencedRelation: 'stores';
            referencedColumns: ['id'];
          },
        ];
      };
      stores: {
        Row: {
          address: string;
          address_detail: string | null;
          business_number: string;
          close_time: string | null;
          created_at: string;
          description: string | null;
          id: string;
          image: string | null;
          name: string;
          open_time: string | null;
          phone: string;
          region: string;
          status: Database['public']['Enums']['store_status'];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          address: string;
          address_detail?: string | null;
          business_number: string;
          close_time?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image?: string | null;
          name: string;
          open_time?: string | null;
          phone: string;
          region: string;
          status?: Database['public']['Enums']['store_status'];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          address?: string;
          address_detail?: string | null;
          business_number?: string;
          close_time?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          image?: string | null;
          name?: string;
          open_time?: string | null;
          phone?: string;
          region?: string;
          status?: Database['public']['Enums']['store_status'];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'stores_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          name: string;
          phone: string | null;
          profile_image: string | null;
          role: Database['public']['Enums']['user_role'];
          status: Database['public']['Enums']['user_status'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id: string;
          name: string;
          phone?: string | null;
          profile_image?: string | null;
          role?: Database['public']['Enums']['user_role'];
          status?: Database['public']['Enums']['user_status'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          name?: string;
          phone?: string | null;
          profile_image?: string | null;
          role?: Database['public']['Enums']['user_role'];
          status?: Database['public']['Enums']['user_status'];
          updated_at?: string;
        };
        Relationships: [];
      };
      wishlists: {
        Row: {
          created_at: string;
          id: string;
          store_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          store_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          store_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'wishlists_store_id_fkey';
            columns: ['store_id'];
            isOneToOne: false;
            referencedRelation: 'stores';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'wishlists_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      approve_seller_application: {
        Args: { application_id: string };
        Returns: undefined;
      };
      begin_payment_processing: {
        Args: { p_order_id: string };
        Returns: {
          success: boolean;
        }[];
      };
      cancel_order: {
        Args: { p_order_id: string; p_reason: string };
        Returns: {
          success: boolean;
        }[];
      };
      check_pickup_capacity: {
        Args: { p_order_number: string };
        Returns: {
          available: boolean;
          remaining_count: number;
        }[];
      };
      confirm_payment: {
        Args: {
          p_amount: number;
          p_method: Database['public']['Enums']['payment_method'];
          p_method_detail: string;
          p_order_number: string;
          p_provider: Database['public']['Enums']['payment_provider'];
          p_provider_order_id: string;
          p_provider_payment_key: string;
        };
        Returns: {
          success: boolean;
        }[];
      };
      create_order: {
        Args: {
          p_expires_at: string;
          p_items: Json;
          p_pickup_at: string;
          p_user_id: string;
        };
        Returns: {
          order_id: string;
          order_number: string;
          payment_amount: number;
        }[];
      };
      create_seller_application: {
        Args: {
          p_business_address: string;
          p_business_category: string;
          p_business_number: string;
          p_business_type: string;
          p_company_name: string;
          p_documents: Json;
          p_representative_name: string;
          p_user_id: string;
        };
        Returns: string;
      };
      expire_order: {
        Args: { p_order_id: string };
        Returns: {
          success: boolean;
        }[];
      };
      generate_order_number: { Args: never; Returns: string };
      revert_payment_processing: {
        Args: { p_order_id: string };
        Returns: {
          success: boolean;
        }[];
      };
      sequence_to_pickup_number: { Args: { seq: number }; Returns: string };
    };
    Enums: {
      menu_item_status: 'active' | 'inactive';
      order_status:
        | 'payment_pending'
        | 'processing'
        | 'reserved'
        | 'accepted'
        | 'ready'
        | 'completed'
        | 'cancelled'
        | 'no_show'
        | 'expired';
      payment_method: 'card' | 'virtual_account' | 'mobile' | 'easy_pay';
      payment_provider: 'toss' | 'kakao_pay' | 'naver_pay';
      payment_status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
      product_status: 'active' | 'closed';
      seller_application_document_type:
        | 'business_license'
        | 'id_card'
        | 'bankbook'
        | 'business_report';
      seller_application_status: 'pending' | 'approved' | 'rejected';
      social_provider: 'google' | 'kakao';
      store_status: 'approved' | 'inactive';
      user_role: 'customer' | 'seller' | 'admin';
      user_status: 'active' | 'suspended' | 'deleted';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      menu_item_status: ['active', 'inactive'],
      order_status: [
        'payment_pending',
        'processing',
        'reserved',
        'accepted',
        'ready',
        'completed',
        'cancelled',
        'no_show',
        'expired',
      ],
      payment_method: ['card', 'virtual_account', 'mobile', 'easy_pay'],
      payment_provider: ['toss', 'kakao_pay', 'naver_pay'],
      payment_status: ['pending', 'paid', 'failed', 'cancelled', 'refunded'],
      product_status: ['active', 'closed'],
      seller_application_document_type: [
        'business_license',
        'id_card',
        'bankbook',
        'business_report',
      ],
      seller_application_status: ['pending', 'approved', 'rejected'],
      social_provider: ['google', 'kakao'],
      store_status: ['approved', 'inactive'],
      user_role: ['customer', 'seller', 'admin'],
      user_status: ['active', 'suspended', 'deleted'],
    },
  },
} as const;
