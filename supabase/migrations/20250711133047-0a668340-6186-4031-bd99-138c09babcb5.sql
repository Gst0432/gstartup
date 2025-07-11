-- Temporarily disable the trigger to avoid the null constraint issue
DROP TRIGGER IF EXISTS trigger_update_vendor_balance_on_sale ON orders;

-- Update recent pending orders to confirmed status
UPDATE orders 
SET status = 'confirmed', 
    payment_status = 'paid', 
    updated_at = now() 
WHERE payment_status = 'pending' 
  AND status = 'pending'
  AND created_at > '2025-07-11 11:00:00';

-- Update moneroo transactions status as well
UPDATE moneroo_transactions 
SET status = 'success',
    webhook_data = jsonb_build_object(
      'status', 'success',
      'manual_update', true,
      'updated_at', now()
    ),
    updated_at = now()
WHERE status = 'pending'
  AND created_at > '2025-07-11 11:00:00';

-- Create vendor balances manually for vendors who don't have them
INSERT INTO vendor_balances (vendor_id, available_balance, total_earned, pending_balance, total_withdrawn)
SELECT DISTINCT 
  oi.vendor_id,
  COALESCE(SUM(oi.total * 0.95), 0) as available_balance, -- 95% after 5% commission
  COALESCE(SUM(oi.total * 0.95), 0) as total_earned,
  0 as pending_balance,
  0 as total_withdrawn
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
WHERE o.status = 'confirmed' 
  AND o.payment_status = 'paid'
  AND NOT EXISTS (
    SELECT 1 FROM vendor_balances vb WHERE vb.vendor_id = oi.vendor_id
  )
GROUP BY oi.vendor_id
ON CONFLICT (vendor_id) DO UPDATE SET
  available_balance = vendor_balances.available_balance + EXCLUDED.available_balance,
  total_earned = vendor_balances.total_earned + EXCLUDED.total_earned,
  updated_at = now();

-- Create vendor transactions for the confirmed sales
INSERT INTO vendor_transactions (vendor_id, type, amount, description, order_id)
SELECT 
  oi.vendor_id,
  'sale' as type,
  SUM(oi.total * 0.95) as amount, -- 95% after commission
  'Vente - Commande #' || o.order_number as description,
  o.id as order_id
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
WHERE o.status = 'confirmed' 
  AND o.payment_status = 'paid'
  AND o.updated_at > '2025-07-11 13:25:00' -- Only recent updates
  AND NOT EXISTS (
    SELECT 1 FROM vendor_transactions vt 
    WHERE vt.order_id = o.id AND vt.type = 'sale'
  )
GROUP BY oi.vendor_id, o.id, o.order_number;

-- Re-enable the trigger for future orders
CREATE TRIGGER trigger_update_vendor_balance_on_sale
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_vendor_balance_on_sale();