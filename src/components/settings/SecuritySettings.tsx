
import { useState, useEffect } from "react";
import { useSystemSettings, useUpdateSystemSetting } from "@/hooks/useSystemSettings";
import { SettingsCard, SettingField, SettingSwitch } from "./SettingsCard";
import { useToast } from "@/hooks/use-toast";

export const SecuritySettings = () => {
  const { data: settings } = useSystemSettings('security');
  const updateSetting = useUpdateSystemSetting();
  const { toast } = useToast();

  const [securitySettings, setSecuritySettings] = useState({
    max_login_attempts: '5',
    session_timeout: '30',
    two_factor_enabled: false,
    password_expiry_days: '90',
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

      setSecuritySettings(prev => ({ ...prev, ...settingsMap }));
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
        description: "Erro ao salvar configuração de segurança",
        variant: "destructive",
      });
    }
  };

  return (
    <SettingsCard 
      title="Configurações de Segurança"
      description="Configure políticas de segurança e autenticação"
    >
      <div className="space-y-6">
        <SettingField
          label="Máximo de tentativas de login"
          description="Número máximo de tentativas de login antes de bloquear a conta"
          value={securitySettings.max_login_attempts}
          onChange={(value) => 
            setSecuritySettings(prev => ({ ...prev, max_login_attempts: value }))
          }
          onSave={() => handleSaveSetting('max_login_attempts', securitySettings.max_login_attempts)}
          type="number"
          placeholder="5"
        />

        <SettingField
          label="Timeout de sessão (minutos)"
          description="Tempo limite para sessões inativas"
          value={securitySettings.session_timeout}
          onChange={(value) => 
            setSecuritySettings(prev => ({ ...prev, session_timeout: value }))
          }
          onSave={() => handleSaveSetting('session_timeout', securitySettings.session_timeout)}
          type="number"
          placeholder="30"
        />

        <SettingField
          label="Expiração de senha (dias)"
          description="Número de dias antes da senha expirar"
          value={securitySettings.password_expiry_days}
          onChange={(value) => 
            setSecuritySettings(prev => ({ ...prev, password_expiry_days: value }))
          }
          onSave={() => handleSaveSetting('password_expiry_days', securitySettings.password_expiry_days)}
          type="number"
          placeholder="90"
        />

        <SettingSwitch
          label="Autenticação de dois fatores"
          description="Exigir verificação adicional no login"
          checked={securitySettings.two_factor_enabled}
          onChange={(checked) => 
            setSecuritySettings(prev => ({ ...prev, two_factor_enabled: checked }))
          }
          onSave={() => handleSaveSetting('two_factor_enabled', securitySettings.two_factor_enabled)}
        />
      </div>
    </SettingsCard>
  );
};
