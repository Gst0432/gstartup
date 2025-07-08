import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  Store, 
  User,
  Save,
  Upload,
  Star,
  MapPin,
  Phone,
  Globe,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface VendorData {
  id: string;
  business_name: string;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  address: string | null;
  phone: string | null;
  website_url: string | null;
  is_active: boolean;
  is_verified: boolean;
  rating: number | null;
  total_sales: number | null;
}

export default function VendorProfile() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    business_name: '',
    description: '',
    address: '',
    phone: '',
    website_url: '',
    logo_url: '',
    cover_image_url: ''
  });

  useEffect(() => {
    if (profile) {
      fetchVendorProfile();
    }
  }, [profile]);

  const fetchVendorProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', profile?.user_id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No vendor profile exists, this is ok
          setLoading(false);
          return;
        }
        console.error('Error fetching vendor profile:', error);
        return;
      }

      setVendor(data);
      setFormData({
        business_name: data.business_name || '',
        description: data.description || '',
        address: data.address || '',
        phone: data.phone || '',
        website_url: data.website_url || '',
        logo_url: data.logo_url || '',
        cover_image_url: data.cover_image_url || ''
      });
    } catch (error) {
      console.error('Error fetching vendor profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (vendor) {
        // Update existing vendor
        const { error } = await supabase
          .from('vendors')
          .update(formData)
          .eq('id', vendor.id);

        if (error) {
          console.error('Error updating vendor:', error);
          toast({
            title: "Erreur",
            description: "Impossible de mettre à jour le profil",
            variant: "destructive"
          });
          return;
        }
      } else {
        // Create new vendor profile
        const { error } = await supabase
          .from('vendors')
          .insert({
            ...formData,
            user_id: profile?.user_id
          });

        if (error) {
          console.error('Error creating vendor:', error);
          toast({
            title: "Erreur",
            description: "Impossible de créer le profil vendeur",
            variant: "destructive"
          });
          return;
        }
      }

      toast({
        title: "Succès",
        description: "Profil vendeur mis à jour avec succès",
      });

      // Refresh data
      fetchVendorProfile();
    } catch (error) {
      console.error('Error saving vendor profile:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
              <div>
                <h1 className="text-2xl font-bold">Profil Vendeur</h1>
                <p className="text-muted-foreground">
                  Gérez les informations de votre boutique
                </p>
              </div>
              <div className="flex items-center gap-4">
                {vendor && (
                  <>
                    <Badge variant={vendor.is_verified ? "default" : "secondary"} className="gap-2">
                      <Shield className="h-4 w-4" />
                      {vendor.is_verified ? "Vérifié" : "Non vérifié"}
                    </Badge>
                    <Badge variant={vendor.is_active ? "default" : "destructive"} className="gap-2">
                      <Store className="h-4 w-4" />
                      {vendor.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Statistiques */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Statistiques
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{vendor?.rating?.toFixed(1) || '0.0'}</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.round(vendor?.rating || 0)
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Note moyenne</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Ventes totales</span>
                      <span className="font-medium">{vendor?.total_sales || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Statut</span>
                      <Badge variant={vendor?.is_active ? "default" : "secondary"}>
                        {vendor?.is_active ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Vérification</span>
                      <Badge variant={vendor?.is_verified ? "default" : "secondary"}>
                        {vendor?.is_verified ? "Vérifié" : "En attente"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Profil utilisateur */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profil Utilisateur
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-sm text-muted-foreground">Nom:</span>
                    <p className="font-medium">{profile?.display_name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Email:</span>
                    <p className="font-medium">{profile?.email}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Rôle:</span>
                    <Badge variant="secondary">{profile?.role}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Formulaire */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations de la Boutique</CardTitle>
                    <CardDescription>
                      Informations publiques de votre boutique
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="business_name">Nom de la boutique *</Label>
                      <Input
                        id="business_name"
                        value={formData.business_name}
                        onChange={(e) => handleInputChange('business_name', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={4}
                        placeholder="Décrivez votre boutique et vos produits..."
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Coordonnées</CardTitle>
                    <CardDescription>
                      Informations de contact pour vos clients
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="address" className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Adresse
                      </Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Votre adresse complète"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Téléphone
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+237 6XX XXX XXX"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="website_url" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Site web
                      </Label>
                      <Input
                        id="website_url"
                        value={formData.website_url}
                        onChange={(e) => handleInputChange('website_url', e.target.value)}
                        placeholder="https://votre-site.com"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Images</CardTitle>
                    <CardDescription>
                      Logo et image de couverture de votre boutique
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="logo_url">URL du logo</Label>
                      <Input
                        id="logo_url"
                        value={formData.logo_url}
                        onChange={(e) => handleInputChange('logo_url', e.target.value)}
                        placeholder="https://..."
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Recommandé: 200x200px
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="cover_image_url">URL de l'image de couverture</Label>
                      <Input
                        id="cover_image_url"
                        value={formData.cover_image_url}
                        onChange={(e) => handleInputChange('cover_image_url', e.target.value)}
                        placeholder="https://..."
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Recommandé: 1200x400px
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving} className="gap-2">
                    <Save className="h-4 w-4" />
                    {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}