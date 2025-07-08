-- Corriger le rôle de l'utilisateur gstartupdigital@gmail.com
UPDATE profiles 
SET role = 'vendor', updated_at = now()
WHERE email = 'gstartupdigital@gmail.com';

-- Créer le profil vendeur pour cet utilisateur
INSERT INTO vendors (
  user_id,
  business_name,
  description,
  is_active,
  is_verified
)
SELECT 
  user_id,
  display_name || ' Business',
  'Vendeur vérifié sur G-STARTUP LTD',
  true,
  true
FROM profiles 
WHERE email = 'gstartupdigital@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM vendors WHERE user_id = profiles.user_id
);