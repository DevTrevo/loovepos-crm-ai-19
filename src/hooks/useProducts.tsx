import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  cost_price?: number;
  sku?: string;
  barcode?: string;
  category: string;
  category_id?: string;
  supplier_id?: string;
  stock_quantity: number;
  min_stock: number;
  status: 'active' | 'inactive';
  company_id?: string;
  created_at: string;
  updated_at: string;
}

export const useProducts = () => {
  const { company } = useAuth();

  return useQuery({
    queryKey: ['products', company?.id],
    queryFn: async () => {
      if (!company?.id) {
        console.log('No company ID available for products query');
        return [];
      }

      console.log('Fetching products for company:', company.id);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('company_id', company.id)
        .order('name', { ascending: true });
      
      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }
      
      console.log('Products fetched:', data?.length || 0);
      return data as Product[];
    },
    enabled: !!company?.id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { company } = useAuth();

  return useMutation({
    mutationFn: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'company_id'>) => {
      console.log('useCreateProduct mutation called');
      console.log('Company available:', company);
      console.log('Product data received:', product);

      if (!company?.id) {
        console.error('No company ID available for product creation');
        throw new Error('Empresa não encontrada. Faça logout e login novamente.');
      }

      console.log('Creating product for company:', company.id);

      // Validação de dados obrigatórios
      if (!product.name || product.name.trim() === '') {
        throw new Error('Nome do produto é obrigatório');
      }

      if (!product.price || product.price <= 0) {
        throw new Error('Preço deve ser maior que zero');
      }

      // Preparar dados para inserção
      const productData = {
        name: product.name.trim(),
        description: product.description || null,
        price: Number(product.price),
        cost_price: product.cost_price ? Number(product.cost_price) : null,
        category: product.category || 'Geral',
        category_id: product.category_id || null,
        supplier_id: product.supplier_id || null,
        stock_quantity: Number(product.stock_quantity) || 0,
        min_stock: Number(product.min_stock) || 5,
        barcode: product.barcode || null,
        sku: product.sku || null,
        status: product.status || 'active',
        company_id: company.id
      };

      console.log('Final product data for insertion:', productData);

      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating product:', error);
        throw new Error(`Erro ao criar produto: ${error.message}`);
      }
      
      console.log('Product created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Product creation successful:', data);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Produto criado",
        description: "Produto adicionado com sucesso!",
      });
    },
    onError: (error) => {
      console.error('Create product mutation error:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar produto",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Produto atualizado",
        description: "Produto atualizado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar produto: " + error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Produto removido",
        description: "Produto removido com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao remover produto: " + error.message,
        variant: "destructive",
      });
    },
  });
};
