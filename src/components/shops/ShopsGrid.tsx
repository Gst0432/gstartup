import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store } from 'lucide-react';
import { ShopCard } from './ShopCard';
import { Vendor } from '@/hooks/useShops';
import { useLanguage } from '@/hooks/useLanguage';

interface ShopsGridProps {
  vendors: Vendor[];
  loading: boolean;
  totalVendors: number;
  searchTerm: string;
  filterVerified: boolean;
  onClearFilters: () => void;
}

export function ShopsGrid({ 
  vendors, 
  loading, 
  totalVendors, 
  searchTerm, 
  filterVerified, 
  onClearFilters 
}: ShopsGridProps) {
  const { t } = useLanguage();
  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-muted rounded-t-lg" />
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded" />
                <div className="h-3 bg-muted rounded w-5/6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Empty state
  if (vendors.length === 0) {
    return (
      <div className="text-center py-12">
        <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">{t('noShopsFound')}</h3>
        <p className="text-muted-foreground mb-6">
          {searchTerm || filterVerified
            ? t('tryDifferentSearch')
            : t('noShopsAvailable')}
        </p>
        {(searchTerm || filterVerified) && (
          <Button variant="outline" onClick={onClearFilters}>
            {t('clearFilters')}
          </Button>
        )}
      </div>
    );
  }

  // Results info
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">
          {totalVendors} {totalVendors > 1 ? t('shopsFounds') : t('shopsFound')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {vendors.map((vendor) => (
          <ShopCard key={vendor.id} vendor={vendor} />
        ))}
      </div>
    </>
  );
}