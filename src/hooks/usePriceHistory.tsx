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
      // Use raw SQL query since the table might not be in generated types yet
      const query = productId 
        ? `SELECT * FROM price_history WHERE product_id = $1 ORDER BY created_at DESC`
        : `SELECT * FROM price_history ORDER BY created_at DESC`;
      
      const params = productId ? [productId] : [];
      
      const { data, error } = await supabase.rpc('exec_sql', {
        query,
        params
      });
      
      if (error) {
        // Fallback to direct table access if exec_sql doesn't exist
        console.log('Trying direct table access for price_history');
        const { data: directData, error: directError } = await supabase
          .from('price_history' as any)
          .select('*')
          .eq(productId ? 'product_id' : 'id', productId || '')
          .order('created_at', { ascending: false });
        
        if (directError) throw directError;
        return (directData || []) as PriceHistoryEntry[];
      }
      
      return (data || []) as PriceHistoryEntry[];
    },
  });
};
