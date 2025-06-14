
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Sale {
  id: string;
  client_id?: string;
  total_amount: number;
  discount_amount: number;
  payment_method: 'cash' | 'card' | 'pix' | 'credit';
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  clients?: {
    name: string;
    email?: string;
  };
}

export const useSales = () => {
  return useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          clients (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Sale[];
    },
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (sale: Omit<Sale, 'id' | 'created_at' | 'updated_at' | 'clients'>) => {
      const { data, error } = await supabase
        .from('sales')
        .insert([sale])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast({
        title: "Venda realizada",
        description: "Venda registrada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao registrar venda: " + error.message,
        variant: "destructive",
      });
    },
  });
};
