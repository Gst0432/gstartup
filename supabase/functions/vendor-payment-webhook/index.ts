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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const webhookData = await req.json();
    console.log("Vendor payment webhook received:", webhookData);

    // Extraire les informations du webhook Moneroo
    const { status, metadata, payment } = webhookData;
    
    if (!metadata?.subscription_id) {
      throw new Error("No subscription ID in webhook metadata");
    }

    const subscription_id = metadata.subscription_id;
    const user_id = metadata.user_id;
    const plan_id = metadata.plan_id;

    // Récupérer la souscription
    const { data: subscription, error: subError } = await supabase
      .from("vendor_subscriptions")
      .select("*")
      .eq("id", subscription_id)
      .single();

    if (subError || !subscription) {
      throw new Error("Subscription not found");
    }

    // Mettre à jour le statut de la souscription selon le webhook
    let newStatus = "pending";
    if (status === "success" || status === "completed") {
      newStatus = "active";
    } else if (status === "failed" || status === "cancelled") {
      newStatus = "failed";
    }

    // Mettre à jour la souscription
    const { error: updateError } = await supabase
      .from("vendor_subscriptions")
      .update({
        status: newStatus,
        webhook_data: webhookData,
        payment_confirmed_at: newStatus === "active" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq("id", subscription_id);

    if (updateError) {
      console.error("Error updating subscription:", updateError);
      throw updateError;
    }

    // Si le paiement est confirmé, activer le rôle vendeur
    if (newStatus === "active") {
      console.log("Activating vendor role for user:", user_id);

      // Mettre à jour le rôle de l'utilisateur en vendeur
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          role: "vendor",
          updated_at: new Date().toISOString()
        })
        .eq("user_id", user_id);

      if (profileError) {
        console.error("Error updating user role:", profileError);
        // Ne pas échouer le webhook si l'update du profil échoue
      }

      // Créer ou mettre à jour le profil vendeur
      const { error: vendorError } = await supabase
        .from("vendors")
        .upsert({
          user_id: user_id,
          business_name: `Boutique ${subscription.metadata?.user_name || 'Vendeur'}`,
          is_active: true,
          is_verified: false,
          subscription_plan: plan_id,
          subscription_expires_at: getSubscriptionExpiryDate(subscription.duration),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: "user_id"
        });

      if (vendorError) {
        console.error("Error creating/updating vendor profile:", vendorError);
        // Ne pas échouer le webhook
      }

      console.log("Vendor role activated successfully for user:", user_id);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      status: newStatus,
      message: "Webhook processed successfully" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Vendor payment webhook error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

function getSubscriptionExpiryDate(duration: string): string {
  const now = new Date();
  
  switch (duration) {
    case "1 mois":
      now.setMonth(now.getMonth() + 1);
      break;
    case "3 mois":
      now.setMonth(now.getMonth() + 3);
      break;
    case "12 mois":
      now.setFullYear(now.getFullYear() + 1);
      break;
    default:
      now.setMonth(now.getMonth() + 1); // Par défaut 1 mois
  }
  
  return now.toISOString();
}