-- Supprimer la contrainte d'unicité sur le SKU pour permettre aux vendeurs 
-- d'utiliser les mêmes SKUs ou de laisser ce champ vide

-- Supprimer la contrainte unique sur le SKU
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_sku_key;

-- Créer un index partiel pour les SKUs non vides par vendeur
-- Cela permet l'unicité du SKU par vendeur tout en permettant des SKUs vides
CREATE UNIQUE INDEX products_vendor_sku_unique 
ON public.products (vendor_id, sku) 
WHERE sku IS NOT NULL AND sku != '';

-- Créer un index normal sur les SKUs pour les recherches
CREATE INDEX idx_products_sku ON public.products (sku);