-- Corriger les contraintes de clés étrangères pour permettre la suppression et la création

-- Supprimer les contraintes existantes et les recréer avec CASCADE ou SET NULL
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_variant_id_fkey;
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_product_id_fkey;
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_items_variant_id_fkey;
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_product_id_fkey;
ALTER TABLE wishlists DROP CONSTRAINT IF EXISTS wishlists_product_id_fkey;
ALTER TABLE product_variants DROP CONSTRAINT IF EXISTS product_variants_product_id_fkey;

-- Recréer les contraintes avec CASCADE pour permettre la suppression
ALTER TABLE order_items 
ADD CONSTRAINT order_items_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE order_items 
ADD CONSTRAINT order_items_variant_id_fkey 
FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL;

ALTER TABLE cart_items 
ADD CONSTRAINT cart_items_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE cart_items 
ADD CONSTRAINT cart_items_variant_id_fkey 
FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL;

ALTER TABLE reviews 
ADD CONSTRAINT reviews_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE wishlists 
ADD CONSTRAINT wishlists_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE product_variants 
ADD CONSTRAINT product_variants_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Améliorer les politiques RLS pour la création de produits
DROP POLICY IF EXISTS "Vendors and admins can create products" ON public.products;

CREATE POLICY "Vendors and admins can create products" 
ON public.products 
FOR INSERT 
WITH CHECK (
  -- Admin peut créer pour n'importe quel vendeur
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = (auth.uid())::text 
    AND profiles.role = 'admin'
  )
  OR
  -- Vendeur peut créer pour son propre compte
  EXISTS (
    SELECT 1 FROM vendors 
    WHERE vendors.id = products.vendor_id 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = (auth.uid())::text 
      AND profiles.user_id = vendors.user_id
    )
  )
);

-- Améliorer la politique pour la mise à jour
DROP POLICY IF EXISTS "Vendors and admins can update products" ON public.products;

CREATE POLICY "Vendors and admins can update products" 
ON public.products 
FOR UPDATE 
USING (
  -- Admin peut modifier tous les produits
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = (auth.uid())::text 
    AND profiles.role = 'admin'
  )
  OR
  -- Vendeur peut modifier ses propres produits
  EXISTS (
    SELECT 1 FROM vendors 
    WHERE vendors.id = products.vendor_id 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = (auth.uid())::text 
      AND profiles.user_id = vendors.user_id
    )
  )
);

-- Améliorer la politique pour la suppression
DROP POLICY IF EXISTS "Vendors and admins can delete products" ON public.products;

CREATE POLICY "Vendors and admins can delete products" 
ON public.products 
FOR DELETE 
USING (
  -- Admin peut supprimer tous les produits
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = (auth.uid())::text 
    AND profiles.role = 'admin'
  )
  OR
  -- Vendeur peut supprimer ses propres produits
  EXISTS (
    SELECT 1 FROM vendors 
    WHERE vendors.id = products.vendor_id 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = (auth.uid())::text 
      AND profiles.user_id = vendors.user_id
    )
  )
);