import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Star, 
  Eye, 
  ShoppingCart, 
  Filter, 
  Search, 
  Grid, 
  List, 
  Store, 
  Heart, 
  TrendingUp,
  Download,
  Users,
  Award,
  Clock,
  Tag,
  ArrowRight,
  Trophy,
  Zap,
  Shield
} from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TranslatableText } from '@/components/TranslatableText';

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
  description?: string;
  image_url?: string;
  products_count?: number;
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [activeTab, setActiveTab] = useState('all');

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

      // Fetch categories with count
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, description, image_url')
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

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.vendor.business_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category.name === selectedCategory;
    const matchesTab = activeTab === 'all' || 
                       (activeTab === 'featured' && product.is_featured) ||
                       (activeTab === 'recent' && new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesCategory && matchesTab;
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

  const featuredProducts = products.filter(product => product.is_featured).slice(0, 6);
  const recentProducts = products.slice(0, 8);
  const popularCategories = categories.slice(0, 8);

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
      
      {/* Hero Banner */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary/10 via-secondary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    Marketplace Digital
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Plus de {products.length} produits digitaux de haute qualité. Scripts, thèmes, plugins et bien plus.
                </p>
                
                {/* Search Bar */}
                <div className="relative mb-8">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher des scripts, thèmes, plugins..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 text-lg border-2 focus:border-primary"
                  />
                  <Button className="absolute right-2 top-2 h-10">
                    Rechercher
                  </Button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{products.length}+</div>
                    <div className="text-sm text-muted-foreground">Produits</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">50+</div>
                    <div className="text-sm text-muted-foreground">Vendeurs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">4.8</div>
                    <div className="text-sm text-muted-foreground">Note moyenne</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  {featuredProducts.slice(0, 4).map((product, index) => (
                    <Card key={product.id} className={`overflow-hidden hover:shadow-lg transition-all duration-300 ${index % 2 === 0 ? 'mt-8' : ''}`}>
                      <div className="aspect-square relative">
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-primary/10 flex items-center justify-center">
                            <span className="text-2xl font-bold text-primary/30">
                              {product.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
                          {formatPrice(product.price)}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Catégories Populaires</h2>
            <Button variant="outline" className="gap-2">
              Voir toutes <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {popularCategories.map((category) => (
              <Card 
                key={category.id} 
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 text-center p-6"
                onClick={() => setSelectedCategory(category.name)}
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Tag className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-medium text-sm">{category.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {products.filter(p => p.category.name === category.name).length} items
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Tabs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
              <TabsList className="grid w-full lg:w-auto grid-cols-3">
                <TabsTrigger value="all" className="gap-2">
                  <Grid className="h-4 w-4" />
                  Tous les produits
                </TabsTrigger>
                <TabsTrigger value="featured" className="gap-2">
                  <Star className="h-4 w-4" />
                  En vedette
                </TabsTrigger>
                <TabsTrigger value="recent" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Récents
                </TabsTrigger>
              </TabsList>

              <div className="flex flex-wrap gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
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

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
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
            </div>

            <TabsContent value="all">
              <ProductGrid products={filteredProducts} viewMode={viewMode} formatPrice={formatPrice} />
            </TabsContent>
            
            <TabsContent value="featured">
              <ProductGrid products={filteredProducts.filter(p => p.is_featured)} viewMode={viewMode} formatPrice={formatPrice} />
            </TabsContent>
            
            <TabsContent value="recent">
              <ProductGrid products={filteredProducts.filter(p => new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))} viewMode={viewMode} formatPrice={formatPrice} />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Featured Vendors */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Vendeurs de Confiance</h2>
              <p className="text-muted-foreground">Découvrez les meilleurs créateurs de notre communauté</p>
            </div>
            <Button variant="outline" className="gap-2">
              Voir tous <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredVendors.map((vendor) => (
              <Card 
                key={vendor.id} 
                className="group cursor-pointer hover:shadow-lg transition-all duration-300"
                onClick={() => window.open(`/store/${vendor.id}`, '_self')}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    {vendor.logo_url ? (
                      <img 
                        src={vendor.logo_url} 
                        alt={vendor.business_name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
                        <span className="text-white font-bold text-xl">
                          {vendor.business_name.charAt(0)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{vendor.business_name}</h3>
                        {vendor.is_verified && (
                          <Shield className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {vendor.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{vendor.rating.toFixed(1)}</span>
                          </div>
                        )}
                        
                        {vendor.total_sales && (
                          <div className="flex items-center gap-1">
                            <Download className="h-4 w-4" />
                            <span>{vendor.total_sales}</span>
                          </div>
                        )}
                      </div>
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

      <Footer />
    </div>
  );
}

// Component for Product Grid
function ProductGrid({ 
  products, 
  viewMode, 
  formatPrice 
}: { 
  products: Product[]; 
  viewMode: 'grid' | 'list';
  formatPrice: (price: number) => string;
}) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
          <Search className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Aucun produit trouvé</h3>
        <p className="text-muted-foreground">Essayez de modifier vos critères de recherche</p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {products.map((product) => (
          <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex gap-6">
                <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary/30">
                        {product.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                    <div className="flex items-center gap-2 ml-4">
                      {product.is_featured && (
                        <Badge className="bg-yellow-500 text-yellow-50">
                          <Star className="h-3 w-3 mr-1" />
                          Vedette
                        </Badge>
                      )}
                      <Badge variant="outline">{product.category.name}</Badge>
                    </div>
                  </div>
                  
                  <TranslatableText
                    originalText={product.description}
                    sourceLanguage="fr"
                    className="text-muted-foreground line-clamp-2 mb-3 prose prose-sm max-w-none"
                    showTranslateButton={true}
                  >
                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                  </TranslatableText>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        Par {product.vendor.business_name}
                      </div>
                      <div className="font-bold text-primary text-xl">
                        {formatPrice(product.price)}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`/product/${product.id}`, '_self')}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Aperçu
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => window.open(`/product/${product.id}`, '_self')}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Acheter
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
          <CardHeader className="p-0">
            <div className="relative aspect-[4/3] overflow-hidden">
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
              
              <div className="absolute top-3 left-3 right-3 flex justify-between">
                <Badge className="bg-primary text-primary-foreground">
                  {product.category.name}
                </Badge>
                {product.is_featured && (
                  <Badge className="bg-yellow-500 text-yellow-50">
                    <Star className="h-3 w-3 mr-1" />
                    Vedette
                  </Badge>
                )}
              </div>
              
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2 line-clamp-2 min-h-[3rem]">{product.name}</h3>
            <TranslatableText
              originalText={product.description}
              sourceLanguage="fr"
              className="text-muted-foreground text-sm mb-3 line-clamp-2 prose prose-sm max-w-none"
              showTranslateButton={true}
            >
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            </TranslatableText>
            
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-muted-foreground">
                {product.vendor.business_name}
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">4.8</span>
              </div>
            </div>
            
            <div className="font-bold text-primary text-lg mb-4">
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
              Aperçu
            </Button>
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => window.open(`/product/${product.id}`, '_self')}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Acheter
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}