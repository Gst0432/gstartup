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

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          product_name,
          quantity,
          price,
          total
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    // Prepare articles array from order items
    const articles = order.order_items.reduce((acc: any, item: any) => {
      acc[item.product_name] = item.total;
      return acc;
    }, {});

    // Prepare payment data according to MoneyFusion API
    const paymentData = {
      totalPrice: Math.round(amount),
      article: [articles],
      personal_Info: [
        {
          userId: order.user_id,
          orderId: order.id,
          orderNumber: order.order_number
        }
      ],
      numeroSend: customerPhone,
      nomclient: customerName,
      return_url: `${req.headers.get("origin")}/payment-success?order=${order.reference_code}`,
      webhook_url: `${req.headers.get("origin")}/supabase/functions/v1/moneyfusion-webhook`
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

    // Return the payment URL
    return new Response(
      JSON.stringify({
        success: true,
        payment_url: moneyfusionData.url,
        token: moneyfusionData.token,
        order_id: order.id
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