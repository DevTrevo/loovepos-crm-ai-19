
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SalesReportData {
  total_sales: number;
  total_orders: number;
  avg_order_value: number;
  top_products: Array<{
    product_name: string;
    quantity_sold: number;
  }>;
}

export const useSalesReport = (startDate?: string, endDate?: string) => {
  return useQuery({
    queryKey: ['sales-report', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_sales_report', {
        start_date: startDate || null,
        end_date: endDate || null
      });
      
      if (error) throw error;
      return data[0] as SalesReportData;
    },
    enabled: true,
  });
};
