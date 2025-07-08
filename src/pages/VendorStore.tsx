import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Globe, Phone, ArrowLeft, ShoppingCart, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Vendor {
  id: string;
  business_name: string;
  description: string;
  logo_url?: string;
  cover_image_url?: string;
  address?: string;
  phone?: string;
  website_url?: string;
  subdomain?: string;
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

export default function VendorStore() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubdomain, setIsSubdomain] = useState(false);

  useEffect(() => {
    // Check if we're on a subdomain
    const checkSubdomain = async () => {
      const hostname = window.location.hostname;
      if (hostname.endsWith('.gstartup.pro') && hostname !== 'gstartup.pro') {
        const subdomain = hostname.replace('.gstartup.pro', '');
        setIsSubdomain(true);
        
        // Fetch vendor by subdomain
        try {
          const { data: vendor, error } = await supabase
            .from('vendors')
            .select('id')
            .eq('subdomain', subdomain)
            .eq('is_active', true)
            .single();
          
          if (error || !vendor) {
            toast({
              title: "Erreur",
              description: "Boutique introuvable",
              variant: "destructive"
            });
            return;
          }
          
          // Update URL without reloading
          window.history.replaceState({}, '', `/store/${vendor.id}`);
          fetchVendorData(vendor.id);
        } catch (error) {
          console.error('Error fetching vendor by subdomain:', error);
        }
      } else if (vendorId) {
        fetchVendorData(vendorId);
      }
    };
    
    checkSubdomain();
  }, [vendorId]);

  const fetchVendorData = async (id?: string) => {
    const targetVendorId = id || vendorId;
    if (!targetVendorId) return;
    
    try {
      // Récupérer les informations du vendeur
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', targetVendorId)
        .eq('is_active', true)
        .single();

      if (vendorError) {
        console.error('Error fetching vendor:', vendorError);
        toast({
          title: "Erreur",
          description: "Vendeur introuvable",
          variant: "destructive"
        });
        if (!isSubdomain) {
          navigate('/marketplace');
        }
        return;
      }

      setVendor(vendorData);

      // Récupérer les produits du vendeur
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', targetVendorId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('Error fetching products:', productsError);
      } else {
        setProducts(productsData || []);
      }
    } catch (error) {
      console.error('Error fetching vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
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
          <Button onClick={() => navigate('/boutiques')}>
            Retour aux boutiques
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      {/* Cover Image */}
      <div className="relative">
        {vendor.cover_image_url ? (
          <div className="h-80 relative overflow-hidden">
            <img 
              src={vendor.cover_image_url} 
              alt={`Couverture de ${vendor.business_name}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>
        ) : (
          <div className="h-80 bg-gradient-to-br from-primary via-primary-foreground to-secondary relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <h1 className="text-4xl font-bold text-white mb-2">{vendor.business_name}</h1>
              <p className="text-white/90">Boutique officielle</p>
            </div>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Informations du vendeur */}
        <div className="flex flex-col md:flex-row gap-8 mb-12" style={{ marginTop: vendor.cover_image_url ? '-4rem' : '0' }}>
          <div className="flex-shrink-0">
            {vendor.logo_url ? (
              <div className="relative">
                <img 
                  src={vendor.logo_url} 
                  alt={`Logo de ${vendor.business_name}`}
                  className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-xl"
                />
                {vendor.is_verified && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-background">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-primary flex items-center justify-center border-4 border-background shadow-xl">
                  <span className="text-4xl font-bold text-white">
                    {vendor.business_name.charAt(0)}
                  </span>
                </div>
                {vendor.is_verified && (
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-background">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold">{vendor.business_name}</h1>
                  {vendor.is_verified && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <Shield className="h-3 w-3 mr-1" />
                      Vérifié
                    </Badge>
                  )}
                </div>
                
                {vendor.description && (
                  <p className="text-lg text-muted-foreground mb-4 max-w-2xl">{vendor.description}</p>
                )}
              </div>

              <div className="flex gap-2">
                {vendor.website_url && (
                  <Button variant="outline" className="gap-2" asChild>
                    <a href={vendor.website_url} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4" />
                      Site web
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Statistiques de la boutique */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">{products.length}</div>
                <div className="text-sm text-muted-foreground">Produits</div>
              </div>
              
              {vendor.rating && (
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl font-bold">{vendor.rating.toFixed(1)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Note moyenne</div>
                </div>
              )}
              
              {vendor.total_sales && (
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{vendor.total_sales}</div>
                  <div className="text-sm text-muted-foreground">Ventes</div>
                </div>
              )}

              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">Actif</div>
                <div className="text-sm text-muted-foreground">Statut</div>
              </div>
            </div>

            {/* Coordonnées */}
            <div className="flex flex-wrap gap-6 text-sm">
              {vendor.address && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{vendor.address}</span>
                </div>
              )}

              {vendor.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${vendor.phone}`} className="hover:text-primary">
                    {vendor.phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section des produits */}
        <div className="space-y-8">
          {/* Header des produits */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">
                Notre Catalogue
              </h2>
              <p className="text-muted-foreground mt-1">
                {products.length} produit{products.length > 1 ? 's' : ''} disponible{products.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {products.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Catalogue en préparation</h3>
                <p className="text-muted-foreground text-lg mb-4">
                  Cette boutique prépare de nouveaux produits pour vous.
                </p>
                <p className="text-muted-foreground">
                  Revenez bientôt pour découvrir nos offres !
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card 
                  key={product.id} 
                  className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-md"
                  onClick={() => handleProductClick(product.id)}
                >
                  <CardHeader className="p-0">
                    <div className="aspect-[4/3] relative overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl font-bold text-primary/30 mb-2">
                              {product.name.charAt(0)}
                            </div>
                            <span className="text-sm text-muted-foreground">Aperçu bientôt</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Badge en vedette */}
                      {product.is_featured && (
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-yellow-500 text-yellow-50 shadow-lg">
                            <Star className="h-3 w-3 mr-1" />
                            Vedette
                          </Badge>
                        </div>
                      )}
                      
                      {/* Badge stock faible */}
                      {product.quantity !== undefined && product.quantity <= 5 && product.quantity > 0 && (
                        <div className="absolute top-3 right-3">
                          <Badge variant="destructive" className="shadow-lg">
                            Stock: {product.quantity}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-5">
                    <div className="space-y-3">
                      <CardTitle className="text-lg line-clamp-2 min-h-[3.5rem] group-hover:text-primary transition-colors">
                        {product.name}
                      </CardTitle>
                      
                      {product.short_description && (
                        <CardDescription className="line-clamp-2 text-sm">
                          {product.short_description}
                        </CardDescription>
                      )}
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-primary">
                              {product.price.toLocaleString()} FCFA
                            </span>
                            {product.compare_price && product.compare_price > product.price && (
                              <span className="text-sm text-muted-foreground line-through">
                                {product.compare_price.toLocaleString()} FCFA
                              </span>
                            )}
                          </div>
                          
                          {product.compare_price && product.compare_price > product.price && (
                            <div className="text-xs text-green-600 font-medium">
                              Économisez {(product.compare_price - product.price).toLocaleString()} FCFA
                            </div>
                          )}
                        </div>
                        
                        <Button size="sm" className="shrink-0">
                          Voir plus
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}