
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useProducts } from "@/hooks/useProducts";
import { useCreateStockMovement } from "@/hooks/useStockMovements";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StockMovementFormData {
  product_id: string;
  movement_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  notes?: string;
}

interface StockMovementFormProps {
  onSuccess: () => void;
}

export const StockMovementForm = ({ onSuccess }: StockMovementFormProps) => {
  const { data: products } = useProducts();
  const { register, handleSubmit, setValue, watch, reset } = useForm<StockMovementFormData>();
  const createMovement = useCreateStockMovement();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeProducts = products?.filter(p => p.status === 'active') || [];

  const onSubmit = async (data: StockMovementFormData) => {
    setIsSubmitting(true);
    try {
      await createMovement.mutateAsync(data);
      reset();
      onSuccess();
    } catch (error) {
      console.error('Erro ao criar movimentação:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label>Produto *</Label>
        <Select value={watch("product_id")} onValueChange={(value) => setValue("product_id", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um produto" />
          </SelectTrigger>
          <SelectContent>
            {activeProducts.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name} - Estoque: {product.stock_quantity}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Tipo de Movimentação *</Label>
        <Select value={watch("movement_type")} onValueChange={(value: 'in' | 'out' | 'adjustment') => setValue("movement_type", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="in">Entrada</SelectItem>
            <SelectItem value="out">Saída</SelectItem>
            <SelectItem value="adjustment">Ajuste</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="quantity">Quantidade *</Label>
        <Input
          id="quantity"
          type="number"
          {...register("quantity", { required: true, valueAsNumber: true })}
          placeholder="0"
        />
      </div>

      <div>
        <Label htmlFor="reason">Motivo *</Label>
        <Input
          id="reason"
          {...register("reason", { required: true })}
          placeholder="Motivo da movimentação"
        />
      </div>

      <div>
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          {...register("notes")}
          placeholder="Observações adicionais"
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Salvando..." : "Registrar Movimentação"}
      </Button>
    </form>
  );
};
