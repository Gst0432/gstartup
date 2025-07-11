import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { VendorOrdersHeader } from '@/components/vendor/VendorOrdersHeader';
import { VendorOrdersStatsCards } from '@/components/vendor/VendorOrdersStats';
import { VendorOrdersFilters } from '@/components/vendor/VendorOrdersFilters';
import { VendorOrdersList } from '@/components/vendor/VendorOrdersList';
import { useVendorOrdersData } from '@/hooks/useVendorOrdersData';
import { filterOrderItems, calculateVendorStats } from '@/utils/vendorOrdersUtils';

export default function VendorOrders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const { orderItems, loading, updateFulfillmentStatus } = useVendorOrdersData();
  
  const filteredOrderItems = filterOrderItems(orderItems, searchTerm, statusFilter);
  const stats = calculateVendorStats(orderItems);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-muted/30">
        <VendorOrdersHeader ordersCount={filteredOrderItems.length} />
        
        <div className="container mx-auto px-4 py-8">
          <VendorOrdersStatsCards stats={stats} />
          
          <VendorOrdersFilters
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            onSearchChange={setSearchTerm}
            onStatusFilterChange={setStatusFilter}
          />
          
          <VendorOrdersList
            orderItems={filteredOrderItems}
            loading={loading}
            onUpdateFulfillmentStatus={updateFulfillmentStatus}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}