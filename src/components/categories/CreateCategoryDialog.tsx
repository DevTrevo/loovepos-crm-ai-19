
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateCategory } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryCreated: (categoryId: string) => void;
}

interface QuickCategoryFormData {
  name: string;
  description?: string;
}

export const CreateCategoryDialog = ({ 
  open, 
  onOpenChange, 
  onCategoryCreated 
}: CreateCategoryDialogProps) => {
  const { register, handleSubmit, reset } = useForm<QuickCategoryFormData>();
  const createCategory = useCreateCategory();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: QuickCategoryFormData) => {
    setIsSubmitting(true);
    try {
      const categoryData = {
        name: data.name,
        description: data.description || null,
        status: 'active' as const
      };

      const newCategory = await createCategory.mutateAsync(categoryData);
      reset();
      onOpenChange(false);
      onCategoryCreated(newCategory.id);
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Nova Categoria</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Categoria *</Label>
            <Input
              id="name"
              {...register("name", { required: true })}
              placeholder="Nome da categoria"
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

          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Criando..." : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
