
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSalesReport } from "@/hooks/useSalesReport";
import { TrendingUp, ShoppingCart, DollarSign, Package } from "lucide-react";
import { format, subDays } from "date-fns";

export const SalesReportCard = () => {
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);
  
  const { data: salesReport, isLoading, refetch } = useSalesReport(
    format(thirtyDaysAgo, 'yyyy-MM-dd'),
    format(today, 'yyyy-MM-dd')
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando relatório de vendas...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Relatório de Vendas (30 dias)</CardTitle>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Atualizar
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-xs text-gray-600">Total de Vendas</p>
              <p className="text-lg font-semibold">
                {formatCurrency(salesReport?.total_sales || 0)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-xs text-gray-600">Total de Pedidos</p>
              <p className="text-lg font-semibold">
                {salesReport?.total_orders || 0}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <div>
              <p className="text-xs text-gray-600">Ticket Médio</p>
              <p className="text-lg font-semibold">
                {formatCurrency(salesReport?.avg_order_value || 0)}
              </p>
            </div>
          </div>
        </div>

        {salesReport?.top_products && salesReport.top_products.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Produtos Mais Vendidos
            </h4>
            <div className="space-y-2">
              {salesReport.top_products.slice(0, 5).map((product, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="truncate">{product.product_name}</span>
                  <span className="font-medium">{product.quantity_sold} unidades</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
