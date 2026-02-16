import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Supabase Configuration
 * 
 * IMPORTANT: In production, use react-native-config or similar to manage environment variables
 * For now, we'll define placeholder values that should be replaced
 */

// TODO: Replace these with your actual Supabase credentials
// Option 1: Use react-native-config and process.env
// Option 2: Create a separate config file not tracked by git
// Option 3: Use a build-time configuration system
const SUPABASE_URL = '';  // Replace with your Supabase URL
const SUPABASE_ANON_KEY = '';  // Replace with your Supabase Anon Key

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '⚠️ Supabase credentials not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY in src/config/supabase.ts'
  );
}

/**
 * Supabase client instance
 * Configured with AsyncStorage for session persistence
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Database types (auto-generated from Supabase schema)
 * Run: npx supabase gen types typescript --project-id <project-id> > src/types/database.types.ts
 */
export type { Database } from '../types/database.types';
