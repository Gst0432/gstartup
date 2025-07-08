import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  Star, 
  Search,
  Filter,
  MessageSquare,
  ThumbsUp,
  Flag
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  is_verified: boolean;
  is_featured: boolean;
  created_at: string;
  product: {
    name: string;
    images: string[];
  };
  user: {
    display_name: string;
  };
}

export default function VendorReviews() {
  const { profile } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');

  useEffect(() => {
    if (profile) {
      fetchReviews();
    }
  }, [profile]);

  const fetchReviews = async () => {
    try {
      // Get vendor info
      const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', profile?.user_id)
        .single();

      if (!vendor) return;

      // Get products for this vendor
      const { data: products } = await supabase
        .from('products')
        .select('id')
        .eq('vendor_id', vendor.id);

      if (!products || products.length === 0) {
        setLoading(false);
        return;
      }

      const productIds = products.map(p => p.id);

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          products!inner(
            name,
            images
          ),
          profiles!inner(
            display_name
          )
        `)
        .in('product_id', productIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
        return;
      }

      const transformedData = data?.map(review => ({
        ...review,
        product: review.products,
        user: review.profiles
      })) || [];

      setReviews(transformedData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (review.content && review.content.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter;
    
    return matchesSearch && matchesRating;
  });

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 : 0
  }));

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-muted/30">
        <header className="bg-background border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Avis Clients</h1>
                <p className="text-muted-foreground">
                  Consultez les avis sur vos produits
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="gap-2">
                  <Star className="h-4 w-4" />
                  {reviews.length} avis
                </Badge>
                <Badge variant="outline" className="gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {averageRating.toFixed(1)}/5
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Statistiques des avis */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Résumé des Avis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {renderStars(Math.round(averageRating))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {reviews.length} avis au total
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    {ratingDistribution.map(({ rating, count, percentage }) => (
                      <div key={rating} className="flex items-center gap-2 text-sm">
                        <span className="w-3">{rating}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="bg-yellow-400 rounded-full h-2 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-8 text-muted-foreground">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Liste des avis */}
            <div className="lg:col-span-3 space-y-6">
              {/* Filtres */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filtres et Recherche
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Rechercher dans les avis..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={ratingFilter} onValueChange={setRatingFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filtrer par note" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les notes</SelectItem>
                        <SelectItem value="5">5 étoiles</SelectItem>
                        <SelectItem value="4">4 étoiles</SelectItem>
                        <SelectItem value="3">3 étoiles</SelectItem>
                        <SelectItem value="2">2 étoiles</SelectItem>
                        <SelectItem value="1">1 étoile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Avis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Tous les Avis
                  </CardTitle>
                  <CardDescription>
                    Gérez les avis laissés sur vos produits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {filteredReviews.map((review) => (
                        <div key={review.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                {renderStars(review.rating)}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{review.user.display_name}</span>
                                {review.is_verified && (
                                  <Badge variant="secondary" className="text-xs">
                                    Achat vérifié
                                  </Badge>
                                )}
                                {review.is_featured && (
                                  <Badge variant="default" className="text-xs">
                                    Mis en avant
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">
                              Produit: {review.product.name}
                            </p>
                            {review.title && (
                              <p className="font-medium mb-2">{review.title}</p>
                            )}
                            {review.content && (
                              <p className="text-sm">{review.content}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 pt-2">
                            <Button variant="outline" size="sm">
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              Utile
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Répondre
                            </Button>
                            <Button variant="outline" size="sm">
                              <Flag className="h-4 w-4 mr-1" />
                              Signaler
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {filteredReviews.length === 0 && (
                        <div className="text-center py-8">
                          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            {searchTerm || ratingFilter !== 'all' 
                              ? "Aucun avis trouvé avec ces filtres" 
                              : "Aucun avis pour le moment"
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}