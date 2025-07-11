
-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_categories_company_id ON categories(company_id);
CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_company_id ON suppliers(company_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_sales_company_id ON sales(company_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_clients_company_id ON clients(company_id);
CREATE INDEX IF NOT EXISTS idx_notifications_company_id ON notifications(company_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Limpar políticas RLS redundantes/conflitantes
DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;
DROP POLICY IF EXISTS "Authenticated users can view products" ON products;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can manage suppliers" ON suppliers;
DROP POLICY IF EXISTS "Authenticated users can manage clients" ON clients;
DROP POLICY IF EXISTS "Authenticated users can manage sales" ON sales;

-- Melhorar função de validação de permissões
CREATE OR REPLACE FUNCTION public.user_has_permission(permission_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.company_users cu
    JOIN public.profiles p ON p.id = cu.user_id
    WHERE cu.user_id = auth.uid() 
    AND cu.status = 'active'
    AND cu.company_id IS NOT NULL
    AND p.is_active = true
    AND (
      cu.role IN ('owner', 'admin') 
      OR cu.permissions->permission_name = 'true'
      OR p.permissions->permission_name = 'true'
    )
  );
$$;

-- Função para obter dados completos da empresa do usuário
CREATE OR REPLACE FUNCTION public.get_user_company_data()
RETURNS TABLE(
  company_id uuid,
  company_name text,
  user_role text,
  permissions jsonb
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT 
    cu.company_id,
    c.name as company_name,
    cu.role as user_role,
    COALESCE(cu.permissions, '{}'::jsonb) || COALESCE(p.permissions, '{}'::jsonb) as permissions
  FROM public.company_users cu
  JOIN public.companies c ON c.id = cu.company_id
  JOIN public.profiles p ON p.id = cu.user_id
  WHERE cu.user_id = auth.uid() 
  AND cu.status = 'active'
  AND p.is_active = true
  LIMIT 1;
$$;

-- Melhorar trigger de notificação de estoque baixo
CREATE OR REPLACE FUNCTION public.check_low_stock()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verificar se o estoque ficou abaixo do mínimo
  IF NEW.stock_quantity <= NEW.min_stock AND (OLD.stock_quantity IS NULL OR OLD.stock_quantity > NEW.min_stock) THEN
    INSERT INTO notifications (company_id, title, message, type, action_url)
    VALUES (
      NEW.company_id,
      'Estoque Baixo - ' || NEW.name,
      'O produto "' || NEW.name || '" está com estoque baixo. Quantidade atual: ' || NEW.stock_quantity || ' unidades (mínimo: ' || NEW.min_stock || ')',
      'warning',
      '/produtos'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para log de auditoria automático
CREATE OR REPLACE FUNCTION public.audit_log_changes()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO audit_logs (
    company_id,
    user_id,
    table_name,
    record_id,
    action,
    old_values,
    new_values
  ) VALUES (
    COALESCE(NEW.company_id, OLD.company_id),
    auth.uid(),
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN to_jsonb(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Aplicar triggers de auditoria
DROP TRIGGER IF EXISTS audit_products_trigger ON products;
CREATE TRIGGER audit_products_trigger
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

DROP TRIGGER IF EXISTS audit_categories_trigger ON categories;
CREATE TRIGGER audit_categories_trigger
  AFTER INSERT OR UPDATE OR DELETE ON categories
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

DROP TRIGGER IF EXISTS audit_suppliers_trigger ON suppliers;
CREATE TRIGGER audit_suppliers_trigger
  AFTER INSERT OR UPDATE OR DELETE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

-- Criar tabela para configurações da empresa
CREATE TABLE IF NOT EXISTS public.company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  setting_key text NOT NULL,
  setting_value jsonb,
  setting_type text DEFAULT 'text',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id, setting_key)
);

ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage company settings"
  ON public.company_settings
  FOR ALL
  USING (company_id = get_user_company_id() AND user_has_permission('manage_settings'));

-- Criar tabela para histórico de preços
CREATE TABLE IF NOT EXISTS public.price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  old_price numeric NOT NULL,
  new_price numeric NOT NULL,
  changed_by uuid REFERENCES auth.users(id),
  reason text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view price history from their company"
  ON public.price_history
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM products p 
    WHERE p.id = product_id 
    AND p.company_id = get_user_company_id()
  ));

-- Trigger para registrar mudanças de preço
CREATE OR REPLACE FUNCTION public.log_price_changes()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.price != NEW.price THEN
    INSERT INTO price_history (product_id, old_price, new_price, changed_by)
    VALUES (NEW.id, OLD.price, NEW.price, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS price_change_trigger ON products;
CREATE TRIGGER price_change_trigger
  AFTER UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION log_price_changes();

-- Função para relatórios de vendas
CREATE OR REPLACE FUNCTION public.get_sales_report(
  start_date date DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  total_sales numeric,
  total_orders bigint,
  avg_order_value numeric,
  top_products jsonb
)
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  WITH sales_data AS (
    SELECT 
      s.total_amount,
      si.product_id,
      si.quantity,
      p.name as product_name
    FROM sales s
    JOIN sale_items si ON si.sale_id = s.id
    JOIN products p ON p.id = si.product_id
    WHERE s.company_id = get_user_company_id()
    AND s.created_at::date BETWEEN start_date AND end_date
    AND s.status = 'completed'
  )
  SELECT 
    COALESCE(SUM(total_amount), 0) as total_sales,
    COUNT(DISTINCT product_id) as total_orders,
    COALESCE(AVG(total_amount), 0) as avg_order_value,
    jsonb_agg(
      jsonb_build_object(
        'product_name', product_name,
        'quantity_sold', SUM(quantity)
      ) ORDER BY SUM(quantity) DESC
    ) FILTER (WHERE product_name IS NOT NULL) as top_products
  FROM sales_data;
$$;

-- Atualizar triggers existentes
DROP TRIGGER IF EXISTS update_updated_at_products ON products;
CREATE TRIGGER update_updated_at_products
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_updated_at_categories ON categories;
CREATE TRIGGER update_updated_at_categories
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_updated_at_suppliers ON suppliers;
CREATE TRIGGER update_updated_at_suppliers
  BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
