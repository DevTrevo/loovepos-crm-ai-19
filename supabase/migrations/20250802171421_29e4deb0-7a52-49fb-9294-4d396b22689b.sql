-- Melhorias no sistema de segurança e permissões

-- 1. Criar tabela de templates de permissões por role
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL,
  permissions JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Inserir permissões padrão para diferentes roles
INSERT INTO public.role_permissions (role, permissions, is_default) VALUES
('owner', '{
  "manage_company": true,
  "manage_users": true,
  "manage_products": true,
  "manage_categories": true,
  "manage_suppliers": true,
  "manage_clients": true,
  "manage_sales": true,
  "create_sales": true,
  "manage_purchases": true,
  "manage_inventory": true,
  "manage_marketing": true,
  "manage_calls": true,
  "view_reports": true,
  "manage_settings": true,
  "manage_security": true,
  "view_audit_logs": true,
  "manage_backups": true
}', true),
('admin', '{
  "manage_users": true,
  "manage_products": true,
  "manage_categories": true,
  "manage_suppliers": true,
  "manage_clients": true,
  "manage_sales": true,
  "create_sales": true,
  "manage_purchases": true,
  "manage_inventory": true,
  "manage_marketing": true,
  "manage_calls": true,
  "view_reports": true,
  "manage_settings": true,
  "view_audit_logs": true
}', true),
('manager', '{
  "manage_products": true,
  "manage_categories": true,
  "manage_suppliers": true,
  "manage_clients": true,
  "manage_sales": true,
  "create_sales": true,
  "manage_purchases": true,
  "manage_inventory": true,
  "manage_calls": true,
  "view_reports": true
}', true),
('employee', '{
  "view_products": true,
  "view_categories": true,
  "view_suppliers": true,
  "view_clients": true,
  "create_sales": true,
  "view_inventory": true,
  "manage_calls": true
}', true);

-- 3. Criar tabela de sessões de segurança
CREATE TABLE IF NOT EXISTS public.security_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company_id UUID NOT NULL,
  session_token TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Criar tabela de tentativas de login
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  attempt_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  failure_reason TEXT
);

-- 5. Criar tabela de configurações de segurança por empresa
CREATE TABLE IF NOT EXISTS public.company_security_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  max_login_attempts INTEGER DEFAULT 5,
  lockout_duration INTEGER DEFAULT 900, -- em segundos
  session_timeout INTEGER DEFAULT 3600, -- em segundos
  require_password_change_days INTEGER DEFAULT 90,
  minimum_password_length INTEGER DEFAULT 8,
  require_special_chars BOOLEAN DEFAULT true,
  require_numbers BOOLEAN DEFAULT true,
  two_factor_enabled BOOLEAN DEFAULT false,
  ip_whitelist JSONB DEFAULT '[]',
  allowed_devices INTEGER DEFAULT 5,
  auto_logout_inactive BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id)
);

-- 6. Função para aplicar permissões padrão a novos usuários
CREATE OR REPLACE FUNCTION public.apply_default_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Buscar permissões padrão para o role do usuário
  DECLARE
    default_permissions JSONB;
  BEGIN
    SELECT permissions INTO default_permissions
    FROM public.role_permissions
    WHERE role = NEW.role AND is_default = true;
    
    -- Se encontrou permissões padrão, aplicar
    IF default_permissions IS NOT NULL THEN
      NEW.permissions := default_permissions;
    END IF;
    
    RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql;

-- 7. Trigger para aplicar permissões padrão
DROP TRIGGER IF EXISTS apply_default_permissions_trigger ON public.company_users;
CREATE TRIGGER apply_default_permissions_trigger
  BEFORE INSERT ON public.company_users
  FOR EACH ROW
  EXECUTE FUNCTION public.apply_default_permissions();

-- 8. Função para registrar tentativas de login
CREATE OR REPLACE FUNCTION public.log_login_attempt(
  user_email TEXT,
  user_ip INET,
  user_agent_str TEXT,
  is_success BOOLEAN,
  fail_reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.login_attempts (
    email, ip_address, user_agent, success, failure_reason
  ) VALUES (
    user_email, user_ip, user_agent_str, is_success, fail_reason
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Função para verificar se usuário está bloqueado
CREATE OR REPLACE FUNCTION public.is_user_locked(user_email TEXT, user_ip INET)
RETURNS BOOLEAN AS $$
DECLARE
  failed_attempts INTEGER;
  max_attempts INTEGER := 5;
  lockout_duration INTEGER := 900; -- 15 minutos
BEGIN
  -- Contar tentativas falhadas nas últimas horas
  SELECT COUNT(*) INTO failed_attempts
  FROM public.login_attempts
  WHERE email = user_email
    AND ip_address = user_ip
    AND success = false
    AND attempt_time > (NOW() - INTERVAL '1 hour');
  
  -- Se excedeu o limite, verificar se ainda está no período de bloqueio
  IF failed_attempts >= max_attempts THEN
    -- Verificar se a última tentativa foi dentro do período de bloqueio
    RETURN EXISTS (
      SELECT 1
      FROM public.login_attempts
      WHERE email = user_email
        AND ip_address = user_ip
        AND success = false
        AND attempt_time > (NOW() - (lockout_duration || ' seconds')::INTERVAL)
      ORDER BY attempt_time DESC
      LIMIT 1
    );
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Função para criar configurações de segurança padrão para empresa
CREATE OR REPLACE FUNCTION public.create_default_security_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.company_security_settings (company_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Trigger para criar configurações de segurança automaticamente
DROP TRIGGER IF EXISTS create_security_settings_trigger ON public.companies;
CREATE TRIGGER create_security_settings_trigger
  AFTER INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_security_settings();

-- 12. Habilitar RLS nas novas tabelas
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_security_settings ENABLE ROW LEVEL SECURITY;

-- 13. Políticas RLS para role_permissions
CREATE POLICY "Authenticated users can view role permissions"
ON public.role_permissions FOR SELECT
TO authenticated
USING (true);

-- 14. Políticas RLS para security_sessions
CREATE POLICY "Users can view their own sessions"
ON public.security_sessions FOR ALL
TO authenticated
USING (user_id = auth.uid());

-- 15. Políticas RLS para login_attempts
CREATE POLICY "Admins can view login attempts"
ON public.login_attempts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.company_users cu
    WHERE cu.user_id = auth.uid()
    AND cu.role IN ('admin', 'owner')
    AND cu.status = 'active'
  )
);

-- 16. Políticas RLS para company_security_settings
CREATE POLICY "Users can view their company security settings"
ON public.company_security_settings FOR SELECT
TO authenticated
USING (company_id = get_user_company_id());

CREATE POLICY "Admins can manage company security settings"
ON public.company_security_settings FOR ALL
TO authenticated
USING (
  company_id = get_user_company_id() AND
  user_has_permission('manage_security')
);

-- 17. Trigger para logs de auditoria atualizados
CREATE TRIGGER audit_role_permissions_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.role_permissions
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_company_security_settings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.company_security_settings
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- 18. Triggers para timestamp automático
CREATE TRIGGER update_role_permissions_updated_at
  BEFORE UPDATE ON public.role_permissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_security_settings_updated_at
  BEFORE UPDATE ON public.company_security_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();