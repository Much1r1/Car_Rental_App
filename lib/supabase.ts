// lib/supabase.ts
import 'react-native-url-polyfill/auto'; // 👈 Required for Supabase in RN
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // 👈 This fixes the crash
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
