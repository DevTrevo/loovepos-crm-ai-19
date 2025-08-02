-- Vincular o usuário à empresa existente como owner
INSERT INTO company_users (company_id, user_id, role, status, joined_at)
VALUES (
  'e4c8c0ed-9e54-45a2-ba14-09d6663b33df',
  '0233a282-46ef-40af-aead-ecbbb56cb2f4', 
  'owner',
  'active',
  now()
);

-- Atualizar o profile do usuário com o company_id e role
UPDATE profiles 
SET company_id = 'e4c8c0ed-9e54-45a2-ba14-09d6663b33df',
    role = 'admin'
WHERE id = '0233a282-46ef-40af-aead-ecbbb56cb2f4';