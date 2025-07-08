import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
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
  Trash
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminStats {
  totalUsers: number;
  totalVendors: number;
  totalProducts: number;
  totalOrders: number;
  pendingVendors: number;
  activeProducts: number;
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
    activeProducts: 0
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

      // Fetch orders count
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: totalUsers || 0,
        totalVendors: totalVendors || 0,
        totalProducts: totalProducts || 0,
        totalOrders: totalOrders || 0,
        pendingVendors: pendingVendors || 0,
        activeProducts: activeProducts || 0
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
      title: 'Statistiques Avancées',
      description: 'Analytics détaillées',
      icon: TrendingUp,
      href: '/admin/analytics',
      color: 'bg-indigo-500',
      count: null
    }
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Tableau de Bord Administrateur</h1>
              <p className="text-muted-foreground">
                Administration G-STARTUP LTD
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="destructive" className="gap-2">
                <Shield className="h-4 w-4" />
                Administrateur
              </Badge>
              <Button variant="outline" onClick={() => signOut()}>
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
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
              <Button variant="secondary" size="lg">
                <TrendingUp className="mr-2 h-5 w-5" />
                Voir les Analytics
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Utilisateurs Totaux
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Utilisateurs enregistrés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vendeurs Actifs
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVendors}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingVendors > 0 && (
                  <span className="text-orange-500">
                    {stats.pendingVendors} en attente
                  </span>
                )}
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
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeProducts} actifs
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
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                Commandes totales
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Gestion de la Plateforme</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {managementSections.map((section, index) => (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={section.title === 'Gestion des Utilisateurs' ? handleUserManagementClick : undefined}
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
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Actions Requises
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.pendingVendors > 0 && (
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">Vendeurs en attente</p>
                      <p className="text-sm text-muted-foreground">
                        {stats.pendingVendors} vendeur(s) à approuver
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Voir
                  </Button>
                </div>
              )}
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Système opérationnel</p>
                    <p className="text-sm text-muted-foreground">
                      Tous les services fonctionnent
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">OK</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration Système
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Version de la plateforme</span>
                <Badge variant="outline">v1.0.0</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Base de données</span>
                <Badge variant="default">Connectée</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Stockage</span>
                <Badge variant="default">Actif</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Authentification</span>
                <Badge variant="default">Opérationnelle</Badge>
              </div>
              <Button variant="outline" className="w-full mt-4">
                <Settings className="mr-2 h-4 w-4" />
                Paramètres Avancés
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}