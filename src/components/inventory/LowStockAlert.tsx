
import { useProducts } from "@/hooks/useProducts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export const LowStockAlert = () => {
  const { data: products } = useProducts();
  
  const lowStockProducts = products?.filter(
    product => product.stock_quantity <= product.min_stock && product.status === 'active'
  ) || [];

  if (lowStockProducts.length === 0) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-700">
          <AlertTriangle className="w-5 h-5" />
          Produtos com Estoque Baixo
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {lowStockProducts.slice(0, 5).map((product) => (
            <div key={product.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{product.name}</p>
                <p className="text-xs text-gray-600">{product.sku}</p>
              </div>
              <div className="text-right">
                <Badge variant="destructive" className="text-xs">
                  {product.stock_quantity} / {product.min_stock}
                </Badge>
              </div>
            </div>
          ))}
          {lowStockProducts.length > 5 && (
            <p className="text-xs text-gray-500 mt-2">
              +{lowStockProducts.length - 5} produtos com estoque baixo
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
