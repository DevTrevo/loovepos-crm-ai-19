
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
      console.log('Fetching price history for product:', productId);
      
      try {
        let query = supabase
          .from('price_history')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (productId) {
          query = query.eq('product_id', productId);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching price history:', error);
          throw error;
        }
        
        console.log('Price history data:', data);
        return (data || []) as PriceHistoryEntry[];
      } catch (error) {
        console.error('Price history query failed:', error);
        // Return empty array as fallback
        return [] as PriceHistoryEntry[];
      }
    },
  });
};
