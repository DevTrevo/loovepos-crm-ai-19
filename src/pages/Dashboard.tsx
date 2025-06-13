
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Mail, 
  Phone,
  Package,
  AlertCircle
} from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const Dashboard = () => {
  const salesData = {
    today: 2450.00,
    month: 15780.00,
    totalClients: 142,
    activeClients: 89,
    pendingOrders: 7,
    lowStock: 3
  };

  const recentSales = [
    { id: 1, client: "Maria Silva", value: 180.00, time: "10:30", status: "completed" },
    { id: 2, client: "João Santos", value: 95.50, time: "11:15", status: "completed" },
    { id: 3, client: "Ana Costa", value: 220.00, time: "12:00", status: "pending" }
  ];

  const campaigns = [
    { id: 1, name: "Promoção Verão", sent: 85, opened: 34, clicks: 12, status: "active" },
    { id: 2, name: "Clientes Inativos", sent: 23, opened: 8, clicks: 3, status: "completed" }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 bg-gray-50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                  <p className="text-gray-600">Visão geral do seu negócio</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Mail className="w-4 h-4 mr-2" />
                  Nova Campanha
                </Button>
                <Button>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Nova Venda
                </Button>
              </div>
            </div>

            {/* Métricas principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    R$ {salesData.today.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-gray-600">+12% em relação a ontem</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{salesData.activeClients}</div>
                  <p className="text-xs text-gray-600">de {salesData.totalClients} total</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{salesData.pendingOrders}</div>
                  <p className="text-xs text-gray-600">Para processar</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{salesData.lowStock}</div>
                  <p className="text-xs text-gray-600">Produtos para repor</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vendas Recentes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Vendas Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentSales.map((sale) => (
                      <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{sale.client}</p>
                          <p className="text-sm text-gray-600">{sale.time}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            R$ {sale.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <Badge variant={sale.status === 'completed' ? 'default' : 'secondary'}>
                            {sale.status === 'completed' ? 'Concluída' : 'Pendente'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Campanhas de Email */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Campanhas de Email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <div key={campaign.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{campaign.name}</h4>
                          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                            {campaign.status === 'active' ? 'Ativa' : 'Finalizada'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Enviados</p>
                            <p className="font-bold">{campaign.sent}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Abertos</p>
                            <p className="font-bold text-blue-600">{campaign.opened}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Cliques</p>
                            <p className="font-bold text-green-600">{campaign.clicks}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
