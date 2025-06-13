
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  Send, 
  Users, 
  BarChart3,
  PlusCircle,
  Eye,
  MousePointer
} from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";

interface Campaign {
  id: number;
  name: string;
  subject: string;
  status: 'draft' | 'sent' | 'scheduled';
  sent: number;
  opened: number;
  clicked: number;
  created: string;
}

const EmailMarketing = () => {
  const { toast } = useToast();
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    subject: "",
    content: ""
  });

  const campaigns: Campaign[] = [
    {
      id: 1,
      name: "Promoção Verão",
      subject: "🏖️ Chegou o Verão! 20% OFF em todos os suplementos",
      status: 'sent',
      sent: 150,
      opened: 75,
      clicked: 23,
      created: "2024-06-10"
    },
    {
      id: 2,
      name: "Clientes Inativos",
      subject: "Sentimos sua falta! Volta aqui com 15% de desconto",
      status: 'sent',
      sent: 45,
      opened: 18,
      clicked: 7,
      created: "2024-06-08"
    },
    {
      id: 3,
      name: "Novos Produtos",
      subject: "🆕 Lançamentos imperdíveis chegaram!",
      status: 'draft',
      sent: 0,
      opened: 0,
      clicked: 0,
      created: "2024-06-12"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sent': return 'Enviada';
      case 'draft': return 'Rascunho';
      case 'scheduled': return 'Agendada';
      default: return status;
    }
  };

  const createCampaign = () => {
    if (!newCampaign.name || !newCampaign.subject || !newCampaign.content) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para criar a campanha.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Campanha criada!",
      description: `A campanha "${newCampaign.name}" foi criada com sucesso.`,
    });

    setNewCampaign({ name: "", subject: "", content: "" });
  };

  const aiSuggestions = [
    {
      type: "Reativação",
      suggestion: "Criar campanha para clientes inativos há mais de 30 dias (12 clientes)"
    },
    {
      type: "Cross-sell",
      suggestion: "Oferecer creatina para clientes que compraram whey protein (8 clientes)"
    },
    {
      type: "Aniversário",
      suggestion: "Campanha de aniversário para 3 clientes este mês"
    }
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
                  <h1 className="text-3xl font-bold text-gray-900">Email Marketing</h1>
                  <p className="text-gray-600">Gerencie campanhas e automatizações</p>
                </div>
              </div>
            </div>

            <Tabs defaultValue="campaigns" className="space-y-6">
              <TabsList>
                <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
                <TabsTrigger value="create">Criar Campanha</TabsTrigger>
                <TabsTrigger value="automation">Automatização IA</TabsTrigger>
              </TabsList>

              <TabsContent value="campaigns">
                {/* Métricas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Enviado</CardTitle>
                      <Send className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">195</div>
                      <p className="text-xs text-gray-600">Este mês</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Taxa de Abertura</CardTitle>
                      <Eye className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">47.7%</div>
                      <p className="text-xs text-gray-600">+2.1% vs mês anterior</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Taxa de Clique</CardTitle>
                      <MousePointer className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">15.4%</div>
                      <p className="text-xs text-gray-600">+0.8% vs mês anterior</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Campanhas Ativas</CardTitle>
                      <BarChart3 className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">3</div>
                      <p className="text-xs text-gray-600">2 enviadas, 1 rascunho</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Lista de Campanhas */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="w-5 h-5" />
                      Todas as Campanhas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {campaigns.map((campaign) => (
                        <div key={campaign.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-medium text-lg">{campaign.name}</h3>
                              <p className="text-gray-600">{campaign.subject}</p>
                              <p className="text-sm text-gray-500">
                                Criada em {new Date(campaign.created).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <Badge className={getStatusColor(campaign.status)}>
                              {getStatusLabel(campaign.status)}
                            </Badge>
                          </div>
                          
                          {campaign.status === 'sent' && (
                            <div className="grid grid-cols-3 gap-4 mt-4">
                              <div className="text-center">
                                <p className="text-sm text-gray-600">Enviados</p>
                                <p className="text-xl font-bold">{campaign.sent}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-gray-600">Abertos</p>
                                <p className="text-xl font-bold text-green-600">
                                  {campaign.opened} ({((campaign.opened / campaign.sent) * 100).toFixed(1)}%)
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-sm text-gray-600">Cliques</p>
                                <p className="text-xl font-bold text-purple-600">
                                  {campaign.clicked} ({((campaign.clicked / campaign.sent) * 100).toFixed(1)}%)
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="create">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PlusCircle className="w-5 h-5" />
                      Nova Campanha
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Nome da Campanha
                      </label>
                      <Input
                        placeholder="Ex: Promoção Black Friday"
                        value={newCampaign.name}
                        onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Assunto do Email
                      </label>
                      <Input
                        placeholder="Ex: 🔥 Descontos imperdíveis te esperando!"
                        value={newCampaign.subject}
                        onChange={(e) => setNewCampaign({...newCampaign, subject: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Conteúdo do Email
                      </label>
                      <Textarea
                        placeholder="Digite o conteúdo do seu email..."
                        rows={8}
                        value={newCampaign.content}
                        onChange={(e) => setNewCampaign({...newCampaign, content: e.target.value})}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button onClick={createCampaign}>
                        <Send className="w-4 h-4 mr-2" />
                        Criar Campanha
                      </Button>
                      <Button variant="outline">
                        Salvar Rascunho
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="automation">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Sugestões da IA Looveble
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {aiSuggestions.map((suggestion, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <Badge variant="secondary" className="mb-2">
                                {suggestion.type}
                              </Badge>
                              <p className="text-gray-700">{suggestion.suggestion}</p>
                            </div>
                            <Button size="sm">
                              Criar Campanha
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                      <h3 className="font-medium text-lg mb-2">🤖 IA Looveble Ativa</h3>
                      <p className="text-gray-600 mb-4">
                        A IA está monitorando seus clientes e pode criar campanhas automaticamente baseadas em:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        <li>Clientes inativos há mais de 15 dias</li>
                        <li>Produtos complementares baseados no histórico</li>
                        <li>Aniversários e datas especiais</li>
                        <li>Carrinhos abandonados no PDV</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default EmailMarketing;
