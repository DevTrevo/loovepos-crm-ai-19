
-- Adicionar RLS (Row Level Security) para todas as tabelas que não possuem
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para categorias
CREATE POLICY "Users can view company categories" ON public.categories
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert company categories" ON public.categories
  FOR INSERT WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update company categories" ON public.categories
  FOR UPDATE USING (company_id = get_user_company_id());

CREATE POLICY "Users can delete company categories" ON public.categories
  FOR DELETE USING (company_id = get_user_company_id());

-- Criar políticas RLS para fornecedores
CREATE POLICY "Users can view company suppliers" ON public.suppliers
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert company suppliers" ON public.suppliers
  FOR INSERT WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update company suppliers" ON public.suppliers
  FOR UPDATE USING (company_id = get_user_company_id());

CREATE POLICY "Users can delete company suppliers" ON public.suppliers
  FOR DELETE USING (company_id = get_user_company_id());

-- Criar políticas RLS para produtos
CREATE POLICY "Users can view company products" ON public.products
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert company products" ON public.products
  FOR INSERT WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update company products" ON public.products
  FOR UPDATE USING (company_id = get_user_company_id());

CREATE POLICY "Users can delete company products" ON public.products
  FOR DELETE USING (company_id = get_user_company_id());

-- Criar políticas RLS para clientes
CREATE POLICY "Users can view company clients" ON public.clients
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert company clients" ON public.clients
  FOR INSERT WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update company clients" ON public.clients
  FOR UPDATE USING (company_id = get_user_company_id());

CREATE POLICY "Users can delete company clients" ON public.clients
  FOR DELETE USING (company_id = get_user_company_id());

-- Criar políticas RLS para vendas
CREATE POLICY "Users can view company sales" ON public.sales
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert company sales" ON public.sales
  FOR INSERT WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update company sales" ON public.sales
  FOR UPDATE USING (company_id = get_user_company_id());

CREATE POLICY "Users can delete company sales" ON public.sales
  FOR DELETE USING (company_id = get_user_company_id());

-- Criar políticas RLS para itens de venda
CREATE POLICY "Users can view sale items" ON public.sale_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sales 
      WHERE sales.id = sale_items.sale_id 
      AND sales.company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can insert sale items" ON public.sale_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sales 
      WHERE sales.id = sale_items.sale_id 
      AND sales.company_id = get_user_company_id()
    )
  );

-- Criar políticas RLS para compras
CREATE POLICY "Users can view company purchases" ON public.purchases
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert company purchases" ON public.purchases
  FOR INSERT WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update company purchases" ON public.purchases
  FOR UPDATE USING (company_id = get_user_company_id());

-- Criar políticas RLS para movimentações de estoque
CREATE POLICY "Users can view company stock movements" ON public.stock_movements
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert company stock movements" ON public.stock_movements
  FOR INSERT WITH CHECK (company_id = get_user_company_id());

-- Criar políticas RLS para notificações
CREATE POLICY "Users can view company notifications" ON public.notifications
  FOR SELECT USING (
    company_id = get_user_company_id() AND 
    (user_id IS NULL OR user_id = auth.uid())
  );

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (
    company_id = get_user_company_id() AND 
    (user_id IS NULL OR user_id = auth.uid())
  );

-- Criar políticas RLS para chamadas
CREATE POLICY "Users can view company calls" ON public.calls
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert company calls" ON public.calls
  FOR INSERT WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update company calls" ON public.calls
  FOR UPDATE USING (company_id = get_user_company_id());

-- Criar políticas RLS para campanhas de email
CREATE POLICY "Users can view company email campaigns" ON public.email_campaigns
  FOR SELECT USING (company_id = get_user_company_id());

CREATE POLICY "Users can insert company email campaigns" ON public.email_campaigns
  FOR INSERT WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Users can update company email campaigns" ON public.email_campaigns
  FOR UPDATE USING (company_id = get_user_company_id());

-- Corrigir trigger para atualizar updated_at em todas as tabelas relevantes
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_suppliers_updated_at ON public.suppliers;
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON public.clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar trigger para verificar estoque baixo nos produtos
DROP TRIGGER IF EXISTS check_low_stock_trigger ON public.products;
CREATE TRIGGER check_low_stock_trigger
  AFTER UPDATE OF stock_quantity ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.check_low_stock();

-- Função para calcular totais automaticamente
CREATE OR REPLACE FUNCTION public.calculate_sale_total()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar o total da venda
  UPDATE public.sales 
  SET total_amount = (
    SELECT COALESCE(SUM(total_price), 0) 
    FROM public.sale_items 
    WHERE sale_id = NEW.sale_id
  )
  WHERE id = NEW.sale_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular total automaticamente
DROP TRIGGER IF EXISTS calculate_sale_total_trigger ON public.sale_items;
CREATE TRIGGER calculate_sale_total_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.sale_items
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_sale_total();

-- Função para validar preços
CREATE OR REPLACE FUNCTION public.validate_prices()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar se preço é positivo
  IF NEW.price <= 0 THEN
    RAISE EXCEPTION 'O preço deve ser maior que zero';
  END IF;
  
  -- Validar se preço de custo é menor que preço de venda (se informado)
  IF NEW.cost_price IS NOT NULL AND NEW.cost_price >= NEW.price THEN
    RAISE EXCEPTION 'O preço de custo deve ser menor que o preço de venda';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar preços
DROP TRIGGER IF EXISTS validate_prices_trigger ON public.products;
CREATE TRIGGER validate_prices_trigger
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_prices();
