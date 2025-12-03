import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CartItem {
  id: number | string;
  code?: string;
  name: string;
  price: number;
  type: 'course' | 'service' | 'document' | 'coursera';
  quantity?: number;
  moocName?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  note?: string;
}

export interface Order {
  id: number;
  user_id: string;
  items: CartItem[];
  customer_info: CustomerInfo;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
}

export function useOrders() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createOrder = async (
    userId: string,
    items: CartItem[],
    customerInfo: CustomerInfo,
    total: number,
    couponCode?: string
  ) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-order', {
        body: { items, customerInfo, total, couponCode }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      toast.success('Đơn hàng đã được tạo thành công!');
      return data.order;
    } catch (error: any) {
      toast.error(error.message || 'Không thể tạo đơn hàng!');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUserOrders = async (userId: string) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as any as Order[];
  };

  return {
    createOrder,
    getUserOrders,
    isSubmitting
  };
}
