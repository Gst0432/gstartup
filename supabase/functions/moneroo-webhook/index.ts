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

    // Extract transaction data from webhook payload
    // Moneroo sends the transaction data in the webhook
    const transactionId = webhookData.id || webhookData.transaction_id || webhookData.data?.id;
    const status = webhookData.status || webhookData.data?.status;
    const metadata = webhookData.metadata || webhookData.data?.metadata || {};

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

    // Traitement automatique pour paiement réussi
    if (newStatus === "success") {
      console.log(`✅ Payment successful for order ${transaction.orders?.order_number || transaction.orders?.reference_code}`);
      
      if (transaction.orders) {
        const { data: customerProfile } = await supabase
          .from("profiles")
          .select("email, display_name")
          .eq("user_id", transaction.orders.user_id)
          .single();

        if (customerProfile) {
          // Get order items with product details for digital delivery
          const { data: orderItems } = await supabase
            .from("order_items")
            .select(`
              *,
              products(
                name,
                is_digital,
                digital_file_url
              ),
              vendors(
                business_name,
                notification_email,
                user_id,
                profiles(email, display_name)
              )
            `)
            .eq("order_id", transaction.order_id);

          // Check for digital products and deliver them automatically
          const digitalProducts = orderItems?.filter(item => 
            item.products?.is_digital && item.products?.digital_file_url
          ) || [];

          if (digitalProducts.length > 0) {
            console.log(`🚀 Delivering ${digitalProducts.length} digital products automatically`);
            
            // Prepare digital products data for email
            const digitalProductsData = digitalProducts.map(item => ({
              name: item.products.name,
              downloadUrl: item.products.digital_file_url,
              quantity: item.quantity
            }));

            // Send digital product delivery email
            await supabase.functions.invoke('send-email-notifications', {
              body: {
                type: 'digital_product_delivery',
                to: customerProfile.email,
                data: {
                  customer_name: customerProfile.display_name,
                  order_number: transaction.orders.order_number,
                  products: digitalProductsData
                }
              }
            });

            // Update fulfillment status to fulfilled for digital products
            await supabase
              .from("orders")
              .update({
                fulfillment_status: 'fulfilled',
                updated_at: new Date().toISOString()
              })
              .eq("id", transaction.order_id);

            // Log the delivery
            await supabase
              .from("delivery_logs")
              .insert({
                order_id: transaction.order_id,
                delivery_type: 'digital',
                products_delivered: digitalProductsData,
                email_sent_to: customerProfile.email,
                delivery_status: 'success'
              });

            console.log(`✅ Digital products delivered successfully for order ${transaction.orders.order_number}`);
          } else {
            // Send regular order confirmation for non-digital or mixed orders
            await supabase.functions.invoke('send-email-notifications', {
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

          // Send payment notification to vendor(s)
          if (orderItems && orderItems.length > 0) {
            const vendorInfo = orderItems[0].vendors;
            if (vendorInfo?.notification_email || vendorInfo?.profiles?.email) {
              const vendorEmail = vendorInfo.notification_email || vendorInfo.profiles?.email;
              
              await supabase.functions.invoke('send-email-notifications', {
                body: {
                  type: 'payment_success',
                  to: vendorEmail,
                  data: {
                    amount: transaction.amount,
                    currency: transaction.currency,
                    order_number: transaction.orders.order_number,
                    customer_name: customerProfile?.display_name || 'Client',
                    payment_method: 'Moneroo'
                  }
                }
              });
            }
          }
        }
      }
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