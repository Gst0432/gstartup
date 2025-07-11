import { AutoProcessMonitor } from '@/components/admin/AutoProcessMonitor';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DashboardHeader } from '@/components/DashboardHeader';

export default function AdminAutoProcess() {
  return (
    <DashboardLayout>
      <DashboardHeader 
        title="Automatisation des Commandes" 
        description="Gestion automatique des paiements et livraisons"
      />
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <AutoProcessMonitor />
        </div>
      </div>
    </DashboardLayout>
  );
}