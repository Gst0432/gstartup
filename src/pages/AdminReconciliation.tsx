import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DashboardHeader } from '@/components/DashboardHeader';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  Zap,
  AlertTriangle,
  TrendingUp,
  ShoppingCart,
  CreditCard,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface StuckOrder {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  user_id: string;
  profiles: {
    display_name: string;
    email: string;
  };
}

interface PendingSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  status: string;
  created_at: string;
  profiles?: {
    display_name: string;
    email: string;
  };
}

interface AutoProcessLog {
  id: string;
  processed_orders: number;
  total_orders: number;
  execution_time: string | null;
  created_at: string;
  errors: any;
}

export default function AdminReconciliation() {
  const [stuckOrders, setStuckOrders] = useState<StuckOrder[]>([]);
  const [pendingSubscriptions, setPendingSubscriptions] = useState<PendingSubscription[]>([]);
  const [autoProcessLogs, setAutoProcessLogs] = useState<AutoProcessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      // Charger les commandes bloquées (pending > 1 heure)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          *,
          profiles (display_name, email)
        `)
        .eq('status', 'pending')
        .eq('payment_status', 'pending')
        .lt('created_at', oneHourAgo)
        .order('created_at', { ascending: false });

      if (orders) setStuckOrders(orders);

      // Charger les abonnements en attente
      const { data: subscriptions } = await supabase
        .from('vendor_subscriptions')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (subscriptions) {
        // Enrichir avec les profils utilisateur
        const enrichedSubs = await Promise.all(
          subscriptions.map(async (sub) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('display_name, email')
              .eq('user_id', sub.user_id)
              .single();
            
            return { ...sub, profiles: profile };
          })
        );
        setPendingSubscriptions(enrichedSubs);
      }

      // Charger les logs d'auto-processus récents
      const { data: logs } = await supabase
        .from('auto_process_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (logs) {
        setAutoProcessLogs(logs.map(log => ({
          ...log,
          execution_time: log.execution_time ? String(log.execution_time) : null
        })));
      }

    } catch (error) {
      console.error('Error loading reconciliation data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de réconciliation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerReconciliation = async () => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('reconcile-orders', {
        body: { manual: true, admin: true }
      });

      if (error) throw error;

      toast({
        title: "Réconciliation lancée",
        description: "Le processus de réconciliation a été déclenché manuellement",
      });

      // Recharger les données après 10 secondes
      setTimeout(loadData, 10000);
    } catch (error) {
      console.error('Error triggering reconciliation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de déclencher la réconciliation",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const triggerAutoProcess = async () => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('auto-process-orders', {
        body: { manual: true }
      });

      if (error) throw error;

      toast({
        title: "Auto-processus lancé",
        description: "Le traitement automatique des commandes a été déclenché",
      });

      setTimeout(loadData, 10000);
    } catch (error) {
      console.error('Error triggering auto-process:', error);
      toast({
        title: "Erreur",
        description: "Impossible de déclencher l'auto-processus",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const approveSubscription = async (subscriptionId: string) => {
    try {
      // Mettre à jour le statut de l'abonnement à "confirmed"
      const { error } = await supabase
        .from('vendor_subscriptions')
        .update({ 
          status: 'confirmed',
          payment_confirmed_at: new Date().toISOString()
        })
        .eq('id', subscriptionId);

      if (error) throw error;

      toast({
        title: "Abonnement approuvé",
        description: "L'abonnement vendeur a été approuvé manuellement",
      });

      loadData();
    } catch (error) {
      console.error('Error approving subscription:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'approuver l'abonnement",
        variant: "destructive"
      });
    }
  };

  const confirmOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'confirmed',
          payment_status: 'paid'
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Commande confirmée",
        description: "La commande a été confirmée manuellement",
      });

      loadData();
    } catch (error) {
      console.error('Error confirming order:', error);
      toast({
        title: "Erreur",
        description: "Impossible de confirmer la commande",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">En attente</Badge>;
      case 'confirmed': return <Badge variant="default">Confirmé</Badge>;
      case 'failed': return <Badge variant="destructive">Échoué</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = {
    stuckOrdersCount: stuckOrders.length,
    pendingSubscriptionsCount: pendingSubscriptions.length,
    totalStuckRevenue: stuckOrders.reduce((sum, order) => sum + order.total_amount, 0),
    lastProcessSuccess: autoProcessLogs.length > 0 ? autoProcessLogs[0].processed_orders : 0
  };

  return (
    <DashboardLayout>
      <DashboardHeader 
        title="Réconciliation et Automatisation" 
        description="Gestion des processus automatiques et résolution des problèmes"
      />
      
      <div className="space-y-6 p-6">
        {/* Vue d'ensemble */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Commandes Bloquées</p>
                  <p className="text-2xl font-bold text-red-600">{stats.stuckOrdersCount}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Abonnements Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingSubscriptionsCount}</p>
                </div>
                <Users className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Revenus Bloqués</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {stats.totalStuckRevenue.toLocaleString()} FCFA
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dernier Traitement</p>
                  <p className="text-2xl font-bold text-green-600">{stats.lastProcessSuccess}</p>
                  <p className="text-xs text-muted-foreground">commandes traitées</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Actions d'Administration
            </CardTitle>
            <CardDescription>
              Déclenchez manuellement les processus d'automatisation
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button 
              onClick={triggerReconciliation} 
              disabled={processing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${processing ? 'animate-spin' : ''}`} />
              Lancer Réconciliation
            </Button>
            <Button 
              variant="outline"
              onClick={triggerAutoProcess} 
              disabled={processing}
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Traiter Commandes
            </Button>
            <Button 
              variant="outline"
              onClick={loadData}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </Button>
          </CardContent>
        </Card>

        {/* Onglets de gestion */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Commandes Bloquées ({stuckOrders.length})
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Abonnements ({pendingSubscriptions.length})
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Logs d'Activité
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Commandes Bloquées</CardTitle>
                <CardDescription>
                  Commandes en attente depuis plus d'une heure
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stuckOrders.length === 0 ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Aucune commande bloquée détectée. Le système fonctionne normalement.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {stuckOrders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Commande #{order.order_number}</div>
                            <div className="text-sm text-muted-foreground">
                              Client: {order.profiles?.display_name} ({order.profiles?.email})
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Créée: {new Date(order.created_at).toLocaleString('fr-FR')}
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <div className="font-bold">{order.total_amount.toLocaleString()} FCFA</div>
                            <div className="flex gap-2">
                              {getStatusBadge(order.status)}
                              {getStatusBadge(order.payment_status)}
                            </div>
                            <Button size="sm" onClick={() => confirmOrder(order.id)}>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Confirmer
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Abonnements en Attente</CardTitle>
                <CardDescription>
                  Abonnements vendeurs nécessitant une approbation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingSubscriptions.length === 0 ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Aucun abonnement en attente d'approbation.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {pendingSubscriptions.map((subscription) => (
                      <div key={subscription.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Plan: {subscription.plan_id}</div>
                            <div className="text-sm text-muted-foreground">
                              Utilisateur: {subscription.profiles?.display_name} ({subscription.profiles?.email})
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Créé: {new Date(subscription.created_at).toLocaleString('fr-FR')}
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <div className="font-bold">{subscription.amount.toLocaleString()} FCFA</div>
                            {getStatusBadge(subscription.status)}
                            <Button size="sm" onClick={() => approveSubscription(subscription.id)}>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approuver
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Logs d'Auto-Processus</CardTitle>
                <CardDescription>
                  Historique des exécutions automatiques
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {autoProcessLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {log.processed_orders}/{log.total_orders} commandes traitées
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Exécuté: {new Date(log.created_at).toLocaleString('fr-FR')}
                          </div>
                          {log.execution_time && (
                            <div className="text-sm text-muted-foreground">
                              Durée: {log.execution_time}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {log.errors ? (
                            <XCircle className="h-5 w-5 text-red-500" />
                          ) : log.processed_orders > 0 ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                      </div>
                      {log.errors && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Erreurs détectées: {JSON.stringify(log.errors)}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}