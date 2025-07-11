import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Eye, User, Package, Edit, Download } from 'lucide-react';
import { OrderItem } from '@/types/vendorOrders';
import { generateOrderPDF } from '@/utils/pdfGenerator';

interface VendorOrderDetailsDialogProps {
  item: OrderItem;
  deliveryNote: string;
  onDeliveryNoteChange: (note: string) => void;
  onUpdateFulfillmentStatus: (status: string) => Promise<void>;
}

export const VendorOrderDetailsDialog = ({
  item,
  deliveryNote,
  onDeliveryNoteChange,
  onUpdateFulfillmentStatus
}: VendorOrderDetailsDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 mr-1" />
          Détails
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Détails de la commande #{item.order.order_number}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations Client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Nom:</strong> {item.order.profiles.display_name}</p>
                <p><strong>Email:</strong> {item.order.profiles.email}</p>
                {item.order.profiles.phone && (
                  <p><strong>Téléphone:</strong> {item.order.profiles.phone}</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Produit Commandé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Produit:</strong> {item.product_name}</p>
                {item.variant_name && (
                  <p><strong>Variante:</strong> {item.variant_name}</p>
                )}
                <p><strong>Quantité:</strong> {item.quantity}</p>
                <p><strong>Prix unitaire:</strong> {item.price.toLocaleString()} FCFA</p>
                <p><strong>Total:</strong> {item.total.toLocaleString()} FCFA</p>
                <p><strong>Statut paiement:</strong> 
                  <Badge variant={item.order.payment_status === 'paid' ? 'default' : 'secondary'} className="ml-2">
                    {item.order.payment_status}
                  </Badge>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Actions de Livraison
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Statut d'expédition:</label>
                  <Select
                    value={item.order.fulfillment_status}
                    onValueChange={onUpdateFulfillmentStatus}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unfulfilled">Non expédié</SelectItem>
                      <SelectItem value="shipped">Expédié</SelectItem>
                      <SelectItem value="delivered">Livré</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Actions rapides:</label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateOrderPDF(item.order)}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Note de livraison:</label>
                <Textarea
                  placeholder="Ajouter des informations de suivi ou des notes pour le client..."
                  value={deliveryNote}
                  onChange={(e) => onDeliveryNoteChange(e.target.value)}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};