import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { VendorStatsCard } from '@/components/vendor/VendorStatsCard';
import { VendorBasicInfoForm } from '@/components/vendor/VendorBasicInfoForm';
import { VendorImagesSection } from '@/components/vendor/VendorImagesSection';
import { VendorDomainSection } from '@/components/vendor/VendorDomainSection';

import { Store, User, Save, Shield, Eye, EyeOff } from 'lucide-react';
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
  subdomain: string | null;
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
    store_slug: '',
    logo_url: '',
    cover_image_url: '',
    moneroo_api_key: '',
    moneroo_secret_key: '',
    moneyfusion_api_url: ''
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
        store_slug: data.store_slug || '',
        logo_url: data.logo_url || '',
        cover_image_url: data.cover_image_url || '',
        moneroo_api_key: data.moneroo_api_key || '',
        moneroo_secret_key: data.moneroo_secret_key || '',
        moneyfusion_api_url: data.moneyfusion_api_url || ''
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

  const toggleVendorStatus = async (isActive: boolean) => {
    if (!vendor) return;
    
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ is_active: isActive })
        .eq('id', vendor.id);

      if (error) {
        console.error('Error updating vendor status:', error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le statut de la boutique",
          variant: "destructive"
        });
        return;
      }

      setVendor(prev => prev ? { ...prev, is_active: isActive } : null);
      
      toast({
        title: "Succès",
        description: `Boutique ${isActive ? 'activée' : 'désactivée'} avec succès`,
      });
    } catch (error) {
      console.error('Error updating vendor status:', error);
    }
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
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
        {/* Header amélioré */}
        <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-40">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Profil Vendeur
                </h1>
                <p className="text-muted-foreground mt-1">
                  Gérez les informations de votre boutique et configurez vos paramètres
                </p>
              </div>
              <div className="flex items-center gap-3">
                {vendor && (
                  <>
                    <Badge variant={vendor.is_verified ? "default" : "secondary"} className="gap-2 px-3 py-1">
                      <Shield className="h-4 w-4" />
                      {vendor.is_verified ? "Vérifié" : "Non vérifié"}
                    </Badge>
                    <Badge variant={vendor.is_active ? "default" : "destructive"} className="gap-2 px-3 py-1">
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
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar avec statistiques et profil */}
            <div className="lg:col-span-1 space-y-6">
              <VendorStatsCard vendor={vendor} />
              
              {/* Profil utilisateur amélioré */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profil Utilisateur
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center pb-4 border-b">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white font-bold text-xl">
                        {profile?.display_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <h3 className="font-medium">{profile?.display_name}</h3>
                    <p className="text-sm text-muted-foreground">{profile?.email}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Rôle:</span>
                      <Badge variant="secondary" className="capitalize">
                        {profile?.role}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Membre depuis:</span>
                      <span className="text-sm font-medium">
                        {new Date().getFullYear()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Formulaire principal */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="space-y-6">
                <VendorBasicInfoForm 
                  formData={formData} 
                  onInputChange={handleInputChange} 
                />
                
                <VendorImagesSection 
                  formData={formData} 
                  vendor={vendor}
                  onInputChange={handleInputChange} 
                />
                
                <VendorDomainSection 
                  formData={formData} 
                  vendor={vendor}
                  onInputChange={handleInputChange} 
                />

                {/* Section de contrôle de visibilité */}
                {vendor && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {vendor.is_active ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                        Visibilité de la boutique
                      </CardTitle>
                      <CardDescription>
                        Contrôlez si votre boutique est visible sur la marketplace
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Store className="h-4 w-4" />
                            <span className="font-medium">Afficher sur la marketplace</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {vendor.is_active 
                              ? "Votre boutique est visible par les clients sur la marketplace"
                              : "Votre boutique est masquée de la marketplace"
                            }
                          </p>
                        </div>
                        <Switch
                          checked={vendor.is_active}
                          onCheckedChange={toggleVendorStatus}
                          className="ml-4"
                        />
                      </div>
                      
                      {!vendor.is_active && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-yellow-800">
                            <EyeOff className="h-4 w-4" />
                            <span className="font-medium">Boutique masquée</span>
                          </div>
                          <p className="text-sm text-yellow-700 mt-1">
                            Votre boutique n'apparaît plus dans les résultats de recherche et la marketplace. 
                            Vos clients existants peuvent toujours accéder à vos produits via des liens directs.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Bouton de sauvegarde fixe */}
                <div className="sticky bottom-6 z-30">
                  <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-lg border shadow-lg">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        {saving ? 'Sauvegarde en cours...' : 'Modifications prêtes à être sauvegardées'}
                      </div>
                      <Button type="submit" disabled={saving} className="gap-2 min-w-[200px]">
                        <Save className="h-4 w-4" />
                        {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}