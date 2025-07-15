
-- 1. Corrigir estrutura da tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS notifications boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS dark_mode boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sound_effects boolean DEFAULT true;

-- 2. Adicionar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_products_company_id ON public.products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON public.products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_sales_company_id ON public.sales(company_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at);
CREATE INDEX IF NOT EXISTS idx_clients_company_id ON public.clients(company_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_company_id ON public.suppliers(company_id);
CREATE INDEX IF NOT EXISTS idx_categories_company_id ON public.categories(company_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_company_id ON public.stock_movements(company_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON public.stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_notifications_company_id ON public.notifications(company_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_company_users_company_id ON public.company_users(company_id);
CREATE INDEX IF NOT EXISTS idx_company_users_user_id ON public.company_users(user_id);

-- 3. Melhorar função de validação de preços
CREATE OR REPLACE FUNCTION public.validate_prices()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Validar se preço é positivo
  IF NEW.price IS NOT NULL AND NEW.price <= 0 THEN
    RAISE EXCEPTION 'O preço deve ser maior que zero';
  END IF;
  
  -- Validar se preço de custo é menor que preço de venda (se informado)
  IF NEW.cost_price IS NOT NULL AND NEW.price IS NOT NULL AND NEW.cost_price >= NEW.price THEN
    RAISE EXCEPTION 'O preço de custo deve ser menor que o preço de venda';
  END IF;
  
  -- Validar se quantidade em estoque não é negativa
  IF NEW.stock_quantity IS NOT NULL AND NEW.stock_quantity < 0 THEN
    RAISE EXCEPTION 'A quantidade em estoque não pode ser negativa';
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4. Adicionar trigger para validação de preços
DROP TRIGGER IF EXISTS validate_prices_trigger ON public.products;
CREATE TRIGGER validate_prices_trigger
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_prices();

-- 5. Melhorar função de auditoria
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (
      company_id, 
      user_id, 
      table_name, 
      action, 
      record_id, 
      old_values,
      ip_address
    ) VALUES (
      OLD.company_id,
      auth.uid(),
      TG_TABLE_NAME,
      TG_OP,
      OLD.id,
      to_jsonb(OLD),
      inet_client_addr()
    );
    RETURN OLD;
  END IF;
  
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (
      company_id, 
      user_id, 
      table_name, 
      action, 
      record_id, 
      new_values,
      ip_address
    ) VALUES (
      NEW.company_id,
      auth.uid(),
      TG_TABLE_NAME,
      TG_OP,
      NEW.id,
      to_jsonb(NEW),
      inet_client_addr()
    );
    RETURN NEW;
  END IF;
  
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (
      company_id, 
      user_id, 
      table_name, 
      action, 
      record_id, 
      old_values,
      new_values,
      ip_address
    ) VALUES (
      NEW.company_id,
      auth.uid(),
      TG_TABLE_NAME,
      TG_OP,
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW),
      inet_client_addr()
    );
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- 6. Adicionar triggers de auditoria nas tabelas principais
DROP TRIGGER IF EXISTS audit_products_trigger ON public.products;
CREATE TRIGGER audit_products_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_trigger();

DROP TRIGGER IF EXISTS audit_sales_trigger ON public.sales;
CREATE TRIGGER audit_sales_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_trigger();

DROP TRIGGER IF EXISTS audit_clients_trigger ON public.clients;
CREATE TRIGGER audit_clients_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_trigger();

-- 7. Adicionar configurações padrão do sistema
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description, category) VALUES
  ('app_name', 'LoovePOS', 'text', 'Nome da aplicação', 'general'),
  ('timezone', 'America/Sao_Paulo', 'text', 'Fuso horário do sistema', 'general'),
  ('currency', 'BRL', 'text', 'Moeda padrão', 'general'),
  ('language', 'pt-BR', 'text', 'Idioma padrão', 'general'),
  ('max_login_attempts', '5', 'number', 'Máximo de tentativas de login', 'security'),
  ('session_timeout', '3600', 'number', 'Timeout da sessão em segundos', 'security'),
  ('backup_retention_days', '30', 'number', 'Dias de retenção de backup', 'system'),
  ('enable_email_notifications', 'true', 'boolean', 'Habilitar notificações por email', 'notifications'),
  ('low_stock_threshold', '10', 'number', 'Limite para alerta de estoque baixo', 'inventory')
ON CONFLICT (setting_key) DO NOTHING;

-- 8. Melhorar função de relatório de vendas
CREATE OR REPLACE FUNCTION public.get_sales_report(
  start_date date DEFAULT NULL,
  end_date date DEFAULT NULL,
  company_id_param uuid DEFAULT NULL
)
RETURNS TABLE(
  total_sales numeric,
  total_orders bigint,
  avg_order_value numeric,
  top_products jsonb,
  sales_by_day jsonb,
  payment_methods jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  company_id_var UUID;
BEGIN
  -- Usar company_id fornecido ou obter do usuário atual
  company_id_var := COALESCE(company_id_param, get_user_company_id());
  
  RETURN QUERY
  SELECT 
    COALESCE(SUM(s.total_amount), 0) as total_sales,
    COUNT(s.id) as total_orders,
    CASE 
      WHEN COUNT(s.id) > 0 THEN COALESCE(SUM(s.total_amount), 0) / COUNT(s.id)
      ELSE 0
    END as avg_order_value,
    -- Top produtos
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'product_name', p.name,
            'quantity_sold', SUM(si.quantity),
            'total_revenue', SUM(si.total_price)
          )
          ORDER BY SUM(si.quantity) DESC
        )
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        JOIN sales s2 ON si.sale_id = s2.id
        WHERE s2.company_id = company_id_var
          AND (start_date IS NULL OR s2.created_at::DATE >= start_date)
          AND (end_date IS NULL OR s2.created_at::DATE <= end_date)
        GROUP BY p.id, p.name
        LIMIT 10
      ),
      '[]'::jsonb
    ) as top_products,
    -- Vendas por dia
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'date', DATE(s2.created_at),
            'total_sales', SUM(s2.total_amount),
            'order_count', COUNT(s2.id)
          )
          ORDER BY DATE(s2.created_at)
        )
        FROM sales s2
        WHERE s2.company_id = company_id_var
          AND (start_date IS NULL OR s2.created_at::DATE >= start_date)
          AND (end_date IS NULL OR s2.created_at::DATE <= end_date)
        GROUP BY DATE(s2.created_at)
      ),
      '[]'::jsonb
    ) as sales_by_day,
    -- Métodos de pagamento
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'payment_method', s2.payment_method,
            'total_amount', SUM(s2.total_amount),
            'count', COUNT(s2.id)
          )
        )
        FROM sales s2
        WHERE s2.company_id = company_id_var
          AND (start_date IS NULL OR s2.created_at::DATE >= start_date)
          AND (end_date IS NULL OR s2.created_at::DATE <= end_date)
        GROUP BY s2.payment_method
      ),
      '[]'::jsonb
    ) as payment_methods
  FROM sales s
  WHERE s.company_id = company_id_var
    AND (start_date IS NULL OR s.created_at::DATE >= start_date)
    AND (end_date IS NULL OR s.created_at::DATE <= end_date);
END;
$$;

-- 9. Função para limpeza de dados antigos
CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Limpar logs de auditoria antigos (mais de 1 ano)
  DELETE FROM public.audit_logs 
  WHERE created_at < NOW() - INTERVAL '1 year';
  
  -- Limpar notificações lidas antigas (mais de 3 meses)
  DELETE FROM public.notifications 
  WHERE read = true AND created_at < NOW() - INTERVAL '3 months';
  
  -- Limpar histórico de preços muito antigo (mais de 2 anos)
  DELETE FROM public.price_history 
  WHERE created_at < NOW() - INTERVAL '2 years';
  
  -- Limpar backups antigos baseado na configuração
  DELETE FROM public.backups 
  WHERE created_at < NOW() - INTERVAL '1 day' * (
    SELECT COALESCE(setting_value::integer, 30) 
    FROM public.system_settings 
    WHERE setting_key = 'backup_retention_days'
  );
END;
$$;

-- 10. Criar função para validar permissões mais robusta
CREATE OR REPLACE FUNCTION public.validate_user_permission(
  user_id_param uuid,
  permission_name text,
  company_id_param uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_company_id uuid;
  user_role text;
  has_permission boolean := false;
BEGIN
  -- Obter company_id do usuário se não fornecido
  user_company_id := COALESCE(
    company_id_param,
    (SELECT company_id FROM public.profiles WHERE id = user_id_param)
  );
  
  -- Verificar se o usuário tem role de admin/owner
  SELECT role INTO user_role
  FROM public.company_users
  WHERE user_id = user_id_param 
    AND company_id = user_company_id
    AND status = 'active';
  
  -- Admins e owners têm todas as permissões
  IF user_role IN ('admin', 'owner') THEN
    RETURN true;
  END IF;
  
  -- Verificar permissão específica
  SELECT EXISTS (
    SELECT 1 
    FROM public.company_users cu
    WHERE cu.user_id = user_id_param 
      AND cu.company_id = user_company_id
      AND cu.status = 'active'
      AND cu.permissions->>permission_name = 'true'
  ) INTO has_permission;
  
  RETURN has_permission;
END;
$$;
