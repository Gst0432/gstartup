import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { OrderItem } from '@/types/vendorOrders';

export const useVendorOrdersData = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      console.log('🔍 Fetching orders for user:', profile?.user_id);
      
      // Get vendor info
      const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', profile?.user_id)
        .single();

      console.log('👤 Vendor found:', vendor);

      if (!vendor) {
        toast({
          title: "Erreur",
          description: "Profil vendeur non trouvé",
          variant: "destructive"
        });
        return;
      }

      // Récupérer d'abord les order_items du vendeur
      const { data: orderItemsData, error: orderItemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          products(
            digital_file_url,
            is_digital
          )
        `)
        .eq('vendor_id', vendor.id)
        .order('created_at', { ascending: false });

      console.log('📋 Order items data:', { orderItemsData, orderItemsError });

      if (orderItemsError) {
        console.error('❌ Error fetching order items:', orderItemsError);
        return;
      }

      if (!orderItemsData || orderItemsData.length === 0) {
        console.log('📦 No order items found for vendor');
        setOrderItems([]);
        return;
      }

      // Récupérer les commandes correspondantes
      const orderIds = orderItemsData.map(item => item.order_id);
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          payment_status,
          fulfillment_status,
          total_amount,
          currency,
          created_at,
          updated_at,
          customer_notes,
          user_id
        `)
        .in('id', orderIds);

      console.log('📋 Orders data:', { ordersData, ordersError });

      if (ordersError) {
        console.error('❌ Error fetching orders:', ordersError);
        return;
      }

      // Créer un map des commandes pour jointure
      const ordersMap = ordersData?.reduce((acc, order) => {
        acc[order.id] = order;
        return acc;
      }, {} as Record<string, any>) || {};

      // Récupérer les profils des utilisateurs
      const userIds = ordersData ? [...new Set(ordersData.map(order => order.user_id).filter(Boolean))] : [];
      console.log('👥 User IDs to fetch:', userIds);
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, email, phone')
        .in('user_id', userIds);

      console.log('👤 Profiles found:', profiles);

      // Créer un map des profils pour une recherche rapide
      const profilesMap = profiles?.reduce((acc, profile) => {
        acc[profile.user_id] = profile;
        return acc;
      }, {} as Record<string, any>) || {};

      // Transformer les données en joignant order_items avec orders et profiles
      const transformedData = orderItemsData?.map(item => {
        const order = ordersMap[item.order_id];
        if (!order) {
          console.warn('⚠️ Order not found for item:', item.id);
          return null;
        }
        
        return {
          ...item,
          order: {
            ...order,
            profiles: profilesMap[order.user_id] || {
              display_name: 'Client anonyme',
              email: 'Non renseigné',
              phone: null
            }
          }
        };
      }).filter(Boolean) || [];

      console.log('✅ Transformed data:', transformedData.length, 'items');
      setOrderItems(transformedData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFulfillmentStatus = async (orderId: string, status: string, deliveryNote?: string) => {
    try {
      const updateData: any = {
        fulfillment_status: status,
        updated_at: new Date().toISOString()
      };

      // Ajouter une note de livraison si fournie
      if (deliveryNote?.trim()) {
        updateData.customer_notes = deliveryNote.trim();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le statut",
          variant: "destructive"
        });
        return false;
      }

      setOrderItems(orderItems.map(item => 
        item.order.id === orderId 
          ? { 
              ...item, 
              order: { 
                ...item.order, 
                fulfillment_status: status,
                customer_notes: updateData.customer_notes || item.order.customer_notes
              } 
            }
          : item
      ));

      // Messages personnalisés selon le statut
      let message = "Statut mis à jour avec succès";
      if (status === 'shipped') message = "Commande marquée comme expédiée";
      if (status === 'delivered') message = "Commande marquée comme livrée";

      toast({
        title: "Succès",
        description: message,
      });

      return true;
    } catch (error) {
      console.error('Error updating fulfillment status:', error);
      return false;
    }
  };

  useEffect(() => {
    if (profile) {
      fetchOrders();
    }
  }, [profile]);

  return {
    orderItems,
    loading,
    fetchOrders,
    updateFulfillmentStatus
  };
};