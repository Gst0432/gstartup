-- Migration pour le système de paiement Moneroo et suivi des commandes

-- Table pour stocker les transactions Moneroo
CREATE TABLE public.moneroo_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  transaction_id TEXT UNIQUE NOT NULL,
  reference_code TEXT UNIQUE NOT NULL, -- Code canyon pour retrouver la commande
  status TEXT NOT NULL DEFAULT 'pending', -- pending, success, failed, cancelled
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'XAF',
  payment_method TEXT,
  moneroo_response JSONB,
  webhook_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour les recherches rapides
CREATE INDEX idx_moneroo_transactions_order_id ON moneroo_transactions(order_id);
CREATE INDEX idx_moneroo_transactions_reference_code ON moneroo_transactions(reference_code);
CREATE INDEX idx_moneroo_transactions_transaction_id ON moneroo_transactions(transaction_id);
CREATE INDEX idx_moneroo_transactions_status ON moneroo_transactions(status);

-- Ajouter un code de référence unique aux commandes pour le suivi
ALTER TABLE orders ADD COLUMN IF NOT EXISTS reference_code TEXT UNIQUE;

-- Fonction pour générer un code de référence unique
CREATE OR REPLACE FUNCTION generate_order_reference_code()
RETURNS TEXT AS $$
DECLARE
  ref_code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Générer un code de 8 caractères alphanumériques
    ref_code := 'ORD' || UPPER(
      SUBSTRING(
        ENCODE(GEN_RANDOM_BYTES(6), 'base64'), 
        1, 
        6
      )
    );
    
    -- Vérifier si le code existe déjà
    SELECT EXISTS(SELECT 1 FROM orders WHERE reference_code = ref_code) INTO exists_check;
    
    -- Si le code n'existe pas, on l'utilise
    IF NOT exists_check THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN ref_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement un code de référence pour les nouvelles commandes
CREATE OR REPLACE FUNCTION set_order_reference_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference_code IS NULL THEN
    NEW.reference_code := generate_order_reference_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_set_order_reference_code ON orders;
CREATE TRIGGER trigger_set_order_reference_code
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION set_order_reference_code();

-- Mettre à jour les commandes existantes avec des codes de référence
UPDATE orders 
SET reference_code = generate_order_reference_code() 
WHERE reference_code IS NULL;

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_moneroo_transactions_updated_at
  BEFORE UPDATE ON moneroo_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS pour moneroo_transactions
ALTER TABLE moneroo_transactions ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leurs propres transactions
CREATE POLICY "Users can view their own moneroo transactions"
ON moneroo_transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders o
    JOIN profiles p ON o.user_id = p.user_id
    WHERE o.id = moneroo_transactions.order_id 
    AND p.user_id = auth.uid()::text
  )
);

-- Les edge functions peuvent gérer toutes les transactions (pour les webhooks)
CREATE POLICY "Service role can manage all moneroo transactions"
ON moneroo_transactions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);