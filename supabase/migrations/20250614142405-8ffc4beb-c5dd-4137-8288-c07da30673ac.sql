
-- Criar tabela de clientes
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  cpf TEXT UNIQUE,
  birth_date DATE,
  address TEXT,
  city TEXT,
  state TEXT DEFAULT 'São Paulo',
  zip_code TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de produtos
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2),
  category TEXT NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  barcode TEXT UNIQUE,
  sku TEXT UNIQUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de vendas
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id),
  total_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'pix', 'credit')),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de itens da venda
CREATE TABLE public.sale_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de campanhas de email
CREATE TABLE public.email_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'scheduled')),
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de ligações
CREATE TABLE public.calls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'missed', 'in-progress')),
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER,
  notes TEXT,
  result TEXT CHECK (result IN ('sale', 'follow-up', 'not-interested')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir dados de exemplo para produtos
INSERT INTO public.products (name, description, price, cost_price, category, stock_quantity, min_stock, sku) VALUES
('Whey Protein', 'Proteína em pó para ganho de massa muscular', 89.90, 65.00, 'Suplemento', 15, 5, 'WHEY001'),
('Creatina', 'Creatina monohidratada para performance', 45.50, 32.00, 'Suplemento', 22, 5, 'CREAT001'),
('Shampoo Fortificante', 'Shampoo para cabelos danificados', 28.90, 20.00, 'Cosmético', 8, 3, 'SHAMP001'),
('Vitamina D', 'Suplemento de vitamina D3', 32.00, 22.00, 'Vitamina', 30, 10, 'VITD001'),
('Óleo de Coco', 'Óleo de coco extravirgem', 24.90, 18.00, 'Natural', 12, 5, 'COCO001'),
('Colágeno', 'Colágeno hidrolisado em pó', 67.80, 48.00, 'Suplemento', 18, 5, 'COLAG001');

-- Inserir dados de exemplo para clientes
INSERT INTO public.clients (name, email, phone, cpf, address, city, zip_code) VALUES
('Maria Silva', 'maria.silva@email.com', '(11) 99999-1111', '123.456.789-01', 'Rua das Flores, 123', 'São Paulo', '01234-567'),
('João Santos', 'joao.santos@email.com', '(11) 99999-2222', '987.654.321-01', 'Av. Paulista, 456', 'São Paulo', '01310-000'),
('Ana Costa', 'ana.costa@email.com', '(11) 99999-3333', '456.789.123-01', 'Rua Augusta, 789', 'São Paulo', '01305-000');

-- Habilitar Row Level Security (RLS) - Para futuro quando implementarmos autenticação
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS permissivas para desenvolvimento (podem ser restringidas depois)
CREATE POLICY "Allow all operations for now" ON public.clients FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON public.products FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON public.sales FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON public.sale_items FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON public.email_campaigns FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON public.calls FOR ALL USING (true);

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON public.sales FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON public.email_campaigns FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_calls_updated_at BEFORE UPDATE ON public.calls FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
