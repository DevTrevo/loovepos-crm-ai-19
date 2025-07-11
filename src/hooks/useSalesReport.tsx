
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
        
        // Use the get_sales_report function that exists in the database
        const { data, error } = await supabase.rpc('get_sales_report', {
          start_date: startDate,
          end_date: endDate
        });
        
        if (error) {
          console.error('Error fetching sales report:', error);
          throw error;
        }
        
        console.log('Sales report data:', data);
        
        // Transform the data to match our interface
        if (data && data.length > 0) {
          const reportData = data[0];
          return {
            total_sales: reportData.total_sales || 0,
            total_orders: reportData.total_orders || 0,
            avg_order_value: reportData.avg_order_value || 0,
            top_products: reportData.top_products || []
          } as SalesReportData;
        }
        
        // Return default structure if no data
        return {
          total_sales: 0,
          total_orders: 0,
          avg_order_value: 0,
          top_products: []
        } as SalesReportData;
      } catch (error) {
        console.error('Error fetching sales report:', error);
        return {
          total_sales: 0,
          total_orders: 0,
          avg_order_value: 0,
          top_products: []
        } as SalesReportData;
      }
    },
    enabled: true,
  });
};
