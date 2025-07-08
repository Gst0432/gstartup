import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, Eye, ShoppingCart, Filter, Search, Grid, List, Store, Heart, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_price?: number;
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
  tags?: string[];
  quantity?: number;
}

interface Category {
  id: string;
  name: string;
}

interface Vendor {
  id: string;
  business_name: string;
  logo_url?: string;
  rating?: number;
  total_sales?: number;
  is_verified: boolean;
}

export default function Marketplace() {
  const { currency } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredVendors, setFeaturedVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showFilters, setShowFilters] = useState(false);

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

      // Fetch featured vendors
      const { data: vendorsData, error: vendorsError } = await supabase
        .from('vendors')
        .select('*')
        .eq('is_active', true)
        .eq('is_verified', true)
        .order('total_sales', { ascending: false })
        .limit(6);

      if (vendorsError) {
        console.error('Error fetching vendors:', vendorsError);
      } else {
        setFeaturedVendors(vendorsData || []);
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
    
    const convertedPrice = price * rates[currency];
    return `${convertedPrice.toLocaleString()} ${symbols[currency]}`;
  };

  const handleBuyProduct = (product: Product) => {
    window.open(`/product/${product.id}`, '_self');
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.vendor.business_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category.name === selectedCategory;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesPrice;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'featured':
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const featuredProducts = products.filter(product => product.is_featured).slice(0, 8);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Marketplace Digital
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Découvrez des produits digitaux innovants créés par des entrepreneurs talentueux
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-background/50 backdrop-blur rounded-lg p-4">
                <div className="text-2xl font-bold text-primary">{products.length}</div>
                <div className="text-sm text-muted-foreground">Produits</div>
              </div>
              <div className="bg-background/50 backdrop-blur rounded-lg p-4">
                <div className="text-2xl font-bold text-primary">{categories.length}</div>
                <div className="text-sm text-muted-foreground">Catégories</div>
              </div>
              <div className="bg-background/50 backdrop-blur rounded-lg p-4">
                <div className="text-2xl font-bold text-primary">{featuredVendors.length}</div>
                <div className="text-sm text-muted-foreground">Vendeurs</div>
              </div>
              <div className="bg-background/50 backdrop-blur rounded-lg p-4">
                <div className="text-2xl font-bold text-primary">{featuredProducts.length}</div>
                <div className="text-sm text-muted-foreground">En Vedette</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-8">
              <Star className="h-6 w-6 text-yellow-500" />
              <h2 className="text-3xl font-bold">Produits en Vedette</h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="group overflow-hidden hover:shadow-elegant transition-all duration-300">
                  <CardHeader className="p-0">
                    <div className="relative h-48 overflow-hidden">
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
                      <Badge className="absolute top-3 left-3 bg-yellow-500 text-yellow-50">
                        <Star className="h-3 w-3 mr-1" />
                        Vedette
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="text-sm text-muted-foreground mb-2">
                      <span>Par {product.vendor.business_name}</span>
                    </div>
                    <div className="font-bold text-primary text-lg">
                      {formatPrice(product.price)}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-4 pt-0 flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => window.open(`/product/${product.id}`, '_self')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleBuyProduct(product)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Acheter
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Vendors */}
      {featuredVendors.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold">Vendeurs en Vedette</h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVendors.map((vendor) => (
                <Card 
                  key={vendor.id} 
                  className="group cursor-pointer hover:shadow-elegant transition-all duration-300"
                  onClick={() => window.open(`/store/${vendor.id}`, '_self')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      {vendor.logo_url ? (
                        <img 
                          src={vendor.logo_url} 
                          alt={vendor.business_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
                          <span className="text-white font-bold text-xl">
                            {vendor.business_name.charAt(0)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{vendor.business_name}</h3>
                          {vendor.is_verified && (
                            <Badge variant="secondary" className="text-xs">Vérifié</Badge>
                          )}
                        </div>
                        
                        {vendor.rating && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{vendor.rating.toFixed(1)}</span>
                          </div>
                        )}
                        
                        {vendor.total_sales && (
                          <div className="text-sm text-muted-foreground">
                            {vendor.total_sales} ventes
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Store className="h-4 w-4 mr-2" />
                      Visiter la boutique
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Marketplace */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Tous les Produits</h2>
          
          {/* Search and Filters */}
          <div className="bg-background rounded-lg p-6 mb-8 border">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher des produits, vendeurs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full lg:w-56">
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

              {/* Filters Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </Button>
            </div>

            {/* Price Range Filter */}
            {(showFilters || window.innerWidth >= 1024) && (
              <div className="pt-4 border-t">
                <label className="text-sm font-medium mb-3 block">
                  Prix: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  max={1000000}
                  step={10000}
                  className="w-full"
                />
              </div>
            )}

            {/* Results count */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
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

                      <div className={`flex items-center gap-2 ${viewMode === 'list' ? 'text-lg' : 'text-xl'}`}>
                        <span className="font-bold text-primary">
                          {formatPrice(product.price)}
                        </span>
                        {product.compare_price && product.compare_price > product.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatPrice(product.compare_price)}
                          </span>
                        )}
                      </div>

                      {product.quantity !== undefined && product.quantity <= 5 && (
                        <p className="text-sm text-orange-600 mt-1">
                          Plus que {product.quantity} en stock
                        </p>
                      )}
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
                setPriceRange([0, 1000000]);
              }}>
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}