
import { useState } from "react";
import { useSuppliers } from "@/hooks/useSuppliers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateSupplierDialog } from "./CreateSupplierDialog";

interface SupplierSelectWithCreateProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export const SupplierSelectWithCreate = ({ 
  value, 
  onValueChange, 
  placeholder = "Selecione um fornecedor" 
}: SupplierSelectWithCreateProps) => {
  const { data: suppliers, isLoading, error } = useSuppliers();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  console.log('SupplierSelectWithCreate rendered');
  console.log('Suppliers data:', suppliers);
  console.log('Loading:', isLoading);
  console.log('Error:', error);
  console.log('Current value:', value);

  if (error) {
    console.error('Error loading suppliers:', error);
  }

  const activeSuppliers = suppliers?.filter(supplier => supplier.status === 'active') || [];

  const handleValueChange = (selectedValue: string) => {
    if (selectedValue === "create-new") {
      setIsCreateDialogOpen(true);
      return;
    }
    // Convert "none" back to empty string for the form
    onValueChange(selectedValue === "none" ? "" : selectedValue);
  };

  const handleSupplierCreated = (supplierId: string) => {
    onValueChange(supplierId);
  };

  return (
    <>
      <Select value={value || "none"} onValueChange={handleValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={isLoading ? "Carregando..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Nenhum fornecedor</SelectItem>
          <SelectItem value="create-new" className="text-blue-600 font-medium">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Criar novo fornecedor
            </div>
          </SelectItem>
          {activeSuppliers.map((supplier) => (
            <SelectItem key={supplier.id} value={supplier.id}>
              {supplier.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <CreateSupplierDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSupplierCreated={handleSupplierCreated}
      />
    </>
  );
};
