import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store, MapPin, Star, Globe } from 'lucide-react';
import { Vendor } from '@/hooks/useShops';
import { useLanguage } from '@/hooks/useLanguage';

interface ShopCardProps {
  vendor: Vendor;
}

export function ShopCard({ vendor }: ShopCardProps) {
  const { t } = useLanguage();
  const getVendorUrl = (vendor: Vendor) => {
    if (vendor.store_slug) {
      return `/boutique/${vendor.store_slug}`;
    }
    return `/store/${vendor.id}`;
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Cover image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={vendor.cover_image_url || '/placeholder.svg'}
          alt={`Couverture de ${vendor.business_name}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        
        {/* Logo overlay */}
        {vendor.logo_url && (
          <div className="absolute -bottom-8 left-4 z-10">
            <div className="w-16 h-16 rounded-full border-4 border-background overflow-hidden shadow-lg bg-background">
              <img
                src={vendor.logo_url}
                alt={`Logo de ${vendor.business_name}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* Verified badge */}
        {vendor.is_verified && (
          <Badge className="absolute top-3 right-3 bg-green-500 hover:bg-green-600">
            {t('verified')}
          </Badge>
        )}
      </div>

      <CardHeader className="pt-12 pb-4">
        <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors text-lg font-semibold">
          {vendor.business_name}
        </CardTitle>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
          {vendor.rating && vendor.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span>{vendor.rating.toFixed(1)}</span>
            </div>
          )}
          
          {vendor.total_sales && vendor.total_sales > 0 && (
            <div className="flex items-center gap-1">
              <Store className="h-4 w-4" />
              <span>{vendor.total_sales} {vendor.total_sales > 1 ? t('salesPlural') : t('sales')}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 px-6 pb-6">
        {vendor.description && (
          <div 
            className="text-sm text-muted-foreground line-clamp-2 leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: vendor.description }}
          />
        )}

        {vendor.address && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-1">{vendor.address}</span>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={() => window.open(getVendorUrl(vendor), '_blank')}
          >
            <Store className="h-4 w-4 mr-2" />
            {t('visit')}
          </Button>
          
          {vendor.website_url && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open(vendor.website_url, '_blank')}
            >
              <Globe className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}