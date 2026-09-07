import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  Constants.expoConfig?.extra?.supabaseUrl ?? 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY =
  Constants.expoConfig?.extra?.supabaseAnonKey ?? 'placeholder-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
