import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Star, Eye, ShoppingCart, ArrowRight, Info } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useAuth } from '../hooks/useAuth';
import { usePendingPurchase } from '../hooks/usePendingPurchase';
import { ResponsiveImage, ImageSizeGuide } from './ui/responsive-image';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  demo_url: string | null;
  preview_url: string | null;
  vendor: {
    business_name: string;
  };
  category: {
    name: string;
  };
  is_featured: boolean;
}

export const ProductsSection = () => {
  const { t, currency } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { savePendingPurchase } = usePendingPurchase();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalVendors: 0,
    totalCategories: 0
  });

  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          vendor:vendors!products_vendor_id_fkey(business_name),
          category:categories!products_category_id_fkey(name)
        `)
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch total products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Fetch total vendors count
      const { count: vendorsCount } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Fetch total categories count
      const { count: categoriesCount } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      setStats({
        totalProducts: productsCount || 0,
        totalVendors: vendorsCount || 0,
        totalCategories: categoriesCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const formatPrice = (price: number) => {
    const rates = {
      FCFA: 1,
      XAF: 1,
      USD: 0.0017,
      FGN: 1.33
    };
    
    const symbols = {
      FCFA: 'FCFA',
      XAF: 'XAF',
      USD: '$',
      FGN: '₦'
    };

    const convertedPrice = Math.round(price * rates[currency]);
    return `${convertedPrice} ${symbols[currency]}`;
  };

  return (
    <section id="marketplace" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Marketplace
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Découvrez notre vaste collection de produits numériques professionnels. Scripts, thèmes, plugins et solutions digitales pour propulser vos projets.
          </p>
          
          {/* Guide des tailles d'images */}
          <div className="mt-8 mx-auto max-w-2xl">
            <details className="group">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2">
                <Info className="h-4 w-4" />
                Guide d'optimisation des images
              </summary>
              <div className="mt-4 p-4 bg-background rounded-lg border text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <h4 className="font-semibold mb-2">Images Produits</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Miniature: 300×300px (1:1)</li>
                      <li>• Galerie: 800×600px (4:3)</li>
                      <li>• Détail: 1200×900px (4:3)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Images Vendeurs</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Logo: 200×200px (1:1)</li>
                      <li>• Couverture: 1200×400px (3:1)</li>
                      <li>• Avatar: 400×400px (1:1)</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <Badge variant="outline" className="text-xs">
                    📱 Les images s'adaptent automatiquement à tous les écrans pour une expérience optimale
                  </Badge>
                </div>
              </div>
            </details>
          </div>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 mt-8 flex-wrap">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalProducts}+</div>
              <div className="text-sm text-muted-foreground">Produits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalVendors}+</div>
              <div className="text-sm text-muted-foreground">Vendeurs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.totalCategories}+</div>
              <div className="text-sm text-muted-foreground">Catégories</div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="w-full h-48 bg-muted animate-pulse" />
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-3 bg-muted rounded animate-pulse mb-4" />
                  <div className="h-6 bg-muted rounded animate-pulse mb-4" />
                  <div className="flex gap-2">
                    <div className="h-8 bg-muted rounded animate-pulse flex-1" />
                    <div className="h-8 bg-muted rounded animate-pulse flex-1" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : products.length > 0 ? (
            products.map((product) => (
                <Card key={product.id} className="group overflow-hidden hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
                <CardHeader className="p-0">
                  <div className="relative overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <ResponsiveImage
                        src={product.images[0]}
                        alt={product.name}
                        aspectRatio="landscape"
                        quality="medium"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="h-48 transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-primary/10 flex items-center justify-center aspect-[16/9]">
                        <div className="text-4xl font-bold text-primary/30">
                          {product.name.charAt(0)}
                        </div>
                      </div>
                    )}
                    <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                      {product.category?.name}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 flex-1 flex flex-col">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
                    {product.name}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">
                    {product.description}
                  </p>

                  <div className="text-sm text-muted-foreground mb-2">
                    <span>{t('by')} {product.vendor?.business_name}</span>
                  </div>

                  <div className="text-2xl font-bold text-primary">
                    {formatPrice(product.price)}
                  </div>
                </CardContent>

                <CardFooter className="p-6 pt-0 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-2"
                    onClick={() => window.open(`/product/${product.id}`, '_self')}
                  >
                    <Eye className="h-4 w-4" />
                    {t('viewDetails')}
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 gap-2"
                    onClick={async () => {
                      if (!isAuthenticated) {
                        // Sauvegarder l'intention d'achat et rediriger vers l'authentification
                        savePendingPurchase(product.id, 1);
                        navigate('/auth');
                        return;
                      }

                      try {
                        const { data, error } = await supabase.functions.invoke('create-payment', {
                          body: { 
                            productId: product.id,
                            quantity: 1 
                          }
                        });

                        if (error) {
                          console.error('Payment error:', error);
                          return;
                        }

                        if (data.success && data.payment_url) {
                          window.open(data.payment_url, '_blank');
                        }
                      } catch (error) {
                        console.error('Payment error:', error);
                      }
                    }}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {t('buy')}
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">{t('noProducts')}</p>
            </div>
          )}
        </div>

        {/* View More Button */}
        <div className="text-center">
          <Button 
            variant="premium" 
            size="lg" 
            className="gap-2"
            onClick={() => navigate('/marketplace')}
          >
            Voir tous les produits
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};