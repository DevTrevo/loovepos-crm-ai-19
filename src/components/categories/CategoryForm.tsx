
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateCategory } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CategoryFormData {
  name: string;
  description?: string;
  status: 'active' | 'inactive';
}

interface CategoryFormProps {
  onSuccess: () => void;
}

export const CategoryForm = ({ onSuccess }: CategoryFormProps) => {
  const { register, handleSubmit, setValue, watch, reset } = useForm<CategoryFormData>({
    defaultValues: {
      status: 'active'
    }
  });
  const createCategory = useCreateCategory();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      await createCategory.mutateAsync(data);
      reset();
      onSuccess();
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome da Categoria *</Label>
        <Input
          id="name"
          {...register("name", { required: true })}
          placeholder="Digite o nome da categoria"
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Descrição da categoria"
        />
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
        {isSubmitting ? "Salvando..." : "Salvar Categoria"}
      </Button>
    </form>
  );
};
