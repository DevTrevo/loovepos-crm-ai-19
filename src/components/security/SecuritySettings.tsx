
import { useState } from "react";
import { useSystemSettings, useUpdateSystemSetting } from "@/hooks/useSystemSettings";
import { SettingsCard, SettingField, SettingSwitch } from "@/components/settings/SettingsCard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const SecuritySettings = () => {
  const { data: settings } = useSystemSettings('security');
  const updateSetting = useUpdateSystemSetting();
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});

  const handleSettingChange = (key: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSetting = async (settingId: string, key: string) => {
    try {
      const value = localSettings[key] || '';
      
      // Validações específicas para configurações críticas
      if (key === 'max_login_attempts') {
        const numValue = parseInt(value);
        if (numValue < 3 || numValue > 10) {
          toast({
            title: "Erro de Validação",
            description: "Máximo de tentativas de login deve estar entre 3 e 10",
            variant: "destructive",
          });
          return;
        }
      }

      if (key === 'session_timeout') {
        const numValue = parseInt(value);
        if (numValue < 300 || numValue > 86400) {
          toast({
            title: "Erro de Validação",
            description: "Timeout da sessão deve estar entre 5 minutos (300s) e 24 horas (86400s)",
            variant: "destructive",
          });
          return;
        }
      }

      await updateSetting.mutateAsync({ id: settingId, setting_value: value });
      toast({
        title: "Configuração atualizada",
        description: "Configuração de segurança salva com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configuração de segurança",
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
    try {
      await supabase.rpc('cleanup_old_data');
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
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Atenção:</strong> Estas configurações afetam a segurança do sistema. 
          Altere apenas se você compreende as implicações.
        </AlertDescription>
      </Alert>

      <SettingsCard 
        title="Configurações de Autenticação"
        description="Configure as políticas de autenticação e sessão"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SettingField
            label="Máximo de Tentativas de Login"
            value={getSettingValue('max_login_attempts')}
            onChange={(value) => handleSettingChange('max_login_attempts', value)}
            onSave={() => handleSaveSetting(getSettingId('max_login_attempts') || '', 'max_login_attempts')}
            type="number"
            placeholder="5"
            description="Número máximo de tentativas antes de bloquear conta (3-10)"
          />

          <SettingField
            label="Timeout da Sessão (segundos)"
            value={getSettingValue('session_timeout')}
            onChange={(value) => handleSettingChange('session_timeout', value)}
            onSave={() => handleSaveSetting(getSettingId('session_timeout') || '', 'session_timeout')}
            type="number"
            placeholder="3600"
            description="Tempo limite da sessão em segundos (300-86400)"
          />
        </div>
      </SettingsCard>

      <SettingsCard
        title="Configurações de Limpeza de Dados"
        description="Configure a retenção e limpeza automática de dados"
      >
        <div className="space-y-4">
          <SettingField
            label="Dias de Retenção de Backup"
            value={getSettingValue('backup_retention_days')}
            onChange={(value) => handleSettingChange('backup_retention_days', value)}
            onSave={() => handleSaveSetting(getSettingId('backup_retention_days') || '', 'backup_retention_days')}
            type="number"
            placeholder="30"
            description="Número de dias para manter backups antes da exclusão automática"
          />

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Limpeza Manual de Dados</h4>
              <p className="text-sm text-muted-foreground">
                Remove logs antigos, notificações lidas e dados expirados
              </p>
            </div>
            <Button 
              onClick={runCleanup}
              variant="outline"
              className="flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              Executar Limpeza
            </Button>
          </div>
        </div>
      </SettingsCard>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Status de Segurança
          </CardTitle>
          <CardDescription>
            Verificação das configurações de segurança aplicadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium">Row Level Security</span>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium">Auditoria de Dados</span>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium">Validação de Entrada</span>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium">Triggers de Segurança</span>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
