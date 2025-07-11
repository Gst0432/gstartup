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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { transaction_id } = await req.json();
    console.log(`🔧 Forcing payment success for transaction: ${transaction_id}`);

    if (!transaction_id) {
      return new Response("Transaction ID required", { status: 400 });
    }

    // Trouver la transaction
    const { data: transaction, error: transactionError } = await supabase
      .from("moneroo_transactions")
      .select("*, orders(*)")
      .eq("transaction_id", transaction_id)
      .single();

    if (transactionError || !transaction) {
      console.error("Transaction not found:", transactionError);
      return new Response("Transaction not found", { status: 404 });
    }

    console.log(`📦 Found transaction for order: ${transaction.orders?.order_number}`);

    // Marquer la transaction comme réussie
    const { error: updateTransactionError } = await supabase
      .from("moneroo_transactions")
      .update({
        status: "success",
        webhook_data: {
          manual_success: true,
          forced_at: new Date().toISOString(),
          id: transaction_id,
          status: "success"
        },
        updated_at: new Date().toISOString()
      })
      .eq("id", transaction.id);

    if (updateTransactionError) {
      console.error("Failed to update transaction:", updateTransactionError);
      return new Response("Failed to update transaction", { status: 500 });
    }

    // Marquer la commande comme confirmée et payée
    const { error: updateOrderError } = await supabase
      .from("orders")
      .update({
        status: "confirmed",
        payment_status: "paid",
        updated_at: new Date().toISOString()
      })
      .eq("id", transaction.order_id);

    if (updateOrderError) {
      console.error("Failed to update order:", updateOrderError);
      return new Response("Failed to update order", { status: 500 });
    }

    console.log(`✅ Payment marked as successful for order ${transaction.orders?.order_number}`);

    // Déclencher le processus automatique pour traiter cette commande
    try {
      await supabase.functions.invoke('auto-process-orders');
      console.log("📤 Auto-process function triggered");
    } catch (error) {
      console.warn("Failed to trigger auto-process:", error);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Payment marked as successful",
        transaction_id: transaction_id,
        order_number: transaction.orders?.order_number
      }), 
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Force payment success error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Failed to force payment success",
        details: error.message 
      }), 
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});