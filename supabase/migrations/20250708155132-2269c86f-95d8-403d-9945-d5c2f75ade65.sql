-- Insérer les passerelles de paiement par défaut (bypass RLS temporairement)
SET session_replication_role = replica;

-- Vider la table d'abord pour éviter les doublons
DELETE FROM public.payment_gateways;

-- Insérer les passerelles par défaut
INSERT INTO public.payment_gateways (name, type, is_active, test_mode, supported_currencies, config) VALUES 
('Moneroo', 'moneroo', false, true, ARRAY['XAF', 'CFA'], '{}'::jsonb),
('Stripe', 'stripe', false, true, ARRAY['USD', 'EUR', 'XAF'], '{}'::jsonb),
('Orange Money', 'orange_money', false, true, ARRAY['XAF'], '{}'::jsonb),
('MTN Mobile Money', 'mtn_money', false, true, ARRAY['XAF'], '{}'::jsonb);

-- Remettre les politiques RLS normales
SET session_replication_role = DEFAULT;