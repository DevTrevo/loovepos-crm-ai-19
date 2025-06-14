
import { useCategories } from "@/hooks/useCategories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategorySelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export const CategorySelect = ({ 
  value, 
  onValueChange, 
  placeholder = "Selecione uma categoria" 
}: CategorySelectProps) => {
  const { data: categories, isLoading, error } = useCategories();

  console.log('CategorySelect rendered');
  console.log('Categories data:', categories);
  console.log('Loading:', isLoading);
  console.log('Error:', error);
  console.log('Current value:', value);

  if (error) {
    console.error('Error loading categories:', error);
  }

  const activeCategories = categories?.filter(cat => cat.status === 'active') || [];

  return (
    <Select value={value || ""} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? "Carregando..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">Nenhuma categoria</SelectItem>
        {activeCategories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
