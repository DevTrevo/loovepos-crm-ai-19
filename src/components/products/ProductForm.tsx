
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateProduct } from "@/hooks/useProducts";
import { CategorySelectWithCreate } from "@/components/categories/CategorySelectWithCreate";
import { SupplierSelectWithCreate } from "@/components/suppliers/SupplierSelectWithCreate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  cost_price?: number;
  category: string;
  category_id?: string;
  supplier_id?: string;
  stock_quantity: number;
  min_stock: number;
  barcode?: string;
  sku?: string;
  status: 'active' | 'inactive';
}

interface ProductFormProps {
  onSuccess: () => void;
}

export const ProductForm = ({ onSuccess }: ProductFormProps) => {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<ProductFormData>({
    defaultValues: {
      status: 'active',
      stock_quantity: 0,
      min_stock: 5,
      category: 'Geral',
      price: 0
    }
  });
  
  const createProduct = useCreateProduct();
  const { toast } = useToast();
  const { user, company, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  console.log('ProductForm rendered');
  console.log('Auth state:', { user: !!user, company: !!company, loading });
  console.log('Company details:', company);
  console.log('Form errors:', errors);
  console.log('Form values:', watch());

  // Verificar se a empresa está carregada
  if (loading) {
    return (
      <div className="text-center py-4">
        <p>Carregando dados da empresa...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-4">
        <p className="text-red-600">Erro: Dados da empresa não encontrados.</p>
        <p className="text-sm text-gray-600">Tente fazer logout e login novamente.</p>
      </div>
    );
  }

  const onSubmit = async (data: ProductFormData) => {
    console.log('Form submitted with data:', data);
    console.log('Company at submit:', company);
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Validação básica
      if (!data.name || data.name.trim() === '') {
        toast({
          title: "Erro",
          description: "Nome do produto é obrigatório",
          variant: "destructive",
        });
        return;
      }

      if (!data.price || data.price <= 0) {
        toast({
          title: "Erro", 
          description: "Preço deve ser maior que zero",
          variant: "destructive",
        });
        return;
      }

      // Preparar dados para envio
      const productData = {
        name: data.name.trim(),
        description: data.description?.trim() || '',
        price: Number(data.price),
        cost_price: data.cost_price ? Number(data.cost_price) : undefined,
        category: data.category_id ? '' : 'Geral', // Se tem category_id, usar vazio, senão usar 'Geral'
        category_id: data.category_id || undefined,
        supplier_id: data.supplier_id || undefined,
        stock_quantity: Number(data.stock_quantity) || 0,
        min_stock: Number(data.min_stock) || 5,
        barcode: data.barcode?.trim() || undefined,
        sku: data.sku?.trim() || undefined,
        status: data.status || 'active'
      };
      
      console.log('Sending product data:', productData);
      
      await createProduct.mutateAsync(productData);
      
      console.log('Product created successfully');
      reset();
      onSuccess();
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar produto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Nome do Produto *</Label>
          <Input
            id="name"
            {...register("name", { 
              required: "Nome é obrigatório",
              minLength: { value: 2, message: "Nome deve ter pelo menos 2 caracteres" }
            })}
            placeholder="Digite o nome do produto"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Descrição do produto (opcional)"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Preço de Venda *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0.01"
              {...register("price", { 
                required: "Preço é obrigatório",
                min: { value: 0.01, message: "Preço deve ser maior que zero" }
              })}
              placeholder="0.00"
              className={errors.price ? "border-red-500" : ""}
            />
            {errors.price && (
              <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="cost_price">Preço de Custo</Label>
            <Input
              id="cost_price"
              type="number"
              step="0.01"
              min="0"
              {...register("cost_price")}
              placeholder="0.00 (opcional)"
            />
          </div>
        </div>

        <div>
          <Label>Categoria</Label>
          <CategorySelectWithCreate
            value={watch("category_id") || ""}
            onValueChange={(value) => {
              console.log('Category selected:', value);
              setValue("category_id", value || undefined);
            }}
            placeholder="Selecione uma categoria (opcional)"
          />
          <p className="text-sm text-gray-500 mt-1">Se não selecionada, será usado "Geral"</p>
        </div>

        <div>
          <Label>Fornecedor</Label>
          <SupplierSelectWithCreate
            value={watch("supplier_id") || ""}
            onValueChange={(value) => {
              console.log('Supplier selected:', value);
              setValue("supplier_id", value || undefined);
            }}
            placeholder="Selecione um fornecedor (opcional)"
          />
          <p className="text-sm text-gray-500 mt-1">Campo opcional</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="stock_quantity">Quantidade em Estoque</Label>
            <Input
              id="stock_quantity"
              type="number"
              min="0"
              {...register("stock_quantity", {
                min: { value: 0, message: "Quantidade não pode ser negativa" }
              })}
              placeholder="0"
            />
            {errors.stock_quantity && (
              <p className="text-sm text-red-500 mt-1">{errors.stock_quantity.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="min_stock">Estoque Mínimo</Label>
            <Input
              id="min_stock"
              type="number"
              min="0"
              {...register("min_stock", {
                min: { value: 0, message: "Estoque mínimo não pode ser negativo" }
              })}
              placeholder="5"
            />
            {errors.min_stock && (
              <p className="text-sm text-red-500 mt-1">{errors.min_stock.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              {...register("sku")}
              placeholder="Código SKU (opcional)"
            />
          </div>

          <div>
            <Label htmlFor="barcode">Código de Barras</Label>
            <Input
              id="barcode"
              {...register("barcode")}
              placeholder="Código de barras (opcional)"
            />
          </div>
        </div>

        <div>
          <Label>Status</Label>
          <Select 
            value={watch("status")} 
            onValueChange={(value: 'active' | 'inactive') => {
              console.log('Status selected:', value);
              setValue("status", value);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          type="submit" 
          disabled={isLoading || isSubmitting} 
          className="w-full"
        >
          {isLoading || isSubmitting ? "Salvando..." : "Salvar Produto"}
        </Button>
      </form>
    </div>
  );
};
