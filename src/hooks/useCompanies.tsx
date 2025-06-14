
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Company {
  id: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  logo_url?: string;
  subscription_plan?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

export const useCompany = () => {
  const { company } = useAuth();
  
  return useQuery({
    queryKey: ['company', company?.id],
    queryFn: async () => {
      if (!company?.id) return null;
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', company.id)
        .single();
      
      if (error) throw error;
      return data as Company;
    },
    enabled: !!company?.id,
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { company } = useAuth();

  return useMutation({
    mutationFn: async (updates: Partial<Company>) => {
      if (!company?.id) {
        throw new Error('Empresa não encontrada');
      }

      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('id', company.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company'] });
      toast({
        title: "Empresa atualizada",
        description: "Dados da empresa atualizados com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar empresa: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useCompanyUsers = () => {
  const { company } = useAuth();

  return useQuery({
    queryKey: ['company-users', company?.id],
    queryFn: async () => {
      if (!company?.id) return [];

      const { data, error } = await supabase
        .from('company_users')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            phone,
            position
          )
        `)
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!company?.id,
  });
};
