-- Fix vendor_balances table to have proper defaults
ALTER TABLE vendor_balances 
ALTER COLUMN available_balance SET DEFAULT 0,
ALTER COLUMN total_earned SET DEFAULT 0,
ALTER COLUMN pending_balance SET DEFAULT 0,
ALTER COLUMN total_withdrawn SET DEFAULT 0;

-- Update any existing NULL values
UPDATE vendor_balances 
SET 
  available_balance = COALESCE(available_balance, 0),
  total_earned = COALESCE(total_earned, 0),
  pending_balance = COALESCE(pending_balance, 0),
  total_withdrawn = COALESCE(total_withdrawn, 0)
WHERE available_balance IS NULL 
   OR total_earned IS NULL 
   OR pending_balance IS NULL 
   OR total_withdrawn IS NULL;

-- Drop the problematic trigger completely
DROP TRIGGER IF EXISTS trigger_update_vendor_balance_on_sale ON orders;

-- Now manually update the orders and create balances
UPDATE orders 
SET status = 'confirmed', 
    payment_status = 'paid', 
    updated_at = now() 
WHERE payment_status = 'pending' 
  AND status = 'pending'
  AND created_at > '2025-07-11 11:00:00';

-- Update moneroo transactions
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

-- Create/update vendor balances
WITH vendor_sales AS (
  SELECT 
    oi.vendor_id,
    SUM(oi.total) * 0.95 as net_amount -- 95% after 5% commission
  FROM order_items oi
  JOIN orders o ON oi.order_id = o.id
  WHERE o.status = 'confirmed' 
    AND o.payment_status = 'paid'
    AND o.updated_at > '2025-07-11 13:25:00'
  GROUP BY oi.vendor_id
)
INSERT INTO vendor_balances (vendor_id, available_balance, total_earned, pending_balance, total_withdrawn)
SELECT 
  vendor_id,
  net_amount,
  net_amount,
  0,
  0
FROM vendor_sales
ON CONFLICT (vendor_id) DO UPDATE SET
  available_balance = vendor_balances.available_balance + EXCLUDED.available_balance,
  total_earned = vendor_balances.total_earned + EXCLUDED.total_earned,
  updated_at = now();