
-- Criar tabela de empresas para suporte multi-tenant
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT DEFAULT 'São Paulo',
  zip_code TEXT,
  logo_url TEXT,
  subscription_plan TEXT DEFAULT 'basic',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar company_id nas tabelas existentes
ALTER TABLE public.profiles ADD COLUMN company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.categories ADD COLUMN company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.suppliers ADD COLUMN company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.products ADD COLUMN company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.clients ADD COLUMN company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.sales ADD COLUMN company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.purchases ADD COLUMN company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.stock_movements ADD COLUMN company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.email_campaigns ADD COLUMN company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.calls ADD COLUMN company_id UUID REFERENCES public.companies(id);

-- Atualizar tabela de perfis para incluir mais informações
ALTER TABLE public.profiles ADD COLUMN phone TEXT;
ALTER TABLE public.profiles ADD COLUMN position TEXT;
ALTER TABLE public.profiles ADD COLUMN permissions JSONB DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN is_active BOOLEAN DEFAULT true;

-- Criar tabela de usuários da empresa
CREATE TABLE public.company_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'employee' CHECK (role IN ('owner', 'admin', 'manager', 'employee')),
  permissions JSONB DEFAULT '{}',
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, user_id)
);

-- Função para obter a empresa do usuário atual
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT cu.company_id 
  FROM public.company_users cu 
  WHERE cu.user_id = auth.uid() AND cu.status = 'active'
  LIMIT 1;
$$;

-- Função para verificar permissões do usuário
CREATE OR REPLACE FUNCTION public.user_has_permission(permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.company_users cu
    WHERE cu.user_id = auth.uid() 
    AND cu.status = 'active'
    AND (
      cu.role IN ('owner', 'admin') 
      OR cu.permissions->permission_name = 'true'
    )
  );
$$;

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para companies
CREATE POLICY "Users can view their company" ON public.companies
FOR SELECT USING (id = public.get_user_company_id());

CREATE POLICY "Company owners can update their company" ON public.companies
FOR UPDATE USING (
  id = public.get_user_company_id() 
  AND public.user_has_permission('manage_company')
);

-- Políticas RLS para company_users
CREATE POLICY "Users can view company users from their company" ON public.company_users
FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Admins can manage company users" ON public.company_users
FOR ALL USING (
  company_id = public.get_user_company_id() 
  AND public.user_has_permission('manage_users')
);

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (id = auth.uid());

-- Políticas RLS para categories
CREATE POLICY "Users can view categories from their company" ON public.categories
FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Users can manage categories" ON public.categories
FOR ALL USING (
  company_id = public.get_user_company_id() 
  AND public.user_has_permission('manage_products')
);

-- Políticas RLS para suppliers
CREATE POLICY "Users can view suppliers from their company" ON public.suppliers
FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Users can manage suppliers" ON public.suppliers
FOR ALL USING (
  company_id = public.get_user_company_id() 
  AND public.user_has_permission('manage_suppliers')
);

-- Políticas RLS para products
CREATE POLICY "Users can view products from their company" ON public.products
FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Users can manage products" ON public.products
FOR ALL USING (
  company_id = public.get_user_company_id() 
  AND public.user_has_permission('manage_products')
);

-- Políticas RLS para clients
CREATE POLICY "Users can view clients from their company" ON public.clients
FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Users can manage clients" ON public.clients
FOR ALL USING (
  company_id = public.get_user_company_id() 
  AND public.user_has_permission('manage_clients')
);

-- Políticas RLS para sales
CREATE POLICY "Users can view sales from their company" ON public.sales
FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Users can create sales" ON public.sales
FOR INSERT WITH CHECK (
  company_id = public.get_user_company_id() 
  AND public.user_has_permission('create_sales')
);

CREATE POLICY "Users can update sales" ON public.sales
FOR UPDATE USING (
  company_id = public.get_user_company_id() 
  AND public.user_has_permission('manage_sales')
);

-- Políticas RLS para purchases
CREATE POLICY "Users can view purchases from their company" ON public.purchases
FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Users can manage purchases" ON public.purchases
FOR ALL USING (
  company_id = public.get_user_company_id() 
  AND public.user_has_permission('manage_purchases')
);

-- Políticas RLS para stock_movements
CREATE POLICY "Users can view stock movements from their company" ON public.stock_movements
FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Users can create stock movements" ON public.stock_movements
FOR INSERT WITH CHECK (
  company_id = public.get_user_company_id() 
  AND public.user_has_permission('manage_inventory')
);

-- Políticas RLS para email_campaigns
CREATE POLICY "Users can view email campaigns from their company" ON public.email_campaigns
FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Users can manage email campaigns" ON public.email_campaigns
FOR ALL USING (
  company_id = public.get_user_company_id() 
  AND public.user_has_permission('manage_marketing')
);

-- Políticas RLS para calls
CREATE POLICY "Users can view calls from their company" ON public.calls
FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Users can manage calls" ON public.calls
FOR ALL USING (
  company_id = public.get_user_company_id() 
  AND public.user_has_permission('manage_calls')
);

-- Trigger para atualizar updated_at nas novas tabelas
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_users_updated_at
  BEFORE UPDATE ON public.company_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Criar tabela de auditoria
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view audit logs from their company" ON public.audit_logs
FOR SELECT USING (company_id = public.get_user_company_id());

-- Criar tabela de backup e recuperação
CREATE TABLE public.backups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) NOT NULL,
  backup_type TEXT NOT NULL CHECK (backup_type IN ('manual', 'automatic', 'scheduled')),
  file_path TEXT NOT NULL,
  file_size BIGINT,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view backups from their company" ON public.backups
FOR SELECT USING (company_id = public.get_user_company_id());
