
-- Adicionar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON products(stock_quantity);

CREATE INDEX IF NOT EXISTS idx_sales_company_id ON sales(company_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);

CREATE INDEX IF NOT EXISTS idx_clients_company_id ON clients(company_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

CREATE INDEX IF NOT EXISTS idx_suppliers_company_id ON suppliers(company_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);

CREATE INDEX IF NOT EXISTS idx_categories_company_id ON categories(company_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_company_id ON stock_movements(company_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);

-- Implementar RLS (Row Level Security) para isolamento entre empresas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para products
CREATE POLICY "Users can only access products from their company" ON products
  FOR ALL USING (company_id = get_user_company_id());

-- Políticas RLS para clients
CREATE POLICY "Users can only access clients from their company" ON clients
  FOR ALL USING (company_id = get_user_company_id());

-- Políticas RLS para suppliers
CREATE POLICY "Users can only access suppliers from their company" ON suppliers
  FOR ALL USING (company_id = get_user_company_id());

-- Políticas RLS para categories
CREATE POLICY "Users can only access categories from their company" ON categories
  FOR ALL USING (company_id = get_user_company_id());

-- Políticas RLS para sales
CREATE POLICY "Users can only access sales from their company" ON sales
  FOR ALL USING (company_id = get_user_company_id());

-- Políticas RLS para stock_movements
CREATE POLICY "Users can only access stock movements from their company" ON stock_movements
  FOR ALL USING (company_id = get_user_company_id());

-- Políticas RLS para email_campaigns
CREATE POLICY "Users can only access email campaigns from their company" ON email_campaigns
  FOR ALL USING (company_id = get_user_company_id());

-- Políticas RLS para calls
CREATE POLICY "Users can only access calls from their company" ON calls
  FOR ALL USING (company_id = get_user_company_id());

-- Criar tabela de notificações para tempo real
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, warning, error, success
  read BOOLEAN NOT NULL DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Índices para notificações
CREATE INDEX idx_notifications_company_id ON notifications(company_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- RLS para notificações
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access notifications from their company" ON notifications
  FOR ALL USING (
    company_id = get_user_company_id() AND 
    (user_id IS NULL OR user_id = auth.uid())
  );

-- Função para criar notificação de estoque baixo
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS trigger AS $$
BEGIN
  -- Se o estoque ficou abaixo do mínimo, criar notificação
  IF NEW.stock_quantity <= NEW.min_stock AND OLD.stock_quantity > NEW.min_stock THEN
    INSERT INTO notifications (company_id, title, message, type)
    VALUES (
      NEW.company_id,
      'Estoque Baixo',
      'O produto "' || NEW.name || '" está com estoque baixo (' || NEW.stock_quantity || ' unidades)',
      'warning'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para verificar estoque baixo
DROP TRIGGER IF EXISTS trigger_check_low_stock ON products;
CREATE TRIGGER trigger_check_low_stock
  AFTER UPDATE OF stock_quantity ON products
  FOR EACH ROW
  EXECUTE FUNCTION check_low_stock();

-- Ativar realtime para notificações
ALTER TABLE notifications REPLICA IDENTITY FULL;
