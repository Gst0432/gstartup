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
    const { productId, quantity = 1 } = await req.json();

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get product details with vendor payment config
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        *,
        vendor:vendors!products_vendor_id_fkey(
          id,
          business_name,
          payment_config
        )
      `)
      .eq('id', productId)
      .eq('is_active', true)
      .single();

    if (productError || !product) {
      throw new Error('Product not found');
    }

    // Get user if authenticated
    const authHeader = req.headers.get("Authorization");
    let user = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabase.auth.getUser(token);
      user = data.user;
    }

    // Calculate total amount
    const totalAmount = product.price * quantity;

    // Create order in database first
    const orderData = {
      user_id: user?.id || null,
      order_number: `ORD-${Date.now()}`,
      subtotal: totalAmount,
      total_amount: totalAmount,
      currency: 'XAF',
      status: 'pending',
      payment_status: 'pending'
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      throw new Error('Failed to create order');
    }

    // Create order item
    await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity: quantity,
        total: totalAmount,
        vendor_id: product.vendor.id
      });

    // Get Moneroo API key
    const monerooApiKey = Deno.env.get("MONEROO_API_KEY");
    
    if (!monerooApiKey) {
      throw new Error('Moneroo API key not configured');
    }

    // Prepare customer data according to Moneroo standards
    const customerData = {
      email: user?.email || 'guest@g-startup.com',
      first_name: user?.user_metadata?.display_name?.split(' ')[0] || 'Client',
      last_name: user?.user_metadata?.display_name?.split(' ').slice(1).join(' ') || 'G-STARTUP'
    };

    // Create Moneroo payment according to their API specification
    const monerooPayload = {
      amount: Math.round(totalAmount), // Ensure integer as required by Moneroo
      currency: 'XAF', // Use XAF for Central/West Africa
      description: `Achat de ${product.name} - Commande #${order.order_number}`,
      return_url: `${req.headers.get("origin")}/payment-success?order=${order.id}`,
      customer: customerData,
      metadata: {
        order_id: order.id,
        product_id: product.id,
        vendor_id: product.vendor.id,
        order_number: order.order_number
      }
    };

    console.log('Creating Moneroo payment with payload:', JSON.stringify(monerooPayload, null, 2));

    // Call Moneroo API endpoint according to their documentation
    const monerooResponse = await fetch('https://api.moneroo.io/v1/payments/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${monerooApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(monerooPayload),
    });

    const monerooData = await monerooResponse.json();
    console.log('Moneroo API response:', monerooData);

    if (!monerooResponse.ok) {
      console.error('Moneroo API error:', monerooData);
      throw new Error(`Moneroo API error: ${monerooData.message || 'Unknown error'}`);
    }

    // Save Moneroo transaction with the correct data structure
    await supabase
      .from('moneroo_transactions')
      .insert({
        order_id: order.id,
        transaction_id: monerooData.data.id, // Use data.id as per Moneroo response format
        reference_code: order.order_number,
        amount: totalAmount,
        currency: 'XAF',
        status: 'pending',
        moneroo_response: monerooData
      });

    // Return the checkout URL from Moneroo response
    return new Response(
      JSON.stringify({
        success: true,
        payment_url: monerooData.data.checkout_url, // Use data.checkout_url as per Moneroo response format
        order_id: order.id,
        transaction_id: monerooData.data.id
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