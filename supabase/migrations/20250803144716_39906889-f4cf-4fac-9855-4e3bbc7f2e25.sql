-- Fix audit_logs RLS policy to allow INSERT from triggers
-- The audit trigger needs to be able to insert logs when products are created/updated

-- Create policy to allow INSERT into audit_logs from triggers/system
CREATE POLICY "System can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);

-- Also ensure the audit trigger is properly attached to products table
DROP TRIGGER IF EXISTS audit_products_trigger ON public.products;
CREATE TRIGGER audit_products_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();