
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface StockMovement {
  id: string;
  product_id?: string;
  movement_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  reference_id?: string;
  reference_type?: string;
  notes?: string;
  company_id?: string;
  created_at: string;
  products?: {
    name: string;
    sku?: string;
  };
}

export const useStockMovements = () => {
  const { company } = useAuth();

  return useQuery({
    queryKey: ['stock-movements', company?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          products (
            name,
            sku
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as StockMovement[];
    },
    enabled: !!company?.id,
  });
};

export const useCreateStockMovement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { company } = useAuth();

  return useMutation({
    mutationFn: async (movement: Omit<StockMovement, 'id' | 'created_at' | 'products' | 'company_id'>) => {
      if (!company?.id) {
        throw new Error('Empresa não encontrada');
      }

      const { data, error } = await supabase
        .from('stock_movements')
        .insert([{ ...movement, company_id: company.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Movimentação registrada",
        description: "Movimentação de estoque registrada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao registrar movimentação: " + error.message,
        variant: "destructive",
      });
    },
  });
};
