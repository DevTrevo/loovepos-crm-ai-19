
import { useState } from "react";
import { useSystemSettings, useUpdateSystemSetting } from "@/hooks/useSystemSettings";
import { Header } from "@/components/layout/Header";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Store, Mail, Bell, Shield, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Configuracoes = () => {
  const { data: settings, isLoading } = useSystemSettings();
  const updateSetting = useUpdateSystemSetting();
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});

  const handleSettingChange = (key: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSetting = async (settingId: string, key: string) => {
    try {
      const value = localSettings[key] || '';
      await updateSetting.mutateAsync({ id: settingId, setting_value: value });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configuração",
        variant: "destructive",
      });
    }
  };

  const getSettingValue = (key: string) => {
    const setting = settings?.find(s => s.setting_key === key);
    return localSettings[key] ?? setting?.setting_value ?? '';
  };

  const getSettingId = (key: string) => {
    return settings?.find(s => s.setting_key === key)?.id;
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <Header />
            <div className="p-6">
              <div className="text-center">Carregando configurações...</div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <Header />
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Configurações</h1>
                <p className="text-gray-600">Gerencie as configurações do sistema</p>
              </div>
            </div>

            <Tabs defaultValue="geral" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="geral" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Geral
                </TabsTrigger>
                <TabsTrigger value="loja" className="flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  Loja
                </TabsTrigger>
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="notificacoes" className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Notificações
                </TabsTrigger>
                <TabsTrigger value="sistema" className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Sistema
                </TabsTrigger>
              </TabsList>

              <TabsContent value="geral">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações Gerais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="app_name">Nome do Sistema</Label>
                        <div className="flex gap-2">
                          <Input
                            id="app_name"
                            value={getSettingValue('app_name')}
                            onChange={(e) => handleSettingChange('app_name', e.target.value)}
                            placeholder="LoovePOS"
                          />
                          <Button 
                            onClick={() => handleSaveSetting(getSettingId('app_name') || '', 'app_name')}
                            size="sm"
                          >
                            Salvar
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timezone">Fuso Horário</Label>
                        <div className="flex gap-2">
                          <Input
                            id="timezone"
                            value={getSettingValue('timezone')}
                            onChange={(e) => handleSettingChange('timezone', e.target.value)}
                            placeholder="America/Sao_Paulo"
                          />
                          <Button 
                            onClick={() => handleSaveSetting(getSettingId('timezone') || '', 'timezone')}
                            size="sm"
                          >
                            Salvar
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="currency">Moeda</Label>
                        <div className="flex gap-2">
                          <Input
                            id="currency"
                            value={getSettingValue('currency')}
                            onChange={(e) => handleSettingChange('currency', e.target.value)}
                            placeholder="BRL"
                          />
                          <Button 
                            onClick={() => handleSaveSetting(getSettingId('currency') || '', 'currency')}
                            size="sm"
                          >
                            Salvar
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="language">Idioma</Label>
                        <div className="flex gap-2">
                          <Input
                            id="language"
                            value={getSettingValue('language')}
                            onChange={(e) => handleSettingChange('language', e.target.value)}
                            placeholder="pt-BR"
                          />
                          <Button 
                            onClick={() => handleSaveSetting(getSettingId('language') || '', 'language')}
                            size="sm"
                          >
                            Salvar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="loja">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações da Loja</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="store_name">Nome da Loja</Label>
                        <div className="flex gap-2">
                          <Input
                            id="store_name"
                            value={getSettingValue('store_name')}
                            onChange={(e) => handleSettingChange('store_name', e.target.value)}
                            placeholder="Minha Loja"
                          />
                          <Button 
                            onClick={() => handleSaveSetting(getSettingId('store_name') || '', 'store_name')}
                            size="sm"
                          >
                            Salvar
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="store_phone">Telefone</Label>
                        <div className="flex gap-2">
                          <Input
                            id="store_phone"
                            value={getSettingValue('store_phone')}
                            onChange={(e) => handleSettingChange('store_phone', e.target.value)}
                            placeholder="(11) 99999-9999"
                          />
                          <Button 
                            onClick={() => handleSaveSetting(getSettingId('store_phone') || '', 'store_phone')}
                            size="sm"
                          >
                            Salvar
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="store_email">Email</Label>
                        <div className="flex gap-2">
                          <Input
                            id="store_email"
                            type="email"
                            value={getSettingValue('store_email')}
                            onChange={(e) => handleSettingChange('store_email', e.target.value)}
                            placeholder="contato@minhaloja.com"
                          />
                          <Button 
                            onClick={() => handleSaveSetting(getSettingId('store_email') || '', 'store_email')}
                            size="sm"
                          >
                            Salvar
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="store_cnpj">CNPJ</Label>
                        <div className="flex gap-2">
                          <Input
                            id="store_cnpj"
                            value={getSettingValue('store_cnpj')}
                            onChange={(e) => handleSettingChange('store_cnpj', e.target.value)}
                            placeholder="00.000.000/0000-00"
                          />
                          <Button 
                            onClick={() => handleSaveSetting(getSettingId('store_cnpj') || '', 'store_cnpj')}
                            size="sm"
                          >
                            Salvar
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="store_address">Endereço</Label>
                      <div className="flex gap-2">
                        <Textarea
                          id="store_address"
                          value={getSettingValue('store_address')}
                          onChange={(e) => handleSettingChange('store_address', e.target.value)}
                          placeholder="Endereço completo da loja"
                        />
                        <Button 
                          onClick={() => handleSaveSetting(getSettingId('store_address') || '', 'store_address')}
                          size="sm"
                        >
                          Salvar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="email">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações de Email</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="smtp_host">Servidor SMTP</Label>
                        <div className="flex gap-2">
                          <Input
                            id="smtp_host"
                            value={getSettingValue('smtp_host')}
                            onChange={(e) => handleSettingChange('smtp_host', e.target.value)}
                            placeholder="smtp.gmail.com"
                          />
                          <Button 
                            onClick={() => handleSaveSetting(getSettingId('smtp_host') || '', 'smtp_host')}
                            size="sm"
                          >
                            Salvar
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="smtp_port">Porta SMTP</Label>
                        <div className="flex gap-2">
                          <Input
                            id="smtp_port"
                            value={getSettingValue('smtp_port')}
                            onChange={(e) => handleSettingChange('smtp_port', e.target.value)}
                            placeholder="587"
                          />
                          <Button 
                            onClick={() => handleSaveSetting(getSettingId('smtp_port') || '', 'smtp_port')}
                            size="sm"
                          >
                            Salvar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notificacoes">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações de Notificações</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Notificar estoque baixo</Label>
                          <p className="text-sm text-gray-600">Receber alertas quando produtos estiverem com estoque baixo</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Notificar novas vendas</Label>
                          <p className="text-sm text-gray-600">Receber notificações de novas vendas realizadas</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Email de relatórios</Label>
                          <p className="text-sm text-gray-600">Receber relatórios periódicos por email</p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="sistema">
                <Card>
                  <CardHeader>
                    <CardTitle>Configurações do Sistema</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Modo de desenvolvimento</Label>
                          <p className="text-sm text-gray-600">Ativar logs detalhados e ferramentas de debug</p>
                        </div>
                        <Switch />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Backup automático</Label>
                          <p className="text-sm text-gray-600">Realizar backup automático dos dados diariamente</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="max_login_attempts">Máximo de tentativas de login</Label>
                        <div className="flex gap-2">
                          <Input
                            id="max_login_attempts"
                            type="number"
                            value={getSettingValue('max_login_attempts')}
                            onChange={(e) => handleSettingChange('max_login_attempts', e.target.value)}
                            placeholder="5"
                          />
                          <Button 
                            onClick={() => handleSaveSetting(getSettingId('max_login_attempts') || '', 'max_login_attempts')}
                            size="sm"
                          >
                            Salvar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Configuracoes;
