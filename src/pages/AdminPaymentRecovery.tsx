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
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Shield } from 'lucide-react';

export default function AdminPaymentRecovery() {
  const [selectedTransactionId, setSelectedTransactionId] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const { toast } = useToast();


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
      
      <div className="space-y-4 md:space-y-6 p-4 md:p-6">
        {/* Informations sur les statuts Moneroo - Responsive grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-2 md:p-4">
              <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2">
                <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                <div className="text-center md:text-left">
                  <p className="text-xs md:text-sm font-medium text-green-800">Success</p>
                  <p className="text-xs text-green-600 hidden md:block">Statut final ✓</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-2 md:p-4">
              <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2">
                <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
                <div className="text-center md:text-left">
                  <p className="text-xs md:text-sm font-medium text-red-800">Failed</p>
                  <p className="text-xs text-red-600 hidden md:block">Statut final ✗</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="p-2 md:p-4">
              <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2">
                <Shield className="h-3 w-3 md:h-4 md:w-4 text-gray-600" />
                <div className="text-center md:text-left">
                  <p className="text-xs md:text-sm font-medium text-gray-800">Cancelled</p>
                  <p className="text-xs text-gray-600 hidden md:block">Statut final ↻</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-2 md:p-4">
              <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2">
                <Clock className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                <div className="text-center md:text-left">
                  <p className="text-xs md:text-sm font-medium text-blue-800">Pending</p>
                  <p className="text-xs text-blue-600 hidden md:block">Transitoire ⏳</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-2 md:p-4">
              <div className="flex flex-col md:flex-row items-center gap-1 md:gap-2">
                <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-orange-600" />
                <div className="text-center md:text-left">
                  <p className="text-xs md:text-sm font-medium text-orange-800">Initiated</p>
                  <p className="text-xs text-orange-600 hidden md:block">Transitoire 🚀</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert d'information */}
        <Alert className="border-blue-200 bg-blue-50">
          <AlertTriangle className="h-4 w-4 text-blue-600 flex-shrink-0" />
          <AlertDescription className="text-blue-800 text-sm">
            <strong>Page de récupération des paiements :</strong> Utilisez cette interface pour débloquer manuellement les paiements Moneroo qui n'ont pas été confirmés automatiquement. Le système vérifie automatiquement les paiements toutes les 10 minutes.
          </AlertDescription>
        </Alert>

        {/* Formulaire de forçage de paiement */}
        <div id="force-payment-form" className="max-w-2xl mx-auto">
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

        {/* Liste des transactions en attente */}
        <PendingTransactionsList 
          onTransactionSelect={handleTransactionSelect}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </DashboardLayout>
  );
}