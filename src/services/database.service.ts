import { supabase } from '../config/supabase';
import type { Database } from '../types/database.types';

type Tables = Database['public']['Tables'];
type BuildingInsert = Tables['buildings']['Insert'];
type RoomInsert = Tables['rooms']['Insert'];
type LeaseInsert = Tables['leases']['Insert'];
type TenantInsert = Tables['tenants']['Insert'];

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

  /**
   * Contracts (Leases)
   */
  static async getContractByRoom(roomId: string) {
    try {
      const { data, error } = await supabase
        .from('leases')
        .select('*')
        .eq('room_id', roomId)
        .in('status', ['active', 'draft'])
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { data: data || null, error: null };
    } catch (error) {
      console.error('Error fetching contract:', error);
      return { data: null, error };
    }
  }

  static async getContractById(id: string) {
    try {
      const { data, error } = await supabase
        .from('leases')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching contract:', error);
      return { data: null, error };
    }
  }

  static async createContract(contract: LeaseInsert) {
    try {
      const { data, error } = await supabase
        .from('leases')
        .insert(contract)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating contract:', error);
      return { data: null, error };
    }
  }

  static async updateContract(id: string, updates: Partial<LeaseInsert>) {
    try {
      const { data, error } = await supabase
        .from('leases')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating contract:', error);
      return { data: null, error };
    }
  }

  static async deleteContract(id: string) {
    try {
      const { error } = await supabase
        .from('leases')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting contract:', error);
      return { error };
    }
  }

  /**
   * Tenants
   */
  static async getTenants(clientId: string, status?: 'active' | 'inactive' | 'blacklisted') {
    try {
      let query = supabase
        .from('tenants')
        .select('*')
        .eq('client_id', clientId);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('first_name', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching tenants:', error);
      return { data: null, error };
    }
  }

  static async getTenantById(id: string) {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching tenant:', error);
      return { data: null, error };
    }
  }

  static async createTenant(tenant: TenantInsert) {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .insert(tenant)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating tenant:', error);
      return { data: null, error };
    }
  }

  static async updateTenant(id: string, updates: Partial<TenantInsert>) {
    try {
      const { data, error } = await supabase
        .from('tenants')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating tenant:', error);
      return { data: null, error };
    }
  }

  static async deleteTenant(id: string) {
    try {
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting tenant:', error);
      return { error };
    }
  }

  /**
   * Leases (Extended Methods)
   */
  static async getLeases(clientId: string) {
    try {
      const { data, error } = await supabase
        .from('leases')
        .select(`
          *,
          tenants (first_name, last_name, email, phone),
          rooms (room_number, buildings (name))
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching leases:', error);
      return { data: null, error };
    }
  }

  static async getLeasesByTenant(tenantId: string) {
    try {
      const { data, error } = await supabase
        .from('leases')
        .select(`
          *,
          rooms (room_number, buildings (name))
        `)
        .eq('tenant_id', tenantId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching tenant leases:', error);
      return { data: null, error };
    }
  }

  static async getExpiringLeases(clientId: string, daysAhead: number = 30) {
    try {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + daysAhead);

      const { data, error } = await supabase
        .from('leases')
        .select(`
          *,
          tenants (first_name, last_name, email, phone),
          rooms (room_number, buildings (name))
        `)
        .eq('client_id', clientId)
        .eq('status', 'active')
        .gte('end_date', today.toISOString().split('T')[0])
        .lte('end_date', futureDate.toISOString().split('T')[0])
        .order('end_date', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching expiring leases:', error);
      return { data: null, error };
    }
  }
}
