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
    console.log('🚀 Create payment function started');
    
    const { productId, quantity = 1 } = await req.json();
    console.log('📦 Request data:', { productId, quantity });

    // Create Supabase clients - use anon key for auth, service key for data operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔐 Supabase clients created');

    // Get product details with vendor payment config
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        vendor:vendors!products_vendor_id_fkey(
          id,
          business_name,
          payment_config,
          moneroo_enabled,
          moneroo_api_key,
          moneroo_secret_key,
          moneyfusion_enabled,
          moneyfusion_api_url
        )
      `)
      .eq('id', productId)
      .eq('is_active', true)
      .single();

    if (productError || !product) {
      console.error('❌ Product error:', productError);
      throw new Error('Product not found');
    }

    console.log('✅ Product found:', { id: product.id, name: product.name, vendor: product.vendor?.id });

    // Get user if authenticated
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
        // Get user profile for additional info
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

    // Calculate total amount
    const totalAmount = product.price * quantity;

    // Create order in database first
    const orderData = {
      user_id: user.id,
      order_number: `ORD-${Date.now()}`,
      subtotal: totalAmount,
      total_amount: totalAmount,
      currency: 'XAF',
      status: 'pending',
      payment_status: 'pending'
    };

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      throw new Error('Failed to create order');
    }

    // Create order item
    await supabaseAdmin
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

    // Determine which payment gateway to use based on vendor configuration
    let paymentUrl = null;
    let transactionId = null;

    // Check if vendor has MoneyFusion enabled and configured
    if (product.vendor.moneyfusion_enabled && product.vendor.moneyfusion_api_url) {
      console.log('Using MoneyFusion payment gateway for vendor:', product.vendor.id);
      
      // Use MoneyFusion API
      const customerPhone = userProfile?.phone || '237000000000'; // Default fallback
      const customerName = userProfile?.display_name || 'Client G-STARTUP';
      
      const moneyfusionPayload = {
        amount: Math.round(totalAmount),
        currency: 'XAF',
        description: `Achat de ${product.name} - Commande #${order.order_number}`,
        customer_name: customerName,
        customer_phone: customerPhone,
        return_url: `${req.headers.get("origin")}/payment-success?order=${order.id}`,
        metadata: {
          order_id: order.id,
          product_id: product.id,
          vendor_id: product.vendor.id,
          order_number: order.order_number
        }
      };

      console.log('Creating MoneyFusion payment with payload:', JSON.stringify(moneyfusionPayload, null, 2));

      const moneyfusionResponse = await fetch(`${product.vendor.moneyfusion_api_url}/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(moneyfusionPayload),
      });

      const moneyfusionData = await moneyfusionResponse.json();
      console.log('MoneyFusion API response:', moneyfusionData);

      if (!moneyfusionResponse.ok) {
        console.error('MoneyFusion API error:', moneyfusionData);
        throw new Error(`MoneyFusion API error: ${moneyfusionData.message || 'Unknown error'}`);
      }

      // Save MoneyFusion transaction
      await supabaseAdmin
        .from('moneyfusion_transactions')
        .insert({
          order_id: order.id,
          token_pay: moneyfusionData.token_pay || moneyfusionData.data?.token_pay,
          reference_code: order.order_number,
          amount: totalAmount,
          currency: 'XAF',
          customer_name: customerName,
          customer_phone: customerPhone,
          status: 'pending',
          moneyfusion_response: moneyfusionData
        });

      paymentUrl = moneyfusionData.payment_url || moneyfusionData.data?.payment_url;
      transactionId = moneyfusionData.token_pay || moneyfusionData.data?.token_pay;

    // Check if vendor has Moneroo enabled and configured
    } else if (product.vendor.moneroo_enabled && product.vendor.moneroo_api_key) {
      console.log('Using Moneroo payment gateway for vendor:', product.vendor.id);
      
      // Prepare customer data according to Moneroo standards
      const customerData = {
        email: user.email || userProfile?.email || 'guest@g-startup.com',
        first_name: userProfile?.display_name?.split(' ')[0] || 'Client',
        last_name: userProfile?.display_name?.split(' ').slice(1).join(' ') || 'G-STARTUP'
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
          'Authorization': `Bearer ${product.vendor.moneroo_api_key}`,
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
      await supabaseAdmin
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

      paymentUrl = monerooData.data.checkout_url;
      transactionId = monerooData.data.id;

    } else {
      throw new Error('Aucune passerelle de paiement configurée pour ce vendeur');
    }

    if (!paymentUrl) {
      throw new Error('URL de paiement non générée');
    }

    // Return the checkout URL
    return new Response(
      JSON.stringify({
        success: true,
        payment_url: paymentUrl,
        order_id: order.id,
        transaction_id: transactionId
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