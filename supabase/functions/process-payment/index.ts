import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  // Pour les achats de produits individuels
  productId?: string;
  quantity?: number;
  
  // Pour les paniers multiples
  cartItems?: Array<{
    product_id: string;
    quantity: number;
    variant_id?: string;
  }>;
  
  // Informations optionnelles
  shippingAddress?: any;
  billingAddress?: any;
  paymentMethod?: string;
  
  // Pour les commandes existantes
  orderId?: string;
  amount?: number;
  vendorId?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Process payment function started');
    
    const requestData: PaymentRequest = await req.json();
    console.log('📦 Request data:', requestData);

    // Create Supabase clients
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔐 Supabase clients created');

    // Get user authentication
    const authHeader = req.headers.get("Authorization");
    let user = null;
    let userProfile = null;
    
    if (authHeader) {
      console.log('🔑 Auth header found, authenticating user');
      const token = authHeader.replace("Bearer ", "");
      const { data: authData, error: authError } = await supabaseAuth.auth.getUser(token);
      
      if (authError) {
        console.error('❌ Auth error:', authError);
        throw new Error('Authentication failed');
      }
      
      user = authData.user;
      console.log('👤 User authenticated:', { id: user?.id, email: user?.email });
      
      if (user) {
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (profileError) {
          console.warn('⚠️ Profile not found:', profileError);
        } else {
          userProfile = profile;
          console.log('👤 User profile loaded:', { display_name: profile?.display_name });
        }
      }
    }
    
    if (!user) {
      console.error('❌ No user authenticated');
      throw new Error('Utilisateur non connecté');
    }

    // Get active payment gateway (prioritize Moneroo)
    const { data: paymentGateway, error: gatewayError } = await supabaseAdmin
      .from('payment_gateways')
      .select('*')
      .eq('type', 'moneroo')
      .eq('is_active', true)
      .single();

    if (gatewayError || !paymentGateway || !paymentGateway.api_key) {
      console.error('❌ Payment gateway config error:', gatewayError);
      throw new Error('Configuration de paiement non disponible');
    }

    console.log('✅ Payment gateway configured:', paymentGateway.type);

    let orderData;
    let totalAmount = 0;
    let orderItems = [];

    // Handle different request types
    if (requestData.productId) {
      // Single product purchase
      console.log('📦 Processing single product purchase');
      
      const { data: product, error: productError } = await supabaseAdmin
        .from('products')
        .select(`
          *,
          vendor:vendors!products_vendor_id_fkey(
            id,
            business_name
          )
        `)
        .eq('id', requestData.productId)
        .eq('is_active', true)
        .single();

      if (productError || !product) {
        console.error('❌ Product error:', productError);
        throw new Error('Product not found');
      }

      totalAmount = product.price * (requestData.quantity || 1);
      
      orderItems = [{
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        quantity: requestData.quantity || 1,
        total: totalAmount,
        vendor_id: product.vendor.id
      }];

    } else if (requestData.cartItems && requestData.cartItems.length > 0) {
      // Multiple products (cart)
      console.log('🛒 Processing cart items');
      
      for (const item of requestData.cartItems) {
        const { data: product, error: productError } = await supabaseAdmin
          .from('products')
          .select(`
            *,
            vendor:vendors!products_vendor_id_fkey(
              id,
              business_name
            )
          `)
          .eq('id', item.product_id)
          .eq('is_active', true)
          .single();

        if (product) {
          const itemTotal = product.price * item.quantity;
          totalAmount += itemTotal;
          
          orderItems.push({
            product_id: product.id,
            product_name: product.name,
            price: product.price,
            quantity: item.quantity,
            total: itemTotal,
            vendor_id: product.vendor.id,
            variant_id: item.variant_id || null
          });
        }
      }
    } else if (requestData.orderId && requestData.amount) {
      // Existing order payment
      console.log('📄 Processing existing order payment');
      totalAmount = requestData.amount;
      
      // This might be for vendor-specific orders
      orderItems = [{
        product_id: 'custom-order',
        product_name: 'Custom Order',
        price: requestData.amount,
        quantity: 1,
        total: requestData.amount,
        vendor_id: requestData.vendorId || 'default'
      }];
    } else {
      throw new Error('Invalid payment request parameters');
    }

    if (totalAmount <= 0) {
      throw new Error('Invalid amount');
    }

    // Create order
    const newOrderData = {
      user_id: user.id,
      order_number: `ORD-${Date.now()}`,
      subtotal: totalAmount,
      total_amount: totalAmount,
      currency: 'XAF',
      status: 'pending',
      payment_status: 'pending',
      shipping_address: requestData.shippingAddress || null,
      billing_address: requestData.billingAddress || null
    };

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert(newOrderData)
      .select()
      .single();

    if (orderError) {
      console.error('❌ Order creation error:', orderError);
      throw new Error('Failed to create order');
    }

    console.log('✅ Order created:', order.id);

    // Create order items
    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id
    }));

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItemsWithOrderId);

    if (itemsError) {
      console.error('❌ Order items creation error:', itemsError);
      throw new Error('Failed to create order items');
    }

    console.log('✅ Order items created');

    // Prepare customer data for Moneroo
    const customerData = {
      email: user.email || userProfile?.email || 'guest@g-startup.com',
      first_name: userProfile?.display_name?.split(' ')[0] || 'Client',
      last_name: userProfile?.display_name?.split(' ').slice(1).join(' ') || 'G-STARTUP'
    };

    // Create Moneroo payment
    const monerooPayload = {
      amount: Math.round(totalAmount),
      currency: 'XAF',
      description: `Commande #${order.order_number} - ${orderItems.length} article(s)`,
      return_url: `${req.headers.get("origin")}/payment-success?order=${order.id}`,
      customer: customerData,
      metadata: {
        order_id: order.id,
        order_number: order.order_number,
        user_id: user.id
      }
    };

    console.log('🔄 Creating Moneroo payment:', JSON.stringify(monerooPayload, null, 2));

    const monerooResponse = await fetch('https://api.moneroo.io/v1/payments/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${paymentGateway.api_key}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(monerooPayload),
    });

    const monerooData = await monerooResponse.json();
    console.log('📡 Moneroo response:', monerooResponse.status, monerooData);

    if (monerooResponse.status !== 201) {
      console.error('❌ Moneroo API error:', monerooData);
      throw new Error(`Moneroo API error: ${monerooData.message || 'Failed to initialize payment'}`);
    }

    // Save Moneroo transaction
    await supabaseAdmin
      .from('moneroo_transactions')
      .insert({
        order_id: order.id,
        transaction_id: monerooData.data.id,
        reference_code: order.order_number,
        amount: totalAmount,
        currency: 'XAF',
        status: 'pending',
        moneroo_response: monerooData
      });

    console.log('✅ Payment process completed successfully');

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        payment_url: monerooData.data?.checkout_url,
        order_id: order.id,
        order_number: order.order_number,
        transaction_id: monerooData.data?.id,
        amount: totalAmount,
        currency: 'XAF'
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Payment processing error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Payment processing failed' 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
