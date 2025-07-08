
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PendingPurchase {
  productId: string;
  quantity: number;
  timestamp: number;
}

export const usePendingPurchase = () => {
  const [pendingPurchase, setPendingPurchase] = useState<PendingPurchase | null>(null);

  useEffect(() => {
    // Récupérer l'achat en attente au chargement
    const saved = localStorage.getItem('pending_purchase');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Vérifier que l'achat n'est pas trop ancien (30 minutes max)
        if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
          setPendingPurchase(parsed);
        } else {
          localStorage.removeItem('pending_purchase');
        }
      } catch (error) {
        console.error('Error parsing pending purchase:', error);
        localStorage.removeItem('pending_purchase');
      }
    }
  }, []);

  const savePendingPurchase = (productId: string, quantity: number = 1) => {
    const purchase: PendingPurchase = {
      productId,
      quantity,
      timestamp: Date.now()
    };
    localStorage.setItem('pending_purchase', JSON.stringify(purchase));
    setPendingPurchase(purchase);
  };

  const clearPendingPurchase = () => {
    localStorage.removeItem('pending_purchase');
    setPendingPurchase(null);
  };

  const executePendingPurchase = async () => {
    if (!pendingPurchase) return null;

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          productId: pendingPurchase.productId,
          quantity: pendingPurchase.quantity
        }
      });

      if (!error && data?.success && data?.payment_url) {
        clearPendingPurchase();
        return data.payment_url;
      }
      
      return null;
    } catch (error) {
      console.error('Error executing pending purchase:', error);
      return null;
    }
  };

  return {
    pendingPurchase,
    savePendingPurchase,
    clearPendingPurchase,
    executePendingPurchase
  };
};
