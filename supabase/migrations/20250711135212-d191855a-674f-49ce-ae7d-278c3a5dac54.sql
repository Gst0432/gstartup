-- Mettre la commission à 0% pour que les vendeurs reçoivent 100% des ventes
UPDATE global_payment_config 
SET commission_rate = 0.0
WHERE is_active = true;

-- Si aucune configuration n'existe, créer une avec 0% de commission
INSERT INTO global_payment_config (commission_rate, is_active, test_mode)
SELECT 0.0, true, false
WHERE NOT EXISTS (SELECT 1 FROM global_payment_config WHERE is_active = true);