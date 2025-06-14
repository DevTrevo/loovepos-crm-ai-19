
import { useSuppliers } from "@/hooks/useSuppliers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SupplierSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export const SupplierSelect = ({ 
  value, 
  onValueChange, 
  placeholder = "Selecione um fornecedor" 
}: SupplierSelectProps) => {
  const { data: suppliers, isLoading, error } = useSuppliers();

  console.log('SupplierSelect rendered');
  console.log('Suppliers data:', suppliers);
  console.log('Loading:', isLoading);
  console.log('Error:', error);
  console.log('Current value:', value);

  if (error) {
    console.error('Error loading suppliers:', error);
  }

  const activeSuppliers = suppliers?.filter(supplier => supplier.status === 'active') || [];

  const handleValueChange = (selectedValue: string) => {
    // Convert "none" back to empty string for the form
    onValueChange(selectedValue === "none" ? "" : selectedValue);
  };

  return (
    <Select value={value || "none"} onValueChange={handleValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? "Carregando..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Nenhum fornecedor</SelectItem>
        {activeSuppliers.map((supplier) => (
          <SelectItem key={supplier.id} value={supplier.id}>
            {supplier.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
