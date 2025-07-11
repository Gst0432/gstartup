-- Test de mise à jour manuelle d'une transaction pour forcer l'automatisation
-- Cette commande force une transaction à être traitée par l'automatisation

-- D'abord, vérifier la commande existante
SELECT 
  o.id, 
  o.order_number, 
  o.status, 
  o.payment_status, 
  o.fulfillment_status,
  mt.transaction_id,
  mt.status as transaction_status
FROM orders o 
JOIN moneroo_transactions mt ON o.id = mt.order_id 
WHERE mt.transaction_id = 'py_s75r1z9holhf';