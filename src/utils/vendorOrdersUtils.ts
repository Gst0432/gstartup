import { OrderItem, OrderPriority, VendorOrdersStats } from '@/types/vendorOrders';

export const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'fulfilled': return 'default';
    case 'pending': return 'secondary';
    case 'cancelled': return 'destructive';
    default: return 'secondary';
  }
};

export const getStatusLabel = (status: string) => {
  switch (status) {
    case 'fulfilled': return 'Expédié';
    case 'pending': return 'En attente';
    case 'cancelled': return 'Annulé';
    default: return status;
  }
};

export const getOrderPriority = (item: OrderItem): OrderPriority => {
  const daysSinceCreated = Math.floor((Date.now() - new Date(item.order.created_at).getTime()) / (1000 * 60 * 60 * 24));
  if (item.order.fulfillment_status === 'unfulfilled' && daysSinceCreated > 3) return 'high';
  if (item.order.payment_status === 'paid' && item.order.fulfillment_status === 'unfulfilled' && daysSinceCreated > 1) return 'medium';
  return 'low';
};

export const filterOrderItems = (
  orderItems: OrderItem[], 
  searchTerm: string, 
  statusFilter: string
): OrderItem[] => {
  return orderItems.filter(item => {
    const matchesSearch = 
      item.order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.order.profiles.display_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.order.fulfillment_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
};

export const calculateVendorStats = (orderItems: OrderItem[]): VendorOrdersStats => {
  const totalRevenue = orderItems.filter(item => item.order.payment_status === 'paid').reduce((sum, item) => sum + item.total, 0);
  const pendingOrders = orderItems.filter(item => item.order.fulfillment_status === 'unfulfilled').length;
  const fulfilledOrders = orderItems.filter(item => item.order.fulfillment_status === 'fulfilled' || item.order.fulfillment_status === 'delivered').length;

  return {
    totalRevenue,
    pendingOrders,
    fulfilledOrders
  };
};