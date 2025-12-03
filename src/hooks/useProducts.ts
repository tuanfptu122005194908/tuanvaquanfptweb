import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  type: string;
  code: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  semester: string | null;
  services: string[] | null;
  active: boolean;
  sort_order: number;
}

export function useProducts(type?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [type]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true });

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedProducts = (data || []).map(p => ({
        ...p,
        services: Array.isArray(p.services) ? p.services as string[] : null
      }));

      setProducts(formattedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { products, isLoading, refetch: fetchProducts };
}
