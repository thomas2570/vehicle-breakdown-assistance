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
      profiles: {
        Row: {
          id: string
          full_name: string
          phone: string
          role: 'customer' | 'mechanic' | 'admin'
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          phone: string
          role: 'customer' | 'mechanic' | 'admin'
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string
          role?: 'customer' | 'mechanic' | 'admin'
          avatar_url?: string | null
          created_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          owner_id: string
          vehicle_type: 'car' | 'bike' | 'truck' | 'other'
          make: string | null
          model: string | null
          registration_number: string
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          vehicle_type: 'car' | 'bike' | 'truck' | 'other'
          make?: string | null
          model?: string | null
          registration_number: string
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          vehicle_type?: 'car' | 'bike' | 'truck' | 'other'
          make?: string | null
          model?: string | null
          registration_number?: string
          image_url?: string | null
          created_at?: string
        }
      }
      mechanics: {
        Row: {
          id: string
          shop_name: string
          shop_address: string | null
          documents_url: string | null
          is_verified: boolean
          is_available: boolean
          current_lat: number | null
          current_lng: number | null
          rating_avg: number
          created_at: string
        }
        Insert: {
          id: string
          shop_name: string
          shop_address?: string | null
          documents_url?: string | null
          is_verified?: boolean
          is_available?: boolean
          current_lat?: number | null
          current_lng?: number | null
          rating_avg?: number
          created_at?: string
        }
        Update: {
          id?: string
          shop_name?: string
          shop_address?: string | null
          documents_url?: string | null
          is_verified?: boolean
          is_available?: boolean
          current_lat?: number | null
          current_lng?: number | null
          rating_avg?: number
          created_at?: string
        }
      }
      breakdown_requests: {
        Row: {
          id: string
          customer_id: string
          mechanic_id: string | null
          vehicle_id: string | null
          problem_type: string
          description: string | null
          image_url: string | null
          lat: number
          lng: number
          status: 'pending' | 'accepted' | 'rejected' | 'moving' | 'arrived' | 'in_progress' | 'completed' | 'cancelled'
          is_offline_created: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          mechanic_id?: string | null
          vehicle_id?: string | null
          problem_type: string
          description?: string | null
          image_url?: string | null
          lat: number
          lng: number
          status?: 'pending' | 'accepted' | 'rejected' | 'moving' | 'arrived' | 'in_progress' | 'completed' | 'cancelled'
          is_offline_created?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          mechanic_id?: string | null
          vehicle_id?: string | null
          problem_type?: string
          description?: string | null
          image_url?: string | null
          lat?: number
          lng?: number
          status?: 'pending' | 'accepted' | 'rejected' | 'moving' | 'arrived' | 'in_progress' | 'completed' | 'cancelled'
          is_offline_created?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
