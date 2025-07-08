import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Star, Eye, ShoppingCart, ArrowRight } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { supabase } from '../integrations/supabase/client';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
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
            {t('productsTitle')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('productsSubtitle')} G-STARTUP LTD is one of the pioneers in providing I.T. infrastructure and solutions on various platforms.
          </p>
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
                  <div className="relative overflow-hidden h-48">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-primary/10 flex items-center justify-center">
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
                    <span>Par {product.vendor?.business_name}</span>
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
                    Voir détails
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 gap-2"
                    onClick={() => {
                      const url = product.demo_url;
                      if (url) {
                        window.open(url, '_blank');
                      } else {
                        window.location.href = `/checkout?product=${product.id}`;
                      }
                    }}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Acheter
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Aucun produit en vedette pour le moment</p>
            </div>
          )}
        </div>

        {/* View More Button */}
        <div className="text-center">
          <Button variant="premium" size="lg" className="gap-2">
            View More Products
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};