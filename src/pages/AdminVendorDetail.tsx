import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  ArrowLeft,
  Store,
  CheckCircle,
  XCircle,
  Star,
  TrendingUp,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Package,
  Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface VendorDetail {
  id: string;
  user_id: string;
  business_name: string;
  description: string;
  address: string;
  phone: string;
  website_url: string;
  is_verified: boolean;
  is_active: boolean;
  rating: number;
  total_sales: number;
  created_at: string;
  updated_at: string;
  logo_url: string;
  cover_image_url: string;
  profiles?: {
    display_name: string;
    email: string;
    user_id: string;
  };
}

interface ProductCount {
  total: number;
  active: number;
}

export default function AdminVendorDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [vendor, setVendor] = useState<VendorDetail | null>(null);
  const [productCount, setProductCount] = useState<ProductCount>({ total: 0, active: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchVendorDetail();
      fetchProductCount();
    }
  }, [id]);

  const fetchVendorDetail = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select(`
          *,
          profiles!inner(
            display_name,
            email,
            user_id
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching vendor detail:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les détails du vendeur",
          variant: "destructive"
        });
        navigate('/admin/vendors');
        return;
      }

      setVendor(data);
    } catch (error) {
      console.error('Error fetching vendor detail:', error);
      navigate('/admin/vendors');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductCount = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, is_active')
        .eq('vendor_id', id);

      if (error) {
        console.error('Error fetching product count:', error);
        return;
      }

      setProductCount({
        total: data.length,
        active: data.filter(p => p.is_active).length
      });
    } catch (error) {
      console.error('Error fetching product count:', error);
    }
  };

  const updateVendorStatus = async (field: 'is_verified' | 'is_active', value: boolean) => {
    if (!vendor) return;

    try {
      const { error } = await supabase
        .from('vendors')
        .update({ [field]: value })
        .eq('id', vendor.id);

      if (error) {
        console.error('Error updating vendor status:', error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le statut du vendeur",
          variant: "destructive"
        });
        return;
      }

      setVendor({ ...vendor, [field]: value });

      toast({
        title: "Succès",
        description: `Statut du vendeur mis à jour avec succès`,
      });
    } catch (error) {
      console.error('Error updating vendor status:', error);
    }
  };

  const deleteVendor = async () => {
    if (!vendor) return;
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce vendeur ? Cette action est irréversible.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', vendor.id);

      if (error) {
        console.error('Error deleting vendor:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le vendeur",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Succès",
        description: "Vendeur supprimé avec succès",
      });
      
      navigate('/admin/vendors');
    } catch (error) {
      console.error('Error deleting vendor:', error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-muted/30 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!vendor) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-muted/30 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Vendeur introuvable</h1>
            <Button onClick={() => navigate('/admin/vendors')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la liste
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-muted/30">
        <header className="bg-background border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/admin/vendors')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">{vendor.business_name}</h1>
                  <p className="text-muted-foreground">
                    Détails du vendeur
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {vendor.is_verified ? (
                  <Badge className="text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Vérifié
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-orange-600">
                    <XCircle className="h-3 w-3 mr-1" />
                    En attente
                  </Badge>
                )}
                {vendor.is_active ? (
                  <Badge variant="default">Actif</Badge>
                ) : (
                  <Badge variant="destructive">Inactif</Badge>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informations principales */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informations générales */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Informations Générales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nom d'entreprise</label>
                      <p className="text-sm">{vendor.business_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Propriétaire</label>
                      <p className="text-sm">{vendor.profiles?.display_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-sm flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {vendor.profiles?.email}
                      </p>
                    </div>
                    {vendor.phone && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Téléphone</label>
                        <p className="text-sm flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {vendor.phone}
                        </p>
                      </div>
                    )}
                    {vendor.website_url && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Site web</label>
                        <p className="text-sm flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          <a href={vendor.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {vendor.website_url}
                          </a>
                        </p>
                      </div>
                    )}
                    {vendor.address && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Adresse</label>
                        <p className="text-sm flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {vendor.address}
                        </p>
                      </div>
                    )}
                  </div>
                  {vendor.description && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Description</label>
                      <p className="text-sm mt-1">{vendor.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Statistiques */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Statistiques
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                      </div>
                      <p className="text-2xl font-bold">{vendor.rating || 0}/5</p>
                      <p className="text-sm text-muted-foreground">Note moyenne</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="text-2xl font-bold">{vendor.total_sales || 0}</p>
                      <p className="text-sm text-muted-foreground">Ventes totales</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Package className="h-5 w-5 text-blue-500" />
                      </div>
                      <p className="text-2xl font-bold">{productCount.total}</p>
                      <p className="text-sm text-muted-foreground">Produits total</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <p className="text-2xl font-bold">{productCount.active}</p>
                      <p className="text-sm text-muted-foreground">Produits actifs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!vendor.is_verified && (
                    <Button
                      className="w-full"
                      onClick={() => updateVendorStatus('is_verified', true)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approuver le vendeur
                    </Button>
                  )}
                  <Button
                    variant={vendor.is_active ? "outline" : "default"}
                    className="w-full"
                    onClick={() => updateVendorStatus('is_active', !vendor.is_active)}
                  >
                    {vendor.is_active ? 'Désactiver' : 'Activer'} le vendeur
                  </Button>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={deleteVendor}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer le vendeur
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Dates importantes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <label className="font-medium text-muted-foreground">Inscription</label>
                    <p>{new Date(vendor.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                  <div>
                    <label className="font-medium text-muted-foreground">Dernière mise à jour</label>
                    <p>{new Date(vendor.updated_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}