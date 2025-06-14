
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useUpdateCategory, Category } from "@/hooks/useCategories";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

interface EditCategoryDialogProps {
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditCategoryDialog = ({ category, open, onOpenChange, onSuccess }: EditCategoryDialogProps) => {
  const { register, handleSubmit, setValue, watch, reset } = useForm<CategoryFormData>();
  const updateCategory = useUpdateCategory();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        description: category.description || '',
        status: category.status
      });
    }
  }, [category, reset]);

  const onSubmit = async (data: CategoryFormData) => {
    if (!category) return;
    
    setIsSubmitting(true);
    try {
      await updateCategory.mutateAsync({ id: category.id, ...data });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Categoria</DialogTitle>
        </DialogHeader>
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

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
