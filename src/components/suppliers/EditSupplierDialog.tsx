
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useUpdateSupplier, Supplier } from "@/hooks/useSuppliers";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SupplierFormData {
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
}

interface EditSupplierDialogProps {
  supplier: Supplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditSupplierDialog = ({ supplier, open, onOpenChange, onSuccess }: EditSupplierDialogProps) => {
  const { register, handleSubmit, setValue, watch, reset } = useForm<SupplierFormData>();
  const updateSupplier = useUpdateSupplier();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (supplier) {
      reset({
        name: supplier.name,
        email: supplier.email || '',
        phone: supplier.phone || '',
        cnpj: supplier.cnpj || '',
        address: supplier.address || '',
        city: supplier.city || '',
        state: supplier.state || 'São Paulo',
        zip_code: supplier.zip_code || '',
        contact_person: supplier.contact_person || '',
        notes: supplier.notes || '',
        status: supplier.status
      });
    }
  }, [supplier, reset]);

  const onSubmit = async (data: SupplierFormData) => {
    if (!supplier) return;
    
    setIsSubmitting(true);
    try {
      await updateSupplier.mutateAsync({ id: supplier.id, ...data });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao atualizar fornecedor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Fornecedor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
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

            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                {...register("cnpj")}
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div>
              <Label htmlFor="contact_person">Pessoa de Contato</Label>
              <Input
                id="contact_person"
                {...register("contact_person")}
                placeholder="Nome do responsável"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                {...register("address")}
                placeholder="Rua, número, complemento"
              />
            </div>

            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                {...register("city")}
                placeholder="Cidade"
              />
            </div>

            <div>
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                {...register("state")}
                placeholder="Estado"
              />
            </div>

            <div>
              <Label htmlFor="zip_code">CEP</Label>
              <Input
                id="zip_code"
                {...register("zip_code")}
                placeholder="00000-000"
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

            <div className="col-span-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Observações sobre o fornecedor"
              />
            </div>
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
