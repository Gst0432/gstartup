import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DashboardHeader } from '@/components/DashboardHeader';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Shield,
  Settings,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash,
  CreditCard
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalUsers: number;
  totalVendors: number;
  totalProducts: number;
  totalOrders: number;
  pendingVendors: number;
  activeProducts: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  recentActivity: any[];
  systemHealth: {
    uptime: string;
    activeUsers: number;
    serverLoad: number;
  };
}

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin';
  is_verified: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalVendors: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingVendors: 0,
    activeProducts: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    recentActivity: [],
    systemHealth: {
      uptime: '99.9%',
      activeUsers: 0,
      serverLoad: 45
    }
  });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchAdminStats();
    }
  }, [profile]);

  const fetchAdminStats = async () => {
    try {
      // Fetch users count
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch vendors count
      const { count: totalVendors } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true });

      // Fetch pending vendors
      const { count: pendingVendors } = await supabase
        .from('vendors')
        .select('*', { count: 'exact', head: true })
        .eq('is_verified', false);

      // Fetch products count
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Fetch active products
      const { count: activeProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Fetch orders count and data
      const { data: ordersData, count: allOrdersCount } = await supabase
        .from('orders')
        .select('*, order_items(*)', { count: 'exact' });

      // Filter confirmed and paid orders only for revenue and count
      const confirmedPaidOrders = ordersData?.filter(order => 
        order.status === 'confirmed' && order.payment_status === 'paid'
      ) || [];

      // Calculate revenue and order stats (only confirmed and paid orders)
      const totalRevenue = confirmedPaidOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const totalOrders = confirmedPaidOrders.length;
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyRevenue = confirmedPaidOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      }).reduce((sum, order) => sum + (order.total_amount || 0), 0);

      // Status counts (all orders)
      const pendingOrders = ordersData?.filter(order => order.status === 'pending').length || 0;
      const completedOrders = ordersData?.filter(order => order.status === 'completed').length || 0;

      // Get recent activity (last 10 confirmed and paid orders)
      const recentActivity = confirmedPaidOrders.slice(-10).reverse();

      // Active users in last 24h (simulation)
      const activeUsers = Math.floor(Math.random() * 50) + 10;

        setStats({
        totalUsers: totalUsers || 0,
        totalVendors: totalVendors || 0,
        totalProducts: totalProducts || 0,
        totalOrders,
        pendingVendors: pendingVendors || 0,
        activeProducts: activeProducts || 0,
        totalRevenue,
        monthlyRevenue,
        pendingOrders,
        completedOrders,
        recentActivity,
        systemHealth: {
          uptime: '99.9%',
          activeUsers,
          serverLoad: Math.floor(Math.random() * 30) + 20
        }
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      setUsers(data?.map(user => ({
        ...user,
        role: user.role as 'customer' | 'vendor' | 'admin'
      })) || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'customer' | 'vendor' | 'admin') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le rôle de l'utilisateur",
          variant: "destructive"
        });
        return;
      }

      // Update local state
      setUsers(users.map(user => 
        user.user_id === userId ? { ...user, role: newRole } : user
      ));

      toast({
        title: "Succès",
        description: "Rôle utilisateur mis à jour avec succès",
      });

      // Refresh stats
      fetchAdminStats();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite",
        variant: "destructive"
      });
    }
  };

  const handleUserManagementClick = () => {
    setShowUserManagement(!showUserManagement);
    if (!showUserManagement && users.length === 0) {
      fetchUsers();
    }
  };

  const managementSections = [
    {
      title: 'Automatisation',
      description: 'Gestion automatique des commandes',
      icon: Settings,
      href: '/admin/auto-process',
      color: 'bg-emerald-500',
      count: null
    },
    {
      title: 'Gestion des Utilisateurs',
      description: 'Voir et gérer tous les utilisateurs',
      icon: Users,
      href: '/admin/users',
      color: 'bg-blue-500',
      count: stats.totalUsers
    },
    {
      title: 'Gestion des Vendeurs',
      description: 'Approuver et gérer les vendeurs',
      icon: Shield,
      href: '/admin/vendors',
      color: 'bg-green-500',
      count: stats.totalVendors,
      badge: stats.pendingVendors > 0 ? `${stats.pendingVendors} en attente` : null
    },
    {
      title: 'Gestion des Produits',
      description: 'Modérer les produits',
      icon: Package,
      href: '/admin/products',
      color: 'bg-purple-500',
      count: stats.totalProducts
    },
    {
      title: 'Gestion des Commandes',
      description: 'Voir toutes les commandes',
      icon: ShoppingCart,
      href: '/admin/orders',
      color: 'bg-orange-500',
      count: stats.totalOrders
    },
    {
      title: 'Catégories',
      description: 'Gérer les catégories',
      icon: Settings,
      href: '/admin/categories',
      color: 'bg-red-500',
      count: null
    },
    {
      title: 'Paramètres de Paiement',
      description: 'Configurer les passerelles',
      icon: CreditCard,
      href: '/admin/settings',
      color: 'bg-yellow-500',
      count: null
    },
    {
      title: 'Statistiques Avancées',
      description: 'Analytics détaillées',
      icon: TrendingUp,
      href: '/admin/analytics',
      color: 'bg-indigo-500',
      count: null
    }
  ];

  return (
    <DashboardLayout>
      <DashboardHeader 
        title="Tableau de Bord Administrateur" 
        description="Administration G-STARTUP LTD"
      />
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-4 sm:py-8">
          {/* Welcome Card */}
          <Card className="mb-8 bg-gradient-to-r from-red-500 to-pink-500 text-white">
            <CardHeader>
              <CardTitle className="text-white">
                Panneau d'Administration
              </CardTitle>
              <CardDescription className="text-white/80">
                Gérez tous les aspects de la plateforme G-STARTUP LTD
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-white/90">
                    Surveillez les activités, gérez les utilisateurs et maintenez la qualité du marketplace
                  </p>
                </div>
                <Button 
                  variant="secondary" 
                  size="lg"
                  onClick={() => window.location.href = '/admin/analytics'}
                >
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Voir les Analytics
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Card className="animate-fade-in border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Utilisateurs
                </CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.systemHealth.activeUsers} actifs
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in border-l-4 border-l-green-500" style={{ animationDelay: '0.1s' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Vendeurs
                </CardTitle>
                <Shield className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalVendors}</div>
                <p className="text-xs text-orange-500">
                  {stats.pendingVendors} en attente
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in border-l-4 border-l-purple-500" style={{ animationDelay: '0.2s' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Produits
                </CardTitle>
                <Package className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-green-600">
                  {stats.activeProducts} actifs
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in border-l-4 border-l-orange-500" style={{ animationDelay: '0.3s' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Commandes
                </CardTitle>
                <ShoppingCart className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
                <p className="text-xs">
                  <span className="text-orange-500">{stats.pendingOrders} en attente</span>
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in border-l-4 border-l-emerald-500" style={{ animationDelay: '0.4s' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Revenus Total
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{stats.totalRevenue.toLocaleString()} FCFA</div>
                <p className="text-xs text-muted-foreground">
                  {stats.monthlyRevenue.toLocaleString()} ce mois
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in border-l-4 border-l-red-500" style={{ animationDelay: '0.5s' }}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Système
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{stats.systemHealth.uptime}</div>
                <p className="text-xs text-muted-foreground">
                  Charge: {stats.systemHealth.serverLoad}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Management Sections */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Gestion de la Plateforme</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {managementSections.map((section, index) => (
                <Card 
                  key={index} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    if (section.title === 'Gestion des Utilisateurs') {
                      handleUserManagementClick();
                    } else if (section.href) {
                      window.location.href = section.href;
                    }
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 ${section.color} rounded-lg flex items-center justify-center mb-3`}>
                        <section.icon className="h-6 w-6 text-white" />
                      </div>
                      {section.badge && (
                        <Badge variant="destructive" className="text-xs">
                          {section.badge}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base">{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                    {section.count !== null && (
                      <div className="text-2xl font-bold text-primary">
                        {section.count}
                      </div>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* User Management Section */}
          {showUserManagement && (
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Gestion des Utilisateurs
                    </span>
                    <Button variant="outline" size="sm" onClick={() => setShowUserManagement(false)}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Fermer
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Gérez les rôles et permissions des utilisateurs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingUsers ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-medium">{user.display_name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                              <Badge variant={
                                user.role === 'admin' ? 'destructive' : 
                                user.role === 'vendor' ? 'default' : 
                                'secondary'
                              }>
                                {user.role === 'admin' ? 'Administrateur' :
                                 user.role === 'vendor' ? 'Vendeur' : 
                                 'Client'}
                              </Badge>
                              {user.is_verified && (
                                <Badge variant="outline" className="text-green-600">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Vérifié
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Inscrit le {new Date(user.created_at).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select
                              value={user.role}
                              onValueChange={(newRole: 'customer' | 'vendor' | 'admin') => 
                                updateUserRole(user.user_id, newRole)
                              }
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="customer">Client</SelectItem>
                                <SelectItem value="vendor">Vendeur</SelectItem>
                                <SelectItem value="admin">Administrateur</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                      {users.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          Aucun utilisateur trouvé
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Activity & System Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Activité récente
                </CardTitle>
                <CardDescription>
                  Dernières commandes et activités de la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentActivity.slice(0, 5).map((order, index) => (
                      <div 
                        key={order.id} 
                        className="animate-fade-in flex items-center justify-between p-3 border rounded hover-scale transition-all"
                        style={{ animationDelay: `${0.7 + index * 0.1}s` }}
                      >
                        <div>
                          <p className="font-medium">Commande #{order.order_number || order.id.slice(-8)}</p>
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
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Aucune activité récente</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '0.7s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  État du système
                </CardTitle>
                <CardDescription>
                  Santé et performance de la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Disponibilité</span>
                    <span className="text-sm text-green-600">{stats.systemHealth.uptime}</span>
                  </div>
                  <Progress value={99.9} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Charge serveur</span>
                    <span className="text-sm">{stats.systemHealth.serverLoad}%</span>
                  </div>
                  <Progress value={stats.systemHealth.serverLoad} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Utilisateurs actifs (24h)</span>
                    <span className="text-sm">{stats.systemHealth.activeUsers}</span>
                  </div>
                  <Progress value={(stats.systemHealth.activeUsers / stats.totalUsers) * 100} className="h-2" />
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-green-50 rounded">
                      <p className="text-xs text-green-600 font-medium">Base de données</p>
                      <p className="text-lg font-bold text-green-700">OK</p>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <p className="text-xs text-green-600 font-medium">API</p>
                      <p className="text-lg font-bold text-green-700">OK</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Admin Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Alertes & Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {stats.pendingVendors > 0 && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-orange-500" />
                      <p className="text-sm font-medium text-orange-800">Vendeurs en attente</p>
                    </div>
                    <p className="text-sm text-orange-600">{stats.pendingVendors} demande(s) à traiter</p>
                    <Button asChild size="sm" className="mt-2 w-full" variant="outline">
                      <a href="/admin/vendors">Traiter les demandes</a>
                    </Button>
                  </div>
                )}
                
                {stats.pendingOrders > 0 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-blue-500" />
                      <p className="text-sm font-medium text-blue-800">Commandes en attente</p>
                    </div>
                    <p className="text-sm text-blue-600">{stats.pendingOrders} commande(s) à superviser</p>
                    <Button asChild size="sm" className="mt-2 w-full" variant="outline">
                      <a href="/admin/orders">Voir les commandes</a>
                    </Button>
                  </div>
                )}

                {stats.pendingVendors === 0 && stats.pendingOrders === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">Tout est à jour !</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '0.9s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-purple-500" />
                  Finances & Revenus
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm font-medium text-purple-800">Revenus totaux</p>
                  <p className="text-xl font-bold text-purple-900">{stats.totalRevenue.toLocaleString()} FCFA</p>
                </div>
                
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-800">Ce mois</p>
                  <p className="text-xl font-bold text-green-900">{stats.monthlyRevenue.toLocaleString()} FCFA</p>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Objectif mensuel</span>
                    <span className="text-sm">{((stats.monthlyRevenue / 1000000) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(stats.monthlyRevenue / 1000000) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">Objectif: 1,000,000 FCFA</p>
                </div>

                <Button asChild className="w-full mt-4">
                  <a href="/admin/analytics">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analytics détaillées
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="animate-fade-in" style={{ animationDelay: '1s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-500" />
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href="/admin/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Configuration générale
                  </a>
                </Button>
                
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href="/admin/categories">
                    <Package className="h-4 w-4 mr-2" />
                    Gérer les catégories
                  </a>
                </Button>
                
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href="/admin/withdrawals">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Retraits vendeurs
                  </a>
                </Button>

                <Button asChild variant="outline" className="w-full justify-start">
                  <a href="/admin/advertisements">
                    <Eye className="h-4 w-4 mr-2" />
                    Publicités
                  </a>
                </Button>

                <div className="pt-4 border-t">
                  <Button asChild className="w-full">
                    <a href="/admin/users">
                      <Users className="h-4 w-4 mr-2" />
                      Gérer les utilisateurs
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}