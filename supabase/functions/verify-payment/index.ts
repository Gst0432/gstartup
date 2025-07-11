import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Payment verification started');
    
    const { transactionId } = await req.json();
    console.log('🆔 Transaction ID:', transactionId);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get global Moneroo configuration
    const { data: globalConfig, error: configError } = await supabase
      .from('global_payment_config')
      .select('*')
      .eq('is_active', true)
      .single();

    if (configError || !globalConfig || !globalConfig.moneroo_api_key) {
      console.error('❌ Global payment config error:', configError);
      throw new Error('Configuration de paiement non disponible');
    }

    console.log('✅ Using global Moneroo configuration');

    // Verify payment status with Moneroo API using the verify endpoint
    const verifyResponse = await fetch(`https://api.moneroo.io/v1/payments/${transactionId}/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${globalConfig.moneroo_api_key}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const paymentData = await verifyResponse.json();
    console.log('🔍 Moneroo verification response:', paymentData);

    if (!verifyResponse.ok) {
      console.error('❌ Moneroo verification error:', paymentData);
      throw new Error(`Moneroo verification error: ${paymentData.message || 'Unknown error'}`);
    }

    // Find the local transaction
    const { data: transaction, error: transactionError } = await supabase
      .from("moneroo_transactions")
      .select("*, orders(*)")
      .eq("transaction_id", transactionId)
      .single();

    if (transactionError || !transaction) {
      console.error('❌ Transaction not found:', transactionId, transactionError);
      throw new Error('Transaction not found');
    }

    // Map Moneroo status to our internal status
    const monerooStatus = paymentData.data?.status || paymentData.status;
    let newStatus = "pending";
    let orderStatus = "pending";
    let paymentStatus = "pending";

    switch (monerooStatus?.toLowerCase()) {
      case "successful":
      case "success":
      case "completed":
      case "paid":
        newStatus = "success";
        orderStatus = "confirmed";
        paymentStatus = "paid";
        break;
      case "failed":
      case "error":
      case "declined":
        newStatus = "failed";
        orderStatus = "cancelled";
        paymentStatus = "failed";
        break;
      case "cancelled":
      case "canceled":
        newStatus = "cancelled";
        orderStatus = "cancelled";
        paymentStatus = "cancelled";
        break;
      default:
        newStatus = "pending";
        orderStatus = "pending";
        paymentStatus = "pending";
    }

    console.log(`📊 Status mapping: ${monerooStatus} -> ${newStatus}`);

    // Update transaction status
    const { error: updateError } = await supabase
      .from("moneroo_transactions")
      .update({
        status: newStatus,
        webhook_data: paymentData,
        updated_at: new Date().toISOString()
      })
      .eq("id", transaction.id);

    if (updateError) {
      console.error('❌ Failed to update transaction:', updateError);
      throw new Error('Failed to update transaction');
    }

    // Update order status
    const { error: orderUpdateError } = await supabase
      .from("orders")
      .update({
        status: orderStatus,
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", transaction.order_id);

    if (orderUpdateError) {
      console.error('❌ Failed to update order:', orderUpdateError);
      throw new Error('Failed to update order');
    }

    console.log(`✅ Payment verification completed for transaction ${transactionId}`);

    return new Response(
      JSON.stringify({
        success: true,
        status: newStatus,
        order_status: orderStatus,
        payment_status: paymentStatus,
        transaction_id: transactionId
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Payment verification error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Payment verification failed' 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});