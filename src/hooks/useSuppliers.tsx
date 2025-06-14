
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cnpj?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  contact_person?: string;
  notes?: string;
  status: 'active' | 'inactive';
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export const useSuppliers = () => {
  const { company } = useAuth();

  return useQuery({
    queryKey: ['suppliers', company?.id],
    queryFn: async () => {
      if (!company?.id) {
        console.log('No company ID available for suppliers query');
        return [];
      }

      console.log('Fetching suppliers for company:', company.id);
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('company_id', company.id)
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching suppliers:', error);
        throw error;
      }
      
      console.log('Suppliers fetched:', data?.length || 0);
      return data as Supplier[];
    },
    enabled: !!company?.id,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { company } = useAuth();

  return useMutation({
    mutationFn: async (supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at' | 'company_id'>) => {
      if (!company?.id) {
        console.error('No company ID available for supplier creation');
        throw new Error('Empresa não encontrada. Faça logout e login novamente.');
      }

      console.log('Creating supplier for company:', company.id);
      console.log('Supplier data:', supplier);

      const supplierData = {
        ...supplier,
        company_id: company.id
      };

      const { data, error } = await supabase
        .from('suppliers')
        .insert([supplierData])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating supplier:', error);
        throw error;
      }
      
      console.log('Supplier created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: "Fornecedor criado",
        description: "Fornecedor adicionado com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Create supplier mutation error:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar fornecedor: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Supplier> & { id: string }) => {
      const { data, error } = await supabase
        .from('suppliers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: "Fornecedor atualizado",
        description: "Fornecedor atualizado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar fornecedor: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({
        title: "Fornecedor removido",
        description: "Fornecedor removido com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao remover fornecedor: " + error.message,
        variant: "destructive",
      });
    },
  });
};
