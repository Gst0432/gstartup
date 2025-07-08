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
    // Initialize Supabase with service role
    const supabaseServiceRole = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const webhookData = await req.json();
    console.log("MoneyFusion webhook received:", JSON.stringify(webhookData, null, 2));

    const tokenPay = webhookData.tokenPay;
    const event = webhookData.event;
    const personalInfo = webhookData.personal_Info || [];

    if (!tokenPay) {
      console.error("Token not found in webhook data");
      return new Response("Token not found", { status: 400 });
    }

    // Find the MoneyFusion transaction with vendor information
    const { data: transaction, error: transactionError } = await supabaseServiceRole
      .from("moneyfusion_transactions")
      .select(`
        *,
        orders(
          *,
          order_items(
            vendor_id,
            vendors(
              id,
              business_name,
              notification_email,
              webhook_url
            )
          )
        )
      `)
      .eq("token_pay", tokenPay)
      .single();

    if (transactionError || !transaction) {
      console.error("Transaction not found:", tokenPay, transactionError);
      return new Response("Transaction not found", { status: 404 });
    }

    // Get vendor info
    const vendorInfo = transaction.orders?.order_items?.[0]?.vendors;

    // Check if this is a duplicate notification
    const currentStatus = transaction.status;
    let newStatus = "pending";
    let orderStatus = "pending";
    let paymentStatus = "pending";

    // Map MoneyFusion events to internal statuses selon la documentation
    switch (event) {
      case "payin.session.completed":
        newStatus = "paid";
        orderStatus = "confirmed";
        paymentStatus = "paid";
        break;
      case "payin.session.cancelled":
        newStatus = "cancelled";
        orderStatus = "cancelled";
        paymentStatus = "cancelled";
        break;
      case "payin.session.pending":
        newStatus = "pending";
        orderStatus = "pending";
        paymentStatus = "pending";
        break;
      default:
        console.log(`Unknown event: ${event}, keeping current status`);
        newStatus = currentStatus;
    }

    // Ignore redundant notifications (recommandation de la documentation)
    if (currentStatus === newStatus) {
      console.log(`Ignoring redundant notification: ${event} for transaction ${tokenPay}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Redundant notification ignored",
          token: tokenPay
        }), 
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }

    console.log(`Updating transaction ${tokenPay} from ${currentStatus} to ${newStatus}`);

    // Update the MoneyFusion transaction status
    const { error: updateError } = await supabaseServiceRole
      .from("moneyfusion_transactions")
      .update({
        status: newStatus,
        webhook_data: webhookData,
        numero_transaction: webhookData.numeroTransaction,
        montant: webhookData.Montant,
        frais: webhookData.frais,
        moyen: webhookData.moyen,
        updated_at: new Date().toISOString()
      })
      .eq("id", transaction.id);

    if (updateError) {
      console.error("Failed to update transaction:", updateError);
      return new Response("Failed to update transaction", { status: 500 });
    }

    // Update the order status
    const { error: orderUpdateError } = await supabaseServiceRole
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

    // Send email notifications if payment is completed
    if (newStatus === "paid") {
      console.log(`Payment completed - sending notifications`);
      
      // Send email notification to customer
      const { data: customerProfile } = await supabaseServiceRole
        .from("profiles")
        .select("email, display_name")
        .eq("user_id", transaction.orders.user_id)
        .single();

      if (customerProfile) {
        // Send order confirmation to customer
        await supabaseServiceRole.functions.invoke('send-email-notifications', {
          body: {
            type: 'order_confirmation',
            to: customerProfile.email,
            data: {
              customer_name: customerProfile.display_name,
              order_number: transaction.orders.order_number,
              total_amount: transaction.orders.total_amount,
              currency: transaction.orders.currency,
              status: 'confirmed'
            }
          }
        });
      }

      // Send payment notification to vendor if configured
      if (vendorInfo?.notification_email) {
        await supabaseServiceRole.functions.invoke('send-email-notifications', {
          body: {
            type: 'payment_success',
            to: vendorInfo.notification_email,
            data: {
              amount: transaction.amount,
              currency: transaction.currency,
              order_number: transaction.orders.order_number,
              customer_name: customerProfile?.display_name || transaction.nomclient,
              payment_method: 'MoneyFusion'
            }
          }
        });
        console.log(`Payment notification sent to vendor: ${vendorInfo.notification_email}`);
      }
    }

    // Forward webhook to vendor's custom webhook URL if configured
    if (vendorInfo?.webhook_url) {
      try {
        console.log(`Forwarding webhook to vendor URL: ${vendorInfo.webhook_url}`);
        const vendorWebhookData = {
          ...webhookData,
          vendor_info: {
            business_name: vendorInfo.business_name,
            vendor_id: vendorInfo.id
          },
          order_info: {
            order_number: transaction.orders?.order_number,
            reference_code: transaction.orders?.reference_code
          }
        };
        
        await fetch(vendorInfo.webhook_url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(vendorWebhookData),
        });
        console.log(`Webhook forwarded successfully to ${vendorInfo.webhook_url}`);
      } catch (error) {
        console.error(`Failed to forward webhook to vendor: ${error}`);
        // Don't fail the main webhook processing if vendor webhook fails
      }
    }

    // Log based on status
    if (newStatus === "paid") {
      console.log(`✅ Payment successful for order ${transaction.orders?.order_number || transaction.orders?.reference_code} - Vendor: ${vendorInfo?.business_name || 'Unknown'}`);
    } else if (newStatus === "cancelled") {
      console.log(`❌ Payment cancelled for order ${transaction.orders?.order_number || transaction.orders?.reference_code} - Vendor: ${vendorInfo?.business_name || 'Unknown'}`);
    } else {
      console.log(`⏳ Payment pending for order ${transaction.orders?.order_number || transaction.orders?.reference_code} - Vendor: ${vendorInfo?.business_name || 'Unknown'}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Webhook processed successfully",
        token: tokenPay,
        event: event,
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