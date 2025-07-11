import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useVendorProducts } from '@/hooks/useVendorProducts';
import { VendorProductsHeader } from '@/components/vendor/VendorProductsHeader';
import { VendorProductsSearch } from '@/components/vendor/VendorProductsSearch';
import { VendorProductsTable } from '@/components/vendor/VendorProductsTable';

export default function VendorProducts() {
  const [searchTerm, setSearchTerm] = useState('');
  const { products, loading, toggleProductStatus, deleteProduct } = useVendorProducts();

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-muted/30">
        <VendorProductsHeader totalItems={filteredProducts.length} />

        <div className="container mx-auto px-4 py-4 sm:py-8">
          <VendorProductsSearch 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm} 
          />

          <VendorProductsTable
            products={products}
            loading={loading}
            searchTerm={searchTerm}
            onToggleStatus={toggleProductStatus}
            onDelete={deleteProduct}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}