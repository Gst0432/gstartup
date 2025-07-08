import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  ShoppingCart, 
  Plus,
  Minus,
  Trash,
  CreditCard,
  Package
} from 'lucide-react';
import { MonerooPaymentButton } from '@/components/MonerooPaymentButton';
import { supabase } from '@/integrations/supabase/client';

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    vendor: {
      business_name: string;
    };
  };
  variant: {
    id: string;
    name: string;
    price: number;
  } | null;
}

export default function Cart() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchCart();
    }
  }, [profile]);

  const fetchCart = async () => {
    try {
      // Get or create cart
      const { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', profile?.user_id)
        .single();

      if (!cart) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products!inner(
            id,
            name,
            price,
            images,
            vendors!inner(business_name)
          ),
          product_variants(
            id,
            name,
            price
          )
        `)
        .eq('cart_id', cart.id);

      if (error) {
        console.error('Error fetching cart:', error);
        return;
      }

      const transformedData = data?.map(item => ({
        ...item,
        product: {
          ...item.products,
          vendor: item.products.vendors
        },
        variant: item.product_variants
      })) || [];

      setCartItems(transformedData);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour la quantité",
          variant: "destructive"
        });
        return;
      }

      setCartItems(cartItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'article",
          variant: "destructive"
        });
        return;
      }

      setCartItems(cartItems.filter(item => item.id !== itemId));
      toast({
        title: "Succès",
        description: "Article supprimé du panier",
      });
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const getItemPrice = (item: CartItem) => {
    return item.variant ? item.variant.price : item.product.price;
  };

  const getItemTotal = (item: CartItem) => {
    return getItemPrice(item) * item.quantity;
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + getItemTotal(item), 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-muted/30">
        <header className="bg-background border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Mon Panier</h1>
                <p className="text-muted-foreground">
                  Gérez vos articles avant l'achat
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  {cartCount} articles
                </Badge>
                <Badge variant="outline" className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  {cartTotal.toLocaleString()} FCFA
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : cartItems.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Votre panier est vide</h3>
                <p className="text-muted-foreground mb-4">
                  Découvrez notre marketplace et ajoutez des produits à votre panier
                </p>
                <Button>
                  Parcourir le Marketplace
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Articles du panier */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Articles ({cartItems.length})
                    </CardTitle>
                    <CardDescription>
                      Gérez les quantités de vos articles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                          {item.product.images?.[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                              <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          
                          <div className="flex-1">
                            <h3 className="font-medium">{item.product.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Vendu par {item.product.vendor.business_name}
                            </p>
                            {item.variant && (
                              <p className="text-sm text-muted-foreground">
                                Variante: {item.variant.name}
                              </p>
                            )}
                            <p className="font-medium text-primary">
                              {getItemPrice(item).toLocaleString()} FCFA
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                              className="w-16 text-center"
                              min="1"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-medium">
                              {getItemTotal(item).toLocaleString()} FCFA
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Récapitulatif */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Récapitulatif</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Sous-total ({cartCount} articles)</span>
                        <span>{cartTotal.toLocaleString()} FCFA</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Livraison</span>
                        <span>Gratuite</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Taxes</span>
                        <span>0 FCFA</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-medium">
                          <span>Total</span>
                          <span>{cartTotal.toLocaleString()} FCFA</span>
                        </div>
                      </div>
                    </div>
                    
                    <MonerooPaymentButton
                      cartItems={cartItems.map(item => ({
                        product_id: item.product.id,
                        quantity: item.quantity,
                        price: getItemPrice(item),
                        variant_id: item.variant?.id
                      }))}
                      paymentMethod="mobile_money"
                      onPaymentStart={() => console.log('Payment started')}
                      onPaymentSuccess={(orderRef) => console.log('Payment success:', orderRef)}
                      onPaymentError={(error) => console.error('Payment error:', error)}
                      className="w-full"
                    />
                    
                    <Button variant="outline" className="w-full">
                      Continuer mes achats
                    </Button>
                    
                    <div className="text-center text-sm text-muted-foreground">
                      <p>Paiement sécurisé • Livraison gratuite</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}