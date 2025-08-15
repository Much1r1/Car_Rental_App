import { supabase } from '@/lib/supabase';
import { SparePart, Order } from '@/types'; // Adjust the path to the correct location of SparePart and Order types

export const sparePartsService = {
  async getSpareParts(filters?: {
    category?: string;
    brand?: string;
    search?: string;
  }) {
    let query = supabase
      .from('spare_parts')
      .select('*')
      .gt('stock', 0)
      .order('created_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.brand) {
      query = query.eq('brand', filters.brand);
    }
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as SparePart[];
  },

  async getSparePartById(id: string) {
    const { data, error } = await supabase
      .from('spare_parts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as SparePart;
  },

  async createSparePart(sparePart: Omit<SparePart, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('spare_parts')
      .insert(sparePart)
      .select()
      .single();

    if (error) throw error;
    return data as SparePart;
  },

  async updateSparePart(id: string, updates: Partial<SparePart>) {
    const { data, error } = await supabase
      .from('spare_parts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as SparePart;
  },

  async deleteSparePart(id: string) {
    const { error } = await supabase
      .from('spare_parts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async createOrder(order: {
    spare_part_id: string;
    quantity: number;
    unit_price: number;
    shipping_address?: string;
  }) {
    const totalPrice = order.quantity * order.unit_price;

    const { data, error } = await supabase
      .from('orders')
      .insert({
        ...order,
        total_price: totalPrice,
        status: 'pending'
      })
      .select(`
        *,
        spare_part:spare_parts(*)
      `)
      .single();

    if (error) throw error;
    return data as Order & { spare_part: SparePart };
  },

  async getUserOrders(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        spare_part:spare_parts(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as (Order & { spare_part: SparePart })[];
  },

  async getAllOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        spare_part:spare_parts(*),
        user:profiles(name, phone, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateOrderStatus(orderId: string, status: Order['status']) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  },

  async getCategories() {
    const { data, error } = await supabase
      .from('spare_parts')
      .select('category')
      .not('category', 'is', null);

    if (error) throw error;
    
    const categories = [...new Set(data.map(item => item.category))];
    return categories;
  },
};