-- Mettre à jour la configuration globale avec le secret webhook 0432
UPDATE global_payment_config 
SET moneroo_secret_key = '0432'
WHERE is_active = true;