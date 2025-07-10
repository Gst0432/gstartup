-- Corriger les contraintes de clés étrangères pour permettre la suppression en cascade
-- et ajouter une politique RLS pour permettre aux admins de voir tous les produits

-- Politique pour permettre aux admins de voir tous les produits (y compris inactifs)
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;

CREATE POLICY "Anyone can view active products or admins can view all" 
ON public.products 
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

-- Politique pour permettre aux admins de gérer toutes les commandes liées aux produits
CREATE POLICY "Admins can view all order items" 
ON public.order_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = (auth.uid())::text 
    AND profiles.role = 'admin'
  )
  OR
  EXISTS (
    SELECT 1
    FROM (orders o JOIN profiles p ON (o.user_id = p.user_id))
    WHERE (o.id = order_items.order_id) AND (p.user_id = (auth.uid())::text)
  )
);