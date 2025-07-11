-- Supprimer les anciennes politiques qui ne sont pas optimales
DROP POLICY IF EXISTS "Users can view order items for their orders" ON public.order_items;

-- Créer de nouvelles politiques plus spécifiques
-- 1. Les clients peuvent voir les articles de leurs propres commandes
CREATE POLICY "Customers can view their order items"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders o
    JOIN profiles p ON p.user_id = o.user_id
    WHERE o.id = order_items.order_id
    AND p.user_id = auth.uid()::text
  )
);

-- 2. Les vendeurs peuvent voir uniquement les articles de commande de leurs produits
CREATE POLICY "Vendors can view their sales"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM vendors v
    JOIN profiles p ON p.user_id = v.user_id
    WHERE v.id = order_items.vendor_id
    AND p.user_id = auth.uid()::text
    AND p.role = 'vendor'
  )
);

-- 3. Les admins peuvent voir tous les articles de commande (cette politique existe déjà, on la garde)
-- La politique "Admins can view all order items" existe déjà et couvre ce cas