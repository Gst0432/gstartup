import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Clock, CheckCircle } from 'lucide-react';
import { VendorOrdersStats } from '@/types/vendorOrders';

interface VendorOrdersStatsProps {
  stats: VendorOrdersStats;
}

export const VendorOrdersStatsCards = ({ stats }: VendorOrdersStatsProps) => {
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Revenus Confirmés
          </CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} FCFA</div>
          <p className="text-xs text-muted-foreground">
            Commandes payées seulement
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            À Expédier
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingOrders}</div>
          <p className="text-xs text-muted-foreground">
            Commandes non expédiées
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Expédiées/Livrées
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.fulfilledOrders}</div>
          <p className="text-xs text-muted-foreground">
            Commandes terminées
          </p>
        </CardContent>
      </Card>
    </div>
  );
};