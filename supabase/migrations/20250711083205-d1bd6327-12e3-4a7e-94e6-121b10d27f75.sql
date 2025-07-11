-- Corriger la politique RLS pour les vendeurs
DROP POLICY IF EXISTS "Vendors can view their sales" ON public.order_items;

-- Recréer la politique sans la condition de rôle qui pose problème
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
  )
);