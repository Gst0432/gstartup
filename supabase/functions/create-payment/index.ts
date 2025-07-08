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

    // Check vendor's payment configuration
    const paymentConfig = product.vendor.payment_config || {};
    const preferredGateway = paymentConfig.preferred_gateway || 'moneroo'; // Default to Moneroo

    // Get the payment gateway configuration
    const { data: gateway, error: gatewayError } = await supabase
      .from('payment_gateways')
      .select('*')
      .eq('type', preferredGateway)
      .eq('is_active', true)
      .single();

    if (gatewayError || !gateway) {
      // Fallback to Moneroo if no gateway found
      const { data: fallbackGateway } = await supabase
        .from('payment_gateways')
        .select('*')
        .eq('type', 'moneroo')
        .single();
      
      if (!fallbackGateway) {
        throw new Error('No payment gateway available');
      }
    }

    // Calculate total amount
    const totalAmount = product.price * quantity;

    // Create order in database
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

    // For now, we'll create a Moneroo payment
    // You can extend this to support other gateways
    if (preferredGateway === 'moneroo' || !gateway) {
      const monerooApiKey = Deno.env.get("MONEROO_API_KEY");
      
      if (!monerooApiKey) {
        throw new Error('Moneroo API key not configured');
      }

      // Create Moneroo payment
      const monerooPayload = {
        amount: totalAmount,
        currency: 'XAF',
        description: `Achat de ${product.name}`,
        return_url: `${req.headers.get("origin")}/payment-success?order=${order.id}`,
        cancel_url: `${req.headers.get("origin")}/payment-cancelled?order=${order.id}`,
        webhook_url: `${supabaseUrl}/functions/v1/moneroo-webhook`,
        customer: {
          email: user?.email || 'guest@example.com',
          first_name: user?.user_metadata?.display_name || 'Guest',
          last_name: '',
        },
        metadata: {
          order_id: order.id,
          product_id: product.id,
          vendor_id: product.vendor.id
        }
      };

      const monerooResponse = await fetch('https://api.moneroo.io/v1/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${monerooApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(monerooPayload),
      });

      if (!monerooResponse.ok) {
        throw new Error('Failed to create Moneroo payment');
      }

      const monerooData = await monerooResponse.json();

      // Save Moneroo transaction
      await supabase
        .from('moneroo_transactions')
        .insert({
          order_id: order.id,
          transaction_id: monerooData.id,
          reference_code: monerooData.reference,
          amount: totalAmount,
          currency: 'XAF',
          status: 'pending',
          moneroo_response: monerooData
        });

      return new Response(
        JSON.stringify({
          success: true,
          payment_url: monerooData.checkout_url,
          order_id: order.id
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // For other gateways, implement similar logic
    throw new Error('Payment gateway not supported yet');

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