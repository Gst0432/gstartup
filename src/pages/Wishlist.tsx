import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  Heart, 
  ShoppingCart,
  Search,
  Package,
  Trash,
  Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WishlistItem {
  id: string;
  created_at: string;
  product: {
    id: string;
    name: string;
    price: number;
    compare_price: number | null;
    images: string[];
    is_active: boolean;
    vendor: {
      business_name: string;
    };
  };
}

export default function Wishlist() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (profile) {
      fetchWishlist();
    }
  }, [profile]);

  const fetchWishlist = async () => {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          products!inner(
            id,
            name,
            price,
            compare_price,
            images,
            is_active,
            vendors!inner(business_name)
          )
        `)
        .eq('user_id', profile?.user_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching wishlist:', error);
        return;
      }

      const transformedData = data?.map(item => ({
        ...item,
        product: {
          ...item.products,
          vendor: item.products.vendors
        }
      })) || [];

      setWishlistItems(transformedData);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', itemId);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer de la liste de souhaits",
          variant: "destructive"
        });
        return;
      }

      setWishlistItems(wishlistItems.filter(item => item.id !== itemId));
      toast({
        title: "Succès",
        description: "Produit supprimé de votre liste de souhaits",
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const addToCart = async (productId: string) => {
    try {
      // Get or create cart
      let { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', profile?.user_id)
        .single();

      if (!cart) {
        const { data: newCart, error: cartError } = await supabase
          .from('carts')
          .insert({ user_id: profile?.user_id })
          .select('id')
          .single();

        if (cartError) {
          console.error('Error creating cart:', cartError);
          return;
        }
        cart = newCart;
      }

      // Check if item already in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cart.id)
        .eq('product_id', productId)
        .single();

      if (existingItem) {
        // Update quantity
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);

        if (error) {
          toast({
            title: "Erreur",
            description: "Impossible d'ajouter au panier",
            variant: "destructive"
          });
          return;
        }
      } else {
        // Add new item
        const { error } = await supabase
          .from('cart_items')
          .insert({
            cart_id: cart.id,
            product_id: productId,
            quantity: 1
          });

        if (error) {
          toast({
            title: "Erreur",
            description: "Impossible d'ajouter au panier",
            variant: "destructive"
          });
          return;
        }
      }

      toast({
        title: "Succès",
        description: "Produit ajouté au panier avec succès !",
      });
      
      // Option: retirer automatiquement de la wishlist après ajout au panier
      // Uncomment les lignes suivantes si souhaité
      // setTimeout(() => {
      //   const itemToRemove = wishlistItems.find(item => item.product.id === productId);
      //   if (itemToRemove) removeFromWishlist(itemToRemove.id);
      // }, 1000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const filteredItems = wishlistItems.filter(item =>
    item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product.vendor.business_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateDiscount = (price: number, comparePrice: number | null) => {
    if (!comparePrice || comparePrice <= price) return 0;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-muted/30">
        <header className="bg-background border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Ma Liste de Souhaits</h1>
                <p className="text-muted-foreground">
                  Vos produits favoris en un seul endroit
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="gap-2">
                  <Heart className="h-4 w-4" />
                  {filteredItems.length} produits
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Recherche */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Recherche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher dans vos favoris..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Liste des souhaits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Mes Produits Favoris
              </CardTitle>
              <CardDescription>
                Gérez votre liste de produits favoris
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {searchTerm ? "Aucun produit trouvé" : "Votre liste de souhaits est vide"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm 
                      ? "Essayez avec d'autres mots-clés" 
                      : "Découvrez notre marketplace et ajoutez des produits à vos favoris"
                    }
                  </p>
                  {!searchTerm && (
                    <Button 
                      onClick={() => window.location.href = '/marketplace'}
                      className="hover-scale"
                    >
                      Parcourir le Marketplace
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="animate-fade-in border rounded-lg overflow-hidden hover-scale transition-all duration-300 group"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="relative">
                        {item.product.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-muted flex items-center justify-center">
                            <Package className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
                          onClick={() => removeFromWishlist(item.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>

                        {item.product.compare_price && calculateDiscount(item.product.price, item.product.compare_price) > 0 && (
                          <Badge className="absolute top-2 left-2" variant="destructive">
                            -{calculateDiscount(item.product.price, item.product.compare_price)}%
                          </Badge>
                        )}

                        {!item.product.is_active && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Badge variant="destructive">Indisponible</Badge>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <div className="mb-2">
                          <h3 className="font-medium line-clamp-2 mb-1">{item.product.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {item.product.vendor.business_name}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-bold text-primary">
                            {item.product.price.toLocaleString()} FCFA
                          </span>
                          {item.product.compare_price && item.product.compare_price > item.product.price && (
                            <span className="text-sm text-muted-foreground line-through">
                              {item.product.compare_price.toLocaleString()} FCFA
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            className="flex-1 group-hover:bg-primary/90 transition-colors"
                            disabled={!item.product.is_active}
                            onClick={() => addToCart(item.product.id)}
                          >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Ajouter au panier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromWishlist(item.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Heart className="h-4 w-4 fill-current" />
                          </Button>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mt-2">
                          Ajouté le {new Date(item.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}