
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateSupplier } from "@/hooks/useSuppliers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CreateSupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSupplierCreated: (supplierId: string) => void;
}

interface QuickSupplierFormData {
  name: string;
  email?: string;
  phone?: string;
}

export const CreateSupplierDialog = ({ 
  open, 
  onOpenChange, 
  onSupplierCreated 
}: CreateSupplierDialogProps) => {
  const { register, handleSubmit, reset } = useForm<QuickSupplierFormData>();
  const createSupplier = useCreateSupplier();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: QuickSupplierFormData) => {
    setIsSubmitting(true);
    try {
      const supplierData = {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        status: 'active' as const
      };

      const newSupplier = await createSupplier.mutateAsync(supplierData);
      reset();
      onOpenChange(false);
      onSupplierCreated(newSupplier.id);
    } catch (error) {
      console.error('Erro ao criar fornecedor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Fornecedor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Empresa *</Label>
            <Input
              id="name"
              {...register("name", { required: true })}
              placeholder="Nome do fornecedor"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="email@fornecedor.com"
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="(11) 99999-9999"
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
