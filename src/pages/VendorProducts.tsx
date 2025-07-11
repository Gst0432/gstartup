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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Package, 
  Plus,
  Search,
  Edit,
  Trash,
  Eye,
  MoreHorizontal,
  Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
                  <div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produit</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Prix</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {product.images?.[0] ? (
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-10 h-10 object-cover rounded-lg"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">{product.name}</p>
                                    {product.is_featured && (
                                      <Badge variant="secondary" className="text-xs">
                                        <Star className="h-3 w-3 mr-1" />
                                        Mis en avant
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">{product.category.name}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={product.is_active ? "default" : "secondary"}>
                                {product.is_active ? "Actif" : "Inactif"}
                              </Badge>
                            </TableCell>
                            <TableCell>{product.price.toLocaleString()} FCFA</TableCell>
                            <TableCell>{product.quantity}</TableCell>
                            <TableCell>{new Date(product.created_at).toLocaleDateString('fr-FR')}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link to={`/products/${product.id}`} className="flex items-center">
                                      <Eye className="h-4 w-4 mr-2" />
                                      Voir
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link to={`/vendor/products/${product.id}/edit`} className="flex items-center">
                                      <Edit className="h-4 w-4 mr-2" />
                                      Modifier
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => toggleProductStatus(product.id, product.is_active)}>
                                    {product.is_active ? 'Désactiver' : 'Activer'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => deleteProduct(product.id)}
                                    className="text-destructive"
                                  >
                                    <Trash className="h-4 w-4 mr-2" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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