import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  AlertCircle, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Eye, 
  Download, 
  Truck, 
  CheckCircle 
} from 'lucide-react';
import { OrderItem } from '@/types/vendorOrders';
import { getOrderPriority, getStatusBadgeVariant, getStatusLabel } from '@/utils/vendorOrdersUtils';
import { generateOrderPDF } from '@/utils/pdfGenerator';
import { VendorOrderDetailsDialog } from './VendorOrderDetailsDialog';

interface VendorOrderItemProps {
  item: OrderItem;
  onUpdateFulfillmentStatus: (orderId: string, status: string, note?: string) => Promise<boolean>;
}

export const VendorOrderItem = ({ item, onUpdateFulfillmentStatus }: VendorOrderItemProps) => {
  const [deliveryNote, setDeliveryNote] = useState('');
  
  const priority = getOrderPriority(item);
  const priorityColors = {
    high: 'border-l-4 border-l-red-500 bg-red-50/50',
    medium: 'border-l-4 border-l-orange-500 bg-orange-50/50',
    low: 'border-l-4 border-l-green-500'
  };

  const handleUpdateStatus = async (status: string) => {
    const success = await onUpdateFulfillmentStatus(item.order.id, status, deliveryNote);
    if (success) {
      setDeliveryNote('');
    }
  };

  return (
    <div className={`flex items-center justify-between p-4 border rounded-lg ${priorityColors[priority]}`}>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium">#{item.order.order_number}</p>
              {priority === 'high' && (
                <Badge variant="destructive" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Urgent
                </Badge>
              )}
              {priority === 'medium' && (
                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                  <Clock className="h-3 w-3 mr-1" />
                  Attention
                </Badge>
              )}
              <Badge variant={getStatusBadgeVariant(item.order.fulfillment_status)}>
                {getStatusLabel(item.order.fulfillment_status)}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {item.product_name} {item.variant_name && `(${item.variant_name})`}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {item.order.profiles.display_name}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {item.order.profiles.email}
              </span>
              {item.order.profiles.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {item.order.profiles.phone}
                </span>
              )}
            </div>
            
            {item.order.customer_notes && (
              <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                <p className="text-xs text-blue-800">
                  <MessageSquare className="h-3 w-3 inline mr-1" />
                  Note: {item.order.customer_notes}
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Quantité:</span>
            <p className="font-medium">{item.quantity}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Total:</span>
            <p className="font-medium">{item.total.toLocaleString()} FCFA</p>
          </div>
          <div>
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Créée:
            </span>
            <p className="font-medium">{new Date(item.order.created_at).toLocaleDateString('fr-FR')}</p>
          </div>
          <div>
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Modifiée:
            </span>
            <p className="font-medium">{new Date(item.order.updated_at).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateOrderPDF(item.order)}
        >
          <Download className="h-4 w-4 mr-1" />
          PDF
        </Button>
        
        <VendorOrderDetailsDialog 
          item={item}
          deliveryNote={deliveryNote}
          onDeliveryNoteChange={setDeliveryNote}
          onUpdateFulfillmentStatus={handleUpdateStatus}
        />
        
        {item.order.fulfillment_status === 'unfulfilled' && item.order.payment_status === 'paid' && (
          <Button
            size="sm"
            onClick={() => handleUpdateStatus('shipped')}
          >
            <Truck className="h-4 w-4 mr-1" />
            Marquer expédié
          </Button>
        )}
        
        {item.order.fulfillment_status === 'shipped' && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleUpdateStatus('delivered')}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Marquer livré
          </Button>
        )}
      </div>
    </div>
  );
};