import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DashboardHeader } from '@/components/DashboardHeader';
import { PaymentForceSuccess } from '@/components/admin/PaymentForceSuccess';
import { PendingTransactionsList } from '@/components/admin/PendingTransactionsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Zap, RefreshCw, AlertTriangle, CheckCircle, Clock, TrendingUp, Shield } from 'lucide-react';

export default function AdminPaymentRecovery() {
  const [selectedTransactionId, setSelectedTransactionId] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleForceAutoProcess = async () => {
    setProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('auto-process-orders');
      
      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "✅ Automatisation Déclenchée",
        description: `${data.processed || 0} commande(s) traitée(s) sur ${data.total || 0}`,
      });
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error triggering auto-process:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors du déclenchement",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSuccessfulPayment = () => {
    setRefreshTrigger(prev => prev + 1);
    setSelectedTransactionId('');
  };

  const handleTransactionSelect = (transactionId: string) => {
    setSelectedTransactionId(transactionId);
    // Scroll vers le formulaire
    document.getElementById('force-payment-form')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <DashboardLayout>
      <DashboardHeader 
        title="Récupération des Paiements" 
        description="Déblocage manuel des paiements et automatisation"
      />
      
      <div className="space-y-6 p-6">
        {/* Informations sur les statuts Moneroo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">Success</p>
                  <p className="text-xs text-green-600">Statut final ✓</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-800">Failed</p>
                  <p className="text-xs text-red-600">Statut final ✗</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Cancelled</p>
                  <p className="text-xs text-gray-600">Statut final ↻</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Pending</p>
                  <p className="text-xs text-blue-600">Transitoire ⏳</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-orange-800">Initiated</p>
                  <p className="text-xs text-orange-600">Transitoire 🚀</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert d'information */}
        <Alert className="border-blue-200 bg-blue-50">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Page de récupération des paiements :</strong> Utilisez cette interface pour débloquer manuellement les paiements Moneroo qui n'ont pas été confirmés automatiquement. Le système vérifie automatiquement les paiements toutes les 10 minutes.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulaire de forçage de paiement */}
          <div id="force-payment-form">
            <PaymentForceSuccess 
              onSuccess={handleSuccessfulPayment}
            />
            
            {selectedTransactionId && (
              <Card className="mt-4 border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Transaction sélectionnée: <code className="bg-green-100 px-1 rounded">{selectedTransactionId}</code>
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        Cliquez sur "Forcer le Succès" ci-dessus pour traiter cette transaction.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
            
          {/* Actions automatiques */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Actions Automatiques
              </CardTitle>
              <CardDescription>
                Outils pour débloquer les processus automatiques
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full justify-start"
                onClick={handleForceAutoProcess}
                disabled={processing}
              >
                {processing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Relancer l'Automatisation Complète
              </Button>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                <p className="text-xs text-blue-800 font-medium">
                  🔄 Processus automatique :
                </p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Traite toutes les commandes confirmées et payées</li>
                  <li>• Livre automatiquement les produits numériques</li>
                  <li>• Met à jour les balances des vendeurs</li>
                  <li>• Envoie les notifications par email</li>
                </ul>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Important :</strong> Le processus automatique ne traite que les commandes déjà confirmées. 
                  Pour débloquer un paiement, utilisez d'abord l'outil "Forcer le Succès" ci-contre.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Liste des transactions en attente */}
        <PendingTransactionsList 
          onTransactionSelect={handleTransactionSelect}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </DashboardLayout>
  );
}