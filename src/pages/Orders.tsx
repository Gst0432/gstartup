import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ReviewForm } from '@/components/ReviewForm';
import { 
  Package, 
  Search,
  Filter,
  Eye,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  Trash2,
  MessageSquare,
  RotateCcw
} from 'lucide-react';
import { generateOrderPDF } from '@/utils/pdfGenerator';
import { supabase } from '@/integrations/supabase/client';
import PaymentSelector from '@/components/PaymentSelector';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  total_amount: number;
  currency: string;
  created_at: string;
  items: Array<{
    id: string;
    product_id: string;
    product_name: string;
    variant_name: string | null;
    quantity: number;
    price: number;
    total: number;
    vendor_id: string;
    products: {
      digital_file_url: string | null;
      is_digital: boolean | null;
    };
  }>;
}

export default function Orders() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [retryOrderId, setRetryOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      fetchOrders();
    }
  }, [profile]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            id,
            product_id,
            product_name,
            variant_name,
            quantity,
            price,
            total,
            vendor_id,
            products(
              digital_file_url,
              is_digital
            )
          )
        `)
        .eq('user_id', profile?.user_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      const transformedData = data?.map(order => ({
        ...order,
        items: order.order_items || []
      })) || [];

      setOrders(transformedData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer la commande",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Commande supprimée",
        description: "L'historique de la commande a été supprimé"
      });

      // Refresh orders list
      fetchOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive"
      });
    }
  };

  const handleRetryPayment = (orderId: string) => {
    setRetryOrderId(orderId);
  };

  const handleDownloadProduct = (item: Order['items'][0]) => {
    if (!item.products.digital_file_url) {
      toast({
        title: "Erreur",
        description: "Aucun fichier disponible pour ce produit",
        variant: "destructive"
      });
      return;
    }

    // Ouvrir le fichier dans un nouvel onglet pour téléchargement
    window.open(item.products.digital_file_url, '_blank');
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
      case 'fulfilled': 
        return 'default';
      case 'pending':
      case 'processing': 
        return 'secondary';
      case 'cancelled':
      case 'failed': 
        return 'destructive';
      default: 
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'fulfilled': 
        return CheckCircle;
      case 'pending':
      case 'processing': 
        return Clock;
      case 'shipped': 
        return Truck;
      case 'cancelled':
      case 'failed': 
        return XCircle;
      default: 
        return Clock;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'processing': return 'En traitement';
      case 'shipped': return 'Expédié';
      case 'fulfilled': return 'Livré';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      case 'failed': return 'Échoué';
      default: return status;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => 
        item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalSpent = orders.reduce((sum, order) => 
    order.status === 'completed' ? sum + order.total_amount : sum, 0
  );
  const completedOrders = orders.filter(order => order.status === 'completed').length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-muted/30">
        <header className="bg-background border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Mes Commandes</h1>
                <p className="text-muted-foreground">
                  Suivez l'état de vos commandes
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="gap-2">
                  <Package className="h-4 w-4" />
                  {filteredOrders.length} commandes
                </Badge>
                <Button variant="outline" onClick={fetchOrders}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualiser
                </Button>
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
                  Total Dépensé
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSpent.toLocaleString()} FCFA</div>
                <p className="text-xs text-muted-foreground">
                  Sur toutes vos commandes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Commandes Livrées
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedOrders}</div>
                <p className="text-xs text-muted-foreground">
                  Commandes terminées
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  En Attente
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingOrders}</div>
                <p className="text-xs text-muted-foreground">
                  En cours de traitement
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
                      placeholder="Rechercher par numéro de commande ou produit..."
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
                    <SelectItem value="processing">En traitement</SelectItem>
                    <SelectItem value="shipped">Expédié</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
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
                <Package className="h-5 w-5" />
                Historique des Commandes
              </CardTitle>
              <CardDescription>
                Consultez le détail de toutes vos commandes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {searchTerm || statusFilter !== 'all' 
                      ? "Aucune commande trouvée" 
                      : "Aucune commande pour le moment"
                    }
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || statusFilter !== 'all'
                      ? "Essayez avec d'autres critères de recherche"
                      : "Commencez vos achats sur notre marketplace"
                    }
                  </p>
                  {!searchTerm && statusFilter === 'all' && (
                    <Button>
                      Parcourir le Marketplace
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => {
                    const StatusIcon = getStatusIcon(order.status);
                    return (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-medium">Commande #{order.order_number}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString('fr-FR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                            <Badge variant={getStatusBadgeVariant(order.status)} className="gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {getStatusLabel(order.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-lg">
                              {order.total_amount.toLocaleString()} {order.currency}
                            </span>
                            
                            {/* Bouton Relancer le paiement pour les commandes en attente */}
                            {(order.status === 'pending' || order.payment_status === 'pending') && (
                              <Dialog open={retryOrderId === order.id} onOpenChange={(open) => !open && setRetryOrderId(null)}>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="default" 
                                    size="sm"
                                    onClick={() => handleRetryPayment(order.id)}
                                    className="bg-primary hover:bg-primary/90"
                                  >
                                    <RotateCcw className="h-4 w-4 mr-1" />
                                    Relancer
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Relancer le paiement</DialogTitle>
                                  </DialogHeader>
                                  <PaymentSelector
                                    amount={order.total_amount}
                                    currency={order.currency}
                                    orderId={order.id}
                                    vendorId={order.items[0]?.vendor_id} // Get vendor from first item
                                    onPaymentComplete={(success) => {
                                      if (success) {
                                        toast({
                                          title: "Paiement relancé",
                                          description: "Votre paiement a été relancé avec succès"
                                        });
                                        setRetryOrderId(null);
                                        fetchOrders(); // Refresh orders
                                      }
                                    }}
                                  />
                                </DialogContent>
                              </Dialog>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Supprimer la commande</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Êtes-vous sûr de vouloir supprimer cette commande ? Cette action est irréversible.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteOrder(order.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Supprimer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Articles:</p>
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-sm bg-muted/50 p-3 rounded">
                              <div className="flex-1">
                                <span className="font-medium">{item.product_name}</span>
                                {item.variant_name && (
                                  <span className="text-muted-foreground"> ({item.variant_name})</span>
                                )}
                                <span className="text-muted-foreground"> × {item.quantity}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{item.total.toLocaleString()} FCFA</span>
                                
                                {/* Bouton de téléchargement du produit - seulement si payé et fichier disponible */}
                                {order.payment_status === 'paid' && item.products?.digital_file_url && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownloadProduct(item)}
                                    className="text-xs"
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    Télécharger
                                  </Button>
                                )}
                                
                                {order.payment_status === 'completed' && (
                                  <ReviewForm
                                    productId={item.product_id}
                                    productName={item.product_name}
                                    orderItemId={item.id}
                                    onReviewSubmitted={() => {
                                      toast({
                                        title: "Avis ajouté",
                                        description: "Merci pour votre avis !"
                                      });
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}