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
      // Get vendor info
      const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', profile?.user_id)
        .single();

      if (!vendor) {
        toast({
          title: "Erreur",
          description: "Profil vendeur non trouvé",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('order_items')
        .select(`
          *,
          orders!inner(
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
            profiles!inner(
              display_name,
              email,
              phone
            )
          )
        `)
        .eq('vendor_id', vendor.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      const transformedData = data?.map(item => ({
        ...item,
        order: {
          ...item.orders,
          profiles: item.orders.profiles
        }
      })) || [];

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