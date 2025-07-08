-- Ajouter les colonnes pour les URLs de prévisualisation
ALTER TABLE public.products 
ADD COLUMN preview_url TEXT,
ADD COLUMN demo_url TEXT;

-- Ajouter des commentaires pour clarifier l'usage
COMMENT ON COLUMN public.products.preview_url IS 'URL de prévisualisation du produit (images, captures d''écran)';
COMMENT ON COLUMN public.products.demo_url IS 'URL de démonstration live du produit';