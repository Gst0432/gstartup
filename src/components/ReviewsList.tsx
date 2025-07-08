import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Verified } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  created_at: string;
  is_verified: boolean;
  is_featured: boolean;
  user_id: string;
  profiles: {
    display_name: string;
    avatar_url: string | null;
  };
}

interface ReviewsListProps {
  productId: string;
  refreshTrigger?: number;
}

export const ReviewsList = ({ productId, refreshTrigger }: ReviewsListProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: [0, 0, 0, 0, 0] // 1-5 stars
  });

  useEffect(() => {
    fetchReviews();
  }, [productId, refreshTrigger]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles!reviews_user_id_fkey(display_name, avatar_url)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
        return;
      }

      setReviews(data || []);
      
      // Calculate statistics
      if (data && data.length > 0) {
        const totalReviews = data.length;
        const totalRating = data.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / totalReviews;
        
        const distribution = [0, 0, 0, 0, 0];
        data.forEach(review => {
          distribution[review.rating - 1]++;
        });
        
        setStats({
          averageRating,
          totalReviews,
          ratingDistribution: distribution
        });
      } else {
        setStats({
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: [0, 0, 0, 0, 0]
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-muted rounded animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      {stats.totalReviews > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Avis clients</h3>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-3xl font-bold">{stats.averageRating.toFixed(1)}</div>
              <div>
                {renderStars(Math.round(stats.averageRating))}
                <p className="text-sm text-muted-foreground mt-1">
                  {stats.totalReviews} avis
                </p>
              </div>
            </div>
            
            {/* Rating distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <span className="w-8">{rating}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width: `${stats.totalReviews > 0 ? (stats.ratingDistribution[rating - 1] / stats.totalReviews) * 100 : 0}%`
                      }}
                    />
                  </div>
                  <span className="w-8 text-right">{stats.ratingDistribution[rating - 1]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews list */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Aucun avis pour ce produit</p>
              <p className="text-sm text-muted-foreground mt-1">
                Soyez le premier à laisser un avis !
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className={review.is_featured ? 'border-primary' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {review.profiles?.avatar_url ? (
                        <img
                          src={review.profiles.avatar_url}
                          alt={review.profiles.display_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-primary font-medium">
                          {review.profiles?.display_name?.charAt(0) || '?'}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{review.profiles?.display_name || 'Utilisateur'}</span>
                        {review.is_verified && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <Verified className="h-3 w-3" />
                            Achat vérifié
                          </Badge>
                        )}
                        {review.is_featured && (
                          <Badge variant="default" className="text-xs">
                            Avis vedette
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(review.created_at)}
                      </p>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>
              </CardHeader>
              
              {(review.title || review.content) && (
                <CardContent className="pt-0">
                  {review.title && (
                    <h4 className="font-medium mb-2">{review.title}</h4>
                  )}
                  {review.content && (
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {review.content}
                    </p>
                  )}
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};