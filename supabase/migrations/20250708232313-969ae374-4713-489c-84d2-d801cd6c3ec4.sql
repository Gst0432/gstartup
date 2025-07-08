-- Ajouter les colonnes pour les URLs de redirection et webhooks dans la table vendors
ALTER TABLE public.vendors 
ADD COLUMN success_url text,
ADD COLUMN cancel_url text,
ADD COLUMN webhook_url text,
ADD COLUMN notification_email text;

-- Ajouter des commentaires pour documenter les nouvelles colonnes
COMMENT ON COLUMN public.vendors.success_url IS 'URL de redirection après paiement réussi';
COMMENT ON COLUMN public.vendors.cancel_url IS 'URL de redirection après annulation de paiement';
COMMENT ON COLUMN public.vendors.webhook_url IS 'URL de webhook pour recevoir les notifications de paiement';
COMMENT ON COLUMN public.vendors.notification_email IS 'Email pour recevoir les notifications de paiement';