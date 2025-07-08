import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  cart_items: Array<{
    product_id: string;
    quantity: number;
    price: number;
    variant_id?: string;
  }>;
  shipping_address?: any;
  billing_address?: any;
  payment_method: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialiser Supabase avec service role pour créer la commande
    const supabaseServiceRole = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Authentifier l'utilisateur
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error("Invalid user token");
    }

    const user = userData.user;
    const { cart_items, shipping_address, billing_address, payment_method }: PaymentRequest = await req.json();

    // Calculer le total
    const subtotal = cart_items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping_amount = 0; // Livraison gratuite pour l'instant
    const tax_amount = 0; // Pas de taxes pour l'instant
    const total_amount = subtotal + shipping_amount + tax_amount;

    // Générer un numéro de commande unique
    const order_number = `CMD${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Créer la commande
    const { data: orderData, error: orderError } = await supabaseServiceRole
      .from("orders")
      .insert({
        user_id: user.id,
        order_number,
        subtotal,
        shipping_amount,
        tax_amount,
        total_amount,
        currency: "XAF",
        status: "pending",
        payment_status: "pending",
        fulfillment_status: "unfulfilled",
        shipping_address,
        billing_address
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      throw new Error("Failed to create order");
    }

    // Créer les items de commande
    const orderItems = cart_items.map(item => ({
      order_id: orderData.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
      product_name: "Produit", // À récupérer depuis la DB en production
      variant_name: item.variant_id ? "Variante" : null,
      vendor_id: "00000000-0000-0000-0000-000000000000" // À récupérer depuis la DB
    }));

    const { error: itemsError } = await supabaseServiceRole
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items creation error:", itemsError);
      throw new Error("Failed to create order items");
    }

    // Récupérer la configuration Moneroo depuis l'admin
    const { data: monerooGateway, error: gatewayError } = await supabaseServiceRole
      .from('payment_gateways')
      .select('api_key, api_secret, is_active')
      .eq('type', 'moneroo')
      .eq('is_active', true)
      .single();

    if (gatewayError || !monerooGateway) {
      throw new Error("Moneroo gateway not configured or inactive");
    }

    if (!monerooGateway.api_key) {
      throw new Error("Moneroo API key not configured in admin settings");
    }

    const monerooPayload = {
      amount: total_amount,
      currency: "XAF",
      description: `Commande ${order_number} - ${cart_items.length} article(s)`,
      return_url: `${req.headers.get("origin")}/payment-success?order=${orderData.reference_code}`,
      cancel_url: `${req.headers.get("origin")}/payment-cancelled?order=${orderData.reference_code}`,
      webhook_url: `${req.headers.get("origin")}/api/webhooks/moneroo`,
      customer: {
        email: user.email,
        name: user.user_metadata?.display_name || user.email,
        phone: user.user_metadata?.phone
      },
      metadata: {
        order_id: orderData.id,
        reference_code: orderData.reference_code,
        user_id: user.id
      }
    };

    // Appel à l'API Moneroo
    const monerooResponse = await fetch("https://api.moneroo.io/v1/payments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${monerooGateway.api_key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(monerooPayload)
    });

    const monerooData = await monerooResponse.json();

    if (!monerooResponse.ok) {
      console.error("Moneroo API error:", monerooData);
      throw new Error("Failed to create Moneroo payment");
    }

    // Enregistrer la transaction Moneroo
    const { error: transactionError } = await supabaseServiceRole
      .from("moneroo_transactions")
      .insert({
        order_id: orderData.id,
        transaction_id: monerooData.id,
        reference_code: orderData.reference_code,
        amount: total_amount,
        currency: "XAF",
        payment_method,
        moneroo_response: monerooData,
        status: "pending"
      });

    if (transactionError) {
      console.error("Transaction creation error:", transactionError);
      // Ne pas échouer ici, continuer avec le paiement
    }

    // Vider le panier après création de la commande
    try {
      const { data: cartData } = await supabaseServiceRole
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (cartData) {
        await supabaseServiceRole
          .from("cart_items")
          .delete()
          .eq("cart_id", cartData.id);
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      // Ne pas échouer ici
    }

    return new Response(JSON.stringify({
      success: true,
      payment_url: monerooData.checkout_url,
      order_reference: orderData.reference_code,
      transaction_id: monerooData.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Payment creation error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});