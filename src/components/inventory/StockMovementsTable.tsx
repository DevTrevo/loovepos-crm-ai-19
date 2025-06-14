
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, RotateCcw } from "lucide-react";
import { StockMovement } from "@/hooks/useStockMovements";

interface StockMovementsTableProps {
  movements: StockMovement[];
}

export function StockMovementsTable({ movements }: StockMovementsTableProps) {
  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'in':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'out':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'adjustment':
        return <RotateCcw className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getMovementLabel = (type: string) => {
    switch (type) {
      case 'in':
        return 'Entrada';
      case 'out':
        return 'Saída';
      case 'adjustment':
        return 'Ajuste';
      default:
        return type;
    }
  };

  const getMovementVariant = (type: string) => {
    switch (type) {
      case 'in':
        return 'default' as const;
      case 'out':
        return 'destructive' as const;
      case 'adjustment':
        return 'secondary' as const;
      default:
        return 'secondary' as const;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Produto</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Quantidade</TableHead>
          <TableHead>Motivo</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Observações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {movements.map((movement) => (
          <TableRow key={movement.id}>
            <TableCell className="font-medium">
              <div>
                <div>{movement.products?.name}</div>
                <div className="text-sm text-gray-500">{movement.products?.sku}</div>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {getMovementIcon(movement.movement_type)}
                <Badge variant={getMovementVariant(movement.movement_type)}>
                  {getMovementLabel(movement.movement_type)}
                </Badge>
              </div>
            </TableCell>
            <TableCell>
              <span className={movement.movement_type === 'out' ? 'text-red-600' : 'text-green-600'}>
                {movement.movement_type === 'out' ? '-' : '+'}{movement.quantity}
              </span>
            </TableCell>
            <TableCell>{movement.reason}</TableCell>
            <TableCell>
              {new Date(movement.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </TableCell>
            <TableCell>{movement.notes || '-'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
