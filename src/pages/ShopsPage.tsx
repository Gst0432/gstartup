import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Store, MapPin, Star, ChevronLeft, ChevronRight, Filter, Globe } from 'lucide-react';
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
  store_slug?: string;
  rating?: number;
  total_sales?: number;
  is_verified: boolean;
}

export default function ShopsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name');
  const [filterVerified, setFilterVerified] = useState(searchParams.get('verified') === 'true');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));
  
  const itemsPerPage = 12;
  const [totalVendors, setTotalVendors] = useState(0);
  const totalPages = Math.ceil(totalVendors / itemsPerPage);

  useEffect(() => {
    fetchVendors();
  }, [searchTerm, sortBy, filterVerified, currentPage]);

  useEffect(() => {
    // Update URL params
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (sortBy !== 'name') params.set('sort', sortBy);
    if (filterVerified) params.set('verified', 'true');
    if (currentPage > 1) params.set('page', currentPage.toString());
    setSearchParams(params);
  }, [searchTerm, sortBy, filterVerified, currentPage, setSearchParams]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('vendors')
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      // Apply search filter
      if (searchTerm) {
        query = query.or(`business_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`);
      }

      // Apply verified filter
      if (filterVerified) {
        query = query.eq('is_verified', true);
      }

      // Apply sorting
      switch (sortBy) {
        case 'rating':
          query = query.order('rating', { ascending: false, nullsFirst: false });
          break;
        case 'sales':
          query = query.order('total_sales', { ascending: false, nullsFirst: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('business_name', { ascending: true });
      }

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching vendors:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les boutiques",
          variant: "destructive"
        });
        return;
      }

      setVendors(data || []);
      setTotalVendors(count || 0);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getVendorUrl = (vendor: Vendor) => {
    if (vendor.store_slug) {
      return `/boutique/${vendor.store_slug}`;
    }
    return `/store/${vendor.id}`;
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Découvrez nos Boutiques
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explorez une sélection de boutiques en ligne proposant des produits et services de qualité
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
              <Input
                placeholder="Rechercher une boutique..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>

            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 bg-background">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  <SelectItem value="name">Nom A-Z</SelectItem>
                  <SelectItem value="rating">Meilleures notes</SelectItem>
                  <SelectItem value="sales">Plus vendues</SelectItem>
                  <SelectItem value="newest">Plus récentes</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={filterVerified ? "default" : "outline"}
                onClick={() => {
                  setFilterVerified(!filterVerified);
                  setCurrentPage(1);
                }}
                className="gap-2 bg-background hover:bg-accent"
              >
                <Filter className="h-4 w-4" />
                Vérifiées
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Results info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            {totalVendors} boutique{totalVendors > 1 ? 's' : ''} trouvée{totalVendors > 1 ? 's' : ''}
          </p>
          <div className="text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages}
          </div>
        </div>

        {/* Loading state */}
        {loading && (
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
        )}

        {/* Vendors grid */}
        {!loading && vendors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vendors.map((vendor) => (
              <Card key={vendor.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
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
                      Vérifié
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
                        <span>{vendor.total_sales} vente{vendor.total_sales > 1 ? 's' : ''}</span>
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
                      Visiter
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
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && vendors.length === 0 && (
          <div className="text-center py-12">
            <Store className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucune boutique trouvée</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || filterVerified
                ? "Essayez de modifier vos critères de recherche"
                : "Il n'y a pas encore de boutiques disponibles"}
            </p>
            {(searchTerm || filterVerified) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilterVerified(false);
                  setCurrentPage(1);
                }}
              >
                Effacer les filtres
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Précédent
            </Button>

            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Suivant
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}