import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Store, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Star,
  Plus,
  Eye,
  ArrowUpRight,
  Calendar,
  CreditCard,
  Settings,
  BookOpen,
  HelpCircle,
  Bell
} from 'lucide-react';

interface VendorStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  averageRating: number;
  recentOrders: any[];
  subscriptionStatus: string;
  subscriptionExpiry: string;
}

export default function VendorDashboard() {
  const [stats, setStats] = useState<VendorStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    averageRating: 0,
    recentOrders: [],
    subscriptionStatus: 'inactive',
    subscriptionExpiry: ''
  });
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadVendorStats();
    }
  }, [user]);

  const loadVendorStats = async () => {
    try {
      // Charger les stats du vendeur
      const [productsResult, ordersResult, vendorResult] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('vendor_id', user?.id),
        supabase
          .from('order_items')
          .select(`
            *,
            orders (
              id,
              total_amount,
              status,
              created_at,
              user_id
            )
          `)
          .eq('vendor_id', user?.id),
        supabase
          .from('vendors')
          .select('*')
          .eq('user_id', user?.id)
          .single()
      ]);

      const products = productsResult.data || [];
      const orderItems = ordersResult.data || [];
      const vendor = vendorResult.data;

      // Calculer les statistiques
      const orders = orderItems.map(item => item.orders).filter(order => order);
      const uniqueOrders = Array.from(new Set(orders.map(o => o.id))).map(id => 
        orders.find(o => o.id === id)
      );
      
      const revenue = orderItems.reduce((sum, item) => sum + (item.total || 0), 0);
      const uniqueCustomers = new Set(orders.map(o => o.user_id)).size;

      setStats({
        totalProducts: products.length,
        totalOrders: uniqueOrders.length,
        totalRevenue: revenue,
        totalCustomers: uniqueCustomers,
        averageRating: vendor?.rating || 0,
        recentOrders: uniqueOrders.slice(-5).reverse(),
        subscriptionStatus: vendor?.subscription_status || 'inactive',
        subscriptionExpiry: vendor?.subscription_expires_at || ''
      });

    } catch (error) {
      console.error('Error loading vendor stats:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Ajouter un produit",
      description: "Créer un nouveau produit",
      icon: Plus,
      action: () => navigate('/vendor/products/new'),
      color: "bg-blue-500"
    },
    {
      title: "Voir ma boutique",
      description: "Aperçu public de votre boutique",
      icon: Eye,
      action: () => window.open(`/store/${user?.id}`, '_blank'),
      color: "bg-green-500"
    },
    {
      title: "Configuration",
      description: "Paramètres de votre boutique",
      icon: Settings,
      action: () => navigate('/vendor/profile'),
      color: "bg-purple-500"
    },
    {
      title: "Guide vendeur",
      description: "Apprenez à optimiser vos ventes",
      icon: BookOpen,
      action: () => navigate('/vendor-guide'),
      color: "bg-orange-500"
    }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                  <div className="h-8 bg-muted rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tableau de bord vendeur</h1>
            <p className="text-muted-foreground">
              Bienvenue {profile?.display_name || 'Vendeur'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {stats.subscriptionStatus === 'active' ? (
              <Badge className="bg-green-500">
                Abonnement actif
              </Badge>
            ) : (
              <Button asChild>
                <a href="/vendor-pricing">
                  Activer l'abonnement
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Alertes */}
        {stats.subscriptionStatus !== 'active' && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-800">
                    Activez votre abonnement vendeur
                  </p>
                  <p className="text-sm text-orange-600">
                    Profitez de toutes les fonctionnalités et commencez à vendre
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <a href="/vendor-pricing">
                    Voir les offres
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Produits</p>
                  <p className="text-2xl font-bold">{stats.totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Commandes</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Revenus</p>
                  <p className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} FCFA</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Clients</p>
                  <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                </div>
                <Users className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Card key={index} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={action.action}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Commandes récentes et performance */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Commandes récentes</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">Commande #{order.id.slice(-8)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{order.total_amount.toLocaleString()} FCFA</p>
                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Aucune commande pour le moment
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Produits actifs</span>
                  <span className="text-sm">{stats.totalProducts}/100</span>
                </div>
                <Progress value={(stats.totalProducts / 100) * 100} />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Note moyenne</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{stats.averageRating.toFixed(1)}/5</span>
                  </div>
                </div>
                <Progress value={(stats.averageRating / 5) * 100} />
              </div>

              <div className="pt-4 border-t">
                <Button asChild variant="outline" className="w-full">
                  <a href="/vendor-support">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Obtenir de l'aide
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}