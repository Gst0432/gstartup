import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  ShoppingCart, 
  Package,
  Search,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  MessageSquare,
  Calendar,
  User,
  Phone,
  Mail,
  AlertCircle,
  Truck,
  Download,
  Edit
} from 'lucide-react';
import { generateOrderPDF } from '@/utils/pdfGenerator';
import { supabase } from '@/integrations/supabase/client';

interface OrderItem {
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

export default function VendorOrders() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedOrderItem, setSelectedOrderItem] = useState<OrderItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deliveryNote, setDeliveryNote] = useState('');

  useEffect(() => {
    if (profile) {
      fetchOrders();
    }
  }, [profile]);

  const fetchOrders = async () => {
    try {
      // Get vendor info
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
        .from('order_items')
        .select(`
          *,
          orders!inner(
            id,
            order_number,
            status,
            payment_status,
            fulfillment_status,
            total_amount,
            currency,
            created_at,
            updated_at,
            customer_notes,
            profiles!inner(
              display_name,
              email,
              phone
            )
          )
        `)
        .eq('vendor_id', vendor.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      const transformedData = data?.map(item => ({
        ...item,
        order: {
          ...item.orders,
          profiles: item.orders.profiles
        }
      })) || [];

      setOrderItems(transformedData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFulfillmentStatus = async (orderId: string, status: string) => {
    try {
      const updateData: any = {
        fulfillment_status: status,
        updated_at: new Date().toISOString()
      };

      // Ajouter une note de livraison si fournie
      if (deliveryNote.trim()) {
        updateData.customer_notes = deliveryNote.trim();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le statut",
          variant: "destructive"
        });
        return;
      }

      setOrderItems(orderItems.map(item => 
        item.order.id === orderId 
          ? { 
              ...item, 
              order: { 
                ...item.order, 
                fulfillment_status: status,
                customer_notes: updateData.customer_notes || item.order.customer_notes
              } 
            }
          : item
      ));

      // Messages personnalisés selon le statut
      let message = "Statut mis à jour avec succès";
      if (status === 'shipped') message = "Commande marquée comme expédiée";
      if (status === 'delivered') message = "Commande marquée comme livrée";

      toast({
        title: "Succès",
        description: message,
      });

      setDeliveryNote('');
    } catch (error) {
      console.error('Error updating fulfillment status:', error);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'fulfilled': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'fulfilled': return 'Expédié';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const filteredOrderItems = orderItems.filter(item => {
    const matchesSearch = 
      item.order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.order.profiles.display_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.order.fulfillment_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getOrderPriority = (item: OrderItem) => {
    const daysSinceCreated = Math.floor((Date.now() - new Date(item.order.created_at).getTime()) / (1000 * 60 * 60 * 24));
    if (item.order.fulfillment_status === 'unfulfilled' && daysSinceCreated > 3) return 'high';
    if (item.order.payment_status === 'paid' && item.order.fulfillment_status === 'unfulfilled' && daysSinceCreated > 1) return 'medium';
    return 'low';
  };

  const totalRevenue = orderItems.filter(item => item.order.payment_status === 'paid').reduce((sum, item) => sum + item.total, 0);
  const pendingOrders = orderItems.filter(item => item.order.fulfillment_status === 'unfulfilled').length;
  const fulfilledOrders = orderItems.filter(item => item.order.fulfillment_status === 'fulfilled' || item.order.fulfillment_status === 'delivered').length;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-muted/30">
        <header className="bg-background border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Mes Commandes</h1>
                <p className="text-muted-foreground">
                  Gérer les commandes de vos produits
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  {filteredOrderItems.length} commandes
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Statistiques */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Revenus Confirmés
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} FCFA</div>
                <p className="text-xs text-muted-foreground">
                  Commandes payées seulement
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  À Expédier
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingOrders}</div>
                <p className="text-xs text-muted-foreground">
                  Commandes non expédiées
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Expédiées/Livrées
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{fulfilledOrders}</div>
                <p className="text-xs text-muted-foreground">
                  Commandes terminées
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filtres */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtres et Recherche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par numéro de commande, produit ou client..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrer par statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="unfulfilled">Non expédié</SelectItem>
                      <SelectItem value="shipped">Expédié</SelectItem>
                      <SelectItem value="delivered">Livré</SelectItem>
                    </SelectContent>
                  </Select>
              </div>
            </CardContent>
          </Card>

          {/* Liste des commandes */}
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
                  {filteredOrderItems.map((item) => {
                    const priority = getOrderPriority(item);
                    const priorityColors = {
                      high: 'border-l-4 border-l-red-500 bg-red-50/50',
                      medium: 'border-l-4 border-l-orange-500 bg-orange-50/50',
                      low: 'border-l-4 border-l-green-500'
                    };
                    
                    return (
                      <div key={item.id} className={`flex items-center justify-between p-4 border rounded-lg ${priorityColors[priority]}`}>
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
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedOrderItem(item)}>
                                <Eye className="h-4 w-4 mr-1" />
                                Détails
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Détails de la commande #{item.order.order_number}</DialogTitle>
                              </DialogHeader>
                              {selectedOrderItem && (
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
                                        <p><strong>Nom:</strong> {selectedOrderItem.order.profiles.display_name}</p>
                                        <p><strong>Email:</strong> {selectedOrderItem.order.profiles.email}</p>
                                        {selectedOrderItem.order.profiles.phone && (
                                          <p><strong>Téléphone:</strong> {selectedOrderItem.order.profiles.phone}</p>
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
                                        <p><strong>Produit:</strong> {selectedOrderItem.product_name}</p>
                                        {selectedOrderItem.variant_name && (
                                          <p><strong>Variante:</strong> {selectedOrderItem.variant_name}</p>
                                        )}
                                        <p><strong>Quantité:</strong> {selectedOrderItem.quantity}</p>
                                        <p><strong>Prix unitaire:</strong> {selectedOrderItem.price.toLocaleString()} FCFA</p>
                                        <p><strong>Total:</strong> {selectedOrderItem.total.toLocaleString()} FCFA</p>
                                        <p><strong>Statut paiement:</strong> 
                                          <Badge variant={selectedOrderItem.order.payment_status === 'paid' ? 'default' : 'secondary'} className="ml-2">
                                            {selectedOrderItem.order.payment_status}
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
                                            value={selectedOrderItem.order.fulfillment_status}
                                            onValueChange={(value) => updateFulfillmentStatus(selectedOrderItem.order.id, value)}
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
                                              onClick={() => generateOrderPDF(selectedOrderItem.order)}
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
                                          onChange={(e) => setDeliveryNote(e.target.value)}
                                          className="mt-2"
                                        />
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          
                          {item.order.fulfillment_status === 'unfulfilled' && item.order.payment_status === 'paid' && (
                            <Button
                              size="sm"
                              onClick={() => updateFulfillmentStatus(item.order.id, 'shipped')}
                            >
                              <Truck className="h-4 w-4 mr-1" />
                              Marquer expédié
                            </Button>
                          )}
                          
                          {item.order.fulfillment_status === 'shipped' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => updateFulfillmentStatus(item.order.id, 'delivered')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Marquer livré
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {filteredOrderItems.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucune commande trouvée
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}