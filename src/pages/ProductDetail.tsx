import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ShoppingCart, Eye, Star, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/hooks/useLanguage';
import { useToast } from '@/hooks/use-toast';

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
  const { currency } = useLanguage();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

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
        // Ouvrir la page de paiement dans un nouvel onglet
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
          <h1 className="text-2xl font-bold mb-4">Produit non trouvé</h1>
          <Button onClick={() => navigate('/')}>Retour à l'accueil</Button>
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
            Retour
          </Button>
          <div className="flex-1" />
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Partager
          </Button>
        </div>

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
                  En vedette
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
                <span>Par {product.vendor.business_name}</span>
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
                  Aperçu
                </Button>
              )}
              <Button onClick={handleBuy} className="flex-1" size="lg">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Acheter maintenant
              </Button>
            </div>

            {/* Stock */}
            <div className="text-sm text-muted-foreground">
              Stock disponible: {product.quantity} unités
            </div>
          </div>
        </div>

        {/* Description */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Description du produit</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}