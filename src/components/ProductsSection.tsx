import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Star, Eye, ShoppingCart, ArrowRight } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

export const ProductsSection = () => {
  const { t, currency } = useLanguage();

  const products = [
    {
      title: 'Remito - Complete Remittance Solution',
      category: 'PHP Scripts',
      sales: 234,
      rating: 4.8,
      reviews: 13,
      price: 49,
      image: '/api/placeholder/400/250',
      description: 'A comprehensive remittance platform with advanced features'
    },
    {
      title: 'AgriWealth - Agricultural HYIP Investment',
      category: 'PHP Scripts',
      sales: 182,
      rating: 4.9,
      reviews: 20,
      price: 29,
      image: '/api/placeholder/400/250',
      description: 'Agricultural investment platform with ecommerce solution'
    },
    {
      title: 'Next Destina - Travel Booking Platform',
      category: 'PHP Scripts',
      sales: 106,
      rating: 4.7,
      reviews: 3,
      price: 25,
      image: '/api/placeholder/400/250',
      description: 'Agency-based tour and travel booking platform'
    },
    {
      title: 'Bullion - Gold HYIP Investment',
      category: 'PHP Scripts',
      sales: 61,
      rating: 4.6,
      reviews: 6,
      price: 29,
      image: '/api/placeholder/400/250',
      description: 'Gold investment and ecommerce application'
    },
    {
      title: 'ChainCity - Real Estate Investment',
      category: 'PHP Scripts',
      sales: 200,
      rating: 4.8,
      reviews: 12,
      price: 49,
      image: '/api/placeholder/400/250',
      description: 'Real estate investment platform'
    },
    {
      title: 'Coinectra - Crypto Exchange Script',
      category: 'PHP Scripts',
      sales: 89,
      rating: 4.5,
      reviews: 3,
      price: 29,
      image: '/api/placeholder/400/250',
      description: 'Buy, sell and crypto currency exchange script'
    },
  ];

  const formatPrice = (price: number) => {
    const rates = {
      FCFA: 600,
      XAF: 600,
      USD: 1,
      FGN: 800
    };
    
    const symbols = {
      FCFA: 'FCFA',
      XAF: 'XAF',
      USD: '$',
      FGN: '₦'
    };

    const convertedPrice = Math.round(price * rates[currency]);
    return `${symbols[currency]}${convertedPrice}`;
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
          {products.map((product, index) => (
            <Card key={index} className="group overflow-hidden hover:shadow-elegant transition-all duration-300 hover:-translate-y-2">
              <CardHeader className="p-0">
                <div className="relative overflow-hidden">
                  <div className="w-full h-48 bg-gradient-primary/10 flex items-center justify-center">
                    <div className="text-4xl font-bold text-primary/30">
                      {product.title.charAt(0)}
                    </div>
                  </div>
                  <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                    {product.category}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                  {product.title}
                </h3>
                
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <span>{product.sales}</span>
                    <span>Sales</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{product.rating}</span>
                    <span>({product.reviews})</span>
                  </div>
                </div>

                <div className="text-2xl font-bold text-primary mb-4">
                  {formatPrice(product.price)}
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-2">
                  <Eye className="h-4 w-4" />
                  Live Preview
                </Button>
                <Button size="sm" className="flex-1 gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Buy Now
                </Button>
              </CardFooter>
            </Card>
          ))}
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