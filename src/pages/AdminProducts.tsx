import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { usePagination } from '@/hooks/usePagination';
import { 
  Package,
  Search,
  Filter,
  Eye,
  Edit,
  Trash,
  CheckCircle,
  XCircle,
  Star,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  vendor?: {
    business_name: string;
  };
  category?: {
    name: string;
  };
}

export default function AdminProducts() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          vendor:vendors!products_vendor_id_fkey(business_name),
          category:categories!products_category_id_fkey(name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProductStatus = async (productId: string, field: 'is_active' | 'is_featured', value: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ [field]: value })
        .eq('id', productId);

      if (error) {
        console.error('Error updating product status:', error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le statut du produit",
          variant: "destructive"
        });
        return;
      }

      setProducts(products.map(product => 
        product.id === productId ? { ...product, [field]: value } : product
      ));

      toast({
        title: "Succès",
        description: `Statut du produit mis à jour avec succès`,
      });
    } catch (error) {
      console.error('Error updating product status:', error);
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('Error deleting product:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le produit",
          variant: "destructive"
        });
        return;
      }

      setProducts(products.filter(product => product.id !== productId));

      toast({
        title: "Succès",
        description: "Produit supprimé avec succès",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.vendor?.business_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && product.is_active) ||
                         (statusFilter === 'inactive' && !product.is_active) ||
                         (statusFilter === 'featured' && product.is_featured);
    return matchesSearch && matchesStatus;
  });

  // Pagination hook
  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    paginatedData: paginatedProducts,
    setCurrentPage,
    setItemsPerPage,
  } = usePagination({
    data: filteredProducts,
    itemsPerPage: 10,
  });

  const stats = {
    total: products.length,
    active: products.filter(p => p.is_active).length,
    featured: products.filter(p => p.is_featured).length,
    inactive: products.filter(p => !p.is_active).length,
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-muted/30">
        <header className="bg-background border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Gestion des Produits</h1>
                <p className="text-muted-foreground">
                  Modérer et gérer tous les produits de la plateforme
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="gap-2">
                  <Package className="h-4 w-4" />
                  {filteredProducts.length} produits
                </Badge>
                <Button asChild>
                  <Link to="/admin/products/new" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Ajouter un produit
                  </Link>
                </Button>
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
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Actifs</p>
                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">En vedette</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.featured}</p>
                  </div>
                  <Star className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Inactifs</p>
                    <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

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
                      placeholder="Rechercher par nom de produit ou vendeur..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les produits</SelectItem>
                    <SelectItem value="active">Actifs</SelectItem>
                    <SelectItem value="inactive">Inactifs</SelectItem>
                    <SelectItem value="featured">En vedette</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Liste des produits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Liste des Produits
              </CardTitle>
              <CardDescription>
                Gérez tous les produits de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                 <div className="space-y-4">
                   {paginatedProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Vendeur: {product.vendor?.business_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Catégorie: {product.category?.name}
                            </p>
                            <p className="text-sm font-medium text-primary mt-1">
                              {product.price.toLocaleString('fr-FR')} FCFA
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {product.is_active ? (
                              <Badge className="text-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Actif
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                Inactif
                              </Badge>
                            )}
                            {product.is_featured && (
                              <Badge className="text-blue-600">
                                <Star className="h-3 w-3 mr-1" />
                                En vedette
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Créé le {new Date(product.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant={product.is_active ? "outline" : "default"}
                          size="sm"
                          onClick={() => updateProductStatus(product.id, 'is_active', !product.is_active)}
                        >
                          {product.is_active ? 'Désactiver' : 'Activer'}
                        </Button>
                        <Button
                          variant={product.is_featured ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateProductStatus(product.id, 'is_featured', !product.is_featured)}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          asChild
                        >
                          <Link to={`/admin/products/${product.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deleteProduct(product.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                   {paginatedProducts.length === 0 && filteredProducts.length === 0 && (
                     <div className="text-center py-8 text-muted-foreground">
                       Aucun produit trouvé
                     </div>
                   )}
                 </div>
               )}
               
               {/* Pagination */}
               {!loading && filteredProducts.length > 0 && (
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