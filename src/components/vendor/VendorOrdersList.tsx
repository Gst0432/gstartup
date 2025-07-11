import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { OrderItem } from '@/types/vendorOrders';
import { VendorOrderItem } from './VendorOrderItem';

interface VendorOrdersListProps {
  orderItems: OrderItem[];
  loading: boolean;
  onUpdateFulfillmentStatus: (orderId: string, status: string, note?: string) => Promise<boolean>;
}

export const VendorOrdersList = ({ 
  orderItems, 
  loading, 
  onUpdateFulfillmentStatus 
}: VendorOrdersListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Liste des Commandes
        </CardTitle>
        <CardDescription>
          Gérez vos commandes et leur statut d'expédition
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {orderItems.map((item) => (
              <VendorOrderItem
                key={item.id}
                item={item}
                onUpdateFulfillmentStatus={onUpdateFulfillmentStatus}
              />
            ))}
            {orderItems.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Aucune commande trouvée
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};