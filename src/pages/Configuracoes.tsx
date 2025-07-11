
import { useState } from "react";
import { useSystemSettings, useUpdateSystemSetting } from "@/hooks/useSystemSettings";
import { Header } from "@/components/layout/Header";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Store, Mail, Bell, Shield, Database, Users } from "lucide-react";
import { SettingsCard, SettingField } from "@/components/settings/SettingsCard";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { SystemMaintenanceSettings } from "@/components/settings/SystemMaintenanceSettings";
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
              <TabsList className="grid w-full grid-cols-6">
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
                <TabsTrigger value="seguranca" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Segurança
                </TabsTrigger>
                <TabsTrigger value="sistema" className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Sistema
                </TabsTrigger>
              </TabsList>

              <TabsContent value="geral">
                <SettingsCard 
                  title="Configurações Gerais"
                  description="Configure as informações básicas do sistema"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SettingField
                      label="Nome do Sistema"
                      value={getSettingValue('app_name')}
                      onChange={(value) => handleSettingChange('app_name', value)}
                      onSave={() => handleSaveSetting(getSettingId('app_name') || '', 'app_name')}
                      placeholder="LoovePOS"
                    />

                    <SettingField
                      label="Fuso Horário"
                      value={getSettingValue('timezone')}
                      onChange={(value) => handleSettingChange('timezone', value)}
                      onSave={() => handleSaveSetting(getSettingId('timezone') || '', 'timezone')}
                      placeholder="America/Sao_Paulo"
                    />

                    <SettingField
                      label="Moeda"
                      value={getSettingValue('currency')}
                      onChange={(value) => handleSettingChange('currency', value)}
                      onSave={() => handleSaveSetting(getSettingId('currency') || '', 'currency')}
                      placeholder="BRL"
                    />

                    <SettingField
                      label="Idioma"
                      value={getSettingValue('language')}
                      onChange={(value) => handleSettingChange('language', value)}
                      onSave={() => handleSaveSetting(getSettingId('language') || '', 'language')}
                      placeholder="pt-BR"
                    />
                  </div>
                </SettingsCard>
              </TabsContent>

              <TabsContent value="loja">
                <SettingsCard 
                  title="Informações da Loja"
                  description="Configure os dados da sua empresa"
                >
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SettingField
                        label="Nome da Loja"
                        value={getSettingValue('store_name')}
                        onChange={(value) => handleSettingChange('store_name', value)}
                        onSave={() => handleSaveSetting(getSettingId('store_name') || '', 'store_name')}
                        placeholder="Minha Loja"
                      />

                      <SettingField
                        label="Telefone"
                        value={getSettingValue('store_phone')}
                        onChange={(value) => handleSettingChange('store_phone', value)}
                        onSave={() => handleSaveSetting(getSettingId('store_phone') || '', 'store_phone')}
                        type="tel"
                        placeholder="(11) 99999-9999"
                      />

                      <SettingField
                        label="Email"
                        value={getSettingValue('store_email')}
                        onChange={(value) => handleSettingChange('store_email', value)}
                        onSave={() => handleSaveSetting(getSettingId('store_email') || '', 'store_email')}
                        type="email"
                        placeholder="contato@minhaloja.com"
                      />

                      <SettingField
                        label="CNPJ"
                        value={getSettingValue('store_cnpj')}
                        onChange={(value) => handleSettingChange('store_cnpj', value)}
                        onSave={() => handleSaveSetting(getSettingId('store_cnpj') || '', 'store_cnpj')}
                        placeholder="00.000.000/0000-00"
                      />
                    </div>

                    <SettingField
                      label="Endereço"
                      value={getSettingValue('store_address')}
                      onChange={(value) => handleSettingChange('store_address', value)}
                      onSave={() => handleSaveSetting(getSettingId('store_address') || '', 'store_address')}
                      type="textarea"
                      placeholder="Endereço completo da loja"
                    />
                  </div>
                </SettingsCard>
              </TabsContent>

              <TabsContent value="email">
                <SettingsCard 
                  title="Configurações de Email"
                  description="Configure o servidor de email para envio de notificações"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SettingField
                      label="Servidor SMTP"
                      value={getSettingValue('smtp_host')}
                      onChange={(value) => handleSettingChange('smtp_host', value)}
                      onSave={() => handleSaveSetting(getSettingId('smtp_host') || '', 'smtp_host')}
                      placeholder="smtp.gmail.com"
                    />

                    <SettingField
                      label="Porta SMTP"
                      value={getSettingValue('smtp_port')}
                      onChange={(value) => handleSettingChange('smtp_port', value)}
                      onSave={() => handleSaveSetting(getSettingId('smtp_port') || '', 'smtp_port')}
                      type="number"
                      placeholder="587"
                    />

                    <SettingField
                      label="Usuário SMTP"
                      value={getSettingValue('smtp_user')}
                      onChange={(value) => handleSettingChange('smtp_user', value)}
                      onSave={() => handleSaveSetting(getSettingId('smtp_user') || '', 'smtp_user')}
                      type="email"
                      placeholder="seu-email@gmail.com"
                    />

                    <SettingField
                      label="Senha SMTP"
                      value={getSettingValue('smtp_password')}
                      onChange={(value) => handleSettingChange('smtp_password', value)}
                      onSave={() => handleSaveSetting(getSettingId('smtp_password') || '', 'smtp_password')}
                      type="text"
                      placeholder="Senha do email"
                    />
                  </div>
                </SettingsCard>
              </TabsContent>

              <TabsContent value="notificacoes">
                <NotificationSettings />
              </TabsContent>

              <TabsContent value="seguranca">
                <SecuritySettings />
              </TabsContent>

              <TabsContent value="sistema">
                <SystemMaintenanceSettings />
              </TabsContent>
            </Tabs>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Configuracoes;
