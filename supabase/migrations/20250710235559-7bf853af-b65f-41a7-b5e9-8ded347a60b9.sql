-- Créer la table des souscriptions vendeur
CREATE TABLE public.vendor_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  duration TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  transaction_number TEXT UNIQUE NOT NULL,
  moneroo_transaction_id TEXT,
  moneroo_response JSONB,
  webhook_data JSONB,
  payment_url TEXT,
  payment_confirmed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ajouter des colonnes à la table vendors pour gérer les abonnements
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS subscription_plan TEXT,
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';

-- Activer RLS sur vendor_subscriptions
ALTER TABLE public.vendor_subscriptions ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs puissent voir leurs propres souscriptions
CREATE POLICY "Users can view their own subscriptions"
ON public.vendor_subscriptions
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.user_id = auth.uid()::text
  AND profiles.user_id = vendor_subscriptions.user_id
));

-- Politique pour que les admins puissent tout voir
CREATE POLICY "Admins can view all subscriptions"
ON public.vendor_subscriptions
FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.user_id = auth.uid()::text
  AND profiles.role = 'admin'
));

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_vendor_subscriptions_updated_at
  BEFORE UPDATE ON public.vendor_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index pour les performances
CREATE INDEX idx_vendor_subscriptions_user_id ON public.vendor_subscriptions(user_id);
CREATE INDEX idx_vendor_subscriptions_status ON public.vendor_subscriptions(status);
CREATE INDEX idx_vendor_subscriptions_transaction_number ON public.vendor_subscriptions(transaction_number);