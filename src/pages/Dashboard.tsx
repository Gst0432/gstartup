import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  ShoppingCart, 
  Heart, 
  Package, 
  CreditCard, 
  User, 
  Settings,
  Store,
  TrendingUp,
  History
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';

interface DashboardStats {
  ordersCount: number;
  completedOrders: number;
  pendingOrders: number;
  totalSpent: number;
  wishlistCount: number;
  cartCount: number;
  cartValue: number;
  lastOrderDate: string | null;
}

export default function Dashboard() {
  const { profile, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    ordersCount: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalSpent: 0,
    wishlistCount: 0,
    cartCount: 0,
    cartValue: 0,
    lastOrderDate: null
  });

  // Rediriger les utilisateurs vers leur tableau de bord approprié
  if (!authLoading && profile) {
    if (profile.role === 'vendor') {
      return <Navigate to="/vendor" replace />;
    }
    if (profile.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
  }

  useEffect(() => {
    if (profile) {
      fetchUserStats();
    }
  }, [profile]);

  const fetchUserStats = async () => {
    if (!profile) return;

    try {
      // Fetch orders statistics
      const { data: orders, count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .eq('user_id', profile.user_id);

      const completedOrders = orders?.filter(order => 
        (order.status === 'completed' || order.status === 'confirmed') && order.payment_status === 'paid'
      ).length || 0;

      const pendingOrders = orders?.filter(order => 
        order.status === 'pending' || order.payment_status === 'pending'
      ).length || 0;

      const totalSpent = orders?.reduce((sum, order) => 
        (order.status === 'completed' || order.status === 'confirmed') && order.payment_status === 'paid' 
          ? sum + order.total_amount 
          : sum, 0
      ) || 0;

      const lastOrder = orders?.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      // Fetch wishlist count
      const { count: wishlistCount } = await supabase
        .from('wishlists')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.user_id);

      // Fetch cart statistics
      const { data: cart } = await supabase
        .from('carts')
        .select(`
          id,
          cart_items(
            id,
            quantity,
            products(
              price
            ),
            product_variants(
              price
            )
          )
        `)
        .eq('user_id', profile.user_id)
        .single();

      let cartCount = 0;
      let cartValue = 0;
      if (cart?.cart_items) {
        cartCount = cart.cart_items.length;
        cartValue = cart.cart_items.reduce((sum, item) => {
          const price = item.product_variants?.price || item.products?.price || 0;
          return sum + (price * item.quantity);
        }, 0);
      }

      setStats({
        ordersCount: ordersCount || 0,
        completedOrders,
        pendingOrders,
        totalSpent,
        wishlistCount: wishlistCount || 0,
        cartCount,
        cartValue,
        lastOrderDate: lastOrder?.created_at || null
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const quickActions = [
    {
      title: 'Explorer Marketplace',
      description: 'Découvrez nos nouveautés',
      icon: Store,
      href: '/marketplace',
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      badge: 'Nouveau',
      badgeColor: 'bg-blue-100 text-blue-700'
    },
    {
      title: 'Mon Panier',
      description: `${stats.cartCount} articles · ${stats.cartValue.toLocaleString()} FCFA`,
      icon: ShoppingCart,
      href: '/cart',
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      badge: stats.cartCount > 0 ? `${stats.cartCount}` : null,
      badgeColor: 'bg-green-100 text-green-700'
    },
    {
      title: 'Liste de Souhaits',
      description: `${stats.wishlistCount} produits sauvegardés`,
      icon: Heart,
      href: '/wishlist',
      color: 'bg-gradient-to-r from-red-500 to-red-600',
      badge: stats.wishlistCount > 0 ? `${stats.wishlistCount}` : null,
      badgeColor: 'bg-red-100 text-red-700'
    },
    {
      title: 'Mes Achats',
      description: `${stats.completedOrders} commandes livrées`,
      icon: Package,
      href: '/orders',
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      badge: stats.pendingOrders > 0 ? 'En attente' : null,
      badgeColor: 'bg-purple-100 text-purple-700'
    }
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <header className="bg-background border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Tableau de Bord Client</h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Bienvenue, {profile?.display_name}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="gap-2 text-xs sm:text-sm">
                  <User className="h-3 w-3 sm:h-4 sm:w-4" />
                  {profile?.role}
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-4 sm:py-8">
          {/* Welcome Card */}
          <Card className="mb-6 sm:mb-8 bg-gradient-primary text-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-lg sm:text-xl">
                Bienvenue sur G-STARTUP LTD
              </CardTitle>
              <CardDescription className="text-white/80 text-sm sm:text-base">
                Votre marketplace numérique pour scripts, thèmes et solutions digitales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <p className="text-white/90 text-sm sm:text-base">
                    Explorez notre vaste collection de produits numériques professionnels
                  </p>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="sm:size-lg w-full sm:w-auto"
                  onClick={() => window.location.href = '/marketplace'}
                >
                  <Store className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Explorer le Marketplace
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="hover-scale transition-all duration-300 border-l-4 border-l-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Commandes Livrées
                </CardTitle>
                <Package className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.completedOrders}</div>
                <p className="text-xs text-muted-foreground">
                  Sur {stats.ordersCount} total
                </p>
              </CardContent>
            </Card>

            <Card className="hover-scale transition-all duration-300 border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Dépensé
                </CardTitle>
                <CreditCard className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalSpent.toLocaleString()} FCFA
                </div>
                <p className="text-xs text-muted-foreground">
                  Tous vos achats
                </p>
              </CardContent>
            </Card>

            <Card className="hover-scale transition-all duration-300 border-l-4 border-l-red-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Articles Favoris
                </CardTitle>
                <Heart className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.wishlistCount}</div>
                <p className="text-xs text-muted-foreground">
                  Dans votre liste de souhaits
                </p>
              </CardContent>
            </Card>

            <Card className="hover-scale transition-all duration-300 border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Panier Actuel
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.cartCount}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.cartValue.toLocaleString()} FCFA
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Quick Actions */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Actions Rapides
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Card 
                  key={index} 
                  className="hover-scale group cursor-pointer transition-all duration-300 hover:shadow-xl border-0 bg-gradient-to-br from-background to-muted/30"
                  onClick={() => window.location.href = action.href}
                >
                  <CardHeader className="pb-3 relative overflow-hidden">
                    <div className={`w-14 h-14 ${action.color} rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="h-7 w-7 text-white" />
                    </div>
                    {action.badge && (
                      <Badge 
                        className={`absolute top-2 right-2 ${action.badgeColor} text-xs px-2 py-1`}
                      >
                        {action.badge}
                      </Badge>
                    )}
                    <CardTitle className="text-base group-hover:text-primary transition-colors">
                      {action.title}
                    </CardTitle>
                    <CardDescription className="text-xs leading-relaxed">
                      {action.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Account Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">Nom d'affichage</p>
                  <p className="text-muted-foreground">{profile?.display_name}</p>
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground">{profile?.email}</p>
                </div>
                <div>
                  <p className="font-medium">Statut</p>
                  <Badge variant={profile?.is_verified ? "default" : "secondary"}>
                    {profile?.is_verified ? "Vérifié" : "Non vérifié"}
                  </Badge>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = '/profile'}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Modifier le Profil
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Activité Récente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Dernière commande</span>
                    <span className="text-xs text-muted-foreground">
                      {stats.lastOrderDate 
                        ? new Date(stats.lastOrderDate).toLocaleDateString('fr-FR')
                        : 'Aucune commande'
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Statut d'activité</span>
                    <Badge variant="secondary" className="text-xs">
                      {stats.ordersCount > 0 ? 'Client actif' : 'Nouveau client'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Compte créé</span>
                    <span className="text-xs text-muted-foreground">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                    </span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => window.location.href = '/orders'}
                >
                  <History className="mr-2 h-4 w-4" />
                  Voir l'Historique
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}