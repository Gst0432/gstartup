import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Package, ArrowRight, Copy, Search, AlertCircle, Loader2 } from 'lucide-react';

interface OrderDetails {
  id: string;
  order_number: string;
  reference_code: string;
  total_amount: number;
  currency: string;
  status: string;
  payment_status: string;
  created_at: string;
  items: Array<{
    product_name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    status?: string;
  } | null>(null);
  const { toast } = useToast();
  
  const orderReference = searchParams.get('order') || localStorage.getItem('pending_order_reference');
  const paymentId = searchParams.get('paymentId');
  const paymentStatus = searchParams.get('paymentStatus');

  useEffect(() => {
    const initialize = async () => {
      // Si on a un paymentId, vérifier d'abord le paiement
      if (paymentId) {
        await verifyPayment();
      }
      
      if (orderReference) {
        await fetchOrderDetails();
        // Nettoyer le localStorage
        localStorage.removeItem('pending_order_reference');
      } else {
        setLoading(false);
      }
    };

    initialize();
  }, [orderReference, paymentId]);

  const verifyPayment = async () => {
    if (!paymentId) return;

    setIsVerifying(true);
    try {
      console.log('🔍 Verifying payment:', paymentId);
      
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { transactionId: paymentId }
      });

      if (error) {
        console.error('❌ Verification error:', error);
        setVerificationResult({ success: false });
        toast({
          title: "Erreur de vérification",
          description: "Impossible de vérifier le statut du paiement",
          variant: "destructive"
        });
      } else {
        console.log('✅ Verification result:', data);
        setVerificationResult({
          success: data.success && data.status === 'success',
          status: data.status
        });

        if (data.success && data.status === 'success') {
          toast({
            title: "Paiement confirmé",
            description: "Votre paiement a été traité avec succès",
            variant: "default"
          });
        }
      }
    } catch (error) {
      console.error('❌ Payment verification failed:', error);
      setVerificationResult({ success: false });
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la vérification",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const fetchOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            product_name,
            quantity,
            price,
            total
          )
        `)
        .eq('reference_code', orderReference)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les détails de la commande",
          variant: "destructive"
        });
        return;
      }

      setOrderDetails({
        ...data,
        items: data.order_items || []
      });

      setOrderDetails({
        ...data,
        items: data.order_items || []
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferenceCode = () => {
    if (orderDetails?.reference_code) {
      navigator.clipboard.writeText(orderDetails.reference_code);
      toast({
        title: "Copié",
        description: "Code de référence copié dans le presse-papiers"
      });
    }
  };

  if (loading || isVerifying) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
            <CardTitle>
              {isVerifying ? 'Vérification du paiement' : 'Chargement'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">
              {isVerifying 
                ? 'Nous vérifions le statut de votre paiement...'
                : 'Chargement des détails de votre commande...'
              }
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!orderReference || !orderDetails) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Commande non trouvée</h3>
            <p className="text-muted-foreground mb-4">
              Impossible de trouver les détails de votre commande
            </p>
            <Link to="/orders">
              <Button>Voir mes commandes</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* En-tête de succès/statut */}
          <Card className="mb-6">
            <CardContent className="text-center py-8">
              {verificationResult?.success === false ? (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              ) : verificationResult?.status === 'pending' ? (
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-yellow-600" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              )}
              
              <h1 className="text-2xl font-bold mb-2">
                {verificationResult?.success === false 
                  ? 'Problème de paiement'
                  : verificationResult?.status === 'pending'
                    ? 'Paiement en cours'
                    : 'Paiement réussi !'
                }
              </h1>
              
              <p className="text-muted-foreground mb-4">
                {verificationResult?.success === false 
                  ? 'Il y a eu un problème avec votre paiement. Contactez notre support si nécessaire.'
                  : verificationResult?.status === 'pending'
                    ? 'Votre paiement est en cours de traitement. Vous serez notifié une fois terminé.'
                    : 'Votre commande a été confirmée et sera traitée sous peu'
                }
              </p>
              
              {paymentId && (
                <div className="bg-muted p-3 rounded-lg mb-4">
                  <p className="text-sm text-muted-foreground">ID de transaction</p>
                  <p className="font-mono text-sm">{paymentId}</p>
                </div>
              )}
              
              <Badge variant="default" className="text-sm">
                <Package className="h-4 w-4 mr-1" />
                Commande #{orderDetails.order_number}
              </Badge>
            </CardContent>
          </Card>

          {/* Code de référence */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Code de suivi</CardTitle>
              <CardDescription>
                Utilisez ce code pour retrouver votre commande à tout moment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="flex-1 font-mono text-lg font-bold">
                  {orderDetails.reference_code}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyReferenceCode}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Gardez ce code précieusement. Vous pouvez l'utiliser sur votre tableau de bord 
                pour suivre l'état de votre commande.
              </p>
            </CardContent>
          </Card>

          {/* Détails de la commande */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Détails de la commande</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Statuts */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Statut de la commande:</span>
                  <Badge variant={
                    orderDetails.status === 'confirmed' ? 'default' : 
                    orderDetails.status === 'pending' ? 'secondary' : 'destructive'
                  }>
                    {orderDetails.status === 'confirmed' ? 'Confirmée' :
                     orderDetails.status === 'pending' ? 'En attente' : orderDetails.status}
                  </Badge>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Statut du paiement:</span>
                  <Badge variant={
                    orderDetails.payment_status === 'paid' ? 'default' : 
                    orderDetails.payment_status === 'pending' ? 'secondary' : 'destructive'
                  }>
                    {orderDetails.payment_status === 'paid' ? 'Payé' :
                     orderDetails.payment_status === 'pending' ? 'En attente' : 'Échoué'}
                  </Badge>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date de commande:</span>
                  <span>{new Date(orderDetails.created_at).toLocaleDateString('fr-FR')}</span>
                </div>

                {/* Articles */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Articles commandés:</h4>
                  <div className="space-y-2">
                    {orderDetails.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.product_name} × {item.quantity}</span>
                        <span className="font-medium">{item.total.toLocaleString()} {orderDetails.currency}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{orderDetails.total_amount.toLocaleString()} {orderDetails.currency}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Link to="/orders" className="flex-1">
              <Button className="w-full">
                Voir mes commandes
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link to="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Continuer mes achats
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}