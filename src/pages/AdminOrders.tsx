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
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { usePagination } from '@/hooks/usePagination';
import { 
  ShoppingCart,
  Search,
  Filter,
  Eye,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  Bell,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Download,
  Edit
} from 'lucide-react';
import { generateOrderPDF } from '@/utils/pdfGenerator';
import { supabase } from '@/integrations/supabase/client';

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  variant_name: string | null;
  quantity: number;
  price: number;
  total: number;
  products?: {
    digital_file_url: string | null;
    is_digital: boolean | null;
  };
}

interface Order {
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
  shipping_address: any;
  billing_address: any;
  profile?: {
    display_name: string;
    email: string;
    phone: string | null;
  };
  order_items?: OrderItem[];
}

export default function AdminOrders() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customerNote, setCustomerNote] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_user_id_fkey(display_name, email, phone),
          order_items(
            *,
            products(
              digital_file_url,
              is_digital
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      const transformedOrders = data?.map(order => ({
        ...order,
        profile: order.profiles,
        order_items: order.order_items || []
      })) || [];

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, field: 'status' | 'payment_status' | 'fulfillment_status', value: string) => {
    try {
      const updateData: any = { 
        [field]: value,
        updated_at: new Date().toISOString()
      };

      // Envoyer une notification au client selon le changement de statut
      const order = orders.find(o => o.id === orderId);
      if (order && customerNote.trim()) {
        updateData.customer_notes = customerNote.trim();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le statut de la commande",
          variant: "destructive"
        });
        return;
      }

      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, [field]: value, customer_notes: updateData.customer_notes || order.customer_notes } : order
      ));

      // Message de notification selon le statut
      let notificationMessage = '';
      if (field === 'fulfillment_status') {
        if (value === 'shipped') notificationMessage = 'Votre commande a été expédiée !';
        if (value === 'delivered') notificationMessage = 'Votre commande a été livrée !';
      }
      if (field === 'status' && value === 'completed') {
        notificationMessage = 'Votre commande est maintenant terminée !';
      }

      toast({
        title: "Succès",
        description: `Statut mis à jour${notificationMessage ? ` - ${notificationMessage}` : ''}`,
      });

      setCustomerNote('');
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleDownloadProduct = (item: OrderItem) => {
    if (!item.products?.digital_file_url) {
      toast({
        title: "Erreur",
        description: "Aucun fichier numérique disponible pour ce produit",
        variant: "destructive"
      });
      return;
    }

    window.open(item.products.digital_file_url, '_blank');
  };

  const getStatusBadge = (status: string, type: 'status' | 'payment' | 'fulfillment') => {
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary';
    let Icon = Clock;

    if (type === 'status') {
      if (status === 'confirmed' || status === 'completed') {
        variant = 'default';
        Icon = CheckCircle;
      } else if (status === 'cancelled') {
        variant = 'destructive';
        Icon = AlertCircle;
      }
    } else if (type === 'payment') {
      if (status === 'paid') {
        variant = 'default';
        Icon = CheckCircle;
      } else if (status === 'failed') {
        variant = 'destructive';
        Icon = AlertCircle;
      } else if (status === 'refunded') {
        variant = 'outline';
        Icon = AlertCircle;
      }
    } else if (type === 'fulfillment') {
      if (status === 'fulfilled' || status === 'delivered') {
        variant = 'default';
        Icon = CheckCircle;
      } else if (status === 'shipped') {
        variant = 'default';
        Icon = Truck;
      } else if (status === 'unfulfilled') {
        Icon = Package;
      }
    }

    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.profile?.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.profile?.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination hook
  const {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    paginatedData: paginatedOrders,
    setCurrentPage,
    setItemsPerPage,
  } = usePagination({
    data: filteredOrders,
    itemsPerPage: 10,
  });

  const getOrderPriority = (order: Order) => {
    const daysSinceCreated = Math.floor((Date.now() - new Date(order.created_at).getTime()) / (1000 * 60 * 60 * 24));
    if (order.status === 'pending' && daysSinceCreated > 3) return 'high';
    if (order.payment_status === 'failed') return 'high';
    if (order.status === 'pending' && daysSinceCreated > 1) return 'medium';
    return 'low';
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    completed: orders.filter(o => o.status === 'completed').length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total_amount, 0)
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-muted/30">
        <header className="bg-background border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Gestion des Commandes</h1>
              <p className="text-muted-foreground">
                Vue administrative - Toutes les commandes de la plateforme
              </p>
            </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  {filteredOrders.length} commandes
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">En attente</p>
                    <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Confirmées</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Complétées</p>
                    <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenus</p>
                    <p className="text-xl font-bold">{stats.totalRevenue.toLocaleString()} FCFA</p>
                  </div>
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
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
                      placeholder="Rechercher par numéro de commande, nom ou email..."
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
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="confirmed">Confirmé</SelectItem>
                    <SelectItem value="completed">Complété</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
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
                Gérez toutes les commandes de la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                 <div className="space-y-4">
                   {paginatedOrders.map((order) => {
                    const priority = getOrderPriority(order);
                    const priorityColors = {
                      high: 'border-l-4 border-l-red-500 bg-red-50/50',
                      medium: 'border-l-4 border-l-orange-500 bg-orange-50/50',
                      low: 'border-l-4 border-l-green-500'
                    };
                    
                    return (
                      <div key={order.id} className={`flex items-center justify-between p-4 border rounded-lg ${priorityColors[priority]}`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium">#{order.order_number}</p>
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
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {order.profile?.display_name}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {order.profile?.email}
                                </span>
                                {order.profile?.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {order.profile.phone}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm font-medium text-primary mt-1">
                                {order.total_amount.toLocaleString('fr-FR')} {order.currency}
                              </p>
                              {order.customer_notes && (
                                <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                                  <p className="text-xs text-blue-800">
                                    <MessageSquare className="h-3 w-3 inline mr-1" />
                                    Note: {order.customer_notes}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {getStatusBadge(order.status, 'status')}
                              {getStatusBadge(order.payment_status, 'payment')}
                              {getStatusBadge(order.fulfillment_status, 'fulfillment')}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Créée: {new Date(order.created_at).toLocaleDateString('fr-FR')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Modifiée: {new Date(order.updated_at).toLocaleDateString('fr-FR')}
                            </span>
                            <span>Articles: {order.order_items?.length || 0}</span>
                          </div>
                        </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => generateOrderPDF(order)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              PDF
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                                  <Eye className="h-4 w-4 mr-1" />
                                  Détails
                                </Button>
                              </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Détails de la commande #{order.order_number}</DialogTitle>
                              </DialogHeader>
                              {selectedOrder && (
                                <div className="space-y-6">
                                  {/* Informations client */}
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-lg flex items-center gap-2">
                                        <User className="h-5 w-5" />
                                        Informations Client
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid md:grid-cols-2 gap-4">
                                      <div>
                                        <p className="font-medium">{selectedOrder.profile?.display_name}</p>
                                        <p className="text-sm text-muted-foreground">{selectedOrder.profile?.email}</p>
                                        {selectedOrder.profile?.phone && (
                                          <p className="text-sm text-muted-foreground">{selectedOrder.profile.phone}</p>
                                        )}
                                      </div>
                                      {selectedOrder.shipping_address && (
                                        <div>
                                          <p className="font-medium flex items-center gap-1">
                                            <MapPin className="h-4 w-4" />
                                            Adresse de livraison
                                          </p>
                                          <p className="text-sm text-muted-foreground">
                                            {JSON.stringify(selectedOrder.shipping_address)}
                                          </p>
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>

                                  {/* Articles commandés */}
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-lg flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Articles Commandés
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                       <div className="space-y-3">
                                         {selectedOrder.order_items?.map((item) => (
                                           <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                                             <div>
                                               <p className="font-medium">{item.product_name}</p>
                                               {item.variant_name && (
                                                 <p className="text-sm text-muted-foreground">Variante: {item.variant_name}</p>
                                               )}
                                               <p className="text-sm">Quantité: {item.quantity}</p>
                                             </div>
                                             <div className="flex items-center gap-3">
                                               <div className="text-right">
                                                 <p className="font-medium">{item.total.toLocaleString()} FCFA</p>
                                                 <p className="text-sm text-muted-foreground">{item.price.toLocaleString()} FCFA/unité</p>
                                               </div>
                                               {/* Bouton de téléchargement du fichier produit */}
                                               {item.products?.digital_file_url && (
                                                 <Button
                                                   variant="outline"
                                                   size="sm"
                                                   onClick={() => handleDownloadProduct(item)}
                                                   className="bg-blue-50 hover:bg-blue-100 text-blue-700"
                                                 >
                                                   <Download className="h-3 w-3 mr-1" />
                                                   Fichier
                                                 </Button>
                                               )}
                                             </div>
                                           </div>
                                         ))}
                                      </div>
                                    </CardContent>
                                  </Card>

                                  {/* Actions rapides */}
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-lg">Actions Rapides</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                      <div className="grid md:grid-cols-3 gap-4">
                                        <Select
                                          value={selectedOrder.status}
                                          onValueChange={(value) => updateOrderStatus(selectedOrder.id, 'status', value)}
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="pending">En attente</SelectItem>
                                            <SelectItem value="confirmed">Confirmé</SelectItem>
                                            <SelectItem value="completed">Complété</SelectItem>
                                            <SelectItem value="cancelled">Annulé</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <Select
                                          value={selectedOrder.payment_status}
                                          onValueChange={(value) => updateOrderStatus(selectedOrder.id, 'payment_status', value)}
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="pending">Paiement en attente</SelectItem>
                                            <SelectItem value="paid">Payé</SelectItem>
                                            <SelectItem value="failed">Échec</SelectItem>
                                            <SelectItem value="refunded">Remboursé</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <Select
                                          value={selectedOrder.fulfillment_status}
                                          onValueChange={(value) => updateOrderStatus(selectedOrder.id, 'fulfillment_status', value)}
                                        >
                                          <SelectTrigger>
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
                                        <label className="text-sm font-medium">Note pour le client:</label>
                                        <Textarea
                                          placeholder="Ajouter une note pour informer le client..."
                                          value={customerNote}
                                          onChange={(e) => setCustomerNote(e.target.value)}
                                          className="mt-2"
                                        />
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateOrderStatus(order.id, 'status', value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">En attente</SelectItem>
                              <SelectItem value="confirmed">Confirmé</SelectItem>
                              <SelectItem value="completed">Complété</SelectItem>
                              <SelectItem value="cancelled">Annulé</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    );
                  })}
                   {paginatedOrders.length === 0 && filteredOrders.length === 0 && (
                     <div className="text-center py-8 text-muted-foreground">
                       Aucune commande trouvée
                     </div>
                   )}
                 </div>
               )}
               
               {/* Pagination */}
               {!loading && filteredOrders.length > 0 && (
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
        </div>
      </div>
    </DashboardLayout>
  );
}