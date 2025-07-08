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

    // This function will be triggered by Supabase auth webhooks or database triggers
    const { record, type } = await req.json();
    
    if (type === 'INSERT' && record.table === 'profiles') {
      console.log('New user registration detected:', record);
      
      // Send notification email to admin
      const emailResponse = await supabase.functions.invoke('send-email-notifications', {
        body: {
          type: 'user_registration',
          to: 'contact@gstartup.pro',
          data: {
            display_name: record.display_name,
            email: record.email,
            role: record.role,
            phone: record.phone,
            user_id: record.user_id
          }
        }
      });

      if (emailResponse.error) {
        console.error('Error sending registration notification:', emailResponse.error);
      } else {
        console.log('Registration notification sent successfully');
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error handling user registration:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});