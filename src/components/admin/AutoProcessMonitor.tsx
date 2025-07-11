import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProcessLog {
  id: string;
  processed_orders: number;
  total_orders: number;
  errors: any;
  execution_time: unknown;
  created_at: string;
}

export const AutoProcessMonitor = () => {
  const [logs, setLogs] = useState<ProcessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('auto_process_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const runManualProcess = async () => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('auto-process-orders', {
        body: { source: 'manual' }
      });

      if (error) throw error;

      toast({
        title: "Processus lancé",
        description: `${data.processed}/${data.total} commandes traitées`,
      });

      // Recharger les logs après un délai
      setTimeout(fetchLogs, 2000);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de lancer le processus",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    
    // Auto-refresh toutes les 30 secondes
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (interval: unknown) => {
    if (!interval || typeof interval !== 'string') return 'N/A';
    const match = interval.match(/PT(\d+\.\d+)S/);
    return match ? `${parseFloat(match[1]).toFixed(2)}s` : String(interval);
  };

  const getStatusBadge = (log: ProcessLog) => {
    if (log.errors && Object.keys(log.errors).length > 0) {
      return <Badge variant="destructive">Erreurs</Badge>;
    }
    if (log.processed_orders > 0) {
      return <Badge className="bg-green-500">Succès</Badge>;
    }
    return <Badge variant="secondary">Aucune commande</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Automatisation des Commandes
          </CardTitle>
          <CardDescription>
            Processus automatique de validation des paiements et livraison des produits numériques
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={runManualProcess}
              disabled={processing}
              className="flex items-center gap-2"
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Lancer manuellement
            </Button>
            
            <Button
              variant="outline"
              onClick={fetchLogs}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Exécution automatique toutes les 5 minutes
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historique des Traitements</CardTitle>
          <CardDescription>
            Dernières exécutions du processus automatique
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun log disponible
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div 
                  key={log.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {log.processed_orders > 0 ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : log.errors ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-500" />
                      )}
                      {getStatusBadge(log)}
                    </div>
                    
                    <div>
                      <div className="font-medium">
                        {log.processed_orders}/{log.total_orders} commandes traitées
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(log.created_at).toLocaleString('fr-FR')} • 
                        Durée: {formatDuration(log.execution_time)}
                      </div>
                    </div>
                  </div>

                  {log.errors && Object.keys(log.errors).length > 0 && (
                    <div className="text-sm text-red-600">
                      {Object.keys(log.errors).length} erreur(s)
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comment ça fonctionne</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-blue-500" />
                <span className="font-medium">1. Vérification</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Le système vérifie les commandes avec des paiements Moneroo confirmés
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">2. Confirmation</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Les commandes sont automatiquement marquées comme confirmées et payées
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-purple-500" />
                <span className="font-medium">3. Livraison</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Les produits numériques sont envoyés par email avec les liens de téléchargement
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};