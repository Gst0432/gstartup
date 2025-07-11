-- Mettre à jour la politique des produits pour inclure le statut actif du vendeur
DROP POLICY IF EXISTS "Anyone can view active products or admins can view all" ON public.products;

CREATE POLICY "Anyone can view active products from active vendors or admins can view all" 
ON public.products 
FOR SELECT 
USING (
  (is_active = true AND EXISTS (
    SELECT 1 FROM vendors v 
    WHERE v.id = products.vendor_id 
    AND v.is_active = true
  )) 
  OR 
  (EXISTS ( 
    SELECT 1 FROM profiles
    WHERE profiles.user_id = (auth.uid())::text 
    AND profiles.role = 'admin'
  ))
);

-- Mettre à jour la politique d'insertion des produits pour vérifier que le vendeur est actif
DROP POLICY IF EXISTS "Vendors and admins can create unlimited products" ON public.products;

CREATE POLICY "Active vendors and admins can create products" 
ON public.products 
FOR INSERT 
WITH CHECK (
  (EXISTS ( 
    SELECT 1 FROM profiles
    WHERE profiles.user_id = (auth.uid())::text 
    AND profiles.role = 'admin'
  )) 
  OR 
  (EXISTS ( 
    SELECT 1 FROM vendors v
    JOIN profiles p ON p.user_id = v.user_id
    WHERE v.id = products.vendor_id 
    AND p.user_id = (auth.uid())::text 
    AND v.is_active = true
    AND v.is_verified = true
  ))
);