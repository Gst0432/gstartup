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
    // Initialiser Supabase avec service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const webhookData = await req.json();
    console.log("Moneroo webhook received:", webhookData);

    // Vérifier la signature du webhook (si implémentée par Moneroo)
    const signature = req.headers.get("x-moneroo-signature");
    // TODO: Implémenter la vérification de signature selon la documentation Moneroo

    const { data: transaction } = await supabase
      .from("moneroo_transactions")
      .select("*, orders(*)")
      .eq("transaction_id", webhookData.id)
      .single();

    if (!transaction) {
      console.error("Transaction not found:", webhookData.id);
      return new Response("Transaction not found", { status: 404 });
    }

    // Mettre à jour le statut de la transaction
    const newStatus = webhookData.status === "completed" ? "success" : 
                     webhookData.status === "failed" ? "failed" : 
                     webhookData.status === "cancelled" ? "cancelled" : "pending";

    const { error: updateError } = await supabase
      .from("moneroo_transactions")
      .update({
        status: newStatus,
        webhook_data: webhookData,
        updated_at: new Date().toISOString()
      })
      .eq("id", transaction.id);

    if (updateError) {
      console.error("Failed to update transaction:", updateError);
      return new Response("Failed to update transaction", { status: 500 });
    }

    // Mettre à jour le statut de la commande
    let orderStatus = "pending";
    let paymentStatus = "pending";

    if (newStatus === "success") {
      orderStatus = "confirmed";
      paymentStatus = "paid";
    } else if (newStatus === "failed" || newStatus === "cancelled") {
      orderStatus = "cancelled";
      paymentStatus = "failed";
    }

    const { error: orderUpdateError } = await supabase
      .from("orders")
      .update({
        status: orderStatus,
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", transaction.order_id);

    if (orderUpdateError) {
      console.error("Failed to update order:", orderUpdateError);
      return new Response("Failed to update order", { status: 500 });
    }

    // Si le paiement est réussi, on peut envoyer un email de confirmation
    if (newStatus === "success") {
      console.log(`Payment successful for order ${transaction.orders.reference_code}`);
      // TODO: Envoyer email de confirmation
    }

    return new Response("Webhook processed", { 
      headers: corsHeaders,
      status: 200 
    });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response("Webhook processing failed", { 
      headers: corsHeaders,
      status: 500 
    });
  }
});