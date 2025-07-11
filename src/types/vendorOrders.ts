export interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  variant_name: string | null;
  quantity: number;
  price: number;
  total: number;
  order: {
    id: string;
    order_number: string;
    status: string;
    payment_status: string;
    fulfillment_status: string;
    total_amount: number;
    currency: string;
    created_at: string;
    updated_at: string;
    customer_notes: string | null;
    profiles: {
      display_name: string;
      email: string;
      phone: string | null;
    };
  };
}

export type OrderPriority = 'high' | 'medium' | 'low';

export interface VendorOrdersStats {
  totalRevenue: number;
  pendingOrders: number;
  fulfilledOrders: number;
}