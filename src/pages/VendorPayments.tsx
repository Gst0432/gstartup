import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { VendorPaymentSection } from '@/components/vendor/VendorPaymentSection';
import { CreditCard, Save, Shield, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface VendorData {
  id: string;
  business_name: string;
  api_key: string | null;
  api_secret: string | null;
  webhook_secret: string | null;
  success_url: string | null;
  cancel_url: string | null;
  webhook_url: string | null;
  notification_email: string | null;
  is_verified: boolean;
}

export default function VendorPayments() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    api_key: '',
    api_secret: '',
    webhook_secret: '',
    success_url: '',
    cancel_url: '',
    webhook_url: '',
    notification_email: ''
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
        .select('id, business_name, api_key, api_secret, webhook_secret, success_url, cancel_url, webhook_url, notification_email, is_verified')
        .eq('user_id', profile?.user_id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching vendor profile:', error);
        return;
      }

      if (data) {
        setVendor(data);
        setFormData({
          api_key: data.api_key || '',
          api_secret: data.api_secret || '',
          webhook_secret: data.webhook_secret || '',
          success_url: data.success_url || '',
          cancel_url: data.cancel_url || '',
          webhook_url: data.webhook_url || '',
          notification_email: data.notification_email || ''
        });
      }
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
        // Update existing vendor payment settings
        const { error } = await supabase
          .from('vendors')
          .update(formData)
          .eq('id', vendor.id);

        if (error) {
          console.error('Error updating vendor payment settings:', error);
          toast({
            title: "Erreur",
            description: "Impossible de mettre à jour les paramètres de paiement",
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Succès",
          description: "Paramètres de paiement mis à jour avec succès",
        });

        // Refresh data
        fetchVendorProfile();
      } else {
        toast({
          title: "Erreur",
          description: "Veuillez d'abord créer votre profil vendeur",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving vendor payment settings:', error);
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

  const isConfigured = formData.api_key && formData.api_secret;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
        {/* Header */}
        <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b sticky top-0 z-40">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-3">
                  <CreditCard className="h-8 w-8 text-primary" />
                  Passerelles de Paiement
                </h1>
                <p className="text-muted-foreground mt-1">
                  Configurez vos moyens de paiement pour recevoir les paiements de vos clients
                </p>
              </div>
              <div className="flex items-center gap-3">
                {vendor?.is_verified && (
                  <Badge variant="default" className="gap-2 px-3 py-1">
                    <Shield className="h-4 w-4" />
                    Vendeur vérifié
                  </Badge>
                )}
                {isConfigured && (
                  <Badge variant="default" className="gap-2 px-3 py-1 bg-green-500 hover:bg-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Configuré
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {!vendor && (
              <Card className="mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800">
                <CardHeader>
                  <CardTitle className="text-yellow-800 dark:text-yellow-200">
                    Profil vendeur requis
                  </CardTitle>
                  <CardDescription className="text-yellow-700 dark:text-yellow-300">
                    Vous devez d'abord compléter votre profil vendeur avant de configurer vos passerelles de paiement.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {vendor && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <VendorPaymentSection 
                  formData={formData} 
                  onInputChange={handleInputChange} 
                />

                {/* Bouton de sauvegarde */}
                <div className="sticky bottom-6 z-30">
                  <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 rounded-lg border shadow-lg">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        {saving ? 'Sauvegarde en cours...' : 'Paramètres de paiement prêts à être sauvegardés'}
                      </div>
                      <Button type="submit" disabled={saving} className="gap-2 min-w-[200px]">
                        <Save className="h-4 w-4" />
                        {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}