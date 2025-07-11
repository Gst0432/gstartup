import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Search, RefreshCw, CheckCircle, Clock, TrendingUp, Users, ShoppingCart, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  paidOrders: number;
  processingIssues: number;
  totalRevenue: number;
}

interface StuckOrder {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  customer_email: string;
  issue_type: string;
}

interface CronJobStatus {
  jobname: string;
  schedule: string;
  active: boolean;
}

export default function AdminOrdersMonitoring() {
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    pendingOrders: 0,
    paidOrders: 0,
    processingIssues: 0,
    totalRevenue: 0
  });
  
  const [stuckOrders, setStuckOrders] = useState<StuckOrder[]>([]);
  const [cronJobs, setCronJobs] = useState<CronJobStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadOrderStats(),
        loadStuckOrders(),
        loadCronJobStatus()
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadOrderStats = async () => {
    const { data: orders } = await supabase
      .from('orders')
      .select('status, payment_status, total_amount, created_at');

    if (orders) {
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(o => o.payment_status === 'pending').length;
      const paidOrders = orders.filter(o => o.payment_status === 'paid').length;
      const processingIssues = orders.filter(o => 
        o.payment_status === 'pending' && 
        new Date().getTime() - new Date(o.created_at).getTime() > 24 * 60 * 60 * 1000
      ).length;
      const totalRevenue = orders
        .filter(o => o.payment_status === 'paid')
        .reduce((sum, o) => sum + o.total_amount, 0);

      setStats({
        totalOrders,
        pendingOrders,
        paidOrders,
        processingIssues,
        totalRevenue
      });
    }
  };

  const loadStuckOrders = async () => {
    const { data: orders } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        payment_status,
        total_amount,
        created_at,
        user_id
      `)
      .or('payment_status.eq.pending,fulfillment_status.eq.unfulfilled')
      .order('created_at', { ascending: false });

    if (orders) {
      // Get customer emails
      const userIds = [...new Set(orders.map(o => o.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, email')
        .in('user_id', userIds);

      const profilesMap = profiles?.reduce((acc, p) => {
        acc[p.user_id] = p;
        return acc;
      }, {} as Record<string, any>) || {};

      const stuckOrdersData = orders.map(order => ({
        ...order,
        customer_email: profilesMap[order.user_id]?.email || 'Non renseigné',
        issue_type: getIssueType(order)
      }));

      setStuckOrders(stuckOrdersData);
    }
  };

  const loadCronJobStatus = async () => {
    try {
      const { data } = await supabase
        .from('cron_jobs_status')
        .select('*');
      
      setCronJobs(data || []);
    } catch (error) {
      console.error('Error loading cron jobs:', error);
    }
  };

  const getIssueType = (order: any): string => {
    const daysSinceCreated = Math.floor((Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24));
    
    if (order.payment_status === 'pending' && daysSinceCreated > 1) {
      return 'Payment Stuck';
    }
    if (order.payment_status === 'paid' && order.fulfillment_status === 'unfulfilled' && daysSinceCreated > 3) {
      return 'Fulfillment Delayed';
    }
    return 'Processing';
  };

  const triggerAutoProcess = async () => {
    try {
      const response = await fetch('/api/admin/trigger-auto-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        toast({
          title: "Succès",
          description: "Traitement automatique déclenché",
        });
        loadData();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de déclencher le traitement",
        variant: "destructive"
      });
    }
  };

  const reconcileOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'confirmed',
          payment_status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Commande réconciliée avec succès",
      });
      
      loadData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de réconcilier la commande",
        variant: "destructive"
      });
    }
  };

  const filteredOrders = stuckOrders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.payment_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default">Payé</Badge>;
      case 'pending':
        return <Badge variant="secondary">En attente</Badge>;
      case 'failed':
        return <Badge variant="destructive">Échoué</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getIssueBadge = (issueType: string) => {
    switch (issueType) {
      case 'Payment Stuck':
        return <Badge variant="destructive">Paiement bloqué</Badge>;
      case 'Fulfillment Delayed':
        return <Badge variant="secondary">Expédition retardée</Badge>;
      default:
        return <Badge variant="outline">En traitement</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-muted/30">
        <div className="border-b bg-background">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Surveillance des Commandes</h1>
                <p className="text-muted-foreground">
                  Surveillance en temps réel et outils de réconciliation
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button 
                  onClick={loadData} 
                  variant="outline"
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
                <Button onClick={triggerAutoProcess}>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Déclencher Auto-Process
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Métriques clés */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Commandes</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Attente</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Payées</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.paidOrders}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Problèmes</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.processingIssues}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenus</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} FCFA</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList>
              <TabsTrigger value="orders">Commandes Problématiques</TabsTrigger>
              <TabsTrigger value="automation">État de l'Automatisation</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Commandes Nécessitant une Attention</CardTitle>
                  <CardDescription>
                    Commandes avec des problèmes de paiement ou de traitement
                  </CardDescription>
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher par numéro de commande ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filtrer par statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="paid">Payé</SelectItem>
                        <SelectItem value="failed">Échoué</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-medium">#{order.order_number}</span>
                            {getStatusBadge(order.payment_status)}
                            {getIssueBadge(order.issue_type)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Client: {order.customer_email} • 
                            Montant: {order.total_amount.toLocaleString()} FCFA • 
                            Créée: {new Date(order.created_at).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => reconcileOrder(order.id)}
                            disabled={order.payment_status === 'paid'}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Réconcilier
                          </Button>
                        </div>
                      </div>
                    ))}
                    {filteredOrders.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Aucune commande problématique trouvée
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="automation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>État des Tâches Automatisées</CardTitle>
                  <CardDescription>
                    Surveillance des cron jobs et de l'automatisation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cronJobs.map((job) => (
                      <div
                        key={job.jobname}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{job.jobname}</div>
                          <div className="text-sm text-muted-foreground">
                            Programmation: {job.schedule}
                          </div>
                        </div>
                        <Badge variant={job.active ? "default" : "destructive"}>
                          {job.active ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                    ))}
                    {cronJobs.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Aucune tâche automatisée configurée
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}