import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  Users, 
  Shield,
  CheckCircle,
  Search,
  UserPlus,
  Edit,
  Trash,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  role: 'customer' | 'vendor' | 'admin';
  is_verified: boolean;
  created_at: string;
}

export default function AdminUsers() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
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
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'customer' | 'vendor' | 'admin') => {
    try {
      // Mettre à jour le rôle dans profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (profileError) {
        console.error('Error updating user role:', profileError);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le rôle de l'utilisateur",
          variant: "destructive"
        });
        return;
      }

      // Si le nouveau rôle est 'vendor', créer un enregistrement vendeur s'il n'existe pas
      if (newRole === 'vendor') {
        const user = users.find(u => u.user_id === userId);
        if (user) {
          console.log('Creating vendor profile for user:', user.display_name);
          
          try {
            // Vérifier si l'enregistrement vendeur existe déjà
            const { data: existingVendor, error: checkError } = await supabase
              .from('vendors')
              .select('id')
              .eq('user_id', userId)
              .maybeSingle();

            if (checkError) {
              console.error('Error checking existing vendor:', checkError);
            }

            // Créer un enregistrement vendeur s'il n'existe pas
            if (!existingVendor) {
              const { data: newVendor, error: vendorError } = await supabase
                .from('vendors')
                .insert({
                  user_id: userId,
                  business_name: (user.display_name || 'Mon Commerce') + ' Business',
                  description: 'Nouveau vendeur sur G-STARTUP LTD',
                  is_active: true,
                  is_verified: true // On vérifie automatiquement les vendeurs ajoutés par admin
                })
                .select()
                .single();

              if (vendorError) {
                console.error('Error creating vendor profile:', vendorError);
                toast({
                  title: "Erreur",
                  description: "Rôle mis à jour mais impossible de créer le profil vendeur: " + vendorError.message,
                  variant: "destructive"
                });
                // On ne return pas ici pour que l'état local soit quand même mis à jour
              } else {
                console.log('Vendor profile created successfully:', newVendor);
                toast({
                  title: "Succès",
                  description: `${user.display_name} est maintenant vendeur avec profil créé`,
                });
              }
            } else {
              console.log('Vendor profile already exists');
              toast({
                title: "Succès",
                description: `${user.display_name} est maintenant vendeur`,
              });
            }
          } catch (vendorErr) {
            console.error('Vendor creation error:', vendorErr);
            toast({
              title: "Avertissement",
              description: "Rôle mis à jour mais erreur lors de la gestion du profil vendeur",
              variant: "destructive"
            });
          }
        }
      } else {
        // Pour les autres rôles, afficher un message de succès simple
        toast({
          title: "Succès",
          description: "Rôle utilisateur mis à jour avec succès",
        });
      }

      // Mettre à jour l'état local
      setUsers(users.map(user => 
        user.user_id === userId ? { ...user, role: newRole } : user
      ));

    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
    }
  };

  const toggleUserVerification = async (userId: string, currentVerification: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: !currentVerification })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating user verification:', error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour la vérification",
          variant: "destructive"
        });
        return;
      }

      setUsers(users.map(user => 
        user.user_id === userId ? { ...user, is_verified: !currentVerification } : user
      ));

      toast({
        title: "Succès",
        description: `Utilisateur ${!currentVerification ? 'vérifié' : 'non vérifié'}`,
      });
    } catch (error) {
      console.error('Error updating user verification:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'vendor': return 'Vendeur';
      default: return 'Client';
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'vendor': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-muted/30">
        <header className="bg-background border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Gestion des Utilisateurs</h1>
                <p className="text-muted-foreground">
                  Gérer tous les utilisateurs de la plateforme
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="gap-2">
                  <Users className="h-4 w-4" />
                  {filteredUsers.length} utilisateurs
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Filtres */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtres et Recherche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par nom ou email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrer par rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les rôles</SelectItem>
                    <SelectItem value="customer">Clients</SelectItem>
                    <SelectItem value="vendor">Vendeurs</SelectItem>
                    <SelectItem value="admin">Administrateurs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Liste des utilisateurs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Liste des Utilisateurs
              </CardTitle>
              <CardDescription>
                Gérez les rôles et permissions des utilisateurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">{user.display_name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {getRoleLabel(user.role)}
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
                        <Button
                          variant={user.is_verified ? "outline" : "default"}
                          size="sm"
                          onClick={() => toggleUserVerification(user.user_id, user.is_verified)}
                        >
                          {user.is_verified ? 'Dé-vérifier' : 'Vérifier'}
                        </Button>
                      </div>
                    </div>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucun utilisateur trouvé
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}