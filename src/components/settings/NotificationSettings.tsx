
import { useState, useEffect } from "react";
import { useSystemSettings, useUpdateSystemSetting } from "@/hooks/useSystemSettings";
import { SettingsCard, SettingSwitch } from "./SettingsCard";
import { useToast } from "@/hooks/use-toast";

export const NotificationSettings = () => {
  const { data: settings } = useSystemSettings('notifications');
  const updateSetting = useUpdateSystemSetting();
  const { toast } = useToast();

  const [notificationSettings, setNotificationSettings] = useState({
    low_stock_alerts: false,
    new_sales_notifications: false,
    email_reports: false,
    system_alerts: true,
    security_alerts: true,
    backup_notifications: true,
  });

  useEffect(() => {
    if (settings) {
      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value === 'true';
        return acc;
      }, {} as Record<string, boolean>);

      setNotificationSettings(prev => ({ ...prev, ...settingsMap }));
    }
  }, [settings]);

  const handleSaveSetting = async (key: string, value: boolean) => {
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
        description: "Erro ao salvar configuração de notificação",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <SettingsCard 
        title="Configurações de Notificações"
        description="Gerencie como e quando você recebe notificações do sistema"
      >
        <div className="space-y-4">
          <SettingSwitch
            label="Alertas de estoque baixo"
            description="Receber notificações quando produtos estiverem com estoque baixo"
            checked={notificationSettings.low_stock_alerts}
            onChange={(checked) => 
              setNotificationSettings(prev => ({ ...prev, low_stock_alerts: checked }))
            }
            onSave={() => handleSaveSetting('low_stock_alerts', notificationSettings.low_stock_alerts)}
          />

          <SettingSwitch
            label="Notificações de novas vendas"
            description="Receber alertas quando novas vendas forem realizadas"
            checked={notificationSettings.new_sales_notifications}
            onChange={(checked) => 
              setNotificationSettings(prev => ({ ...prev, new_sales_notifications: checked }))
            }
            onSave={() => handleSaveSetting('new_sales_notifications', notificationSettings.new_sales_notifications)}
          />

          <SettingSwitch
            label="Relatórios por email"
            description="Receber relatórios periódicos por email"
            checked={notificationSettings.email_reports}
            onChange={(checked) => 
              setNotificationSettings(prev => ({ ...prev, email_reports: checked }))
            }
            onSave={() => handleSaveSetting('email_reports', notificationSettings.email_reports)}
          />

          <SettingSwitch
            label="Alertas do sistema"
            description="Receber notificações sobre atualizações e manutenções do sistema"
            checked={notificationSettings.system_alerts}
            onChange={(checked) => 
              setNotificationSettings(prev => ({ ...prev, system_alerts: checked }))
            }
            onSave={() => handleSaveSetting('system_alerts', notificationSettings.system_alerts)}
          />

          <SettingSwitch
            label="Alertas de segurança"
            description="Receber notificações sobre eventos de segurança importantes"
            checked={notificationSettings.security_alerts}
            onChange={(checked) => 
              setNotificationSettings(prev => ({ ...prev, security_alerts: checked }))
            }
            onSave={() => handleSaveSetting('security_alerts', notificationSettings.security_alerts)}
          />

          <SettingSwitch
            label="Notificações de backup"
            description="Receber alertas sobre status de backups e manutenções"
            checked={notificationSettings.backup_notifications}
            onChange={(checked) => 
              setNotificationSettings(prev => ({ ...prev, backup_notifications: checked }))
            }
            onSave={() => handleSaveSetting('backup_notifications', notificationSettings.backup_notifications)}
          />
        </div>
      </SettingsCard>
    </div>
  );
};
