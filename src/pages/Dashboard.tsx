import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
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

interface DashboardStats {
  ordersCount: number;
  wishlistCount: number;
  cartCount: number;
}

export default function Dashboard() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    ordersCount: 0,
    wishlistCount: 0,
    cartCount: 0
  });

  useEffect(() => {
    if (profile) {
      fetchUserStats();
    }
  }, [profile]);

  const fetchUserStats = async () => {
    if (!profile) return;

    try {
      // Fetch orders count
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.user_id);

      // Fetch wishlist count
      const { count: wishlistCount } = await supabase
        .from('wishlists')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.user_id);

      // Fetch cart count
      const { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', profile.user_id)
        .single();

      let cartCount = 0;
      if (cart) {
        const { count } = await supabase
          .from('cart_items')
          .select('*', { count: 'exact', head: true })
          .eq('cart_id', cart.id);
        cartCount = count || 0;
      }

      setStats({
        ordersCount: ordersCount || 0,
        wishlistCount: wishlistCount || 0,
        cartCount
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const quickActions = [
    {
      title: 'Parcourir le Marketplace',
      description: 'Découvrez nos produits numériques',
      icon: Store,
      href: '/#marketplace',
      color: 'bg-blue-500'
    },
    {
      title: 'Mon Panier',
      description: `${stats.cartCount} articles`,
      icon: ShoppingCart,
      href: '/cart',
      color: 'bg-green-500'
    },
    {
      title: 'Ma Liste de Souhaits',
      description: `${stats.wishlistCount} produits`,
      icon: Heart,
      href: '/wishlist',
      color: 'bg-red-500'
    },
    {
      title: 'Mes Commandes',
      description: `${stats.ordersCount} commandes`,
      icon: Package,
      href: '/orders',
      color: 'bg-purple-500'
    }
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-muted/30">
        {/* Header */}
        <header className="bg-background border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Tableau de Bord Client</h1>
                <p className="text-muted-foreground">
                  Bienvenue, {profile?.display_name}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="gap-2">
                  <User className="h-4 w-4" />
                  {profile?.role}
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Welcome Card */}
          <Card className="mb-8 bg-gradient-primary text-white">
            <CardHeader>
              <CardTitle className="text-white">
                Bienvenue sur G-STARTUP LTD
              </CardTitle>
              <CardDescription className="text-white/80">
                Votre marketplace numérique pour scripts, thèmes et solutions digitales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-white/90">
                    Explorez notre vaste collection de produits numériques professionnels
                  </p>
                </div>
                <Button variant="secondary" size="lg">
                  <Store className="mr-2 h-5 w-5" />
                  Explorer le Marketplace
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Commandes Totales
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.ordersCount}</div>
                <p className="text-xs text-muted-foreground">
                  Toutes vos commandes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Articles Favoris
                </CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.wishlistCount}</div>
                <p className="text-xs text-muted-foreground">
                  Dans votre liste de souhaits
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Panier Actuel
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.cartCount}</div>
                <p className="text-xs text-muted-foreground">
                  Articles en attente
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Actions Rapides</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-base">{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Account Management */}
          <div className="grid md:grid-cols-2 gap-6">
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
                <Button variant="outline" className="w-full">
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
                    <span className="text-sm">Connexion récente</span>
                    <span className="text-xs text-muted-foreground">Aujourd'hui</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Compte créé</span>
                    <span className="text-xs text-muted-foreground">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                    </span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
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