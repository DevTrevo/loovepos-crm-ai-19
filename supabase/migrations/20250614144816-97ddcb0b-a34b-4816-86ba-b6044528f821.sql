
-- Criar tabela de categorias de produtos (para melhor organização)
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de fornecedores
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  cnpj TEXT UNIQUE,
  address TEXT,
  city TEXT,
  state TEXT DEFAULT 'São Paulo',
  zip_code TEXT,
  contact_person TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de movimentações de estoque
CREATE TABLE public.stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id),
  movement_type TEXT NOT NULL CHECK (movement_type IN ('in', 'out', 'adjustment')),
  quantity INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_id UUID, -- pode referenciar sale_id, purchase_id, etc
  reference_type TEXT, -- 'sale', 'purchase', 'adjustment', 'return'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de compras/pedidos
CREATE TABLE public.purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID REFERENCES public.suppliers(id),
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'ordered', 'received', 'cancelled')),
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_date DATE,
  received_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de itens de compra
CREATE TABLE public.purchase_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID REFERENCES public.purchases(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  unit_cost DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  received_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de campanhas de email para clientes específicos
CREATE TABLE public.email_campaign_recipients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id),
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de configurações do sistema
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type TEXT DEFAULT 'text' CHECK (setting_type IN ('text', 'number', 'boolean', 'json')),
  description TEXT,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de logs de atividades
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT, -- Para quando implementarmos autenticação
  action TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Atualizar tabela de produtos para referenciar categorias
ALTER TABLE public.products ADD COLUMN category_id UUID REFERENCES public.categories(id);
ALTER TABLE public.products ADD COLUMN supplier_id UUID REFERENCES public.suppliers(id);

-- Habilitar RLS para todas as novas tabelas
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS permissivas para desenvolvimento
CREATE POLICY "Allow all operations for now" ON public.categories FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON public.suppliers FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON public.stock_movements FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON public.purchases FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON public.purchase_items FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON public.email_campaign_recipients FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON public.system_settings FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON public.activity_logs FOR ALL USING (true);

-- Criar triggers para updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON public.purchases FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Inserir categorias padrão
INSERT INTO public.categories (name, description) VALUES
('Suplemento', 'Suplementos alimentares e nutricionais'),
('Cosmético', 'Produtos de beleza e cuidados pessoais'),
('Vitamina', 'Vitaminas e minerais'),
('Natural', 'Produtos naturais e orgânicos'),
('Acessório', 'Acessórios diversos'),
('Medicamento', 'Medicamentos e produtos farmacêuticos');

-- Inserir algumas configurações padrão do sistema
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description, category) VALUES
('company_name', 'LoovePOS', 'text', 'Nome da empresa', 'company'),
('company_email', 'contato@looovepos.com', 'text', 'Email da empresa', 'company'),
('company_phone', '(11) 99999-9999', 'text', 'Telefone da empresa', 'company'),
('tax_rate', '0.18', 'number', 'Taxa de imposto padrão', 'financial'),
('currency', 'BRL', 'text', 'Moeda padrão', 'financial'),
('low_stock_alert', 'true', 'boolean', 'Alerta de estoque baixo', 'inventory'),
('email_notifications', 'true', 'boolean', 'Notificações por email', 'notifications');

-- Inserir fornecedor exemplo
INSERT INTO public.suppliers (name, email, phone, cnpj, contact_person, address, city) VALUES
('Distribuidora Saúde Total', 'contato@saudetotal.com.br', '(11) 3333-4444', '12.345.678/0001-90', 'Carlos Silva', 'Rua dos Distribuidores, 100', 'São Paulo');

-- Atualizar produtos existentes com category_id
UPDATE public.products SET category_id = (SELECT id FROM public.categories WHERE name = 'Suplemento' LIMIT 1) WHERE category = 'Suplemento';
UPDATE public.products SET category_id = (SELECT id FROM public.categories WHERE name = 'Cosmético' LIMIT 1) WHERE category = 'Cosmético';
UPDATE public.products SET category_id = (SELECT id FROM public.categories WHERE name = 'Vitamina' LIMIT 1) WHERE category = 'Vitamina';
UPDATE public.products SET category_id = (SELECT id FROM public.categories WHERE name = 'Natural' LIMIT 1) WHERE category = 'Natural';
