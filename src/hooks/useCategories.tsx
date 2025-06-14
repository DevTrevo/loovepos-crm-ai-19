
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Category {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export const useCategories = () => {
  const { company } = useAuth();

  return useQuery({
    queryKey: ['categories', company?.id],
    queryFn: async () => {
      if (!company?.id) {
        console.log('No company ID available for categories query');
        return [];
      }

      console.log('Fetching categories for company:', company.id);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('company_id', company.id)
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }
      
      console.log('Categories fetched:', data?.length || 0);
      return data as Category[];
    },
    enabled: !!company?.id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { company } = useAuth();

  return useMutation({
    mutationFn: async (category: Omit<Category, 'id' | 'created_at' | 'updated_at' | 'company_id'>) => {
      if (!company?.id) {
        console.error('No company ID available for category creation');
        throw new Error('Empresa não encontrada. Faça logout e login novamente.');
      }

      console.log('Creating category for company:', company.id);
      console.log('Category data:', category);

      // Garantir que campos opcionais tenham valores apropriados
      const categoryData = {
        name: category.name,
        description: category.description || null,
        status: category.status || 'active',
        company_id: company.id
      };

      const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating category:', error);
        throw error;
      }
      
      console.log('Category created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Categoria criada",
        description: "Categoria adicionada com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Create category mutation error:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar categoria: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Category> & { id: string }) => {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Categoria atualizada",
        description: "Categoria atualizada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar categoria: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Categoria removida",
        description: "Categoria removida com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao remover categoria: " + error.message,
        variant: "destructive",
      });
    },
  });
};
