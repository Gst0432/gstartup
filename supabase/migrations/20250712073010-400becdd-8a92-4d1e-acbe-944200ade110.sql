-- Corriger le rôle double pour contact@gstartup.pro
-- Garder seulement le rôle admin et supprimer le profil vendeur s'il existe

-- Mettre à jour le rôle pour être uniquement admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'contact@gstartup.pro';

-- Supprimer le profil vendeur s'il existe pour cet utilisateur
DELETE FROM vendors 
WHERE user_id IN (
  SELECT user_id 
  FROM profiles 
  WHERE email = 'contact@gstartup.pro'
);