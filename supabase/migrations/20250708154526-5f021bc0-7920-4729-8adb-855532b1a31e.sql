-- Ajouter les colonnes pour les clés API des vendeurs
ALTER TABLE public.vendors 
ADD COLUMN api_key TEXT,
ADD COLUMN api_secret TEXT,
ADD COLUMN webhook_secret TEXT,
ADD COLUMN payment_config JSONB DEFAULT '{}'::jsonb,
ADD COLUMN api_settings JSONB DEFAULT '{}'::jsonb;

-- Ajouter des commentaires pour clarifier l'usage
COMMENT ON COLUMN public.vendors.api_key IS 'Clé API du vendeur pour les intégrations';
COMMENT ON COLUMN public.vendors.api_secret IS 'Clé secrète API du vendeur';
COMMENT ON COLUMN public.vendors.webhook_secret IS 'Clé secrète webhook du vendeur';
COMMENT ON COLUMN public.vendors.payment_config IS 'Configuration des paiements du vendeur';
COMMENT ON COLUMN public.vendors.api_settings IS 'Paramètres API personnalisés du vendeur';