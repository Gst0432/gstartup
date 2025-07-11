import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Zap, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  Bell
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AutomationStats {
  processedOrders: number;
  failedOrders: number;
  lastProcessAt: string | null;
  pendingRevenue: number;
  autoProcessEnabled: boolean;
}

export const VendorAutomationWidget = () => {
  const [stats, setStats] = useState<AutomationStats>({
    processedOrders: 0,
    failedOrders: 0,
    lastProcessAt: null,
    pendingRevenue: 0,
    autoProcessEnabled: true
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAutomationStats();
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadAutomationStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAutomationStats = async () => {
    try {
      // Charger les logs d'auto-processus récents
      const { data: logs } = await supabase
        .from('auto_process_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (logs && logs.length > 0) {
        const latestLog = logs[0];
        setStats(prev => ({
          ...prev,
          processedOrders: latestLog.processed_orders || 0,
          failedOrders: (latestLog.total_orders || 0) - (latestLog.processed_orders || 0),
          lastProcessAt: latestLog.created_at
        }));
      }

      // Charger les commandes en attente pour ce vendeur
      const { data: pendingOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('status', 'pending')
        .eq('payment_status', 'pending');

      if (pendingOrders) {
        const pendingRevenue = pendingOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        setStats(prev => ({ ...prev, pendingRevenue }));
      }

    } catch (error) {
      console.error('Error loading automation stats:', error);
    }
  };

  const triggerManualProcess = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('reconcile-orders', {
        body: { manual: true }
      });

      if (error) throw error;

      toast({
        title: "Processus déclenché",
        description: "La réconciliation manuelle a été lancée",
      });

      // Recharger les stats après 5 secondes
      setTimeout(loadAutomationStats, 5000);
    } catch (error) {
      console.error('Error triggering manual process:', error);
      toast({
        title: "Erreur",
        description: "Impossible de déclencher le processus",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (stats.failedOrders > 0) return 'text-red-500';
    if (stats.processedOrders > 0) return 'text-green-500';
    return 'text-yellow-500';
  };

  const getStatusIcon = () => {
    if (stats.failedOrders > 0) return <XCircle className="h-4 w-4 text-red-500" />;
    if (stats.processedOrders > 0) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  return (
    <Card className="border-l-4 border-l-emerald-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-emerald-500" />
            Automatisation des Ventes
          </div>
          <Badge variant={stats.autoProcessEnabled ? "default" : "secondary"}>
            {stats.autoProcessEnabled ? "Actif" : "Inactif"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Statistiques temps réel */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{stats.processedOrders}</div>
            <div className="text-xs text-muted-foreground">Traitées</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-600">
              {stats.pendingRevenue.toLocaleString()} FCFA
            </div>
            <div className="text-xs text-muted-foreground">En attente</div>
          </div>
        </div>

        {/* Statut du système */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {stats.failedOrders > 0 
                ? `${stats.failedOrders} échecs détectés`
                : stats.processedOrders > 0
                ? "Système opérationnel"
                : "En attente de traitement"
              }
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {stats.lastProcessAt 
              ? `Dernier: ${new Date(stats.lastProcessAt).toLocaleTimeString('fr-FR')}`
              : "Aucun traitement récent"
            }
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={triggerManualProcess}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Vérifier maintenant
          </Button>
          {stats.pendingRevenue > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <Bell className="h-3 w-3" />
              {stats.pendingRevenue.toLocaleString()} FCFA en attente
            </Badge>
          )}
        </div>

        {/* Informations sur l'automatisation */}
        <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-3 w-3" />
            <span className="font-medium">Automatisation active</span>
          </div>
          <p>
            Les commandes sont automatiquement vérifiées et confirmées toutes les 5 minutes. 
            La réconciliation des commandes bloquées s'effectue chaque heure.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};