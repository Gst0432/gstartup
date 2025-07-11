import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReconcileResult {
  processedOrders: number;
  totalOrders: number;
  errors: any[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔄 Début de la réconciliation des commandes...');

    // Récupérer toutes les commandes pending avec leurs transactions Moneroo
    const { data: pendingOrders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        payment_status,
        status,
        user_id,
        total_amount,
        moneroo_transactions(
          id,
          transaction_id,
          status,
          webhook_data
        )
      `)
      .eq('payment_status', 'pending')
      .not('moneroo_transactions', 'is', null);

    if (ordersError) {
      throw new Error(`Erreur lors de la récupération des commandes: ${ordersError.message}`);
    }

    console.log(`📋 ${pendingOrders?.length || 0} commandes en attente trouvées`);

    const result: ReconcileResult = {
      processedOrders: 0,
      totalOrders: pendingOrders?.length || 0,
      errors: []
    };

    if (!pendingOrders || pendingOrders.length === 0) {
      return Response.json({
        message: 'Aucune commande en attente à réconcilier',
        result
      }, { headers: corsHeaders });
    }

    // Récupérer la configuration Moneroo active
    const { data: config } = await supabase
      .from('global_payment_config')
      .select('moneroo_api_key, test_mode')
      .eq('is_active', true)
      .single();

    if (!config?.moneroo_api_key) {
      throw new Error('Configuration Moneroo non trouvée');
    }

    // Traiter chaque commande
    for (const order of pendingOrders) {
      try {
        console.log(`🔍 Vérification commande ${order.order_number}...`);

        if (!order.moneroo_transactions || order.moneroo_transactions.length === 0) {
          continue;
        }

        const transaction = order.moneroo_transactions[0];

        // Vérifier le statut sur Moneroo
        const monerooResponse = await fetch(
          `https://api.moneroo.io/v1/payments/${transaction.transaction_id}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${config.moneroo_api_key}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!monerooResponse.ok) {
          console.log(`❌ Erreur API Moneroo pour ${order.order_number}: ${monerooResponse.status}`);
          continue;
        }

        const monerooData = await monerooResponse.json();
        console.log(`📊 Statut Moneroo pour ${order.order_number}: ${monerooData.status}`);

        // Si le paiement est réussi sur Moneroo mais pending dans notre base
        if (monerooData.status === 'success' && transaction.status !== 'success') {
          // Mettre à jour la transaction
          await supabase
            .from('moneroo_transactions')
            .update({
              status: 'success',
              webhook_data: monerooData,
              updated_at: new Date().toISOString()
            })
            .eq('id', transaction.id);

          // Mettre à jour la commande
          await supabase
            .from('orders')
            .update({
              status: 'confirmed',
              payment_status: 'paid',
              updated_at: new Date().toISOString()
            })
            .eq('id', order.id);

          // Envoyer les notifications
          await supabase.functions.invoke('send-email-notifications', {
            body: {
              type: 'order_confirmation',
              order_id: order.id
            }
          });

          result.processedOrders++;
          console.log(`✅ Commande ${order.order_number} réconciliée avec succès`);
        }

      } catch (error) {
        console.error(`❌ Erreur lors du traitement de la commande ${order.order_number}:`, error);
        result.errors.push({
          order_id: order.id,
          order_number: order.order_number,
          error: error.message
        });
      }
    }

    // Mettre à jour les balances des vendeurs si des commandes ont été traitées
    if (result.processedOrders > 0) {
      await supabase.functions.invoke('auto-process-orders');
    }

    console.log(`🎉 Réconciliation terminée: ${result.processedOrders}/${result.totalOrders} commandes traitées`);

    return Response.json({
      message: `Réconciliation terminée: ${result.processedOrders} commandes débloqueées`,
      result
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('❌ Erreur lors de la réconciliation:', error);
    return Response.json(
      { error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
});