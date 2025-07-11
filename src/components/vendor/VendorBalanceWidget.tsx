import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { 
  Wallet, 
  TrendingUp, 
  ArrowUp, 
  ArrowDown,
  RefreshCw,
  Eye,
  CreditCard
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface VendorBalance {
  available_balance: number;
  pending_balance: number;
  total_earned: number;
  total_withdrawn: number;
}

interface RecentTransaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  created_at: string;
}

export const VendorBalanceWidget = () => {
  const [balance, setBalance] = useState<VendorBalance>({
    available_balance: 0,
    pending_balance: 0,
    total_earned: 0,
    total_withdrawn: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadBalance();
      // Rafraîchir toutes les 60 secondes
      const interval = setInterval(loadBalance, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadBalance = async () => {
    try {
      // Récupérer d'abord l'ID vendeur
      const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (!vendor) return;

      // Charger le solde vendeur
      const { data: balanceData } = await supabase
        .from('vendor_balances')
        .select('*')
        .eq('vendor_id', vendor.id)
        .single();

      if (balanceData) {
        setBalance(balanceData);
      }

      // Charger les transactions récentes
      const { data: transactions } = await supabase
        .from('vendor_transactions')
        .select('*')
        .eq('vendor_id', vendor.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (transactions) {
        setRecentTransactions(transactions);
      }

    } catch (error) {
      console.error('Error loading balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshBalance = async () => {
    setLoading(true);
    await loadBalance();
    toast({
      title: "Solde mis à jour",
      description: "Les informations de votre solde ont été rafraîchies",
    });
  };

  const getTransactionIcon = (type: string) => {
    return type === 'sale' ? <ArrowUp className="h-3 w-3 text-green-500" /> : <ArrowDown className="h-3 w-3 text-red-500" />;
  };

  const getTransactionColor = (type: string) => {
    return type === 'sale' ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
          <div className="h-8 bg-muted rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-emerald-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-500" />
            Balance Vendeur
          </div>
          <Button variant="ghost" size="sm" onClick={refreshBalance}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Soldes principaux */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {balance.available_balance.toLocaleString()} FCFA
            </div>
            <div className="text-sm text-green-700 font-medium">Disponible</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">
              {balance.pending_balance.toLocaleString()} FCFA
            </div>
            <div className="text-sm text-orange-700 font-medium">En attente</div>
          </div>
        </div>

        {/* Statistiques de performance */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Total gagné</span>
            <span className="font-bold text-lg">{balance.total_earned.toLocaleString()} FCFA</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total retiré</span>
            <span className="font-bold text-lg">{balance.total_withdrawn.toLocaleString()} FCFA</span>
          </div>
        </div>

        {/* Transactions récentes */}
        {recentTransactions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Transactions récentes
            </h4>
            <div className="space-y-2">
              {recentTransactions.slice(0, 3).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div className="flex items-center gap-2">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <div className="text-sm font-medium">{transaction.description}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  <div className={`font-medium ${getTransactionColor(transaction.type)}`}>
                    {transaction.type === 'sale' ? '+' : '-'}{transaction.amount.toLocaleString()} FCFA
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => navigate('/vendor/withdrawals')}
            disabled={balance.available_balance <= 0}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Retirer
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/vendor/payments')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Historique
          </Button>
        </div>

        {/* Notification si solde disponible */}
        {balance.available_balance > 1000 && (
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-emerald-700">
              <Wallet className="h-4 w-4" />
              <span className="text-sm font-medium">
                Vous avez {balance.available_balance.toLocaleString()} FCFA prêts à être retirés !
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};