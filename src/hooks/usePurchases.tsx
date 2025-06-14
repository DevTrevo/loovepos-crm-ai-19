
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Purchase {
  id: string;
  supplier_id?: string;
  total_amount: number;
  status: 'pending' | 'ordered' | 'received' | 'cancelled';
  order_date: string;
  expected_date?: string;
  received_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  suppliers?: {
    name: string;
    email?: string;
  };
}

export const usePurchases = () => {
  return useQuery({
    queryKey: ['purchases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          suppliers (
            name,
            email
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Purchase[];
    },
  });
};

export const useCreatePurchase = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (purchase: Omit<Purchase, 'id' | 'created_at' | 'updated_at' | 'suppliers'>) => {
      const { data, error } = await supabase
        .from('purchases')
        .insert([purchase])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      toast({
        title: "Compra criada",
        description: "Pedido de compra criado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar compra: " + error.message,
        variant: "destructive",
      });
    },
  });
};
