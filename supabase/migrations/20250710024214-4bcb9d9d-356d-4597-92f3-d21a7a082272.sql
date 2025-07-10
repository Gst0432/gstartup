-- Ajouter les politiques RLS manquantes pour permettre aux admins de gérer les vendeurs

-- Politique pour permettre aux admins de voir tous les vendeurs (y compris inactifs)
DROP POLICY IF EXISTS "Anyone can view active vendors" ON public.vendors;

CREATE POLICY "Anyone can view active vendors or admins can view all" 
ON public.vendors 
FOR SELECT 
USING (
  is_active = true 
  OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = (auth.uid())::text 
    AND profiles.role = 'admin'
  )
);

-- Politique pour permettre aux admins de modifier tous les vendeurs
CREATE POLICY "Admins can update all vendors" 
ON public.vendors 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = (auth.uid())::text 
    AND profiles.role = 'admin'
  )
  OR
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = (auth.uid())::text 
    AND profiles.user_id = vendors.user_id
  )
);

-- Politique pour permettre aux admins de supprimer des vendeurs
CREATE POLICY "Admins can delete vendors" 
ON public.vendors 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = (auth.uid())::text 
    AND profiles.role = 'admin'
  )
);

-- Corriger les contraintes de clés étrangères pour les vendeurs
-- Permettre la suppression en cascade ou SET NULL pour les produits quand un vendeur est supprimé
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_vendor_id_fkey;
ALTER TABLE products 
ADD CONSTRAINT products_vendor_id_fkey 
FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE;