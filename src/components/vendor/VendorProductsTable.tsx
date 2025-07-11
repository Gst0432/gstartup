import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { usePagination } from '@/hooks/usePagination';
import { Package, Plus, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Product } from '@/types/vendor';
import { VendorProductActionsDropdown } from './VendorProductActionsDropdown';

interface VendorProductsTableProps {
  products: Product[];
  loading: boolean;
  searchTerm: string;
  onToggleStatus: (productId: string, isActive: boolean) => void;
  onDelete: (productId: string) => void;
}

export function VendorProductsTable({ 
  products, 
  loading, 
  searchTerm, 
  onToggleStatus, 
  onDelete 
}: VendorProductsTableProps) {
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
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
                    <VendorProductActionsDropdown
                      product={product}
                      onToggleStatus={onToggleStatus}
                      onDelete={onDelete}
                    />
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
  );
}