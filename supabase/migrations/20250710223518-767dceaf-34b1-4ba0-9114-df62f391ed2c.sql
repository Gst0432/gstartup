-- Créer la table pour les codes de réinitialisation de mot de passe
CREATE TABLE public.password_reset_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Créer un index sur l'email pour les requêtes rapides
CREATE INDEX idx_password_reset_codes_email ON public.password_reset_codes(email);

-- Créer un index sur expires_at pour le nettoyage automatique
CREATE INDEX idx_password_reset_codes_expires_at ON public.password_reset_codes(expires_at);

-- Activer RLS
ALTER TABLE public.password_reset_codes ENABLE ROW LEVEL SECURITY;

-- Politique pour les edge functions (service role)
CREATE POLICY "Service role can manage password reset codes"
ON public.password_reset_codes
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Fonction pour nettoyer automatiquement les codes expirés
CREATE OR REPLACE FUNCTION public.cleanup_expired_reset_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.password_reset_codes
  WHERE expires_at < now() OR used = true;
END;
$$;