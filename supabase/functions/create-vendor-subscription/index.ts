import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscriptionRequest {
  plan_id: string;
  amount: number;
  duration: string;
  user_id: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialiser Supabase avec service role
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
    const { plan_id, amount, duration, user_id }: SubscriptionRequest = await req.json();

    // Vérifier que l'utilisateur correspond
    if (user.id !== user_id) {
      throw new Error("User mismatch");
    }

    // Récupérer le profil utilisateur
    const { data: profile, error: profileError } = await supabaseServiceRole
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      console.error("Profile error:", profileError);
      throw new Error("User profile not found");
    }

    // Générer un numéro de transaction unique
    const transaction_number = `VEN${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Créer l'enregistrement de souscription
    const { data: subscriptionData, error: subscriptionError } = await supabaseServiceRole
      .from("vendor_subscriptions")
      .insert({
        user_id: user.id,
        plan_id,
        amount,
        duration,
        status: "pending",
        transaction_number,
        metadata: {
          user_email: user.email,
          user_name: profile.display_name,
          plan_details: {
            plan_id,
            duration,
            amount
          }
        }
      })
      .select()
      .single();

    if (subscriptionError) {
      console.error("Subscription creation error:", subscriptionError);
      throw new Error("Failed to create subscription");
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
      throw new Error("Moneroo API key not configured");
    }

    // Préparer les données pour Moneroo
    const monerooPayload = {
      amount: amount,
      currency: "XAF",
      description: `Abonnement Vendeur ${duration} - Plan ${plan_id}`,
      return_url: `${req.headers.get("origin")}/vendor-payment-success?subscription=${subscriptionData.id}`,
      cancel_url: `${req.headers.get("origin")}/vendor-payment-cancelled?subscription=${subscriptionData.id}`,
      webhook_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/vendor-payment-webhook`,
      customer: {
        email: user.email,
        name: profile.display_name || user.email,
        phone: profile.phone
      },
      metadata: {
        subscription_id: subscriptionData.id,
        transaction_number: transaction_number,
        user_id: user.id,
        plan_id: plan_id,
        type: "vendor_subscription"
      }
    };

    console.log("Moneroo payload:", monerooPayload);

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
    console.log("Moneroo response:", monerooData);

    if (!monerooResponse.ok) {
      console.error("Moneroo API error:", monerooData);
      throw new Error(`Moneroo API error: ${monerooData.message || 'Unknown error'}`);
    }

    // Mettre à jour la souscription avec les données Moneroo
    const { error: updateError } = await supabaseServiceRole
      .from("vendor_subscriptions")
      .update({
        moneroo_transaction_id: monerooData.id,
        moneroo_response: monerooData,
        payment_url: monerooData.checkout_url
      })
      .eq("id", subscriptionData.id);

    if (updateError) {
      console.error("Update subscription error:", updateError);
      // Continue même si l'update échoue
    }

    return new Response(JSON.stringify({
      success: true,
      payment_url: monerooData.checkout_url,
      subscription_id: subscriptionData.id,
      transaction_number: transaction_number
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Vendor subscription error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});