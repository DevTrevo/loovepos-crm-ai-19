
import { useState, useEffect } from "react";
import { useSystemSettings, useUpdateSystemSetting } from "@/hooks/useSystemSettings";
import { SettingsCard, SettingSwitch, SettingField } from "./SettingsCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Database, Download, Upload, AlertTriangle } from "lucide-react";

export const SystemMaintenanceSettings = () => {
  const { data: settings } = useSystemSettings('system');
  const updateSetting = useUpdateSystemSetting();
  const { toast } = useToast();

  const [systemSettings, setSystemSettings] = useState({
    auto_backup_enabled: true,
    backup_frequency: '24',
    maintenance_mode: false,
    debug_mode: false,
    log_level: 'info',
  });

  useEffect(() => {
    if (settings) {
      const settingsMap = settings.reduce((acc, setting) => {
        if (setting.setting_type === 'boolean') {
          acc[setting.setting_key] = setting.setting_value === 'true';
        } else {
          acc[setting.setting_key] = setting.setting_value || '';
        }
        return acc;
      }, {} as Record<string, any>);

      setSystemSettings(prev => ({ ...prev, ...settingsMap }));
    }
  }, [settings]);

  const handleSaveSetting = async (key: string, value: string | boolean) => {
    try {
      const setting = settings?.find(s => s.setting_key === key);
      if (setting) {
        await updateSetting.mutateAsync({
          id: setting.id,
          setting_value: value.toString()
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configuração do sistema",
        variant: "destructive",
      });
    }
  };

  const handleBackupNow = async () => {
    try {
      toast({
        title: "Backup iniciado",
        description: "O backup do sistema foi iniciado e será processado em segundo plano.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao iniciar backup",
        variant: "destructive",
      });
    }
  };

  return (
    <SettingsCard 
      title="Manutenção do Sistema"
      description="Configure backups, logs e manutenção do sistema"
    >
      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Backup e Recuperação
          </h4>
          
          <div className="space-y-4">
            <SettingSwitch
              label="Backup automático"
              description="Realizar backup automático dos dados regularmente"
              checked={systemSettings.auto_backup_enabled}
              onChange={(checked) => 
                setSystemSettings(prev => ({ ...prev, auto_backup_enabled: checked }))
              }
              onSave={() => handleSaveSetting('auto_backup_enabled', systemSettings.auto_backup_enabled)}
            />

            <SettingField
              label="Frequência de backup (horas)"
              description="Intervalo entre backups automáticos"
              value={systemSettings.backup_frequency}
              onChange={(value) => 
                setSystemSettings(prev => ({ ...prev, backup_frequency: value }))
              }
              onSave={() => handleSaveSetting('backup_frequency', systemSettings.backup_frequency)}
              type="number"
              placeholder="24"
            />

            <div className="flex gap-2">
              <Button onClick={handleBackupNow} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Fazer Backup Agora
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Restaurar Backup
              </Button>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Configurações Avançadas
          </h4>
          
          <div className="space-y-4">
            <SettingSwitch
              label="Modo de manutenção"
              description="Bloquear acesso ao sistema para manutenção"
              checked={systemSettings.maintenance_mode}
              onChange={(checked) => 
                setSystemSettings(prev => ({ ...prev, maintenance_mode: checked }))
              }
              onSave={() => handleSaveSetting('maintenance_mode', systemSettings.maintenance_mode)}
            />

            <SettingSwitch
              label="Modo de depuração"
              description="Ativar logs detalhados para desenvolvimento"
              checked={systemSettings.debug_mode}
              onChange={(checked) => 
                setSystemSettings(prev => ({ ...prev, debug_mode: checked }))
              }
              onSave={() => handleSaveSetting('debug_mode', systemSettings.debug_mode)}
            />

            <SettingField
              label="Nível de log"
              description="Nível de detalhamento dos logs (error, warn, info, debug)"
              value={systemSettings.log_level}
              onChange={(value) => 
                setSystemSettings(prev => ({ ...prev, log_level: value }))
              }
              onSave={() => handleSaveSetting('log_level', systemSettings.log_level)}
              placeholder="info"
            />
          </div>
        </div>
      </div>
    </SettingsCard>
  );
};
