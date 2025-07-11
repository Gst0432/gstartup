import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderToProcess {
  id: string;
  order_number: string;
  user_id: string;
  payment_status: string;
  fulfillment_status: string;
  customer_email: string;
  customer_name: string;
  order_items: Array<{
    id: string;
    product_name: string;
    digital_file_url: string | null;
    is_digital: boolean;
  }>;
}

const logStep = (step: string, details?: any) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[${timestamp}] [AUTO-PROCESS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  );

  try {
    logStep("Démarrage du processus automatique de traitement des commandes");

    // 1. Récupérer toutes les commandes confirmées et payées non encore livrées
    const { data: ordersToProcess, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        user_id,
        payment_status,
        fulfillment_status,
        profiles!inner(email, display_name),
        order_items!inner(
          id,
          product_name,
          vendor_id,
          total,
          products(digital_file_url, is_digital)
        )
      `)
      .eq('status', 'confirmed')
      .eq('payment_status', 'paid')
      .eq('fulfillment_status', 'unfulfilled');

    if (ordersError) {
      logStep("Erreur lors de la récupération des commandes", ordersError);
      throw ordersError;
    }

    logStep(`Trouvé ${ordersToProcess?.length || 0} commandes à traiter`);

    if (!ordersToProcess || ordersToProcess.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Aucune commande à traiter",
        processed: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    let processedCount = 0;
    const errors: any[] = [];

    // 2. Traiter chaque commande
    for (const order of ordersToProcess) {
      try {
        logStep(`Traitement de la commande ${order.order_number}`, { orderId: order.id });

        // Mettre à jour le statut de la commande
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status: 'confirmed',
            payment_status: 'paid',
            fulfillment_status: 'delivered', // Automatiquement livré pour les produits numériques
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id);

        if (updateError) {
          logStep(`Erreur lors de la mise à jour de la commande ${order.order_number}`, updateError);
          errors.push({ order: order.order_number, error: updateError.message });
          continue;
        }

        // Vérifier s'il y a des produits numériques à envoyer
        const digitalProducts = order.order_items.filter(
          item => item.products?.is_digital && item.products?.digital_file_url
        );

        if (digitalProducts.length > 0) {
          logStep(`Envoi des produits numériques pour la commande ${order.order_number}`, {
            count: digitalProducts.length
          });

          // Envoyer l'email avec les liens de téléchargement
          await sendDigitalProductEmail(supabase, {
            customerEmail: order.profiles.email,
            customerName: order.profiles.display_name,
            orderNumber: order.order_number,
            products: digitalProducts.map(item => ({
              name: item.product_name,
              downloadUrl: item.products.digital_file_url
            }))
          });
        }

        // Envoyer email de notification de paiement aux vendeurs
        await notifyVendorsOfPayment(supabase, order);

        processedCount++;
        logStep(`Commande ${order.order_number} traitée avec succès`);

      } catch (error) {
        logStep(`Erreur lors du traitement de la commande ${order.order_number}`, error);
        errors.push({ order: order.order_number, error: error.message });
      }
    }

    // 3. Mettre à jour les balances des vendeurs
    logStep("Mise à jour des balances des vendeurs");
    await updateVendorBalances(supabase);

    const result = {
      success: true,
      processed: processedCount,
      total: ordersToProcess.length,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    };

    logStep("Processus automatique terminé", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    logStep("Erreur fatale dans le processus automatique", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

async function sendDigitalProductEmail(
  supabase: any, 
  data: {
    customerEmail: string;
    customerName: string;
    orderNumber: string;
    products: Array<{ name: string; downloadUrl: string }>;
  }
) {
  try {
    const { error } = await supabase.functions.invoke('send-email-notifications', {
      body: {
        type: 'digital_product_delivery',
        to: data.customerEmail,
        data: {
          customer_name: data.customerName,
          order_number: data.orderNumber,
          products: data.products
        }
      }
    });

    if (error) {
      logStep(`Erreur lors de l'envoi de l'email pour ${data.orderNumber}`, error);
    } else {
      logStep(`Email envoyé avec succès pour ${data.orderNumber}`);
    }
  } catch (error) {
    logStep(`Erreur lors de l'envoi de l'email pour ${data.orderNumber}`, error);
  }
}

async function updateVendorBalances(supabase: any) {
  try {
    // Récupérer les commandes récemment confirmées
    const { data: recentOrders } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        updated_at,
        order_items(
          vendor_id,
          total
        )
      `)
      .eq('status', 'confirmed')
      .eq('payment_status', 'paid')
      .gte('updated_at', new Date(Date.now() - 10 * 60 * 1000).toISOString()); // Dernières 10 minutes

    if (!recentOrders || recentOrders.length === 0) {
      logStep("Aucune commande récente à traiter pour les balances");
      return;
    }

    // Grouper par vendeur et calculer les montants
    const vendorTotals = new Map<string, number>();
    
    for (const order of recentOrders) {
      for (const item of order.order_items) {
        const currentTotal = vendorTotals.get(item.vendor_id) || 0;
        const vendorAmount = item.total; // 100% pour les vendeurs (commission = 0%)
        vendorTotals.set(item.vendor_id, currentTotal + vendorAmount);
      }
    }

    // Mettre à jour les balances des vendeurs
    for (const [vendorId, amount] of vendorTotals) {
      const { error } = await supabase
        .from('vendor_balances')
        .upsert({
          vendor_id: vendorId,
          available_balance: amount,
          total_earned: amount,
          pending_balance: 0,
          total_withdrawn: 0,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'vendor_id',
          ignoreDuplicates: false 
        });

      if (error) {
        logStep(`Erreur lors de la mise à jour de la balance pour le vendeur ${vendorId}`, error);
      } else {
        logStep(`Balance mise à jour pour le vendeur ${vendorId}`, { amount });
      }
    }

  } catch (error) {
    logStep("Erreur lors de la mise à jour des balances des vendeurs", error);
  }
}

async function notifyVendorsOfPayment(supabase: any, order: any) {
  try {
    // Grouper les items par vendeur
    const vendorGroups = new Map();
    
    for (const item of order.order_items) {
      if (!vendorGroups.has(item.vendor_id)) {
        vendorGroups.set(item.vendor_id, []);
      }
      vendorGroups.get(item.vendor_id).push(item);
    }

    // Envoyer un email à chaque vendeur
    for (const [vendorId, items] of vendorGroups) {
      // Récupérer les infos du vendeur
      const { data: vendor } = await supabase
        .from('vendors')
        .select(`
          business_name,
          notification_email,
          profiles!inner(email, display_name)
        `)
        .eq('id', vendorId)
        .single();

      if (!vendor) continue;

      const vendorEmail = vendor.notification_email || vendor.profiles.email;
      const totalAmount = items.reduce((sum: number, item: any) => sum + item.total, 0);

      // Envoyer email de notification de paiement
      await supabase.functions.invoke('send-email-notifications', {
        body: {
          type: 'payment_success',
          to: vendorEmail,
          data: {
            amount: totalAmount,
            currency: 'XAF',
            order_number: order.order_number,
            customer_name: order.profiles.display_name,
            payment_method: 'Moneroo',
            items: items.map((item: any) => ({
              product_name: item.product_name,
              quantity: item.quantity || 1,
              price: item.price || item.total,
              total: item.total
            }))
          }
        }
      });

      logStep(`Email de notification envoyé au vendeur ${vendor.business_name}`, {
        vendorId,
        email: vendorEmail,
        amount: totalAmount
      });
    }

  } catch (error) {
    logStep("Erreur lors de l'envoi des notifications aux vendeurs", error);
  }
}