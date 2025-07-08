-- Corriger les politiques RLS pour permettre aux admins de gérer les produits
DROP POLICY IF EXISTS "Vendors can create their own products" ON public.products;
DROP POLICY IF EXISTS "Vendors can update their own products" ON public.products;
DROP POLICY IF EXISTS "Vendors can delete their own products" ON public.products;

-- Nouvelle politique pour permettre aux vendeurs ET aux admins de créer des produits
CREATE POLICY "Vendors and admins can create products" 
ON public.products 
FOR INSERT 
WITH CHECK (
  -- Les vendeurs peuvent créer leurs propres produits
  (EXISTS ( 
    SELECT 1
    FROM vendors
    WHERE ((vendors.id = products.vendor_id) AND (EXISTS ( 
      SELECT 1
      FROM profiles
      WHERE ((profiles.user_id = (auth.uid())::text) AND (profiles.user_id = vendors.user_id))
    )))
  )) 
  OR 
  -- Les admins peuvent créer des produits pour n'importe quel vendeur
  (EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.user_id = (auth.uid())::text 
    AND profiles.role = 'admin'
  ))
);

-- Nouvelle politique pour permettre aux vendeurs ET aux admins de modifier des produits
CREATE POLICY "Vendors and admins can update products" 
ON public.products 
FOR UPDATE 
USING (
  -- Les vendeurs peuvent modifier leurs propres produits
  (EXISTS ( 
    SELECT 1
    FROM vendors
    WHERE ((vendors.id = products.vendor_id) AND (EXISTS ( 
      SELECT 1
      FROM profiles
      WHERE ((profiles.user_id = (auth.uid())::text) AND (profiles.user_id = vendors.user_id))
    )))
  )) 
  OR 
  -- Les admins peuvent modifier tous les produits
  (EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.user_id = (auth.uid())::text 
    AND profiles.role = 'admin'
  ))
);

-- Nouvelle politique pour permettre aux vendeurs ET aux admins de supprimer des produits
CREATE POLICY "Vendors and admins can delete products" 
ON public.products 
FOR DELETE 
USING (
  -- Les vendeurs peuvent supprimer leurs propres produits
  (EXISTS ( 
    SELECT 1
    FROM vendors
    WHERE ((vendors.id = products.vendor_id) AND (EXISTS ( 
      SELECT 1
      FROM profiles
      WHERE ((profiles.user_id = (auth.uid())::text) AND (profiles.user_id = vendors.user_id))
    )))
  )) 
  OR 
  -- Les admins peuvent supprimer tous les produits
  (EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.user_id = (auth.uid())::text 
    AND profiles.role = 'admin'
  ))
);