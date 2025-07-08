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
    const { orderId, amount, customerPhone, customerName } = await req.json();

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const moneyfusionApiUrl = Deno.env.get("MONEYFUSION_API_URL")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get order details with vendor information
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          product_name,
          quantity,
          price,
          total,
          vendor_id,
          vendors(
            id,
            business_name,
            webhook_secret,
            success_url,
            cancel_url,
            webhook_url,
            notification_email
          )
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    // Get vendor info from the first order item (assuming single vendor per order)
    const vendorInfo = order.order_items[0]?.vendors;
    if (!vendorInfo) {
      throw new Error('Vendor information not found');
    }

    // Prepare articles array from order items
    const articles = order.order_items.reduce((acc: any, item: any) => {
      acc[item.product_name] = item.total;
      return acc;
    }, {});

    // Determine URLs to use (vendor custom or defaults)
    const origin = req.headers.get("origin") || "https://gstartup.pro";
    const successUrl = vendorInfo.success_url || `${origin}/payment-success?order=${order.reference_code}`;
    const cancelUrl = vendorInfo.cancel_url || `${origin}/payment-cancelled?order=${order.reference_code}`;
    const webhookUrl = vendorInfo.webhook_url || `${origin}/functions/v1/moneyfusion-webhook`;

    // Prepare payment data according to MoneyFusion API
    const paymentData = {
      totalPrice: Math.round(amount),
      article: [articles],
      personal_Info: [
        {
          userId: order.user_id,
          orderId: order.id,
          orderNumber: order.order_number,
          vendorId: vendorInfo.id
        }
      ],
      numeroSend: customerPhone,
      nomclient: customerName,
      return_url: successUrl,
      webhook_url: webhookUrl
    };

    console.log('Creating MoneyFusion payment with data:', JSON.stringify(paymentData, null, 2));

    // Call MoneyFusion API
    const moneyfusionResponse = await fetch(moneyfusionApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const moneyfusionData = await moneyfusionResponse.json();
    console.log('MoneyFusion API response:', moneyfusionData);

    if (!moneyfusionResponse.ok || !moneyfusionData.statut) {
      console.error('MoneyFusion API error:', moneyfusionData);
      throw new Error(`MoneyFusion API error: ${moneyfusionData.message || 'Unknown error'}`);
    }

    // Save MoneyFusion transaction
    const { error: transactionError } = await supabase
      .from('moneyfusion_transactions')
      .insert({
        order_id: order.id,
        token_pay: moneyfusionData.token,
        reference_code: order.reference_code,
        amount: amount,
        currency: 'XAF',
        customer_phone: customerPhone,
        customer_name: customerName,
        status: 'pending',
        moneyfusion_response: moneyfusionData
      });

    if (transactionError) {
      console.error('Error saving transaction:', transactionError);
      throw new Error('Failed to save transaction');
    }

    // Send email notification to vendor if configured
    if (vendorInfo.notification_email) {
      console.log(`Sending payment notification to vendor: ${vendorInfo.notification_email}`);
      // TODO: Implement email notification (could use Resend or other email service)
    }

    // Return the payment URL
    return new Response(
      JSON.stringify({
        success: true,
        payment_url: moneyfusionData.url,
        token: moneyfusionData.token,
        order_id: order.id,
        vendor_info: {
          business_name: vendorInfo.business_name,
          success_url: successUrl,
          cancel_url: cancelUrl
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Payment creation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Payment creation failed' 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});