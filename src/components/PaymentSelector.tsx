import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, DollarSign, Smartphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PaymentGateway {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  test_mode: boolean;
  supported_currencies: string[];
}

interface PaymentSelectorProps {
  amount: number;
  currency: string;
  orderId: string;
  vendorId?: string; // Add vendorId to get vendor-specific payment gateways
  onPaymentComplete?: (success: boolean) => void;
}

export default function PaymentSelector({ amount, currency, orderId, vendorId, onPaymentComplete }: PaymentSelectorProps) {
  const { toast } = useToast();
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchActiveGateways();
  }, [vendorId, currency]);

  const fetchActiveGateways = async () => {
    try {
      if (!vendorId) {
        console.log('No vendorId provided');
        return;
      }

      // Récupérer les informations de paiement du vendeur
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('moneroo_enabled, moneyfusion_enabled, moneroo_api_key, moneyfusion_api_url')
        .eq('id', vendorId)
        .single();

      if (vendorError) {
        console.error('Error fetching vendor payment config:', vendorError);
        return;
      }

      const availableGateways: PaymentGateway[] = [];

      // Ajouter Moneroo si configuré et activé
      if (vendorData.moneroo_enabled && vendorData.moneroo_api_key) {
        availableGateways.push({
          id: 'moneroo',
          name: 'Moneroo',
          type: 'moneroo',
          is_active: true,
          test_mode: false,
          supported_currencies: ['XAF', 'FCFA']
        });
      }

      // Ajouter MoneyFusion si configuré et activé
      if (vendorData.moneyfusion_enabled && vendorData.moneyfusion_api_url) {
        availableGateways.push({
          id: 'moneyfusion',
          name: 'MoneyFusion',
          type: 'moneyfusion',
          is_active: true,
          test_mode: false,
          supported_currencies: ['XAF', 'FCFA']
        });
      }

      // Filtrer les passerelles qui supportent la devise
      const supportedGateways = availableGateways.filter(gateway => 
        gateway.supported_currencies.includes(currency)
      );

      setGateways(supportedGateways);
      if (supportedGateways.length > 0) {
        setSelectedGateway(supportedGateways[0].id);
      }
    } catch (error) {
      console.error('Error fetching vendor payment gateways:', error);
    }
  };

  const handlePayment = async () => {
    if (!selectedGateway) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une méthode de paiement",
        variant: "destructive"
      });
      return;
    }

    const gateway = gateways.find(g => g.id === selectedGateway);
    if (!gateway) return;

    setLoading(true);

    try {
      switch (gateway.type) {
        case 'moneroo':
          await handleMonerooPayment(orderId, amount);
          break;
        case 'moneyfusion':
          await handleMoneyFusionPayment(orderId, amount);
          break;
        case 'stripe':
          await handleStripePayment(orderId, amount);
          break;
        case 'orange_money':
          await handleOrangeMoneyPayment(orderId, amount);
          break;
        case 'moneyfusion_mobile':
          await handleMoneyFusionMobilePayment(orderId, amount);
          break;
        default:
          throw new Error('Passerelle non supportée');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Erreur de paiement",
        description: "Impossible de traiter le paiement",
        variant: "destructive"
      });
      onPaymentComplete?.(false);
    } finally {
      setLoading(false);
    }
  };

  const handleMonerooPayment = async (orderId: string, amount: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { productId: orderId, quantity: 1 }
      });

      if (error) throw error;

      if (data?.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (error) {
      throw error;
    }
  };

  const handleMoneyFusionPayment = async (orderId: string, amount: number) => {
    // Demander les informations du client
    const customerPhone = prompt("Entrez votre numéro de téléphone:");
    const customerName = prompt("Entrez votre nom complet:");
    
    if (!customerPhone || !customerName) {
      toast({
        title: "Informations requises",
        description: "Le numéro de téléphone et le nom sont requis pour MoneyFusion",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-moneyfusion-payment', {
        body: { 
          orderId, 
          amount,
          vendorId,
          customerPhone: customerPhone.trim(),
          customerName: customerName.trim()
        }
      });

      if (error) throw error;

      if (data?.payment_url) {
        window.open(data.payment_url, '_blank');
        onPaymentComplete?.(true);
      }
    } catch (error) {
      throw error;
    }
  };

  const handleStripePayment = async (orderId: string, amount: number) => {
    // TODO: Implémenter Stripe
    toast({
      title: "En développement",
      description: "Stripe sera bientôt disponible",
    });
  };

  const handleOrangeMoneyPayment = async (orderId: string, amount: number) => {
    // TODO: Implémenter Orange Money
    toast({
      title: "En développement", 
      description: "Orange Money sera bientôt disponible",
    });
  };

  const handleMoneyFusionMobilePayment = async (orderId: string, amount: number) => {
    // Réutiliser la même logique que MoneyFusion standard
    return handleMoneyFusionPayment(orderId, amount);
  };

  const getGatewayIcon = (type: string) => {
    switch (type) {
      case 'moneroo':
      case 'stripe':
        return CreditCard;
      case 'moneyfusion':
      case 'moneyfusion_mobile':
      case 'orange_money':
        return Smartphone;
      default:
        return DollarSign;
    }
  };

  if (gateways.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Aucune méthode de paiement disponible pour {currency}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Méthode de Paiement</CardTitle>
        <CardDescription>
          Choisissez votre méthode de paiement préférée
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          {gateways.map((gateway) => {
            const IconComponent = getGatewayIcon(gateway.type);
            return (
              <div
                key={gateway.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedGateway === gateway.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedGateway(gateway.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{gateway.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {gateway.supported_currencies.join(', ')}
                      </p>
                    </div>
                  </div>
                  {gateway.test_mode && (
                    <Badge variant="secondary" className="text-xs">
                      Test
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Montant total:</span>
            <span className="text-lg font-bold">
              {amount.toLocaleString()} {currency}
            </span>
          </div>
          
          <Button 
            onClick={handlePayment}
            disabled={loading || !selectedGateway}
            className="w-full"
            size="lg"
          >
            {loading ? 'Traitement...' : `Payer ${amount.toLocaleString()} ${currency}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}