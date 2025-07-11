import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';

interface VendorOrdersHeaderProps {
  ordersCount: number;
}

export const VendorOrdersHeader = ({ ordersCount }: VendorOrdersHeaderProps) => {
  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Mes Ventes</h1>
            <p className="text-muted-foreground">
              Commandes de vos produits uniquement
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              {ordersCount} commandes
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
};