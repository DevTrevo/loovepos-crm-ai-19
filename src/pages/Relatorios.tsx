
import { useSales } from "@/hooks/useSales";
import { useProducts } from "@/hooks/useProducts";
import { useClients } from "@/hooks/useClients";
import { Header } from "@/components/layout/Header";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, Package, DollarSign, Calendar } from "lucide-react";

const Relatorios = () => {
  const { data: sales } = useSales();
  const { data: products } = useProducts();
  const { data: clients } = useClients();

  // Cálculos para métricas
  const completedSales = sales?.filter(s => s.status === 'completed') || [];
  const totalRevenue = completedSales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const activeProducts = products?.filter(p => p.status === 'active') || [];
  const activeClients = clients?.filter(c => c.status === 'active') || [];

  // Vendas dos últimos 7 dias
  const last7Days = Array.from({length: 7}, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const salesByDay = last7Days.map(date => {
    const daySales = completedSales.filter(sale => 
      sale.created_at.split('T')[0] === date
    );
    const total = daySales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
    return {
      date: new Date(date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
      vendas: total
    };
  });

  // Métodos de pagamento
  const paymentMethods = completedSales.reduce((acc, sale) => {
    const method = sale.payment_method || 'cash';
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const paymentData = Object.entries(paymentMethods).map(([method, count]) => ({
    name: method === 'cash' ? 'Dinheiro' : 
          method === 'card' ? 'Cartão' : 
          method === 'pix' ? 'PIX' : 'Crédito',
    value: count,
    color: method === 'cash' ? '#8884d8' : 
           method === 'card' ? '#82ca9d' : 
           method === 'pix' ? '#ffc658' : '#ff7300'
  }));

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <Header />
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Relatórios</h1>
                <p className="text-gray-600">Análise de desempenho e métricas do negócio</p>
              </div>
            </div>

            {/* Cards de métricas principais */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    {completedSales.length} vendas realizadas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeProducts.length}</div>
                  <p className="text-xs text-muted-foreground">
                    No catálogo
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeClients.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Cadastrados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {completedSales.length > 0 ? (totalRevenue / completedSales.length).toFixed(2) : '0.00'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Por venda
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Vendas dos Últimos 7 Dias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesByDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Vendas']}
                      />
                      <Bar dataKey="vendas" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Métodos de Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={paymentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {paymentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Resumo mensal */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{completedSales.length}</div>
                    <div className="text-sm text-gray-600">Vendas Realizadas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {activeProducts.reduce((sum, p) => sum + p.stock_quantity, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Itens em Estoque</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      R$ {activeProducts.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0).toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Valor Total do Estoque</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Relatorios;
