
import { useSuppliers } from "@/hooks/useSuppliers";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SupplierSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export const SupplierSelect = ({ value, onValueChange, placeholder = "Selecione um fornecedor" }: SupplierSelectProps) => {
  const { data: suppliers, isLoading } = useSuppliers();

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Carregando fornecedores..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {suppliers?.map((supplier) => (
          <SelectItem key={supplier.id} value={supplier.id}>
            {supplier.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
