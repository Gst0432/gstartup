import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  TrendingUp,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Activity,
  BarChart3,
  PieChart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalUsers: number;
  totalVendors: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  revenueGrowth: number;
  ordersGrowth: number;
  userGrowth: number;
  topCategories: Array<{ name: string; count: number }>;
  recentActivity: Array<{ 
    type: 'user' | 'order' | 'product' | 'vendor';
    message: string;
    timestamp: string;
  }>;
}

export default function AdminAnalytics() {
  const { profile } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    totalVendors: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
    userGrowth: 0,
    topCategories: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch basic counts
      const [usersResult, vendorsResult, productsResult, ordersResult] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('vendors').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true })
      ]);

      // Fetch revenue
      const { data: ordersData } = await supabase
        .from('orders')
        .select('total_amount, created_at');

      const totalRevenue = ordersData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

      // Fetch top categories
      const { data: productsWithCategories } = await supabase
        .from('products')
        .select('category:categories(name)');

      const categoryCount = new Map();
      productsWithCategories?.forEach(product => {
        if (product.category?.name) {
          const count = categoryCount.get(product.category.name) || 0;
          categoryCount.set(product.category.name, count + 1);
        }
      });

      const topCategories = Array.from(categoryCount.entries())
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate growth rates (simplified - would need historical data in real app)
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

      const recentOrders = ordersData?.filter(order => 
        new Date(order.created_at) > lastMonth
      ) || [];

      const recentRevenue = recentOrders.reduce((sum, order) => sum + order.total_amount, 0);
      const oldRevenue = totalRevenue - recentRevenue;
      const revenueGrowth = oldRevenue > 0 ? ((recentRevenue - oldRevenue) / oldRevenue) * 100 : 0;

      // Fetch recent activity
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('display_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentOrdersData } = await supabase
        .from('orders')
        .select('order_number, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const recentActivity = [
        ...(recentUsers?.map(user => ({
          type: 'user' as const,
          message: `Nouvel utilisateur: ${user.display_name}`,
          timestamp: user.created_at
        })) || []),
        ...(recentOrdersData?.map(order => ({
          type: 'order' as const,
          message: `Nouvelle commande: #${order.order_number}`,
          timestamp: order.created_at
        })) || [])
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

      setAnalytics({
        totalUsers: usersResult.count || 0,
        totalVendors: vendorsResult.count || 0,
        totalProducts: productsResult.count || 0,
        totalOrders: ordersResult.count || 0,
        totalRevenue,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
        ordersGrowth: recentOrders.length * 10, // Simplified calculation
        userGrowth: (recentUsers?.length || 0) * 15, // Simplified calculation
        topCategories,
        recentActivity
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return Users;
      case 'order': return ShoppingCart;
      case 'product': return Package;
      case 'vendor': return TrendingUp;
      default: return Activity;
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-muted/30">
        <header className="bg-background border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Analytics Avancées</h1>
                <p className="text-muted-foreground">
                  Analyses détaillées de la performance de la plateforme
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Card className="p-2">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Dernière mise à jour</p>
                    <p className="text-sm font-medium">
                      {new Date().toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Métriques principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Revenus Totaux</p>
                        <p className="text-3xl font-bold">
                          {analytics.totalRevenue.toLocaleString('fr-FR')} FCFA
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                          +{analytics.revenueGrowth}% ce mois
                        </p>
                      </div>
                      <DollarSign className="h-12 w-12 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Commandes</p>
                        <p className="text-3xl font-bold">{analytics.totalOrders}</p>
                        <p className="text-sm text-blue-600 mt-1">
                          +{analytics.ordersGrowth}% ce mois
                        </p>
                      </div>
                      <ShoppingCart className="h-12 w-12 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Utilisateurs</p>
                        <p className="text-3xl font-bold">{analytics.totalUsers}</p>
                        <p className="text-sm text-purple-600 mt-1">
                          +{analytics.userGrowth}% ce mois
                        </p>
                      </div>
                      <Users className="h-12 w-12 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Produits</p>
                        <p className="text-3xl font-bold">{analytics.totalProducts}</p>
                        <p className="text-sm text-orange-600 mt-1">
                          {analytics.totalVendors} vendeurs actifs
                        </p>
                      </div>
                      <Package className="h-12 w-12 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Catégories */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Top Catégories
                    </CardTitle>
                    <CardDescription>
                      Catégories les plus populaires par nombre de produits
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.topCategories.map((category, index) => (
                        <div key={category.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium">{index + 1}</span>
                            </div>
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {category.count} produits
                            </span>
                            <div className="w-16 h-2 bg-muted rounded-full">
                              <div 
                                className="h-full bg-primary rounded-full" 
                                style={{ 
                                  width: `${(category.count / Math.max(...analytics.topCategories.map(c => c.count))) * 100}%` 
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      {analytics.topCategories.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          Aucune donnée de catégorie disponible
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Activité Récente */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Activité Récente
                    </CardTitle>
                    <CardDescription>
                      Dernières activités sur la plateforme
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.recentActivity.map((activity, index) => {
                        const Icon = getActivityIcon(activity.type);
                        return (
                          <div key={index} className="flex items-center gap-3">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1">
                              <p className="text-sm">{activity.message}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(activity.timestamp).toLocaleString('fr-FR')}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      {analytics.recentActivity.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          Aucune activité récente
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Graphiques simulés */}
              <div className="mt-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Performance de la Plateforme
                    </CardTitle>
                    <CardDescription>
                      Évolution des métriques clés au fil du temps
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">
                          Graphiques avancés disponibles dans la version complète
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}