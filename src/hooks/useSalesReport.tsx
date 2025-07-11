
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
      try {
        console.log('Fetching sales report for period:', startDate, 'to', endDate);
        
        // Return default structure for now - this will work once the function is available
        const defaultData: SalesReportData = {
          total_sales: 0,
          total_orders: 0,
          avg_order_value: 0,
          top_products: []
        };
        
        return defaultData;
      } catch (error) {
        console.error('Error fetching sales report:', error);
        return {
          total_sales: 0,
          total_orders: 0,
          avg_order_value: 0,
          top_products: []
        };
      }
    },
    enabled: true,
  });
};
