
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, ShoppingCart, Eye, Star, Share2, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';
import { usePendingPurchase } from '@/hooks/usePendingPurchase';
import { ReviewForm } from '@/components/ReviewForm';
import { ReviewsList } from '@/components/ReviewsList';

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
    logo_url: string | null;
  };
  category: {
    name: string;
  };
  is_featured: boolean;
  quantity: number;
  tags: string[];
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currency, t } = useLanguage();
  const { toast } = useToast();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { savePendingPurchase, executePendingPurchase, pendingPurchase, clearPendingPurchase } = usePendingPurchase();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [reviewsRefreshTrigger, setReviewsRefreshTrigger] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Exécuter l'achat en attente après authentification
  useEffect(() => {
    if (isAuthenticated && !authLoading && pendingPurchase) {
      handlePendingPurchase();
    }
  }, [isAuthenticated, authLoading, pendingPurchase]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          vendor:vendors!products_vendor_id_fkey(business_name, logo_url),
          category:categories!products_category_id_fkey(name)
        `)
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "Erreur",
          description: "Produit non trouvé",
          variant: "destructive"
        });
        navigate('/');
        return;
      }

      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le produit",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePendingPurchase = async () => {
    if (!pendingPurchase) return;

    const paymentUrl = await executePendingPurchase();
    if (paymentUrl) {
      toast({
        title: "Redirection vers le paiement",
        description: "Votre achat va être finalisé...",
      });
      setTimeout(() => {
        window.open(paymentUrl, '_blank');
      }, 1000);
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de finaliser l'achat",
        variant: "destructive"
      });
      clearPendingPurchase();
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

  const handleBuy = async () => {
    if (!isAuthenticated) {
      // Sauvegarder l'intention d'achat et inviter à s'inscrire
      if (product) {
        savePendingPurchase(product.id, 1);
        setShowAuthPrompt(true);
      }
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { 
          productId: product?.id,
          quantity: 1 
        }
      });

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de créer le paiement",
          variant: "destructive"
        });
        return;
      }

      if (data.success && data.payment_url) {
        window.open(data.payment_url, '_blank');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Erreur", 
        description: "Une erreur est survenue",
        variant: "destructive"
      });
    }
  };

  const handleAuthRedirect = () => {
    navigate('/auth');
  };

  const handlePreview = () => {
    if (product?.preview_url) {
      window.open(product.preview_url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('productNotFound')}</h1>
          <Button onClick={() => navigate('/')}>{t('returnHome')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('back')}
          </Button>
          <div className="flex-1" />
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            {t('share')}
          </Button>
        </div>

        {/* Alerte d'inscription requise */}
        {showAuthPrompt && (
          <Alert className="mb-6 border-primary bg-primary/5">
            <UserPlus className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                {t('authRequired')}
              </span>
              <div className="flex gap-2 ml-4">
                <Button size="sm" onClick={handleAuthRedirect}>
                  {t('signupLogin')}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setShowAuthPrompt(false);
                    clearPendingPurchase();
                  }}
                >
                  {t('cancel')}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Confirmation d'achat en attente après connexion */}
        {isAuthenticated && pendingPurchase && (
          <Alert className="mb-6 border-green-500 bg-green-50">
            <ShoppingCart className="h-4 w-4" />
            <AlertDescription>
              {t('welcomeMessage')}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-primary/10 flex items-center justify-center">
                  <div className="text-6xl font-bold text-primary/30">
                    {product.name.charAt(0)}
                  </div>
                </div>
              )}
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImageIndex === index ? 'border-primary' : 'border-muted'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex gap-2">
              <Badge variant="secondary">{product.category.name}</Badge>
              {product.is_featured && (
                <Badge variant="default">
                  <Star className="h-3 w-3 mr-1" />
                  {t('featured')}
                </Badge>
              )}
            </div>

            {/* Title & Vendor */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                {product.vendor.logo_url && (
                  <img 
                    src={product.vendor.logo_url} 
                    alt={product.vendor.business_name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                )}
                <span>{t('by')} {product.vendor.business_name}</span>
              </div>
            </div>

            {/* Price */}
            <div className="text-4xl font-bold text-primary">
              {formatPrice(product.price)}
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              {product.preview_url && (
                <Button variant="outline" onClick={handlePreview} className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  {t('preview')}
                </Button>
              )}
              <Button onClick={handleBuy} className="flex-1" size="lg">
                <ShoppingCart className="h-4 w-4 mr-2" />
                {isAuthenticated ? t('buyNow') : t('buyRequireAuth')}
              </Button>
            </div>

            {/* Add Review Button for authenticated users */}
            {isAuthenticated && (
              <div className="pt-4 border-t">
                <ReviewForm
                  productId={product.id}
                  productName={product.name}
                  onReviewSubmitted={() => {
                    setReviewsRefreshTrigger(prev => prev + 1);
                    toast({
                      title: t('reviewAdded'),
                      description: t('thankYouReview')
                    });
                  }}
                />
              </div>
            )}

            {/* Produit numérique */}
            <div className="text-sm text-muted-foreground">
              📱 {t('digitalProduct')}
            </div>
          </div>
        </div>

        {/* Description */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>{t('productDescription')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <div className="mt-12">
          <ReviewsList 
            productId={product.id} 
            refreshTrigger={reviewsRefreshTrigger}
          />
        </div>
      </div>
    </div>
  );
}
