-- Corriger la configuration des passerelles selon la vraie documentation
-- Supprimer les anciennes colonnes incorrectes
ALTER TABLE public.vendors 
DROP COLUMN IF EXISTS api_key,
DROP COLUMN IF EXISTS api_secret,
DROP COLUMN IF EXISTS webhook_secret;

-- Ajouter les nouvelles colonnes correctes
ALTER TABLE public.vendors 
ADD COLUMN moneroo_api_key text,
ADD COLUMN moneroo_secret_key text,
ADD COLUMN moneyfusion_api_url text,
ADD COLUMN moneroo_enabled boolean DEFAULT false,
ADD COLUMN moneyfusion_enabled boolean DEFAULT false;

-- Ajouter des commentaires pour documenter
COMMENT ON COLUMN public.vendors.moneroo_api_key IS 'Clé API Moneroo';
COMMENT ON COLUMN public.vendors.moneroo_secret_key IS 'Clé secrète Moneroo';
COMMENT ON COLUMN public.vendors.moneyfusion_api_url IS 'URL API MoneyFusion';
COMMENT ON COLUMN public.vendors.moneroo_enabled IS 'Passerelle Moneroo activée';
COMMENT ON COLUMN public.vendors.moneyfusion_enabled IS 'Passerelle MoneyFusion activée';