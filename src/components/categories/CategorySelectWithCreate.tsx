
import { useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { CreateCategoryDialog } from "./CreateCategoryDialog";

interface CategorySelectWithCreateProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export const CategorySelectWithCreate = ({ 
  value, 
  onValueChange, 
  placeholder = "Selecione uma categoria" 
}: CategorySelectWithCreateProps) => {
  const { data: categories, isLoading, error } = useCategories();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  console.log('CategorySelectWithCreate rendered');
  console.log('Categories data:', categories);
  console.log('Loading:', isLoading);
  console.log('Error:', error);
  console.log('Current value:', value);

  if (error) {
    console.error('Error loading categories:', error);
  }

  const activeCategories = categories?.filter(cat => cat.status === 'active') || [];

  const handleValueChange = (selectedValue: string) => {
    if (selectedValue === "create-new") {
      setIsCreateDialogOpen(true);
      return;
    }
    // Convert "none" back to empty string for the form
    onValueChange(selectedValue === "none" ? "" : selectedValue);
  };

  const handleCategoryCreated = (categoryId: string) => {
    onValueChange(categoryId);
  };

  return (
    <>
      <Select value={value || "none"} onValueChange={handleValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={isLoading ? "Carregando..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Nenhuma categoria</SelectItem>
          <SelectItem value="create-new" className="text-blue-600 font-medium">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Criar nova categoria
            </div>
          </SelectItem>
          {activeCategories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <CreateCategoryDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCategoryCreated={handleCategoryCreated}
      />
    </>
  );
};
