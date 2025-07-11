import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface VendorProductsHeaderProps {
  totalItems: number;
}

export function VendorProductsHeader({ totalItems }: VendorProductsHeaderProps) {
  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Mes Produits</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Gérer votre catalogue de produits
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
            <Badge variant="outline" className="gap-2 text-xs sm:text-sm">
              <Package className="h-3 w-3 sm:h-4 sm:w-4" />
              {totalItems} produit{totalItems > 1 ? 's' : ''}
            </Badge>
            <Link to="/vendor/products/new" className="w-full sm:w-auto">
              <Button className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Ajouter un produit
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}