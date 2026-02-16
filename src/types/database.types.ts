/**
 * Database Types
 * This file should be auto-generated from your Supabase schema
 * 
 * To generate:
 * 1. Install Supabase CLI: npm install -g supabase
 * 2. Login: supabase login
 * 3. Generate types: npx supabase gen types typescript --project-id <your-project-id> > src/types/database.types.ts
 * 
 * For now, we'll use a simplified version
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          country: string | null;
          postal_code: string | null;
          logo_url: string | null;
          status: 'active' | 'inactive' | 'suspended';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['clients']['Insert']>;
      };
      buildings: {
        Row: {
          id: string;
          client_id: string;
          name: string;
          address: string;
          city: string;
          state: string | null;
          country: string;
          postal_code: string | null;
          description: string | null;
          total_floors: number;
          total_rooms: number;
          year_built: number | null;
          building_type: 'residential' | 'commercial' | 'mixed';
          amenities: string[] | null;
          image_url: string | null;
          status: 'active' | 'inactive' | 'under_construction' | 'maintenance';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['buildings']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['buildings']['Insert']>;
      };
      rooms: {
        Row: {
          id: string;
          client_id: string;
          building_id: string;
          room_number: string;
          floor_number: number | null;
          room_type: 'studio' | '1bedroom' | '2bedroom' | '3bedroom' | 'penthouse' | 'other';
          area_sqft: number | null;
          bedrooms: number;
          bathrooms: number;
          description: string | null;
          rent_amount: number;
          deposit_amount: number | null;
          currency: string;
          amenities: string[] | null;
          image_urls: string[] | null;
          status: 'available' | 'occupied' | 'maintenance' | 'reserved';
          available_from: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['rooms']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['rooms']['Insert']>;
      };
      users: {
        Row: {
          id: string;
          client_id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          role: 'admin' | 'manager' | 'user';
          avatar_url: string | null;
          status: 'active' | 'inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
    };
    Views: {
      available_rooms_view: {
        Row: {
          id: string;
          client_id: string;
          room_number: string;
          floor_number: number | null;
          room_type: string;
          area_sqft: number | null;
          bedrooms: number;
          bathrooms: number;
          rent_amount: number;
          available_from: string | null;
          building_name: string;
          building_address: string;
          building_city: string;
        };
      };
    };
  };
}
