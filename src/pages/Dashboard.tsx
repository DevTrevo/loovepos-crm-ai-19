
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, DollarSign, Package, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useProducts } from "@/hooks/useProducts";
import { useSales } from "@/hooks/useSales";

const Dashboard = () => {
  const { data: clients } = useClients();
  const { data: products } = useProducts();
  const { data: sales } = useSales();

  const totalRevenue = sales?.reduce((sum, sale) => sum + sale.total_amount, 0) || 0;
  const lowStockProducts = products?.filter(p => p.stock_quantity <= p.min_stock).length || 0;
  const activeSales = sales?.filter(s => s.status === 'completed').length || 0;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">Visão geral do seu negócio</p>
          </div>

          {/* Cards de métricas principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% em relação ao mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vendas</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeSales}</div>
                <p className="text-xs text-muted-foreground">
                  +12.5% em relação à semana anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{clients?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +2 novos esta semana
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Produtos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {lowStockProducts} com estoque baixo
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Cards de informações detalhadas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Vendas Recentes
                </CardTitle>
                <CardDescription>Últimas vendas realizadas</CardDescription>
              </CardHeader>
              <CardContent>
                {sales && sales.length > 0 ? (
                  <div className="space-y-3">
                    {sales.slice(0, 5).map((sale) => (
                      <div key={sale.id} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">
                            {sale.clients?.name || 'Cliente não identificado'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(sale.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            R$ {sale.total_amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {sale.payment_method}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Nenhuma venda registrada</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Estoque Baixo
                </CardTitle>
                <CardDescription>Produtos que precisam de reposição</CardDescription>
              </CardHeader>
              <CardContent>
                {products && lowStockProducts > 0 ? (
                  <div className="space-y-3">
                    {products
                      .filter(p => p.stock_quantity <= p.min_stock)
                      .slice(0, 5)
                      .map((product) => (
                        <div key={product.id} className="flex items-center justify-between border-b pb-2">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600">{product.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-600">
                              {product.stock_quantity} un.
                            </p>
                            <p className="text-xs text-gray-500">
                              Mín: {product.min_stock}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Todos os produtos têm estoque adequado
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Dashboard;
