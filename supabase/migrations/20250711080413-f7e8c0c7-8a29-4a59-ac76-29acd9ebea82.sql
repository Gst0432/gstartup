-- Create function to manually update payment status (for testing/fixing)
CREATE OR REPLACE FUNCTION public.fix_payment_status(
  p_transaction_id text,
  p_new_status text DEFAULT 'success'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_transaction record;
  v_order record;
  result json;
BEGIN
  -- Find the transaction
  SELECT * INTO v_transaction 
  FROM moneroo_transactions 
  WHERE transaction_id = p_transaction_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Transaction not found');
  END IF;
  
  -- Update transaction status
  UPDATE moneroo_transactions 
  SET status = p_new_status,
      webhook_data = json_build_object(
        'id', p_transaction_id,
        'status', p_new_status,
        'message', 'Manual status update',
        'timestamp', now()
      ),
      updated_at = now()
  WHERE transaction_id = p_transaction_id;
  
  -- Update order status based on transaction status
  IF p_new_status = 'success' THEN
    UPDATE orders 
    SET status = 'confirmed',
        payment_status = 'paid',
        updated_at = now()
    WHERE id = v_transaction.order_id
    RETURNING * INTO v_order;
  ELSIF p_new_status = 'failed' THEN
    UPDATE orders 
    SET status = 'cancelled',
        payment_status = 'failed',
        updated_at = now()
    WHERE id = v_transaction.order_id
    RETURNING * INTO v_order;
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'transaction_id', p_transaction_id,
    'old_status', v_transaction.status,
    'new_status', p_new_status,
    'order_id', v_transaction.order_id,
    'order_status', v_order.status,
    'payment_status', v_order.payment_status
  );
END;
$$;