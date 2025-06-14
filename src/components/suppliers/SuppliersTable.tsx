
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Truck, Mail, Phone } from "lucide-react";
import { Supplier } from "@/hooks/useSuppliers";

interface SuppliersTableProps {
  suppliers: Supplier[];
}

export function SuppliersTable({ suppliers }: SuppliersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Contato</TableHead>
          <TableHead>CNPJ</TableHead>
          <TableHead>Cidade</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {suppliers.map((supplier) => (
          <TableRow key={supplier.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-gray-500" />
                <div>
                  <div>{supplier.name}</div>
                  {supplier.contact_person && (
                    <div className="text-sm text-gray-500">{supplier.contact_person}</div>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                {supplier.email && (
                  <div className="flex items-center gap-1 text-sm">
                    <Mail className="w-3 h-3" />
                    {supplier.email}
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center gap-1 text-sm">
                    <Phone className="w-3 h-3" />
                    {supplier.phone}
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>{supplier.cnpj || '-'}</TableCell>
            <TableCell>{supplier.city || '-'}</TableCell>
            <TableCell>
              <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                {supplier.status === 'active' ? 'Ativo' : 'Inativo'}
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
