import { supabase } from '@/lib/supabase';
import type { Car, Booking } from '@/types'; // Ensure Car and Booking types are imported from the correct path

export const carsService = {
  async getCars(filters?: {
    brand?: string;
    location?: string;
    maxPrice?: number;
    status?: string;
  }) {
    let query = supabase
      .from('cars')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.brand) {
      query = query.eq('brand', filters.brand);
    }
    if (filters?.location) {
      query = query.eq('location', filters.location);
    }
    if (filters?.maxPrice) {
      query = query.lte('price_per_day', filters.maxPrice);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Car[];
  },

  async getCarById(id: string) {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Car;
  },

  async createCar(car: Omit<Car, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('cars')
      .insert(car)
      .select()
      .single();

    if (error) throw error;
    return data as Car;
  },

  async updateCar(id: string, updates: Partial<Car>) {
    const { data, error } = await supabase
      .from('cars')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Car;
  },

  async deleteCar(id: string) {
    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getCarAvailability(carId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('car_id', carId)
      .not('status', 'in', '(cancelled)')
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);

    if (error) throw error;
    return data.length === 0; // Available if no conflicting bookings
  },

  async createBooking(booking: {
    car_id: string;
    start_date: string;
    end_date: string;
    total_price: number;
    special_requests?: string;
  }) {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        ...booking,
        status: 'pending'
      })
      .select(`
        *,
        car:cars(*)
      `)
      .single();

    if (error) throw error;
    return data as Booking & { car: Car };
  },

  async getUserBookings(userId: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        car:cars(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as (Booking & { car: Car })[];
  },

  async getAllBookings() {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        car:cars(*),
        user:profiles(name, phone, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateBookingStatus(bookingId: string, status: Booking['status']) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return data as Booking;
  },
};