
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateSupplier } from "@/hooks/useSuppliers";
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

interface SupplierFormProps {
  onSuccess: () => void;
}

export const SupplierForm = ({ onSuccess }: SupplierFormProps) => {
  const { register, handleSubmit, setValue, watch, reset } = useForm<SupplierFormData>({
    defaultValues: {
      status: 'active',
      state: 'São Paulo'
    }
  });
  const createSupplier = useCreateSupplier();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: SupplierFormData) => {
    setIsSubmitting(true);
    try {
      await createSupplier.mutateAsync(data);
      reset();
      onSuccess();
    } catch (error) {
      console.error('Erro ao criar fornecedor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Salvando..." : "Salvar Fornecedor"}
      </Button>
    </form>
  );
};
