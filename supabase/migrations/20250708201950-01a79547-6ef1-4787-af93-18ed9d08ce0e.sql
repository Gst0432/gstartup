-- Ajouter un champ subdomain à la table vendors
ALTER TABLE public.vendors 
ADD COLUMN subdomain text UNIQUE;

-- Ajouter un index pour optimiser les recherches par sous-domaine
CREATE INDEX idx_vendors_subdomain ON public.vendors(subdomain);

-- Ajouter une contrainte pour valider le format du sous-domaine
ALTER TABLE public.vendors 
ADD CONSTRAINT subdomain_format_check 
CHECK (subdomain ~ '^[a-z0-9-]+$' AND length(subdomain) >= 3 AND length(subdomain) <= 50);

-- Ajouter un commentaire explicatif
COMMENT ON COLUMN public.vendors.subdomain IS 'Sous-domaine personnalisé pour la boutique du vendeur (ex: boutique-jean pour jean.g-startup.com)';