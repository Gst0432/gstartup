import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Plus,
  BarChart3,
  Settings,
  Store,
  ShoppingCart,
  Star
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VendorStats {
  productsCount: number;
  ordersCount: number;
  totalRevenue: number;
  avgRating: number;
}

export default function VendorDashboard() {
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState<VendorStats>({
    productsCount: 0,
    ordersCount: 0,
    totalRevenue: 0,
    avgRating: 0
  });
  const [vendor, setVendor] = useState<any>(null);

  useEffect(() => {
    if (profile) {
      fetchVendorData();
    }
  }, [profile]);

  const fetchVendorData = async () => {
    if (!profile) return;

    try {
      // Get vendor profile
      let { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', profile.user_id)
        .single();

      // If no vendor profile exists and user has vendor role, create one
      if (vendorError && vendorError.code === 'PGRST116' && profile.role === 'vendor') {
        const { data: newVendor, error: createError } = await supabase
          .from('vendors')
          .insert({
            user_id: profile.user_id,
            business_name: profile.display_name + " Business",
            description: "Nouveau vendeur sur G-STARTUP LTD",
            is_active: true,
            is_verified: false
          })
          .select()
          .single();

        if (!createError && newVendor) {
          setVendor(newVendor);
          vendorData = newVendor;
        } else {
          console.error('Error creating vendor profile:', createError);
          return;
        }
      } else if (vendorError) {
        console.error('Error fetching vendor:', vendorError);
        return;
      } else {
        setVendor(vendorData);
      }

      if (vendorData) {
        // Fetch products count
        const { count: productsCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('vendor_id', vendorData.id);

        // Fetch orders count for vendor products
        const { count: ordersCount } = await supabase
          .from('order_items')
          .select('*', { count: 'exact', head: true })
          .eq('vendor_id', vendorData.id);

        // Calculate total revenue
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('total')
          .eq('vendor_id', vendorData.id);

        const totalRevenue = orderItems?.reduce((sum, item) => sum + Number(item.total), 0) || 0;

        setStats({
          productsCount: productsCount || 0,
          ordersCount: ordersCount || 0,
          totalRevenue,
          avgRating: vendorData.rating || 0
        });
      }
    } catch (error) {
      console.error('Error fetching vendor data:', error);
    }
  };

  const quickActions = [
    {
      title: 'Ajouter un Produit',
      description: 'Créer un nouveau produit',
      icon: Plus,
      href: '/vendor/products/new',
      color: 'bg-green-500'
    },
    {
      title: 'Gérer les Produits',
      description: `${stats.productsCount} produits`,
      icon: Package,
      href: '/vendor/products',
      color: 'bg-blue-500'
    },
    {
      title: 'Commandes',
      description: `${stats.ordersCount} commandes`,
      icon: ShoppingCart,
      href: '/vendor/orders',
      color: 'bg-purple-500'
    },
    {
      title: 'Statistiques',
      description: 'Analytics détaillées',
      icon: BarChart3,
      href: '/vendor/analytics',
      color: 'bg-orange-500'
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
                <h1 className="text-2xl font-bold">Tableau de Bord Vendeur</h1>
                <p className="text-muted-foreground">
                  {vendor?.business_name || profile?.display_name}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="gap-2">
                  <Store className="h-4 w-4" />
                  Vendeur
                  {vendor?.is_verified && (
                    <Badge variant="default" className="ml-1">Vérifié</Badge>
                  )}
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Welcome Card */}
          {!vendor ? (
            <Card className="mb-8 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800">
                  Configuration du profil vendeur...
                </CardTitle>
                <CardDescription className="text-blue-700">
                  Votre profil vendeur est en cours de création
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="text-blue-800">Configuration en cours...</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-8 bg-gradient-primary text-white">
              <CardHeader>
                <CardTitle className="text-white">
                  Bienvenue {vendor.business_name}
                </CardTitle>
                <CardDescription className="text-white/80">
                  Gérez vos produits et suivez vos ventes sur G-STARTUP LTD
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-white/90">
                      {vendor.description || "Développez votre business sur notre marketplace"}
                    </p>
                  </div>
                  <Button variant="secondary" size="lg">
                    <Plus className="mr-2 h-5 w-5" />
                    Nouveau Produit
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Produits
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.productsCount}</div>
                <p className="text-xs text-muted-foreground">
                  Produits actifs
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
                <div className="text-2xl font-bold">{stats.ordersCount}</div>
                <p className="text-xs text-muted-foreground">
                  Commandes totales
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Revenus
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Revenus totaux
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Note Moyenne
                </CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground">
                  Sur 5 étoiles
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

          {/* Recent Activity & Performance */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Ventes ce mois</span>
                  <span className="font-medium">{stats.ordersCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Produits populaires</span>
                  <span className="font-medium">{Math.min(stats.productsCount, 5)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Taux de conversion</span>
                  <span className="font-medium">12.5%</span>
                </div>
                {vendor && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total des ventes</span>
                    <span className="font-medium">{vendor.total_sales}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Profil Vendeur
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {vendor ? (
                  <>
                    <div>
                      <p className="font-medium">Nom de l'entreprise</p>
                      <p className="text-muted-foreground">{vendor.business_name}</p>
                    </div>
                    <div>
                      <p className="font-medium">Statut</p>
                      <Badge variant={vendor.is_verified ? "default" : "secondary"}>
                        {vendor.is_verified ? "Vérifié" : "En attente"}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium">Note</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{vendor.rating?.toFixed(1) || "0.0"}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    Créez votre profil vendeur pour commencer
                  </p>
                )}
                <Button variant="outline" className="w-full">
                  <Settings className="mr-2 h-4 w-4" />
                  Gérer le Profil
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}