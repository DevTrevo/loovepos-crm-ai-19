
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Tag } from "lucide-react";
import { Category } from "@/hooks/useCategories";

interface CategoriesTableProps {
  categories: Category[];
}

export function CategoriesTable({ categories }: CategoriesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Criado em</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => (
          <TableRow key={category.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-500" />
                {category.name}
              </div>
            </TableCell>
            <TableCell>{category.description || '-'}</TableCell>
            <TableCell>
              <Badge variant={category.status === 'active' ? 'default' : 'secondary'}>
                {category.status === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(category.created_at).toLocaleDateString('pt-BR')}
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
