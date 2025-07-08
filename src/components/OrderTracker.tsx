import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, Package, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TrackedOrder {
  id: string;
  order_number: string;
  reference_code: string;
  status: string;
  payment_status: string;
  total_amount: number;
  currency: string;
  created_at: string;
}

export function OrderTracker() {
  const [referenceCode, setReferenceCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState<TrackedOrder | null>(null);
  const { toast } = useToast();

  const trackOrder = async () => {
    if (!referenceCode.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un code de référence",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, reference_code, status, payment_status, total_amount, currency, created_at')
        .eq('reference_code', referenceCode.toUpperCase().trim())
        .single();

      if (error || !data) {
        toast({
          title: "Commande non trouvée",
          description: "Aucune commande trouvée avec ce code de référence",
          variant: "destructive"
        });
        setTrackedOrder(null);
        return;
      }

      setTrackedOrder(data);
      toast({
        title: "Commande trouvée",
        description: "Voici les détails de votre commande"
      });

    } catch (error) {
      console.error('Error tracking order:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la recherche de la commande",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'paid': 
        return 'default';
      case 'pending': 
        return 'secondary';
      case 'cancelled':
      case 'failed': 
        return 'destructive';
      default: 
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'processing': return 'En traitement';
      case 'shipped': return 'Expédiée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      case 'paid': return 'Payée';
      case 'failed': return 'Échouée';
      default: return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Suivre une commande
        </CardTitle>
        <CardDescription>
          Entrez votre code de référence pour suivre l'état de votre commande
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Ex: ORDABC123"
            value={referenceCode}
            onChange={(e) => setReferenceCode(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && trackOrder()}
          />
          <Button onClick={trackOrder} disabled={loading}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {trackedOrder && (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Commande #{trackedOrder.order_number}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(trackedOrder.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {trackedOrder.total_amount.toLocaleString()} {trackedOrder.currency}
                </p>
                <code className="text-xs bg-muted px-2 py-1 rounded">
                  {trackedOrder.reference_code}
                </code>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Badge variant={getStatusBadgeVariant(trackedOrder.status)}>
                  {getStatusLabel(trackedOrder.status)}
                </Badge>
                <Badge variant={getStatusBadgeVariant(trackedOrder.payment_status)}>
                  Paiement: {getStatusLabel(trackedOrder.payment_status)}
                </Badge>
              </div>
              
              <Link to={`/orders`}>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Voir détails
                </Button>
              </Link>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>
            💡 <strong>Astuce:</strong> Votre code de référence vous a été envoyé par email 
            après votre achat. Vous pouvez aussi le retrouver dans votre espace client.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}