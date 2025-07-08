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
    console.log("Moneroo webhook received:", JSON.stringify(webhookData, null, 2));

    // Selon la documentation Moneroo, les webhooks contiennent directement les données
    // Le transaction_id est maintenant dans webhookData.id (selon la structure de leur API)
    const transactionId = webhookData.id;
    const status = webhookData.status;
    const metadata = webhookData.metadata || {};

    if (!transactionId) {
      console.error("Transaction ID not found in webhook data");
      return new Response("Transaction ID not found", { status: 400 });
    }

    // Trouver la transaction Moneroo correspondante
    const { data: transaction, error: transactionError } = await supabase
      .from("moneroo_transactions")
      .select("*, orders(*)")
      .eq("transaction_id", transactionId)
      .single();

    if (transactionError || !transaction) {
      console.error("Transaction not found:", transactionId, transactionError);
      return new Response("Transaction not found", { status: 404 });
    }

    // Mapper les statuts Moneroo aux statuts internes
    let newStatus = "pending";
    let orderStatus = "pending";
    let paymentStatus = "pending";

    switch (status) {
      case "success":
      case "completed":
      case "paid":
        newStatus = "success";
        orderStatus = "confirmed";
        paymentStatus = "paid";
        break;
      case "failed":
      case "error":
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

    console.log(`Updating transaction ${transactionId} from status to ${newStatus}`);

    // Mettre à jour le statut de la transaction Moneroo
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

    // Log selon le statut
    if (newStatus === "success") {
      console.log(`✅ Payment successful for order ${transaction.orders?.order_number || transaction.orders?.reference_code}`);
      // TODO: Envoyer email de confirmation si nécessaire
    } else if (newStatus === "failed") {
      console.log(`❌ Payment failed for order ${transaction.orders?.order_number || transaction.orders?.reference_code}`);
    } else if (newStatus === "cancelled") {
      console.log(`🚫 Payment cancelled for order ${transaction.orders?.order_number || transaction.orders?.reference_code}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Webhook processed successfully",
        transaction_id: transactionId,
        new_status: newStatus
      }), 
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Webhook processing failed",
        details: error.message 
      }), 
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});