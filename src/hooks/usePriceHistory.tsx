
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PriceHistoryEntry {
  id: string;
  product_id: string;
  old_price: number;
  new_price: number;
  changed_by: string | null;
  reason: string | null;
  created_at: string;
}

export const usePriceHistory = (productId?: string) => {
  return useQuery({
    queryKey: ['price-history', productId],
    queryFn: async () => {
      let query = supabase
        .from('price_history')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (productId) {
        query = query.eq('product_id', productId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as PriceHistoryEntry[];
    },
  });
};
