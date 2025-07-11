
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { usePriceHistory } from "@/hooks/usePriceHistory";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PriceHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
}

export const PriceHistoryDialog = ({ 
  open, 
  onOpenChange, 
  productId, 
  productName 
}: PriceHistoryDialogProps) => {
  const { data: priceHistory, isLoading } = usePriceHistory(productId);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPriceChangeIcon = (oldPrice: number, newPrice: number) => {
    if (newPrice > oldPrice) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (newPrice < oldPrice) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  const getPriceChangeBadge = (oldPrice: number, newPrice: number) => {
    const change = ((newPrice - oldPrice) / oldPrice) * 100;
    const variant = change > 0 ? "default" : "destructive";
    
    return (
      <Badge variant={variant} className="text-xs">
        {change > 0 ? '+' : ''}{change.toFixed(1)}%
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico de Preços - {productName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Carregando histórico...</div>
          ) : priceHistory && priceHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Preço Anterior</TableHead>
                  <TableHead>Novo Preço</TableHead>
                  <TableHead>Variação</TableHead>
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceHistory.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {format(new Date(entry.created_at), 'dd/MM/yyyy HH:mm', { 
                        locale: ptBR 
                      })}
                    </TableCell>
                    <TableCell>{formatCurrency(entry.old_price)}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      {getPriceChangeIcon(entry.old_price, entry.new_price)}
                      {formatCurrency(entry.new_price)}
                    </TableCell>
                    <TableCell>
                      {getPriceChangeBadge(entry.old_price, entry.new_price)}
                    </TableCell>
                    <TableCell>
                      {entry.reason || 'Não informado'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Nenhum histórico de preços encontrado para este produto.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
