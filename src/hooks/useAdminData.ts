import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Order } from './useOrders';

export interface AdminStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  pendingOrders: number;
}

export interface AdminUser {
  id: string;
  name: string;
  phone: string | null;
  order_count: number;
  total_spent: number;
  created_at: string;
}

export function useAdminData() {
  const [stats, setStats] = useState<AdminStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    pendingOrders: 0
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch all users/profiles
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      setOrders(ordersData as any as Order[] || []);
      setUsers(usersData as any as AdminUser[] || []);

      // Calculate stats
      const totalRevenue = ordersData?.reduce((sum, order) => {
        if (order.status === 'completed') {
          return sum + Number(order.total);
        }
        return sum;
      }, 0) || 0;

      const pendingCount = ordersData?.filter(o => o.status === 'pending').length || 0;

      setStats({
        totalOrders: ordersData?.length || 0,
        totalRevenue,
        totalUsers: usersData?.length || 0,
        pendingOrders: pendingCount
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    stats,
    orders,
    users,
    isLoading,
    refreshData: fetchData
  };
}
