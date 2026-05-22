export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      store_categories: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          parent_id: number | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          description?: string | null
          parent_id?: number | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string | null
          parent_id?: number | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      store_products: {
        Row: {
          id: number
          plant_id: number | null
          category_id: number | null
          name: string
          slug: string
          description: string | null
          short_description: string | null
          price: number
          compare_at_price: number | null
          cost_price: number | null
          sku: string
          barcode: string | null
          stock_quantity: number
          low_stock_threshold: number
          weight: number | null
          dimensions: string | null
          image_url: string | null
          gallery_images: Json
          badge: string | null
          is_featured: boolean
          is_active: boolean
          seo_title: string | null
          seo_description: string | null
          seo_keywords: string | null
          created_by_id: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          plant_id?: number | null
          category_id?: number | null
          name: string
          slug: string
          description?: string | null
          short_description?: string | null
          price: number
          compare_at_price?: number | null
          cost_price?: number | null
          sku: string
          barcode?: string | null
          stock_quantity?: number
          low_stock_threshold?: number
          weight?: number | null
          dimensions?: string | null
          image_url?: string | null
          gallery_images?: Json
          badge?: string | null
          is_featured?: boolean
          is_active?: boolean
          seo_title?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          created_by_id?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          plant_id?: number | null
          category_id?: number | null
          name?: string
          slug?: string
          description?: string | null
          short_description?: string | null
          price?: number
          compare_at_price?: number | null
          cost_price?: number | null
          sku?: string
          barcode?: string | null
          stock_quantity?: number
          low_stock_threshold?: number
          weight?: number | null
          dimensions?: string | null
          image_url?: string | null
          gallery_images?: Json
          badge?: string | null
          is_featured?: boolean
          is_active?: boolean
          seo_title?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          created_by_id?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      store_orders: {
        Row: {
          id: number
          order_number: string
          customer_id: number | null
          first_name: string
          last_name: string
          email: string | null
          phone: string
          shipping_address: string | null
          shipping_city: string | null
          shipping_country: string
          billing_address: string | null
          billing_city: string | null
          billing_country: string
          subtotal: number
          tax_amount: number
          shipping_amount: number
          discount_amount: number
          total_amount: number
          status: string
          payment_method: string
          payment_status: string
          paynow_poll_url: string | null
          paynow_reference: string | null
          notes: string | null
          customer_notes: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          order_number: string
          customer_id?: number | null
          first_name: string
          last_name: string
          email?: string | null
          phone: string
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_country?: string
          billing_address?: string | null
          billing_city?: string | null
          billing_country?: string
          subtotal: number
          tax_amount?: number
          shipping_amount?: number
          discount_amount?: number
          total_amount: number
          status?: string
          payment_method?: string
          payment_status?: string
          paynow_poll_url?: string | null
          paynow_reference?: string | null
          notes?: string | null
          customer_notes?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          order_number?: string
          customer_id?: number | null
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string
          shipping_address?: string | null
          shipping_city?: string | null
          shipping_country?: string
          billing_address?: string | null
          billing_city?: string | null
          billing_country?: string
          subtotal?: number
          tax_amount?: number
          shipping_amount?: number
          discount_amount?: number
          total_amount?: number
          status?: string
          payment_method?: string
          payment_status?: string
          paynow_poll_url?: string | null
          paynow_reference?: string | null
          notes?: string | null
          customer_notes?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      store_order_items: {
        Row: {
          id: number
          order_id: number
          product_id: number | null
          product_name: string
          product_sku: string | null
          product_price: number
          quantity: number
          line_total: number
          created_at: string
        }
        Insert: {
          id?: number
          order_id: number
          product_id?: number | null
          product_name: string
          product_sku?: string | null
          product_price: number
          quantity: number
          line_total: number
          created_at?: string
        }
        Update: {
          id?: number
          order_id?: number
          product_id?: number | null
          product_name?: string
          product_sku?: string | null
          product_price?: number
          quantity?: number
          line_total?: number
          created_at?: string
        }
      }
    }
  }
}

export type Product = Database['public']['Tables']['store_products']['Row'];
export type Category = Database['public']['Tables']['store_categories']['Row'];
export type Order = Database['public']['Tables']['store_orders']['Row'];
export type OrderItem = Database['public']['Tables']['store_order_items']['Row'];
