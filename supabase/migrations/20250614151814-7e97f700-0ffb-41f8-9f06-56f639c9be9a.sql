
-- Create user profiles table for additional user data
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Update existing RLS policies to require authentication

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow all operations for now" ON public.clients;
DROP POLICY IF EXISTS "Allow all operations for now" ON public.products;
DROP POLICY IF EXISTS "Allow all operations for now" ON public.sales;
DROP POLICY IF EXISTS "Allow all operations for now" ON public.sale_items;
DROP POLICY IF EXISTS "Allow all operations for now" ON public.categories;
DROP POLICY IF EXISTS "Allow all operations for now" ON public.suppliers;
DROP POLICY IF EXISTS "Allow all operations for now" ON public.purchases;
DROP POLICY IF EXISTS "Allow all operations for now" ON public.purchase_items;
DROP POLICY IF EXISTS "Allow all operations for now" ON public.stock_movements;
DROP POLICY IF EXISTS "Allow all operations for now" ON public.email_campaigns;
DROP POLICY IF EXISTS "Allow all operations for now" ON public.email_campaign_recipients;
DROP POLICY IF EXISTS "Allow all operations for now" ON public.calls;
DROP POLICY IF EXISTS "Allow all operations for now" ON public.system_settings;
DROP POLICY IF EXISTS "Allow all operations for now" ON public.activity_logs;

-- Create secure RLS policies for all tables
-- Clients
CREATE POLICY "Authenticated users can manage clients" ON public.clients
  FOR ALL USING (auth.role() = 'authenticated');

-- Products
CREATE POLICY "Authenticated users can view products" ON public.products
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage products" ON public.products
  FOR ALL USING (auth.role() = 'authenticated');

-- Categories
CREATE POLICY "Authenticated users can manage categories" ON public.categories
  FOR ALL USING (auth.role() = 'authenticated');

-- Suppliers
CREATE POLICY "Authenticated users can manage suppliers" ON public.suppliers
  FOR ALL USING (auth.role() = 'authenticated');

-- Sales
CREATE POLICY "Authenticated users can manage sales" ON public.sales
  FOR ALL USING (auth.role() = 'authenticated');

-- Sale items
CREATE POLICY "Authenticated users can manage sale items" ON public.sale_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Purchases
CREATE POLICY "Authenticated users can manage purchases" ON public.purchases
  FOR ALL USING (auth.role() = 'authenticated');

-- Purchase items
CREATE POLICY "Authenticated users can manage purchase items" ON public.purchase_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Stock movements
CREATE POLICY "Authenticated users can manage stock movements" ON public.stock_movements
  FOR ALL USING (auth.role() = 'authenticated');

-- Email campaigns
CREATE POLICY "Authenticated users can manage email campaigns" ON public.email_campaigns
  FOR ALL USING (auth.role() = 'authenticated');

-- Email campaign recipients
CREATE POLICY "Authenticated users can manage email campaign recipients" ON public.email_campaign_recipients
  FOR ALL USING (auth.role() = 'authenticated');

-- Calls
CREATE POLICY "Authenticated users can manage calls" ON public.calls
  FOR ALL USING (auth.role() = 'authenticated');

-- System settings - only admins can modify
CREATE POLICY "Authenticated users can view system settings" ON public.system_settings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage system settings" ON public.system_settings
  FOR ALL USING (public.get_current_user_role() = 'admin');

-- Activity logs - read-only for regular users, full access for admins
CREATE POLICY "Authenticated users can view activity logs" ON public.activity_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (true);
