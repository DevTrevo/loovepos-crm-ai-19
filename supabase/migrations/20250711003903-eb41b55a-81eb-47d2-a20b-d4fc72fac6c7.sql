
-- Create price_history table to track product price changes
CREATE TABLE public.price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  old_price NUMERIC NOT NULL,
  new_price NUMERIC NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for price_history
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view price history from their company"
  ON public.price_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p 
      WHERE p.id = price_history.product_id 
      AND p.company_id = get_user_company_id()
    )
  );

CREATE POLICY "Users can insert price history for their company products"
  ON public.price_history
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products p 
      WHERE p.id = price_history.product_id 
      AND p.company_id = get_user_company_id()
    )
  );

-- Create trigger to automatically log price changes
CREATE OR REPLACE FUNCTION public.log_price_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if price actually changed
  IF OLD.price IS DISTINCT FROM NEW.price THEN
    INSERT INTO public.price_history (product_id, old_price, new_price, changed_by, reason)
    VALUES (NEW.id, OLD.price, NEW.price, auth.uid(), 'Price updated');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_price_change
  AFTER UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION log_price_change();

-- Create get_sales_report function
CREATE OR REPLACE FUNCTION public.get_sales_report(
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL
)
RETURNS TABLE(
  total_sales NUMERIC,
  total_orders BIGINT,
  avg_order_value NUMERIC,
  top_products JSONB
) AS $$
DECLARE
  company_id_var UUID;
BEGIN
  -- Get the user's company ID
  company_id_var := get_user_company_id();
  
  -- Return sales report data
  RETURN QUERY
  SELECT 
    COALESCE(SUM(s.total_amount), 0) as total_sales,
    COUNT(s.id) as total_orders,
    CASE 
      WHEN COUNT(s.id) > 0 THEN COALESCE(SUM(s.total_amount), 0) / COUNT(s.id)
      ELSE 0
    END as avg_order_value,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'product_name', p.name,
            'quantity_sold', SUM(si.quantity)
          )
          ORDER BY SUM(si.quantity) DESC
        )
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        JOIN sales s2 ON si.sale_id = s2.id
        WHERE s2.company_id = company_id_var
          AND (start_date IS NULL OR s2.created_at::DATE >= start_date)
          AND (end_date IS NULL OR s2.created_at::DATE <= end_date)
        GROUP BY p.id, p.name
        LIMIT 10
      ),
      '[]'::jsonb
    ) as top_products
  FROM sales s
  WHERE s.company_id = company_id_var
    AND (start_date IS NULL OR s.created_at::DATE >= start_date)
    AND (end_date IS NULL OR s.created_at::DATE <= end_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
