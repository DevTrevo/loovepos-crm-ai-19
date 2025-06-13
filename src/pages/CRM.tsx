
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Users, 
  Phone, 
  Mail, 
  Calendar,
  ShoppingBag,
  TrendingUp,
  Star
} from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  lastPurchase: string;
  totalSpent: number;
  purchaseCount: number;
  status: 'active' | 'inactive' | 'vip';
  score: number;
}

const CRM = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const clients: Client[] = [
    {
      id: 1,
      name: "Maria Silva",
      email: "maria@email.com",
      phone: "(11) 99999-1111",
      lastPurchase: "2024-06-10",
      totalSpent: 1250.00,
      purchaseCount: 8,
      status: 'vip',
      score: 95
    },
    {
      id: 2,
      name: "João Santos",
      email: "joao@email.com",
      phone: "(11) 99999-2222",
      lastPurchase: "2024-06-08",
      totalSpent: 680.50,
      purchaseCount: 4,
      status: 'active',
      score: 78
    },
    {
      id: 3,
      name: "Ana Costa",
      email: "ana@email.com",
      phone: "(11) 99999-3333",
      lastPurchase: "2024-05-15",
      totalSpent: 320.00,
      purchaseCount: 2,
      status: 'inactive',
      score: 45
    }
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'vip': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'vip': return 'VIP';
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      default: return status;
    }
  };

  const purchaseHistory = [
    { date: "10/06/2024", products: "Whey Protein, Creatina", value: 135.40 },
    { date: "25/05/2024", products: "Vitamina D", value: 32.00 },
    { date: "15/05/2024", products: "Colágeno, Óleo de Coco", value: 92.70 }
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
                  <h1 className="text-3xl font-bold text-gray-900">CRM - Gestão de Clientes</h1>
                  <p className="text-gray-600">Gerencie relacionamentos e histórico de clientes</p>
                </div>
              </div>
              <Button>
                <Users className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Lista de Clientes */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Clientes
                    </CardTitle>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Buscar clientes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredClients.map((client) => (
                        <div
                          key={client.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                            selectedClient?.id === client.id ? 'bg-blue-50 border-blue-300' : ''
                          }`}
                          onClick={() => setSelectedClient(client)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium">{client.name}</h3>
                            <Badge className={getStatusColor(client.status)}>
                              {getStatusLabel(client.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{client.email}</p>
                          <p className="text-sm text-gray-600">{client.phone}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm font-medium text-green-600">
                              R$ {client.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500" />
                              <span className="text-sm">{client.score}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detalhes do Cliente */}
              <div className="lg:col-span-2">
                {selectedClient ? (
                  <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList>
                      <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                      <TabsTrigger value="history">Histórico</TabsTrigger>
                      <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Users className="w-5 h-5" />
                              Informações Pessoais
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <label className="text-sm font-medium text-gray-600">Nome</label>
                              <p className="font-medium">{selectedClient.name}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Email</label>
                              <p className="font-medium">{selectedClient.email}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Telefone</label>
                              <p className="font-medium">{selectedClient.phone}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Status</label>
                              <Badge className={getStatusColor(selectedClient.status)}>
                                {getStatusLabel(selectedClient.status)}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <TrendingUp className="w-5 h-5" />
                              Métricas de Compra
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <label className="text-sm font-medium text-gray-600">Total Gasto</label>
                              <p className="text-2xl font-bold text-green-600">
                                R$ {selectedClient.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Número de Compras</label>
                              <p className="text-xl font-medium">{selectedClient.purchaseCount}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Última Compra</label>
                              <p className="font-medium">{new Date(selectedClient.lastPurchase).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium text-gray-600">Score do Cliente</label>
                              <div className="flex items-center gap-2">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-yellow-500 h-2 rounded-full" 
                                    style={{ width: `${selectedClient.score}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium">{selectedClient.score}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <Button className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Ligar
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Enviar Email
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Agendar
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="history">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5" />
                            Histórico de Compras
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {purchaseHistory.map((purchase, index) => (
                              <div key={index} className="p-4 border rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="font-medium">{purchase.products}</p>
                                    <p className="text-sm text-gray-600">{purchase.date}</p>
                                  </div>
                                  <p className="font-bold text-green-600">
                                    R$ {purchase.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="campaigns">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Mail className="w-5 h-5" />
                            Campanhas Enviadas
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="p-4 border rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-medium">Promoção Verão</h4>
                                  <p className="text-sm text-gray-600">Enviado em 05/06/2024</p>
                                </div>
                                <Badge>Aberto</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mt-2">
                                Campanha promocional com 20% de desconto em suplementos.
                              </p>
                            </div>
                            
                            <div className="p-4 border rounded-lg">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h4 className="font-medium">Produtos Recomendados</h4>
                                  <p className="text-sm text-gray-600">Enviado em 28/05/2024</p>
                                </div>
                                <Badge variant="secondary">Não Aberto</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mt-2">
                                Sugestões personalizadas baseadas no histórico de compras.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <Card className="h-96 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Selecione um cliente para ver os detalhes</p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default CRM;
