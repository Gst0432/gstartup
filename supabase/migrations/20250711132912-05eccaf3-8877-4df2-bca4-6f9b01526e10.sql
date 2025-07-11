-- Fix the vendor balance trigger to handle null values correctly
CREATE OR REPLACE FUNCTION public.update_vendor_balance_on_sale()
RETURNS TRIGGER AS $$
DECLARE
  commission_rate NUMERIC;
  vendor_amount NUMERIC;
  commission_amount NUMERIC;
  vendor_record RECORD;
BEGIN
  -- Skip if order is not confirmed and paid
  IF NEW.status != 'confirmed' OR NEW.payment_status != 'paid' THEN
    RETURN NEW;
  END IF;
  
  -- Skip if already processed (prevent duplicate processing)
  IF OLD.status = 'confirmed' AND OLD.payment_status = 'paid' THEN
    RETURN NEW;
  END IF;

  -- Get commission rate
  SELECT COALESCE(global_payment_config.commission_rate, 0.05) INTO commission_rate
  FROM global_payment_config
  WHERE is_active = true
  LIMIT 1;
  
  -- Process each vendor in the order
  FOR vendor_record IN 
    SELECT 
      oi.vendor_id,
      SUM(oi.total) as vendor_total
    FROM order_items oi
    WHERE oi.order_id = NEW.id
    GROUP BY oi.vendor_id
  LOOP
    -- Calculate amounts for this vendor
    commission_amount := vendor_record.vendor_total * commission_rate;
    vendor_amount := vendor_record.vendor_total - commission_amount;
    
    -- Update or create vendor balance
    INSERT INTO vendor_balances (vendor_id, available_balance, total_earned, pending_balance, total_withdrawn)
    VALUES (
      vendor_record.vendor_id,
      vendor_amount,
      vendor_amount,
      0,
      0
    )
    ON CONFLICT (vendor_id) DO UPDATE SET
      available_balance = COALESCE(vendor_balances.available_balance, 0) + vendor_amount,
      total_earned = COALESCE(vendor_balances.total_earned, 0) + vendor_amount,
      updated_at = now();
    
    -- Create vendor transaction record
    INSERT INTO vendor_transactions (vendor_id, type, amount, description, order_id)
    VALUES (
      vendor_record.vendor_id,
      'sale',
      vendor_amount,
      'Vente - Commande #' || NEW.order_number,
      NEW.id
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;