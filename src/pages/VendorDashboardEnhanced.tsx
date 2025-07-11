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
  Bell,
  AlertCircle
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
  pendingOrders: number;
  completedOrders: number;
  monthlyRevenue: number;
  topProduct: any;
  lowStockProducts: number;
  totalViews: number;
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
    subscriptionExpiry: '',
    pendingOrders: 0,
    completedOrders: 0,
    monthlyRevenue: 0,
    topProduct: null,
    lowStockProducts: 0,
    totalViews: 0
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
              payment_status,
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

      // Calculer les statistiques uniquement pour les commandes payées
      const orders = orderItems.map(item => item.orders).filter(order => order);
      const paidOrders = orders.filter(order => order.payment_status === 'paid');
      const uniquePaidOrders = Array.from(new Set(paidOrders.map(o => o.id))).map(id => 
        paidOrders.find(o => o.id === id)
      );
      
      // Filtrer les order_items pour les commandes payées seulement
      const paidOrderItems = orderItems.filter(item => 
        item.orders && item.orders.payment_status === 'paid'
      );
      
      const revenue = paidOrderItems.reduce((sum, item) => sum + (item.total || 0), 0);
      const uniqueCustomers = new Set(paidOrders.map(o => o.user_id)).size;
      
      // Calculer les commandes en attente et complétées (toutes les commandes)
      const allUniqueOrders = Array.from(new Set(orders.map(o => o.id))).map(id => 
        orders.find(o => o.id === id)
      );
      const pendingOrders = allUniqueOrders.filter(o => o.status === 'pending').length;
      const completedOrders = allUniqueOrders.filter(o => o.status === 'completed').length;
      
      // Revenus du mois en cours (commandes payées seulement)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = paidOrderItems
        .filter(item => {
          const orderDate = new Date(item.orders.created_at);
          return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
        })
        .reduce((sum, item) => sum + (item.total || 0), 0);
      
      // Produit le plus vendu
      const productSales = orderItems.reduce((acc, item) => {
        acc[item.product_id] = (acc[item.product_id] || 0) + item.quantity;
        return acc;
      }, {} as Record<string, number>);
      
      const topProductId = Object.keys(productSales).reduce((a, b) => 
        productSales[a] > productSales[b] ? a : b, Object.keys(productSales)[0]
      );
      const topProduct = products.find(p => p.id === topProductId);
      
      // Produits en rupture de stock
      const lowStockProducts = products.filter(p => (p.quantity || 0) < 5).length;

      setStats({
        totalProducts: products.length,
        totalOrders: uniquePaidOrders.length,
        totalRevenue: revenue,
        totalCustomers: uniqueCustomers,
        averageRating: vendor?.rating || 0,
        recentOrders: uniquePaidOrders.slice(-5).reverse(),
        subscriptionStatus: vendor?.subscription_status || 'inactive',
        subscriptionExpiry: vendor?.subscription_expires_at || '',
        pendingOrders,
        completedOrders,
        monthlyRevenue,
        topProduct,
        lowStockProducts,
        totalViews: Math.floor(Math.random() * 1000) + 100 // Simulation
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
      color: "bg-blue-500",
      badge: null
    },
    {
      title: "Gérer les commandes",
      description: "Traiter les commandes en attente",
      icon: ShoppingCart,
      action: () => navigate('/vendor/orders'),
      color: "bg-green-500",
      badge: stats.pendingOrders > 0 ? `${stats.pendingOrders} en attente` : null
    },
    {
      title: "Voir ma boutique",
      description: "Aperçu public de votre boutique",
      icon: Eye,
      action: () => window.open(`/store/${user?.id}`, '_blank'),
      color: "bg-indigo-500",
      badge: null
    },
    {
      title: "Statistiques détaillées",
      description: "Analytics de performance",
      icon: TrendingUp,
      action: () => navigate('/vendor/analytics'),
      color: "bg-purple-500",
      badge: null
    },
    {
      title: "Gérer les retraits",
      description: "Retirer vos gains",
      icon: CreditCard,
      action: () => navigate('/vendor/withdrawals'),
      color: "bg-emerald-500",
      badge: null
    },
    {
      title: "Configuration",
      description: "Paramètres de votre boutique",
      icon: Settings,
      action: () => navigate('/vendor/profile'),
      color: "bg-gray-500",
      badge: null
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
          <Card className="animate-fade-in border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Produits Totaux</p>
                  <p className="text-2xl font-bold">{stats.totalProducts}</p>
                  <p className="text-xs text-red-500">{stats.lowStockProducts} en rupture</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in border-l-4 border-l-green-500" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Commandes Payées</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                  <div className="flex gap-2 text-xs">
                    <span className="text-orange-500">{stats.pendingOrders} en attente</span>
                    <span className="text-green-500">{stats.completedOrders} complétées</span>
                  </div>
                </div>
                <ShoppingCart className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in border-l-4 border-l-purple-500" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Revenus Totaux</p>
                  <p className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} FCFA</p>
                  <p className="text-xs text-muted-foreground">
                    Ce mois: {stats.monthlyRevenue.toLocaleString()} FCFA
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in border-l-4 border-l-orange-500" style={{ animationDelay: '0.3s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Clients Uniques</p>
                  <p className="text-2xl font-bold">{stats.totalCustomers}</p>
                  <p className="text-xs text-muted-foreground">{stats.totalViews} vues totales</p>
                </div>
                <Users className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Card 
                  key={index} 
                  className="animate-fade-in cursor-pointer hover:shadow-lg hover-scale transition-all duration-300 group" 
                  onClick={action.action}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium">{action.title}</h3>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        </div>
                      </div>
                      {action.badge && (
                        <Badge variant="destructive" className="text-xs">
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Insights et performances */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Commandes récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentOrders.map((order, index) => (
                    <div 
                      key={order.id} 
                      className="animate-fade-in flex items-center justify-between p-3 border rounded hover-scale transition-all"
                      style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                    >
                      <div>
                        <p className="font-medium">Commande #{order.id.slice(-8)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{order.total_amount.toLocaleString()} FCFA</p>
                        <Badge variant={order.status === 'completed' ? 'default' : order.status === 'pending' ? 'secondary' : 'destructive'}>
                          {order.status === 'completed' ? 'Complétée' : 
                           order.status === 'pending' ? 'En attente' : 
                           order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Aucune commande pour le moment</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Taux de conversion</span>
                  <span className="text-sm">{((stats.completedOrders / Math.max(stats.totalOrders, 1)) * 100).toFixed(1)}%</span>
                </div>
                <Progress value={(stats.completedOrders / Math.max(stats.totalOrders, 1)) * 100} />
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

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Stock disponible</span>
                  <span className="text-sm">{stats.totalProducts - stats.lowStockProducts}/{stats.totalProducts}</span>
                </div>
                <Progress value={((stats.totalProducts - stats.lowStockProducts) / Math.max(stats.totalProducts, 1)) * 100} />
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Insights produits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.topProduct ? (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground">Produit le plus vendu</p>
                  <p className="font-medium">{stats.topProduct.name}</p>
                  <p className="text-sm text-muted-foreground">{stats.topProduct.price?.toLocaleString()} FCFA</p>
                </div>
              ) : (
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">Aucune vente pour le moment</p>
                </div>
              )}
              
              {stats.lowStockProducts > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <p className="text-sm font-medium text-red-800">Stock faible</p>
                  </div>
                  <p className="text-sm text-red-600">{stats.lowStockProducts} produit(s) à réapprovisionner</p>
                </div>
              )}

              <div className="pt-4 border-t space-y-2">
                <Button asChild variant="outline" className="w-full">
                  <a href="/vendor/support">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Obtenir de l'aide
                  </a>
                </Button>
                <Button asChild className="w-full">
                  <a href="/vendor-guide">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Guide vendeur
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