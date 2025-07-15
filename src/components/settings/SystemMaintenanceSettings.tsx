
import { useState } from "react";
import { useSystemSettings, useUpdateSystemSetting } from "@/hooks/useSystemSettings";
import { SettingsCard, SettingField } from "./SettingsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, Trash2, Download, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const SystemMaintenanceSettings = () => {
  const { data: settings } = useSystemSettings('system');
  const updateSetting = useUpdateSystemSetting();
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});
  const [isCleaningUp, setIsCleaningUp] = useState(false);

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

  const runCleanup = async () => {
    setIsCleaningUp(true);
    try {
      const { error } = await supabase.rpc('cleanup_old_data');
      if (error) throw error;
      
      toast({
        title: "Limpeza concluída",
        description: "Dados antigos foram removidos com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao executar limpeza de dados",
        variant: "destructive",
      });
    } finally {
      setIsCleaningUp(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Atenção:</strong> Estas operações podem afetar o desempenho do sistema. 
          Execute apenas durante horários de baixa atividade.
        </AlertDescription>
      </Alert>

      <SettingsCard 
        title="Configurações de Manutenção"
        description="Configure as políticas de retenção e limpeza de dados"
      >
        <div className="space-y-6">
          <SettingField
            label="Dias de Retenção de Backup"
            value={getSettingValue('backup_retention_days')}
            onChange={(value) => handleSettingChange('backup_retention_days', value)}
            onSave={() => handleSaveSetting(getSettingId('backup_retention_days') || '', 'backup_retention_days')}
            type="number"
            placeholder="30"
            description="Número de dias para manter backups antes da exclusão automática"
          />

          <SettingField
            label="Limite de Alerta de Estoque"
            value={getSettingValue('low_stock_threshold')}
            onChange={(value) => handleSettingChange('low_stock_threshold', value)}
            onSave={() => handleSaveSetting(getSettingId('low_stock_threshold') || '', 'low_stock_threshold')}
            type="number"
            placeholder="10"
            description="Quantidade mínima para gerar alerta de estoque baixo"
          />
        </div>
      </SettingsCard>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Operações de Manutenção
          </CardTitle>
          <CardDescription>
            Execute operações de limpeza e manutenção do banco de dados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Limpeza de Dados Antigos</h4>
              <p className="text-sm text-muted-foreground">
                Remove logs de auditoria antigos, notificações lidas e histórico de preços
              </p>
            </div>
            <Button 
              onClick={runCleanup}
              disabled={isCleaningUp}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {isCleaningUp ? 'Executando...' : 'Executar Limpeza'}
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Backup do Sistema</h4>
              <p className="text-sm text-muted-foreground">
                Gera backup completo dos dados do sistema
              </p>
            </div>
            <Button 
              variant="outline"
              disabled
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Em Breve
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Políticas de Retenção</CardTitle>
          <CardDescription>
            Configure por quanto tempo os dados serão mantidos no sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Logs de Auditoria</h4>
              <p className="text-sm text-muted-foreground">Mantidos por 1 ano</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Notificações Lidas</h4>
              <p className="text-sm text-muted-foreground">Mantidas por 3 meses</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Histórico de Preços</h4>
              <p className="text-sm text-muted-foreground">Mantido por 2 anos</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Backups</h4>
              <p className="text-sm text-muted-foreground">Baseado na configuração</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
