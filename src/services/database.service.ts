import { supabase } from '../config/supabase';
import type { Database } from '../types/database.types';

type Tables = Database['public']['Tables'];
type BuildingInsert = Tables['buildings']['Insert'];
type RoomInsert = Tables['rooms']['Insert'];

/**
 * Database Service
 * Handles all database CRUD operations
 */
export class DatabaseService {
  /**
   * Buildings
   */
  static async getBuildings(clientId: string) {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .select('*')
        .eq('client_id', clientId)
        .order('name', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching buildings:', error);
      return { data: null, error };
    }
  }

  static async getBuildingById(id: string) {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching building:', error);
      return { data: null, error };
    }
  }

  static async createBuilding(building: BuildingInsert) {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .insert(building)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating building:', error);
      return { data: null, error };
    }
  }

  static async updateBuilding(id: string, updates: Partial<BuildingInsert>) {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating building:', error);
      return { data: null, error };
    }
  }

  static async deleteBuilding(id: string) {
    try {
      const { error } = await supabase
        .from('buildings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting building:', error);
      return { error };
    }
  }

  /**
   * Rooms
   */
  static async getRoomsByBuilding(buildingId: string) {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('building_id', buildingId)
        .order('room_number', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching rooms:', error);
      return { data: null, error };
    }
  }

  static async getRoomById(id: string) {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching room:', error);
      return { data: null, error };
    }
  }

  static async getAvailableRooms(clientId: string) {
    try {
      const { data, error } = await supabase
        .from('available_rooms_view')
        .select('*')
        .eq('client_id', clientId);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      return { data: null, error };
    }
  }

  static async createRoom(room: RoomInsert) {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert(room)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating room:', error);
      return { data: null, error };
    }
  }

  static async updateRoom(id: string, updates: Partial<RoomInsert>) {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating room:', error);
      return { data: null, error };
    }
  }

  static async deleteRoom(id: string) {
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting room:', error);
      return { error };
    }
  }

  /**
   * User Profile
   */
  static async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { data: null, error };
    }
  }

  static async createUserProfile(userId: string, clientId: string, email: string, metadata?: any) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          client_id: clientId,
          email,
          full_name: metadata?.full_name || null,
          phone: metadata?.phone || null,
          role: 'user',
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating user profile:', error);
      return { data: null, error };
    }
  }
}
