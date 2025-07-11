import { useState, useEffect } from 'react';
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
  Package, 
  Plus,
  Search,
  Edit,
  Trash,
  Eye,
  Filter,
  Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  is_active: boolean;
  is_featured: boolean;
  quantity: number;
  created_at: string;
  category: {
    name: string;
  };
}

export default function VendorProducts() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (profile) {
      fetchProducts();
    }
  }, [profile]);

  const fetchProducts = async () => {
    try {
      // First get vendor info
      const { data: vendor } = await supabase
        .from('vendors')
        .select('id')
        .eq('user_id', profile?.user_id)
        .single();

      if (!vendor) {
        toast({
          title: "Erreur",
          description: "Profil vendeur non trouvé",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories!inner(name)
        `)
        .eq('vendor_id', vendor.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      setProducts(data?.map(product => ({
        ...product,
        category: product.categories
      })) || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleProductStatus = async (productId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !isActive })
        .eq('id', productId);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de modifier le statut du produit",
          variant: "destructive"
        });
        return;
      }

      setProducts(products.map(product => 
        product.id === productId ? { ...product, is_active: !isActive } : product
      ));

      toast({
        title: "Succès",
        description: `Produit ${!isActive ? 'activé' : 'désactivé'}`,
      });
    } catch (error) {
      console.error('Error updating product:', error);
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

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-muted/30">
        <header className="bg-background border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold">Mes Produits</h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Gérer votre catalogue de produits
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                <Badge variant="outline" className="gap-2 text-xs sm:text-sm">
                  <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                  {totalItems} produit{totalItems > 1 ? 's' : ''}
                </Badge>
                <Link to="/vendor/products/new" className="w-full sm:w-auto">
                  <Button className="gap-2 w-full sm:w-auto">
                    <Plus className="h-4 w-4" />
                    Ajouter un produit
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-4 sm:py-8">
          {/* Recherche */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Recherche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou catégorie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Liste des produits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Catalogue des Produits
              </CardTitle>
              <CardDescription>
                Gérez vos produits et leur visibilité
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                 <div className="grid gap-4">
                   {paginatedProducts.map((product) => (
                     <div key={product.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg">
                       <div className="flex items-center gap-4 flex-1">
                         {product.images?.[0] ? (
                           <img
                             src={product.images[0]}
                             alt={product.name}
                             className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg flex-shrink-0"
                           />
                         ) : (
                           <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                             <Package className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                           </div>
                         )}
                         <div className="flex-1 min-w-0">
                           <div className="flex flex-wrap items-center gap-2 mb-1">
                             <h3 className="font-medium text-sm sm:text-base truncate">{product.name}</h3>
                             {product.is_featured && (
                               <Badge variant="secondary" className="text-xs">
                                 <Star className="h-3 w-3 mr-1" />
                                 Mis en avant
                               </Badge>
                             )}
                             <Badge variant={product.is_active ? "default" : "secondary"} className="text-xs">
                               {product.is_active ? "Actif" : "Inactif"}
                             </Badge>
                           </div>
                           <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">
                             Catégorie: {product.category.name}
                           </p>
                           <p className="text-xs sm:text-sm font-medium">
                             Prix: {product.price.toLocaleString()} FCFA
                           </p>
                           <p className="text-xs text-muted-foreground">
                             Stock: {product.quantity} | Créé le {new Date(product.created_at).toLocaleDateString('fr-FR')}
                           </p>
                         </div>
                       </div>
                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                          <Link to={`/products/${product.id}`}>
                            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                              <Eye className="h-4 w-4 sm:mr-0 mr-2" />
                              <span className="sm:hidden">Voir</span>
                            </Button>
                          </Link>
                          <Link to={`/vendor/products/${product.id}/edit`}>
                            <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                              <Edit className="h-4 w-4 sm:mr-0 mr-2" />
                              <span className="sm:hidden">Modifier</span>
                            </Button>
                          </Link>
                          <Button
                            variant={product.is_active ? "outline" : "default"}
                            size="sm"
                            onClick={() => toggleProductStatus(product.id, product.is_active)}
                            className="flex-1 sm:flex-none text-xs sm:text-sm"
                          >
                            {product.is_active ? 'Désactiver' : 'Activer'}
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => deleteProduct(product.id)}
                            className="flex-1 sm:flex-none"
                          >
                            <Trash className="h-4 w-4 sm:mr-0 mr-2" />
                            <span className="sm:hidden">Supprimer</span>
                          </Button>
                        </div>
                     </div>
                  ))}
                   {paginatedProducts.length === 0 && filteredProducts.length === 0 && (
                     <div className="text-center py-8">
                       <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                       <p className="text-muted-foreground mb-4">
                         {searchTerm ? "Aucun produit trouvé" : "Aucun produit dans votre catalogue"}
                       </p>
                       {!searchTerm && (
                         <Link to="/vendor/products/new">
                           <Button>
                             <Plus className="h-4 w-4 mr-2" />
                             Ajouter votre premier produit
                           </Button>
                         </Link>
                       )}
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