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
    console.log('🚀 Process withdrawal function started');
    
    const { withdrawalRequestId } = await req.json();
    console.log('📦 Request data:', { withdrawalRequestId });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔐 Supabase client created');

    // Get withdrawal request details
    const { data: withdrawalRequest, error: requestError } = await supabase
      .from('withdrawal_requests')
      .select(`
        *,
        vendor:vendors!withdrawal_requests_vendor_id_fkey(
          id,
          business_name
        )
      `)
      .eq('id', withdrawalRequestId)
      .eq('status', 'approved')
      .single();

    if (requestError || !withdrawalRequest) {
      console.error('❌ Withdrawal request error:', requestError);
      throw new Error('Demande de retrait non trouvée ou non approuvée');
    }

    console.log('✅ Withdrawal request found:', { 
      id: withdrawalRequest.id, 
      amount: withdrawalRequest.amount,
      vendor: withdrawalRequest.vendor?.business_name 
    });

    // Get global Moneroo configuration
    const { data: globalConfig, error: configError } = await supabase
      .from('global_payment_config')
      .select('*')
      .eq('is_active', true)
      .single();

    if (configError || !globalConfig || !globalConfig.moneroo_api_key) {
      console.error('❌ Global payment config error:', configError);
      throw new Error('Configuration de paiement Moneroo non disponible');
    }

    console.log('✅ Moneroo config found');

    // Create Moneroo disbursement
    const monerooPayload = {
      amount: Math.round(withdrawalRequest.amount),
      currency: 'XAF',
      description: `Retrait pour ${withdrawalRequest.vendor.business_name} - ${withdrawalRequest.amount.toLocaleString()} FCFA`,
      phone: withdrawalRequest.moneroo_phone,
      metadata: {
        withdrawal_request_id: withdrawalRequest.id,
        vendor_id: withdrawalRequest.vendor_id,
        business_name: withdrawalRequest.vendor.business_name
      }
    };

    console.log('Creating Moneroo disbursement with payload:', JSON.stringify(monerooPayload, null, 2));

    // Call Moneroo disbursement API
    const monerooResponse = await fetch('https://api.moneroo.io/v1/disbursements', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${globalConfig.moneroo_api_key}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(monerooPayload),
    });

    const monerooData = await monerooResponse.json();
    console.log('Moneroo disbursement response:', monerooData);

    if (!monerooResponse.ok) {
      console.error('Moneroo disbursement error:', monerooData);
      
      // Update withdrawal request with error
      await supabase
        .from('withdrawal_requests')
        .update({
          status: 'rejected',
          rejection_reason: `Erreur Moneroo: ${monerooData.message || 'Erreur inconnue'}`,
          admin_notes: `Échec du transfert Moneroo: ${JSON.stringify(monerooData)}`,
          processed_at: new Date().toISOString()
        })
        .eq('id', withdrawalRequestId);

      throw new Error(`Erreur Moneroo: ${monerooData.message || 'Erreur inconnue'}`);
    }

    // Update withdrawal request as processed
    const { error: updateError } = await supabase
      .from('withdrawal_requests')
      .update({
        status: 'processed',
        moneroo_transaction_id: monerooData.data?.id || monerooData.id,
        admin_notes: 'Transfert Moneroo réussi',
        processed_at: new Date().toISOString()
      })
      .eq('id', withdrawalRequestId);

    if (updateError) {
      console.error('Error updating withdrawal request:', updateError);
      throw new Error('Erreur lors de la mise à jour de la demande');
    }

    // Create vendor transaction record
    await supabase
      .from('vendor_transactions')
      .insert({
        vendor_id: withdrawalRequest.vendor_id,
        type: 'withdrawal',
        amount: -withdrawalRequest.amount,
        description: `Retrait traité - ${withdrawalRequest.amount.toLocaleString()} FCFA via Moneroo`,
        withdrawal_request_id: withdrawalRequestId
      });

    console.log('✅ Withdrawal processed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Retrait traité avec succès',
        moneroo_transaction_id: monerooData.data?.id || monerooData.id
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Withdrawal processing error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erreur lors du traitement du retrait' 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});