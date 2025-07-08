import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  BarChart3, 
  TrendingUp,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  Eye,
  Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
  topProducts: Array<{
    name: string;
    revenue: number;
    orders: number;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
}

export default function VendorAnalytics() {
  const { profile } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    averageOrderValue: 0,
    topProducts: [],
    monthlyRevenue: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchAnalytics();
    }
  }, [profile]);

  const fetchAnalytics = async () => {
    try {
      // Get vendor info
      const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', profile?.user_id)
        .single();

      if (!vendor) return;

      // Fetch order items for revenue calculation
      const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
          total,
          product_name,
          created_at,
          orders!inner(status)
        `)
        .eq('vendor_id', vendor.id)
        .eq('orders.status', 'completed');

      // Fetch products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', vendor.id);

      // Calculate analytics
      const totalRevenue = orderItems?.reduce((sum, item) => sum + item.total, 0) || 0;
      const totalOrders = orderItems?.length || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Calculate top products
      const productRevenue: { [key: string]: { revenue: number; orders: number } } = {};
      orderItems?.forEach(item => {
        if (!productRevenue[item.product_name]) {
          productRevenue[item.product_name] = { revenue: 0, orders: 0 };
        }
        productRevenue[item.product_name].revenue += item.total;
        productRevenue[item.product_name].orders += 1;
      });

      const topProducts = Object.entries(productRevenue)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Calculate monthly revenue (last 6 months)
      const monthlyData: { [key: string]: number } = {};
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        monthlyData[monthKey] = 0;
      }

      orderItems?.forEach(item => {
        const date = new Date(item.created_at);
        const monthKey = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        if (monthlyData[monthKey] !== undefined) {
          monthlyData[monthKey] += item.total;
        }
      });

      const monthlyRevenue = Object.entries(monthlyData).map(([month, revenue]) => ({
        month,
        revenue
      }));

      setAnalytics({
        totalRevenue,
        totalOrders,
        totalProducts: productsCount || 0,
        averageOrderValue,
        topProducts,
        monthlyRevenue
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-muted/30">
        <header className="bg-background border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Statistiques</h1>
                <p className="text-muted-foreground">
                  Suivez les performances de votre boutique
                </p>
              </div>
              <Badge variant="outline" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytiques
              </Badge>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Métriques principales */}
              <div className="grid md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Revenus Totaux
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalRevenue.toLocaleString()} FCFA</div>
                    <p className="text-xs text-muted-foreground">
                      +20.1% par rapport au mois dernier
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Commandes
                    </CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalOrders}</div>
                    <p className="text-xs text-muted-foreground">
                      +12% par rapport au mois dernier
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Produits
                    </CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalProducts}</div>
                    <p className="text-xs text-muted-foreground">
                      Dans votre catalogue
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Panier Moyen
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.averageOrderValue.toLocaleString()} FCFA</div>
                    <p className="text-xs text-muted-foreground">
                      Par commande
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Revenus mensuels */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Revenus des 6 derniers mois
                    </CardTitle>
                    <CardDescription>
                      Évolution de vos revenus mensuels
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.monthlyRevenue.map((month, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{month.month}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary rounded-full h-2 transition-all"
                                style={{ 
                                  width: `${Math.max(10, (month.revenue / Math.max(...analytics.monthlyRevenue.map(m => m.revenue))) * 100)}%` 
                                }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground min-w-20 text-right">
                              {month.revenue.toLocaleString()} FCFA
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top produits */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Top 5 Produits
                    </CardTitle>
                    <CardDescription>
                      Vos produits les plus vendus
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.topProducts.length > 0 ? (
                        analytics.topProducts.map((product, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{product.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {product.orders} commandes
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-sm">{product.revenue.toLocaleString()} FCFA</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                          <p>Aucune vente pour le moment</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Métriques supplémentaires */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Vues Produits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">1,234</div>
                    <p className="text-sm text-muted-foreground">
                      +15% ce mois-ci
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Taux de Conversion
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">3.2%</div>
                    <p className="text-sm text-muted-foreground">
                      Visiteurs → Acheteurs
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Note Moyenne
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-2">4.8/5</div>
                    <p className="text-sm text-muted-foreground">
                      Basé sur 156 avis
                    </p>
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