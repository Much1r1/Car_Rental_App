import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface Profile {
  id: string;
  name: string;
  phone?: string;
  role: 'customer' | 'admin' | 'shop_manager';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Car {
  id: string;
  owner_id?: string;
  brand: string;
  model: string;
  year: number;
  price_per_day: number;
  location: string;
  status: 'available' | 'booked' | 'maintenance' | 'out_of_service';
  image_url?: string;
  description?: string;
  features?: string[];
  license_plate?: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  car_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  special_requests?: string;
  created_at: string;
  updated_at: string;
  car?: Car;
}

export interface SparePart {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image_url?: string;
  description?: string;
  brand?: string;
  part_number?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  spare_part_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address?: string;
  created_at: string;
  updated_at: string;
  spare_part?: SparePart;
}

export interface Review {
  id: string;
  user_id: string;
  car_id?: string;
  spare_part_id?: string;
  rating: number;
  comment?: string;
  created_at: string;
}