
-- Primeiro, vamos verificar se o usuário atual existe na tabela company_users
-- e configurá-lo como admin/owner

-- Atualizar o perfil do usuário atual para admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = auth.uid();

-- Inserir ou atualizar o usuário na tabela company_users como owner
INSERT INTO public.company_users (user_id, company_id, role, status)
SELECT 
  auth.uid(),
  c.id,
  'owner',
  'active'
FROM public.companies c
LIMIT 1
ON CONFLICT (user_id, company_id) 
DO UPDATE SET 
  role = 'owner',
  status = 'active';

-- Se não existir nenhuma empresa, criar uma empresa padrão
INSERT INTO public.companies (name, status)
SELECT 'Minha Empresa', 'active'
WHERE NOT EXISTS (SELECT 1 FROM public.companies);

-- Garantir que o usuário tenha uma empresa vinculada no perfil
UPDATE public.profiles 
SET company_id = (SELECT id FROM public.companies LIMIT 1)
WHERE id = auth.uid() AND company_id IS NULL;

-- Atualizar as políticas de system_settings para permitir que owners também gerenciem
DROP POLICY IF EXISTS "Admins can manage system settings" ON public.system_settings;

CREATE POLICY "Admins and owners can manage system settings" 
ON public.system_settings 
FOR ALL 
TO authenticated
USING (
  get_current_user_role() IN ('admin', 'owner') OR
  EXISTS (
    SELECT 1 FROM public.company_users cu 
    WHERE cu.user_id = auth.uid() 
    AND cu.role IN ('admin', 'owner') 
    AND cu.status = 'active'
  )
);
