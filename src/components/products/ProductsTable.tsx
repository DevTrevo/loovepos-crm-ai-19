
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Package } from "lucide-react";
import { Product } from "@/hooks/useProducts";

interface ProductsTableProps {
  products: Product[];
}

export function ProductsTable({ products }: ProductsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Preço</TableHead>
          <TableHead>Estoque</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                {product.name}
              </div>
            </TableCell>
            <TableCell>{product.category}</TableCell>
            <TableCell>R$ {product.price.toFixed(2)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <span>{product.stock_quantity}</span>
                {product.stock_quantity <= product.min_stock && (
                  <Badge variant="destructive" className="text-xs">
                    Baixo
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                {product.status === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
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
