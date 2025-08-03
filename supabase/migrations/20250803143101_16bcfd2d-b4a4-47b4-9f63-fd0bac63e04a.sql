-- Inserir configurações padrão da loja na tabela system_settings
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description, category) VALUES
('store_name', '', 'text', 'Nome da loja/empresa', 'store'),
('store_phone', '', 'text', 'Telefone da loja', 'store'),
('store_email', '', 'text', 'Email de contato da loja', 'store'),
('store_cnpj', '', 'text', 'CNPJ da empresa', 'store'),
('store_address', '', 'text', 'Endereço completo da loja', 'store')
ON CONFLICT (setting_key) DO NOTHING;