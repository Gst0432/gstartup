-- Créer la table pour les demandes de retrait des vendeurs
CREATE TABLE public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processed')),
  payment_method TEXT NOT NULL DEFAULT 'moneroo',
  moneroo_phone TEXT,
  bank_details JSONB,
  admin_notes TEXT,
  rejection_reason TEXT,
  processed_at TIMESTAMPTZ,
  processed_by TEXT,
  moneroo_transaction_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table pour suivre les soldes des vendeurs
CREATE TABLE public.vendor_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL UNIQUE REFERENCES vendors(id) ON DELETE CASCADE,
  available_balance NUMERIC NOT NULL DEFAULT 0,
  pending_balance NUMERIC NOT NULL DEFAULT 0,
  total_earned NUMERIC NOT NULL DEFAULT 0,
  total_withdrawn NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table pour l'historique des transactions des vendeurs
CREATE TABLE public.vendor_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('sale', 'withdrawal', 'commission')),
  amount NUMERIC NOT NULL,
  description TEXT,
  order_id UUID REFERENCES orders(id),
  withdrawal_request_id UUID REFERENCES withdrawal_requests(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Configuration globale Moneroo pour l'admin
CREATE TABLE public.global_payment_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moneroo_api_key TEXT,
  moneroo_secret_key TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  test_mode BOOLEAN NOT NULL DEFAULT true,
  commission_rate NUMERIC NOT NULL DEFAULT 0.05, -- 5% par défaut
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour les performances
CREATE INDEX idx_withdrawal_requests_vendor_id ON withdrawal_requests(vendor_id);
CREATE INDEX idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX idx_vendor_transactions_vendor_id ON vendor_transactions(vendor_id);
CREATE INDEX idx_vendor_transactions_type ON vendor_transactions(type);

-- Triggers pour updated_at
CREATE TRIGGER update_withdrawal_requests_updated_at
  BEFORE UPDATE ON withdrawal_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_balances_updated_at
  BEFORE UPDATE ON vendor_balances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_global_payment_config_updated_at
  BEFORE UPDATE ON global_payment_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_payment_config ENABLE ROW LEVEL SECURITY;

-- Withdrawal requests policies
CREATE POLICY "Vendors can view their own withdrawal requests"
ON withdrawal_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM vendors v
    JOIN profiles p ON v.user_id = p.user_id
    WHERE v.id = vendor_id AND p.user_id = auth.uid()::text
  )
);

CREATE POLICY "Vendors can create withdrawal requests"
ON withdrawal_requests FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM vendors v
    JOIN profiles p ON v.user_id = p.user_id
    WHERE v.id = vendor_id AND p.user_id = auth.uid()::text
  )
);

CREATE POLICY "Admins can manage all withdrawal requests"
ON withdrawal_requests FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()::text AND role = 'admin'
  )
);

-- Vendor balances policies
CREATE POLICY "Vendors can view their own balance"
ON vendor_balances FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM vendors v
    JOIN profiles p ON v.user_id = p.user_id
    WHERE v.id = vendor_id AND p.user_id = auth.uid()::text
  )
);

CREATE POLICY "Admins can view all balances"
ON vendor_balances FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()::text AND role = 'admin'
  )
);

-- Vendor transactions policies
CREATE POLICY "Vendors can view their own transactions"
ON vendor_transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM vendors v
    JOIN profiles p ON v.user_id = p.user_id
    WHERE v.id = vendor_id AND p.user_id = auth.uid()::text
  )
);

CREATE POLICY "Admins can view all transactions"
ON vendor_transactions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()::text AND role = 'admin'
  )
);

-- Global payment config policies
CREATE POLICY "Only admins can manage global payment config"
ON global_payment_config FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid()::text AND role = 'admin'
  )
);

-- Fonction pour mettre à jour le solde vendeur après une vente
CREATE OR REPLACE FUNCTION update_vendor_balance_on_sale()
RETURNS TRIGGER AS $$
DECLARE
  commission_rate NUMERIC;
  vendor_amount NUMERIC;
  commission_amount NUMERIC;
BEGIN
  -- Récupérer le taux de commission
  SELECT COALESCE(global_payment_config.commission_rate, 0.05) INTO commission_rate
  FROM global_payment_config
  WHERE is_active = true
  LIMIT 1;
  
  -- Calculer les montants
  commission_amount := NEW.total_amount * commission_rate;
  vendor_amount := NEW.total_amount - commission_amount;
  
  -- Mettre à jour ou créer le solde vendeur pour chaque item
  INSERT INTO vendor_balances (vendor_id, available_balance, total_earned)
  SELECT 
    oi.vendor_id,
    vendor_amount,
    vendor_amount
  FROM order_items oi
  WHERE oi.order_id = NEW.id
  ON CONFLICT (vendor_id) DO UPDATE SET
    available_balance = vendor_balances.available_balance + vendor_amount,
    total_earned = vendor_balances.total_earned + vendor_amount,
    updated_at = now();
  
  -- Créer les transactions vendeur
  INSERT INTO vendor_transactions (vendor_id, type, amount, description, order_id)
  SELECT 
    oi.vendor_id,
    'sale',
    vendor_amount,
    'Vente - Commande #' || NEW.order_number,
    NEW.id
  FROM order_items oi
  WHERE oi.order_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le solde après confirmation de paiement
CREATE TRIGGER trigger_update_vendor_balance_on_payment
  AFTER UPDATE OF payment_status ON orders
  FOR EACH ROW
  WHEN (NEW.payment_status = 'paid' AND OLD.payment_status != 'paid')
  EXECUTE FUNCTION update_vendor_balance_on_sale();

-- Insérer une configuration globale par défaut
INSERT INTO global_payment_config (is_active, test_mode, commission_rate)
VALUES (false, true, 0.05);