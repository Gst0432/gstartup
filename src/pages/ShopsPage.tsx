import { ShopsHeader } from '@/components/shops/ShopsHeader';
import { ShopsGrid } from '@/components/shops/ShopsGrid';
import { ShopsPagination } from '@/components/shops/ShopsPagination';
import { useShops } from '@/hooks/useShops';

export default function ShopsPage() {
  const {
    vendors,
    loading,
    searchTerm,
    sortBy,
    filterVerified,
    currentPage,
    totalVendors,
    totalPages,
    handleSearch,
    setSortBy,
    setFilterVerified,
    handlePageChange,
    clearFilters
  } = useShops();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <ShopsHeader
        searchTerm={searchTerm}
        sortBy={sortBy}
        filterVerified={filterVerified}
        onSearch={handleSearch}
        onSortChange={setSortBy}
        onFilterChange={setFilterVerified}
      />

      <div className="container mx-auto px-4 py-8">
        <ShopsGrid
          vendors={vendors}
          loading={loading}
          totalVendors={totalVendors}
          searchTerm={searchTerm}
          filterVerified={filterVerified}
          onClearFilters={clearFilters}
        />

        <ShopsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}