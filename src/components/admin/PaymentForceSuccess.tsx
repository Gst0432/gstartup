import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface PaymentForceSuccessProps {
  onSuccess?: () => void;
}

export const PaymentForceSuccess = ({ onSuccess }: PaymentForceSuccessProps) => {
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleForceSuccess = async () => {
    if (!transactionId.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un ID de transaction",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('force-payment-success', {
        body: { transaction_id: transactionId.trim() }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.success) {
        toast({
          title: "✅ Succès",
          description: `Paiement marqué comme réussi pour la commande ${data.order_number}`,
        });
        setTransactionId('');
        onSuccess?.();
      } else {
        throw new Error(data.error || "Erreur inconnue");
      }
    } catch (error) {
      console.error('Error forcing payment success:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors du traitement",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Forcer le Succès d'un Paiement
        </CardTitle>
        <CardDescription>
          Marquer manuellement un paiement comme réussi et déclencher l'automatisation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="transaction-id" className="text-sm font-medium">
            ID de Transaction Moneroo
          </label>
          <Input
            id="transaction-id"
            placeholder="Ex: py_w6k8l98hbk5l"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            disabled={loading}
          />
          <p className="text-xs text-muted-foreground">
            Vous pouvez trouver l'ID dans la liste des transactions ci-dessous
          </p>
        </div>

        <Button 
          onClick={handleForceSuccess}
          disabled={loading || !transactionId.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Traitement...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Forcer le Succès
            </>
          )}
        </Button>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-xs text-yellow-800">
            ⚠️ <strong>Attention :</strong> Cette action marque le paiement comme réussi et déclenche automatiquement :
            <br />• La confirmation de la commande
            <br />• La livraison des produits numériques
            <br />• La mise à jour des balances vendeurs
            <br />• L'envoi des notifications
          </p>
        </div>
      </CardContent>
    </Card>
  );
};