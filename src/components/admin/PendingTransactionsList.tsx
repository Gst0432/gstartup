import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Copy, ExternalLink, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Transaction {
  id: string;
  transaction_id: string;
  status: string;
  amount: number;
  created_at: string;
  order_id: string;
  orders: {
    order_number: string;
    user_id: string;
  };
}

interface PendingTransactionsListProps {
  onTransactionSelect?: (transactionId: string) => void;
  refreshTrigger?: number;
}

export const PendingTransactionsList = ({ onTransactionSelect, refreshTrigger }: PendingTransactionsListProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('moneroo_transactions')
        .select(`
          id,
          transaction_id,
          status,
          amount,
          created_at,
          order_id,
          orders!inner(
            order_number,
            user_id
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        throw error;
      }

      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les transactions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [refreshTrigger]);

  const copyTransactionId = (transactionId: string) => {
    navigator.clipboard.writeText(transactionId);
    toast({
      title: "Copié",
      description: "ID de transaction copié dans le presse-papiers",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'En attente' },
      success: { variant: 'default' as const, label: 'Réussi' },
      failed: { variant: 'destructive' as const, label: 'Échoué' },
      cancelled: { variant: 'outline' as const, label: 'Annulé' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transactions en Attente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Transactions en Attente</CardTitle>
          <CardDescription>
            {transactions.length} transaction(s) en attente de confirmation
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTransactions}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucune transaction en attente
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {transaction.transaction_id}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyTransactionId(transaction.transaction_id)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Commande: {transaction.orders.order_number}</span>
                    <span>{transaction.amount} XAF</span>
                    <span>{format(new Date(transaction.created_at), 'dd MMM yyyy HH:mm', { locale: fr })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(transaction.status)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTransactionSelect?.(transaction.transaction_id)}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Sélectionner
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};