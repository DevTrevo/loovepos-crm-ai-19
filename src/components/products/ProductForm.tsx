
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateProduct } from "@/hooks/useProducts";
import { CategorySelect } from "@/components/categories/CategorySelect";
import { SupplierSelect } from "@/components/suppliers/SupplierSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const { register, handleSubmit, setValue, watch, reset } = useForm<ProductFormData>({
    defaultValues: {
      status: 'active',
      stock_quantity: 0,
      min_stock: 5
    }
  });
  const createProduct = useCreateProduct();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      await createProduct.mutateAsync(data);
      reset();
      onSuccess();
    } catch (error) {
      console.error('Erro ao criar produto:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome do Produto *</Label>
        <Input
          id="name"
          {...register("name", { required: true })}
          placeholder="Digite o nome do produto"
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Descrição do produto"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Preço de Venda *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register("price", { required: true, valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>

        <div>
          <Label htmlFor="cost_price">Preço de Custo</Label>
          <Input
            id="cost_price"
            type="number"
            step="0.01"
            {...register("cost_price", { valueAsNumber: true })}
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <Label>Categoria *</Label>
        <CategorySelect
          value={watch("category_id")}
          onValueChange={(value) => setValue("category_id", value)}
        />
      </div>

      <div>
        <Label>Fornecedor</Label>
        <SupplierSelect
          value={watch("supplier_id")}
          onValueChange={(value) => setValue("supplier_id", value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="stock_quantity">Quantidade em Estoque</Label>
          <Input
            id="stock_quantity"
            type="number"
            {...register("stock_quantity", { valueAsNumber: true })}
            placeholder="0"
          />
        </div>

        <div>
          <Label htmlFor="min_stock">Estoque Mínimo</Label>
          <Input
            id="min_stock"
            type="number"
            {...register("min_stock", { valueAsNumber: true })}
            placeholder="5"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            {...register("sku")}
            placeholder="Código SKU"
          />
        </div>

        <div>
          <Label htmlFor="barcode">Código de Barras</Label>
          <Input
            id="barcode"
            {...register("barcode")}
            placeholder="Código de barras"
          />
        </div>
      </div>

      <div>
        <Label>Status</Label>
        <Select value={watch("status")} onValueChange={(value: 'active' | 'inactive') => setValue("status", value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Salvando..." : "Salvar Produto"}
      </Button>
    </form>
  );
};
