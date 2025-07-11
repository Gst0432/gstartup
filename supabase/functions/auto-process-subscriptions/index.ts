import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessResult {
  processedSubscriptions: number;
  totalSubscriptions: number;
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

    console.log('🔄 Début du traitement automatique des abonnements...');

    // Récupérer les abonnements en attente
    const { data: pendingSubscriptions, error: subsError } = await supabase
      .from('vendor_subscriptions')
      .select(`
        id,
        user_id,
        plan_id,
        duration,
        amount,
        status,
        moneroo_transaction_id,
        transaction_number,
        created_at
      `)
      .eq('status', 'pending')
      .not('moneroo_transaction_id', 'is', null);

    if (subsError) {
      throw new Error(`Erreur lors de la récupération des abonnements: ${subsError.message}`);
    }

    console.log(`📋 ${pendingSubscriptions?.length || 0} abonnements en attente trouvés`);

    const result: ProcessResult = {
      processedSubscriptions: 0,
      totalSubscriptions: pendingSubscriptions?.length || 0,
      errors: []
    };

    if (!pendingSubscriptions || pendingSubscriptions.length === 0) {
      return Response.json({
        message: 'Aucun abonnement en attente à traiter',
        result
      }, { headers: corsHeaders });
    }

    // Récupérer la configuration Moneroo
    const { data: config } = await supabase
      .from('global_payment_config')
      .select('moneroo_api_key, test_mode')
      .eq('is_active', true)
      .single();

    if (!config?.moneroo_api_key) {
      throw new Error('Configuration Moneroo non trouvée');
    }

    // Traiter chaque abonnement
    for (const subscription of pendingSubscriptions) {
      try {
        console.log(`🔍 Vérification abonnement ${subscription.transaction_number}...`);

        // Vérifier le statut du paiement sur Moneroo
        const monerooResponse = await fetch(
          `https://api.moneroo.io/v1/payments/${subscription.moneroo_transaction_id}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${config.moneroo_api_key}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!monerooResponse.ok) {
          console.log(`❌ Erreur API Moneroo pour abonnement ${subscription.transaction_number}: ${monerooResponse.status}`);
          continue;
        }

        const monerooData = await monerooResponse.json();
        console.log(`📊 Statut Moneroo pour abonnement ${subscription.transaction_number}: ${monerooData.status}`);

        if (monerooData.status === 'success') {
          // Calculer la date d'expiration
          const now = new Date();
          const expirationDate = new Date(now);
          
          if (subscription.duration === 'monthly') {
            expirationDate.setMonth(expirationDate.getMonth() + 1);
          } else if (subscription.duration === 'yearly') {
            expirationDate.setFullYear(expirationDate.getFullYear() + 1);
          }

          // Mettre à jour l'abonnement
          await supabase
            .from('vendor_subscriptions')
            .update({
              status: 'active',
              payment_confirmed_at: new Date().toISOString(),
              webhook_data: monerooData,
              updated_at: new Date().toISOString()
            })
            .eq('id', subscription.id);

          // Activer le statut vendeur
          await supabase
            .from('vendors')
            .update({
              subscription_status: 'active',
              subscription_plan: subscription.plan_id,
              subscription_expires_at: expirationDate.toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', subscription.user_id);

          // Mettre à jour le rôle du profil
          await supabase
            .from('profiles')
            .update({
              role: 'vendor',
              updated_at: new Date().toISOString()
            })
            .eq('user_id', subscription.user_id);

          // Envoyer email de confirmation
          await supabase.functions.invoke('send-email-notifications', {
            body: {
              type: 'subscription_activated',
              user_id: subscription.user_id,
              data: {
                plan_id: subscription.plan_id,
                duration: subscription.duration,
                expires_at: expirationDate.toISOString(),
                amount: subscription.amount
              }
            }
          });

          result.processedSubscriptions++;
          console.log(`✅ Abonnement ${subscription.transaction_number} activé avec succès`);

        } else if (monerooData.status === 'failed' || monerooData.status === 'cancelled') {
          // Marquer l'abonnement comme échoué
          await supabase
            .from('vendor_subscriptions')
            .update({
              status: 'failed',
              webhook_data: monerooData,
              updated_at: new Date().toISOString()
            })
            .eq('id', subscription.id);

          console.log(`❌ Abonnement ${subscription.transaction_number} marqué comme échoué`);
        }

      } catch (error) {
        console.error(`❌ Erreur lors du traitement de l'abonnement ${subscription.transaction_number}:`, error);
        result.errors.push({
          subscription_id: subscription.id,
          transaction_number: subscription.transaction_number,
          error: error.message
        });
      }
    }

    console.log(`🎉 Traitement terminé: ${result.processedSubscriptions}/${result.totalSubscriptions} abonnements activés`);

    return Response.json({
      message: `Traitement terminé: ${result.processedSubscriptions} abonnements activés`,
      result
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('❌ Erreur lors du traitement des abonnements:', error);
    return Response.json(
      { error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
});