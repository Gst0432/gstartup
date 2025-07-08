import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Globe, Phone, ArrowLeft, ShoppingCart, ExternalLink, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { extractSubdomain, redirectToMainDomain } from '@/utils/subdomain';

interface Vendor {
  id: string;
  business_name: string;
  description: string;
  logo_url?: string;
  cover_image_url?: string;
  address?: string;
  phone?: string;
  website_url?: string;
  rating?: number;
  total_sales?: number;
  is_active: boolean;
  is_verified: boolean;
}

interface Product {
  id: string;
  name: string;
  description: string;
  short_description?: string;
  price: number;
  compare_price?: number;
  images?: string[];
  category_id: string;
  is_active: boolean;
  is_featured: boolean;
  quantity?: number;
  tags?: string[];
}

export default function VendorSubdomainStore() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [subdomain, setSubdomain] = useState<string | null>(null);

  useEffect(() => {
    const currentSubdomain = extractSubdomain(window.location.hostname);
    setSubdomain(currentSubdomain);
    
    if (currentSubdomain) {
      fetchVendorBySubdomain(currentSubdomain);
    } else {
      // No valid subdomain, redirect to main site
      redirectToMainDomain('/marketplace');
    }
  }, []);

  const fetchVendorBySubdomain = async (subdomainValue: string) => {
    try {
      // Récupérer le vendeur par sous-domaine
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('subdomain', subdomainValue)
        .eq('is_active', true)
        .single();

      if (vendorError) {
        console.error('Error fetching vendor by subdomain:', vendorError);
        toast({
          title: "Boutique introuvable",
          description: "Cette boutique n'existe pas ou n'est plus active",
          variant: "destructive"
        });
        redirectToMainDomain('/marketplace');
        return;
      }

      setVendor(vendorData);

      // Récupérer les produits du vendeur
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', vendorData.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('Error fetching products:', productsError);
      } else {
        setProducts(productsData || []);
      }
    } catch (error) {
      console.error('Error fetching vendor data:', error);
      redirectToMainDomain('/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId: string) => {
    // Navigate to product detail on main domain
    window.open(`${window.location.protocol}//${window.location.hostname.replace(/^[^.]+\./, '')}/product/${productId}`, '_blank');
  };

  const handleBackToMain = () => {
    redirectToMainDomain('/marketplace');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Boutique introuvable</h1>
          <p className="text-muted-foreground mb-4">
            Cette boutique n'existe pas ou n'est plus active.
          </p>
          <Button onClick={handleBackToMain}>
            <Home className="h-4 w-4 mr-2" />
            Retour à G-STARTUP
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header avec bouton retour */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={handleBackToMain}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              G-STARTUP Marketplace
            </Button>
            
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {subdomain}.gstartup.pro
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      {vendor.cover_image_url && (
        <div className="h-64 bg-gradient-to-r from-primary to-primary-foreground relative">
          <img 
            src={vendor.cover_image_url} 
            alt={`Couverture de ${vendor.business_name}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Informations du vendeur */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="flex-shrink-0">
            {vendor.logo_url ? (
              <img 
                src={vendor.logo_url} 
                alt={`Logo de ${vendor.business_name}`}
                className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-lg"
                style={{ marginTop: vendor.cover_image_url ? '-4rem' : '0' }}
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-background shadow-lg">
                <span className="text-2xl font-bold text-muted-foreground">
                  {vendor.business_name.charAt(0)}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl font-bold text-primary">{vendor.business_name}</h1>
              {vendor.is_verified && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Vérifié
                </Badge>
              )}
            </div>

            {vendor.description && (
              <p className="text-muted-foreground mb-4">{vendor.description}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {vendor.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{vendor.rating.toFixed(1)}</span>
                </div>
              )}
              
              {vendor.total_sales && (
                <div className="flex items-center gap-1">
                  <ShoppingCart className="h-4 w-4" />
                  <span>{vendor.total_sales} ventes</span>
                </div>
              )}

              {vendor.address && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{vendor.address}</span>
                </div>
              )}

              {vendor.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span>{vendor.phone}</span>
                </div>
              )}

              {vendor.website_url && (
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  <a 
                    href={vendor.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary"
                  >
                    Site web
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Produits du vendeur */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-primary">
            Nos Produits ({products.length})
          </h2>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Aucun produit disponible pour le moment
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Card 
                  key={product.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleProductClick(product.id)}
                >
                  <CardHeader className="p-0">
                    <div className="aspect-square bg-muted rounded-t-lg overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-muted-foreground">Pas d'image</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg mb-2 line-clamp-2">
                      {product.name}
                    </CardTitle>
                    {product.short_description && (
                      <CardDescription className="mb-3 line-clamp-2">
                        {product.short_description}
                      </CardDescription>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-primary">
                          {product.price.toLocaleString()} FCFA
                        </span>
                        {product.compare_price && product.compare_price > product.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            {product.compare_price.toLocaleString()} FCFA
                          </span>
                        )}
                      </div>
                      {product.is_featured && (
                        <Badge variant="secondary">Vedette</Badge>
                      )}
                    </div>
                    {product.quantity !== undefined && product.quantity <= 5 && (
                      <p className="text-sm text-orange-600 mt-2">
                        Plus que {product.quantity} en stock
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer de la boutique */}
        <div className="mt-16 pt-8 border-t text-center">
          <p className="text-muted-foreground">
            Boutique en ligne de <span className="font-semibold">{vendor.business_name}</span>
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Propulsé par{' '}
            <Button 
              variant="link" 
              className="p-0 h-auto font-semibold text-primary"
              onClick={handleBackToMain}
            >
              G-STARTUP LTD
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
}