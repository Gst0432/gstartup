import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Wallet, TrendingUp, Clock, CheckCircle } from 'lucide-react';

interface VendorBalance {
  id: string;
  vendor_id: string;
  available_balance: number;
  pending_balance: number;
  total_earned: number;
  total_withdrawn: number;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  status: string;
  payment_method: string;
  moneroo_phone?: string;
  created_at: string;
  admin_notes?: string;
  rejection_reason?: string;
}

export default function VendorWithdrawals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState<VendorBalance | null>(null);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [monerooPhone, setMonerooPhone] = useState('');

  useEffect(() => {
    if (user) {
      fetchVendorBalance();
      fetchWithdrawalRequests();
    }
  }, [user]);

  const fetchVendorBalance = async () => {
    try {
      // Get vendor ID first
      const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (vendor) {
        const { data: balanceData } = await supabase
          .from('vendor_balances')
          .select('*')
          .eq('vendor_id', vendor.id)
          .single();

        setBalance(balanceData);
      }
    } catch (error) {
      console.error('Error fetching vendor balance:', error);
    }
  };

  const fetchWithdrawalRequests = async () => {
    try {
      // Get vendor ID first
      const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (vendor) {
        const { data: requests } = await supabase
          .from('withdrawal_requests')
          .select('*')
          .eq('vendor_id', vendor.id)
          .order('created_at', { ascending: false });

        setWithdrawalRequests(requests || []);
      }
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
    }
  };

  const handleWithdrawalRequest = async () => {
    if (!withdrawalAmount || !monerooPhone) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs requis",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(withdrawalAmount);
    if (amount <= 0 || amount > (balance?.available_balance || 0)) {
      toast({
        title: "Erreur",
        description: "Montant invalide ou insuffisant",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Get vendor ID
      const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (vendor) {
        const { error } = await supabase
          .from('withdrawal_requests')
          .insert({
            vendor_id: vendor.id,
            amount: amount,
            payment_method: 'moneroo',
            moneroo_phone: monerooPhone
          });

        if (error) throw error;

        toast({
          title: "Succès",
          description: "Demande de retrait soumise avec succès"
        });

        setWithdrawalAmount('');
        setMonerooPhone('');
        fetchWithdrawalRequests();
      }
    } catch (error) {
      console.error('Error creating withdrawal request:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la création de la demande",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", icon: Clock },
      approved: { variant: "default", icon: CheckCircle },
      rejected: { variant: "destructive", icon: Clock },
      processed: { variant: "default", icon: CheckCircle }
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status === 'pending' && 'En attente'}
        {status === 'approved' && 'Approuvée'}
        {status === 'rejected' && 'Rejetée'}
        {status === 'processed' && 'Traitée'}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-muted/30">
        <header className="bg-background border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Retraits</h1>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 space-y-6">

      {/* Balance Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solde Disponible</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {balance?.available_balance?.toLocaleString() || 0} FCFA
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gagné</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {balance?.total_earned?.toLocaleString() || 0} FCFA
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Retiré</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {balance?.total_withdrawn?.toLocaleString() || 0} FCFA
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Withdrawal Request */}
      <Card>
        <CardHeader>
          <CardTitle>Nouvelle Demande de Retrait</CardTitle>
          <CardDescription>
            Demandez un retrait de vos gains via GS Money
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Montant (FCFA)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Entrez le montant"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                max={balance?.available_balance || 0}
              />
              <p className="text-sm text-muted-foreground">
                Disponible: {balance?.available_balance?.toLocaleString() || 0} FCFA
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Email GS Money</Label>
              <Input
                id="phone"
                type="email"
                placeholder="votre@email.com"
                value={monerooPhone}
                onChange={(e) => setMonerooPhone(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Pas encore inscrit ? <a href="https://gsmoney.pro" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Créer un compte GS Money</a>
              </p>
            </div>
          </div>

          <Button 
            onClick={handleWithdrawalRequest}
            disabled={loading || !withdrawalAmount || !monerooPhone}
            className="w-full"
          >
            {loading ? 'Traitement...' : 'Demander le Retrait'}
          </Button>
        </CardContent>
      </Card>

      {/* Withdrawal History */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Retraits</CardTitle>
          <CardDescription>
            Vos demandes de retrait précédentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {withdrawalRequests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucune demande de retrait
              </p>
            ) : (
              withdrawalRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{request.amount.toLocaleString()} FCFA</span>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(request.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                     {request.moneroo_phone && (
                      <p className="text-sm text-muted-foreground">
                        GS Money: {request.moneroo_phone}
                      </p>
                    )}
                    {request.rejection_reason && (
                      <p className="text-sm text-destructive">
                        Raison du rejet: {request.rejection_reason}
                      </p>
                    )}
                    {request.admin_notes && (
                      <p className="text-sm text-muted-foreground">
                        Note admin: {request.admin_notes}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}