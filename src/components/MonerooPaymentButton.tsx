import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Loader2 } from 'lucide-react';

interface CartItem {
  product_id: string;
  quantity: number;
  price: number;
  variant_id?: string;
}

interface MonerooPaymentButtonProps {
  cartItems: CartItem[];
  shippingAddress?: any;
  billingAddress?: any;
  paymentMethod?: string;
  onPaymentStart?: () => void;
  onPaymentSuccess?: (orderReference: string) => void;
  onPaymentError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export function MonerooPaymentButton({
  cartItems,
  shippingAddress,
  billingAddress,
  paymentMethod = "mobile_money",
  onPaymentStart,
  onPaymentSuccess,
  onPaymentError,
  disabled,
  className
}: MonerooPaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!cartItems.length) {
      toast({
        title: "Erreur",
        description: "Votre panier est vide",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    onPaymentStart?.();

    try {
      const { data, error } = await supabase.functions.invoke('create-moneroo-payment', {
        body: {
          cart_items: cartItems,
          shipping_address: shippingAddress,
          billing_address: billingAddress,
          payment_method: paymentMethod
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || "Erreur lors de la création du paiement");
      }

      // Stocker la référence de commande pour le suivi
      localStorage.setItem('pending_order_reference', data.order_reference);

      // Rediriger vers Moneroo pour le paiement
      window.location.href = data.payment_url;

      onPaymentSuccess?.(data.order_reference);

    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : "Erreur de paiement";
      
      toast({
        title: "Erreur de paiement",
        description: errorMessage,
        variant: "destructive"
      });

      onPaymentError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || loading || !cartItems.length}
      className={className}
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Traitement...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4 mr-2" />
          Payer avec Moneroo
        </>
      )}
    </Button>
  );
}