import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Clock, Wallet, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface WithdrawalRequest {
  id: string;
  vendor_id: string;
  amount: number;
  status: string;
  payment_method: string;
  moneroo_phone?: string;
  created_at: string;
  admin_notes?: string;
  rejection_reason?: string;
  vendor: {
    business_name: string;
    user_id: string;
  };
}

interface GlobalConfig {
  id: string;
  moneroo_api_key?: string;
  moneroo_secret_key?: string;
  is_active: boolean;
  test_mode: boolean;
  commission_rate: number;
}

export default function AdminWithdrawals() {
  const { toast } = useToast();
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [globalConfig, setGlobalConfig] = useState<GlobalConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [configForm, setConfigForm] = useState({
    moneroo_api_key: '',
    moneroo_secret_key: '',
    is_active: false,
    test_mode: true,
    commission_rate: 0.05
  });

  useEffect(() => {
    fetchWithdrawalRequests();
    fetchGlobalConfig();
  }, []);

  const fetchWithdrawalRequests = async () => {
    try {
      const { data: requests } = await supabase
        .from('withdrawal_requests')
        .select(`
          *,
          vendor:vendors!withdrawal_requests_vendor_id_fkey(
            business_name,
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      setWithdrawalRequests(requests || []);
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error);
    }
  };

  const fetchGlobalConfig = async () => {
    try {
      const { data: config } = await supabase
        .from('global_payment_config')
        .select('*')
        .single();

      if (config) {
        setGlobalConfig(config);
        setConfigForm({
          moneroo_api_key: config.moneroo_api_key || '',
          moneroo_secret_key: config.moneroo_secret_key || '',
          is_active: config.is_active,
          test_mode: config.test_mode,
          commission_rate: config.commission_rate
        });
      }
    } catch (error) {
      console.error('Error fetching global config:', error);
    }
  };

  const updateGlobalConfig = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('global_payment_config')
        .update(configForm)
        .eq('id', globalConfig?.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Configuration mise à jour avec succès"
      });

      setShowConfigDialog(false);
      fetchGlobalConfig();
    } catch (error) {
      console.error('Error updating config:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (requestId: string, approve: boolean) => {
    setLoading(true);
    try {
      const updateData: any = {
        status: approve ? 'approved' : 'rejected',
        admin_notes: adminNotes,
        processed_at: new Date().toISOString(),
        processed_by: 'admin' // In a real app, you'd use the actual admin user ID
      };

      if (!approve) {
        updateData.rejection_reason = rejectionReason;
      }

      const { error } = await supabase
        .from('withdrawal_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      if (approve) {
        // Update vendor balance
        const request = withdrawalRequests.find(r => r.id === requestId);
        if (request) {
          // First get current balance
          const { data: currentBalance } = await supabase
            .from('vendor_balances')
            .select('available_balance, total_withdrawn')
            .eq('vendor_id', request.vendor_id)
            .single();

          if (currentBalance) {
            await supabase
              .from('vendor_balances')
              .update({
                available_balance: currentBalance.available_balance - request.amount,
                total_withdrawn: currentBalance.total_withdrawn + request.amount
              })
              .eq('vendor_id', request.vendor_id);
          }

          // Create transaction record
          await supabase
            .from('vendor_transactions')
            .insert({
              vendor_id: request.vendor_id,
              type: 'withdrawal',
              amount: -request.amount,
              description: `Retrait approuvé - ${request.amount.toLocaleString()} FCFA`,
              withdrawal_request_id: requestId
            });
        }
      }

      toast({
        title: "Succès",
        description: `Demande ${approve ? 'approuvée' : 'rejetée'} avec succès`
      });

      setSelectedRequest(null);
      setAdminNotes('');
      setRejectionReason('');
      fetchWithdrawalRequests();
    } catch (error) {
      console.error('Error updating withdrawal request:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la mise à jour",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", icon: Clock },
      approved: { variant: "default", icon: Check },
      rejected: { variant: "destructive", icon: X },
      processed: { variant: "default", icon: Check }
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des Retraits</h1>
        <Button 
          onClick={() => setShowConfigDialog(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Configuration
        </Button>
      </div>

      {/* Global Config Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Configuration Moneroo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant={globalConfig?.is_active ? "default" : "secondary"}>
              {globalConfig?.is_active ? 'Active' : 'Inactive'}
            </Badge>
            <Badge variant={globalConfig?.test_mode ? "secondary" : "default"}>
              {globalConfig?.test_mode ? 'Mode Test' : 'Mode Production'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Commission: {((globalConfig?.commission_rate || 0) * 100).toFixed(1)}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Demandes de Retrait</CardTitle>
          <CardDescription>
            Gérez les demandes de retrait des vendeurs
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
                      <span className="font-medium">{request.vendor.business_name}</span>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold">{request.amount.toLocaleString()} FCFA</span>
                      {request.moneroo_phone && (
                        <span className="text-sm text-muted-foreground">
                          Moneroo: {request.moneroo_phone}
                        </span>
                      )}
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
                    {request.rejection_reason && (
                      <p className="text-sm text-destructive">
                        Rejet: {request.rejection_reason}
                      </p>
                    )}
                    {request.admin_notes && (
                      <p className="text-sm text-muted-foreground">
                        Notes: {request.admin_notes}
                      </p>
                    )}
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedRequest(request)}
                      >
                        Examiner
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Examiner la Demande de Retrait</DialogTitle>
            <DialogDescription>
              Vendeur: {selectedRequest?.vendor.business_name}<br />
              Montant: {selectedRequest?.amount.toLocaleString()} FCFA
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="adminNotes">Notes administratives</Label>
              <Textarea
                id="adminNotes"
                placeholder="Notes internes..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="rejectionReason">Raison du rejet (si applicable)</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Raison du rejet..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="destructive"
              onClick={() => handleApproval(selectedRequest!.id, false)}
              disabled={loading}
            >
              Rejeter
            </Button>
            <Button
              onClick={() => handleApproval(selectedRequest!.id, true)}
              disabled={loading}
            >
              Approuver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Config Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configuration Moneroo</DialogTitle>
            <DialogDescription>
              Configurez les paramètres globaux de paiement
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="moneroo_api_key">Clé API Moneroo</Label>
              <Input
                id="moneroo_api_key"
                type="password"
                value={configForm.moneroo_api_key}
                onChange={(e) => setConfigForm({ ...configForm, moneroo_api_key: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="moneroo_secret_key">Clé Secrète Moneroo</Label>
              <Input
                id="moneroo_secret_key"
                type="password"
                value={configForm.moneroo_secret_key}
                onChange={(e) => setConfigForm({ ...configForm, moneroo_secret_key: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="commission_rate">Taux de Commission (%)</Label>
              <Input
                id="commission_rate"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={configForm.commission_rate}
                onChange={(e) => setConfigForm({ ...configForm, commission_rate: parseFloat(e.target.value) })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={configForm.is_active}
                onChange={(e) => setConfigForm({ ...configForm, is_active: e.target.checked })}
              />
              <Label htmlFor="is_active">Activer les paiements</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="test_mode"
                checked={configForm.test_mode}
                onChange={(e) => setConfigForm({ ...configForm, test_mode: e.target.checked })}
              />
              <Label htmlFor="test_mode">Mode test</Label>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={updateGlobalConfig} disabled={loading}>
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}