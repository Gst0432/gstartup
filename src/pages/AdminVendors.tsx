import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { usePagination } from '@/hooks/usePagination';
import { 
  Shield,
  Store,
  CheckCircle,
  XCircle,
  Search,
  Star,
  TrendingUp,
  Eye,
  Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Vendor {
  id: string;
  user_id: string;
  business_name: string;
  description: string;
  is_verified: boolean;
  is_active: boolean;
  rating: number;
  total_sales: number;
  created_at: string;
  profiles?: {
    display_name: string;
    email: string;
    user_id: string;
  };
}

export default function AdminVendors() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select(`
          *,
          profiles!inner(
            display_name,
            email,
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching vendors:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les vendeurs",
          variant: "destructive"
        });
        return;
      }

      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateVendorStatus = async (vendorId: string, field: 'is_verified' | 'is_active', value: boolean) => {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ [field]: value })
        .eq('id', vendorId);

      if (error) {
        console.error('Error updating vendor status:', error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le statut du vendeur",
          variant: "destructive"
        });
        return;
      }

      setVendors(vendors.map(vendor => 
        vendor.id === vendorId ? { ...vendor, [field]: value } : vendor
      ));

      toast({
        title: "Succès",
        description: `Statut du vendeur mis à jour avec succès`,
      });
    } catch (error) {
      console.error('Error updating vendor status:', error);
    }
  };

  const deleteVendor = async (vendorId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce vendeur ? Cette action est irréversible.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', vendorId);

      if (error) {
        console.error('Error deleting vendor:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le vendeur",
          variant: "destructive"
        });
        return;
      }

      setVendors(vendors.filter(vendor => vendor.id !== vendorId));

      toast({
        title: "Succès",
        description: "Vendeur supprimé avec succès",
      });
    } catch (error) {
      console.error('Error deleting vendor:', error);
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.profiles?.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.profiles?.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Pagination hook
  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    paginatedData: paginatedVendors,
    setCurrentPage,
    setItemsPerPage,
  } = usePagination({
    data: filteredVendors,
    itemsPerPage: 10,
  });

  const stats = {
    total: vendors.length,
    verified: vendors.filter(v => v.is_verified).length,
    pending: vendors.filter(v => !v.is_verified).length,
    active: vendors.filter(v => v.is_active).length,
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-muted/30">
        <header className="bg-background border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Gestion des Vendeurs</h1>
                <p className="text-muted-foreground">
                  Approuver et gérer les vendeurs de la plateforme
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="gap-2">
                  <Store className="h-4 w-4" />
                  {filteredVendors.length} vendeurs
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Store className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Vérifiés</p>
                    <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">En attente</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Actifs</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
                  </div>
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recherche */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom d'entreprise, nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Liste des vendeurs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Liste des Vendeurs
              </CardTitle>
              <CardDescription>
                Gérez les vendeurs et leurs autorisations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                 <div className="space-y-4">
                   {paginatedVendors.map((vendor) => (
                    <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                           <div>
                             <p className="font-medium">{vendor.business_name}</p>
                             <p className="text-sm text-muted-foreground">
                               {vendor.profiles?.display_name} ({vendor.profiles?.email})
                             </p>
                             {vendor.description && (
                               <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                 {vendor.description}
                               </p>
                             )}
                           </div>
                          <div className="flex gap-2">
                            {vendor.is_verified ? (
                              <Badge className="text-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Vérifié
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-orange-600">
                                <XCircle className="h-3 w-3 mr-1" />
                                En attente
                              </Badge>
                            )}
                            {vendor.is_active ? (
                              <Badge variant="default">Actif</Badge>
                            ) : (
                              <Badge variant="destructive">Inactif</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Note: {vendor.rating || 0}/5
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Ventes: {vendor.total_sales || 0}
                          </span>
                          <span>
                            Inscrit le {new Date(vendor.created_at).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                       <div className="flex items-center gap-2">
                         {!vendor.is_verified && (
                           <Button
                             variant="default"
                             size="sm"
                             onClick={() => updateVendorStatus(vendor.id, 'is_verified', true)}
                           >
                             <CheckCircle className="h-4 w-4 mr-2" />
                             Approuver
                           </Button>
                         )}
                         <Button
                           variant={vendor.is_active ? "outline" : "default"}
                           size="sm"
                           onClick={() => updateVendorStatus(vendor.id, 'is_active', !vendor.is_active)}
                         >
                           {vendor.is_active ? 'Désactiver' : 'Activer'}
                         </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/admin/vendors/${vendor.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                         <Button 
                           variant="destructive" 
                           size="sm"
                           onClick={() => deleteVendor(vendor.id)}
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                    </div>
                  ))}
                   {paginatedVendors.length === 0 && filteredVendors.length === 0 && (
                     <div className="text-center py-8 text-muted-foreground">
                       Aucun vendeur trouvé
                     </div>
                   )}
                 </div>
               )}
               
               {/* Pagination */}
               {!loading && filteredVendors.length > 0 && (
                 <div className="mt-6">
                   <DataTablePagination
                     currentPage={currentPage}
                     totalPages={totalPages}
                     totalItems={totalItems}
                     itemsPerPage={itemsPerPage}
                     onPageChange={setCurrentPage}
                     onItemsPerPageChange={setItemsPerPage}
                   />
                 </div>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}