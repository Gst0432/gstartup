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

    const { transaction_id, status = "success" } = await req.json();

    if (!transaction_id) {
      return new Response("Transaction ID required", { status: 400 });
    }

    // Simuler un webhook Moneroo
    const webhookData = {
      id: transaction_id,
      status: status,
      message: "Test webhook simulation",
      timestamp: new Date().toISOString()
    };

    console.log("Simulating Moneroo webhook for transaction:", transaction_id);

    // Appeler le webhook Moneroo
    const webhookResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/moneroo-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`
      },
      body: JSON.stringify(webhookData)
    });

    const webhookResult = await webhookResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Test webhook sent",
        webhook_response: webhookResult
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Test webhook error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});