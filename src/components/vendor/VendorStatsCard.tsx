import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Store, Star } from 'lucide-react';

interface VendorStatsCardProps {
  vendor: {
    rating?: number | null;
    total_sales?: number | null;
    is_active: boolean;
    is_verified: boolean;
  } | null;
}

export function VendorStatsCard({ vendor }: VendorStatsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Statistiques
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">{vendor?.rating?.toFixed(1) || '0.0'}</div>
          <div className="flex items-center justify-center gap-1 mt-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.round(vendor?.rating || 0)
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-muted-foreground/30'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-1">Note moyenne</p>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
            <span className="text-sm font-medium">Ventes totales</span>
            <span className="text-lg font-bold text-primary">{vendor?.total_sales || 0}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
            <span className="text-sm font-medium">Statut</span>
            <Badge variant={vendor?.is_active ? "default" : "secondary"}>
              {vendor?.is_active ? "Actif" : "Inactif"}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
            <span className="text-sm font-medium">Vérification</span>
            <Badge variant={vendor?.is_verified ? "default" : "secondary"}>
              {vendor?.is_verified ? "Vérifié" : "En attente"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}