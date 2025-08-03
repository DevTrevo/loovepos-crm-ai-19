-- Atualizar as políticas RLS da tabela system_settings para permitir operações de UPDATE
DROP POLICY IF EXISTS "Admins and owners can manage system settings" ON public.system_settings;

-- Criar nova política que permite INSERT, UPDATE e DELETE para admins e owners
CREATE POLICY "Admins and owners can manage system settings" 
ON public.system_settings 
FOR ALL 
TO authenticated
USING (
  (get_current_user_role() = ANY (ARRAY['admin'::text, 'owner'::text])) 
  OR 
  (EXISTS ( 
    SELECT 1
    FROM company_users cu
    WHERE cu.user_id = auth.uid() 
      AND cu.role = ANY (ARRAY['admin'::text, 'owner'::text]) 
      AND cu.status = 'active'::text
  ))
)
WITH CHECK (
  (get_current_user_role() = ANY (ARRAY['admin'::text, 'owner'::text])) 
  OR 
  (EXISTS ( 
    SELECT 1
    FROM company_users cu
    WHERE cu.user_id = auth.uid() 
      AND cu.role = ANY (ARRAY['admin'::text, 'owner'::text]) 
      AND cu.status = 'active'::text
  ))
);