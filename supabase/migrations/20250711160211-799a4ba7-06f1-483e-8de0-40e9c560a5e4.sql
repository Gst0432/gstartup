-- Mettre à jour la configuration avec la clé API Moneroo depuis les secrets
UPDATE global_payment_config 
SET moneroo_api_key = 'sk_test_XKBQNAdnxPgdjxRlOOSPt6tU'
WHERE is_active = true;