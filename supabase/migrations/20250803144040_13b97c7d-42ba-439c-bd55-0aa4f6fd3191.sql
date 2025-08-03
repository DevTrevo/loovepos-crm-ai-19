-- Corrigir estrutura da tabela products
-- Tornar company_id obrigatório e ajustar constraints

-- Primeiro, garantir que todos os produtos existentes tenham company_id
UPDATE public.products 
SET company_id = (
  SELECT id FROM public.companies LIMIT 1
) 
WHERE company_id IS NULL;

-- Tornar company_id NOT NULL
ALTER TABLE public.products 
ALTER COLUMN company_id SET NOT NULL;

-- Remover constraints de UNIQUE em barcode e sku se existirem (podem causar conflitos)
ALTER TABLE public.products 
DROP CONSTRAINT IF EXISTS products_barcode_key;

ALTER TABLE public.products 
DROP CONSTRAINT IF EXISTS products_sku_key;

-- Recriar constraints de UNIQUE mas apenas dentro do escopo da empresa
CREATE UNIQUE INDEX IF NOT EXISTS products_barcode_company_unique 
ON public.products (company_id, barcode) 
WHERE barcode IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS products_sku_company_unique 
ON public.products (company_id, sku) 
WHERE sku IS NOT NULL;

-- Garantir que o trigger de validação existe
CREATE OR REPLACE FUNCTION public.validate_product_data()
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql;

-- Recriar o trigger
DROP TRIGGER IF EXISTS validate_product_data_trigger ON public.products;
CREATE TRIGGER validate_product_data_trigger
  BEFORE INSERT OR UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION validate_product_data();

-- Atualizar o trigger de updated_at se não existir
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();