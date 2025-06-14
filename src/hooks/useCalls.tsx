
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Call {
  id: string;
  client_id?: string;
  status: 'scheduled' | 'completed' | 'missed' | 'in-progress';
  scheduled_time: string;
  duration_minutes?: number;
  notes?: string;
  result?: 'sale' | 'follow-up' | 'not-interested';
  company_id?: string;
  created_at: string;
  updated_at: string;
  clients?: {
    name: string;
    phone?: string;
  };
}

export const useCalls = () => {
  const { company } = useAuth();

  return useQuery({
    queryKey: ['calls', company?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calls')
        .select(`
          *,
          clients (
            name,
            phone
          )
        `)
        .order('scheduled_time', { ascending: false });
      
      if (error) throw error;
      return data as Call[];
    },
    enabled: !!company?.id,
  });
};

export const useCreateCall = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { company } = useAuth();

  return useMutation({
    mutationFn: async (call: Omit<Call, 'id' | 'created_at' | 'updated_at' | 'clients' | 'company_id'>) => {
      if (!company?.id) {
        throw new Error('Empresa não encontrada');
      }

      const { data, error } = await supabase
        .from('calls')
        .insert([{ ...call, company_id: company.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calls'] });
      toast({
        title: "Ligação agendada",
        description: "Ligação agendada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao agendar ligação: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateCall = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Call> & { id: string }) => {
      const { data, error } = await supabase
        .from('calls')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calls'] });
      toast({
        title: "Ligação atualizada",
        description: "Status da ligação atualizado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar ligação: " + error.message,
        variant: "destructive",
      });
    },
  });
};
