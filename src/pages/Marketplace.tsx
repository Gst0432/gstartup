import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Eye, ShoppingCart, Filter, Search, Grid, List, Store } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ReviewsList } from '@/components/ReviewsList';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  demo_url: string | null;
  preview_url: string | null;
  created_at: string;
  vendor: {
    id: string;
    business_name: string;
  };
  category: {
    name: string;
  };
  is_featured: boolean;
}

interface Category {
  id: string;
  name: string;
}

export default function Marketplace() {
  const { currency } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          vendor:vendors!products_vendor_id_fkey(id, business_name),
          category:categories!products_category_id_fkey(name)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('Error fetching products:', productsError);
      } else {
        setProducts(productsData || []);
      }

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
      } else {
        setCategories(categoriesData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.vendor.business_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category.name === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'featured':
          return b.is_featured ? 1 : -1;
        default: // newest
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const handleBuyProduct = async (product: Product) => {
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
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Marketplace G-STARTUP
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Découvrez notre sélection de produits et services digitaux de qualité
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 lg:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Plus récents</SelectItem>
                <SelectItem value="featured">En vedette</SelectItem>
                <SelectItem value="price-low">Prix croissant</SelectItem>
                <SelectItem value="price-high">Prix décroissant</SelectItem>
                <SelectItem value="name">Nom A-Z</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>{filteredProducts.length} produit(s) trouvé(s)</span>
          </div>
        </div>

        {/* Products Grid/List */}
        {filteredProducts.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? "grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }>
            {filteredProducts.map((product) => (
              <Card 
                key={product.id} 
                className={`group overflow-hidden hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 ${
                  viewMode === 'list' ? 'flex flex-row' : 'h-full flex flex-col'
                }`}
              >
                <CardHeader className={`p-0 ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                  <div className={`relative overflow-hidden ${viewMode === 'list' ? 'h-32' : 'h-48'}`}>
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
                      {product.category.name}
                    </Badge>
                    {product.is_featured && (
                      <Badge className="absolute top-3 right-3 bg-yellow-500 text-yellow-50">
                        <Star className="h-3 w-3 mr-1" />
                        Vedette
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <div className="flex-1 flex flex-col">
                  <CardContent className={`flex-1 flex flex-col ${viewMode === 'list' ? 'p-4' : 'p-6'}`}>
                    <h3 className={`font-semibold mb-2 line-clamp-2 ${viewMode === 'list' ? 'text-base' : 'text-lg'}`}>
                      {product.name}
                    </h3>
                    
                    <p className={`text-muted-foreground text-sm mb-4 line-clamp-3 flex-1 ${viewMode === 'list' ? 'line-clamp-2' : ''}`}>
                      {product.description}
                    </p>

                    <div className="text-sm text-muted-foreground mb-2 flex items-center justify-between">
                      <span>Par {product.vendor.business_name}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/store/${product.vendor.id}`, '_self');
                        }}
                      >
                        <Store className="h-3 w-3 mr-1" />
                        Boutique
                      </Button>
                    </div>

                    <div className={`font-bold text-primary ${viewMode === 'list' ? 'text-lg' : 'text-2xl'}`}>
                      {formatPrice(product.price)}
                    </div>
                  </CardContent>

                  <CardFooter className={`flex gap-2 ${viewMode === 'list' ? 'p-4 pt-0' : 'p-6 pt-0'}`}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-2"
                      onClick={() => window.open(`/product/${product.id}`, '_self')}
                    >
                      <Eye className="h-4 w-4" />
                      Détails
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 gap-2"
                      onClick={() => handleBuyProduct(product)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Acheter
                    </Button>
                  </CardFooter>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium mb-2">Aucun produit trouvé</h3>
            <p className="text-muted-foreground mb-6">
              Essayez de modifier vos critères de recherche ou parcourez toutes les catégories
            </p>
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}>
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}