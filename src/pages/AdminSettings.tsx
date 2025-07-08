import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Settings, Key, CreditCard, Globe, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PaymentGateway {
  id: string;
  name: string;
  type: 'moneroo' | 'stripe' | 'paypal' | 'orange_money' | 'mtn_money';
  is_active: boolean;
  api_key?: string;
  api_secret?: string;
  webhook_secret?: string;
  test_mode: boolean;
  supported_currencies: string[];
  config: any;
}

export default function AdminSettings() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<string>('');

  const [formData, setFormData] = useState({
    api_key: '',
    api_secret: '',
    webhook_secret: '',
    test_mode: true,
    is_active: false
  });

  const defaultGateways: Omit<PaymentGateway, 'id'>[] = [
    {
      name: 'Moneroo',
      type: 'moneroo',
      is_active: false,
      test_mode: true,
      supported_currencies: ['XAF', 'CFA'],
      config: {}
    },
    {
      name: 'Stripe',
      type: 'stripe',
      is_active: false,
      test_mode: true,
      supported_currencies: ['USD', 'EUR', 'XAF'],
      config: {}
    },
    {
      name: 'Orange Money',
      type: 'orange_money',
      is_active: false,
      test_mode: true,
      supported_currencies: ['XAF'],
      config: {}
    },
    {
      name: 'MTN Mobile Money',
      type: 'mtn_money',
      is_active: false,
      test_mode: true,
      supported_currencies: ['XAF'],
      config: {}
    }
  ];

  useEffect(() => {
    fetchGateways();
  }, []);

  useEffect(() => {
    if (selectedGateway) {
      const gateway = gateways.find(g => g.id === selectedGateway);
      if (gateway) {
        setFormData({
          api_key: gateway.api_key || '',
          api_secret: gateway.api_secret || '',
          webhook_secret: gateway.webhook_secret || '',
          test_mode: gateway.test_mode,
          is_active: gateway.is_active
        });
      }
    }
  }, [selectedGateway, gateways]);

  const fetchGateways = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_gateways')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching gateways:', error);
        // Initialize default gateways if table doesn't exist or is empty
        await initializeDefaultGateways();
        return;
      }

      if (!data || data.length === 0) {
        await initializeDefaultGateways();
        return;
      }

      setGateways(data);
      if (data.length > 0) {
        setSelectedGateway(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching gateways:', error);
      await initializeDefaultGateways();
    }
  };

  const initializeDefaultGateways = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_gateways')
        .insert(defaultGateways)
        .select();

      if (error) {
        console.error('Error initializing gateways:', error);
        return;
      }

      setGateways(data || []);
      if (data && data.length > 0) {
        setSelectedGateway(data[0].id);
      }
    } catch (error) {
      console.error('Error initializing gateways:', error);
    }
  };

  const handleSave = async () => {
    if (!selectedGateway) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('payment_gateways')
        .update({
          api_key: formData.api_key,
          api_secret: formData.api_secret,
          webhook_secret: formData.webhook_secret,
          test_mode: formData.test_mode,
          is_active: formData.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedGateway);

      if (error) {
        throw error;
      }

      // Update local state
      setGateways(prev => prev.map(g => 
        g.id === selectedGateway 
          ? { ...g, ...formData }
          : g
      ));

      toast({
        title: "Succès",
        description: "Configuration de la passerelle mise à jour",
      });

    } catch (error) {
      console.error('Error saving gateway:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const currentGateway = gateways.find(g => g.id === selectedGateway);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-muted/30">
        <header className="bg-background border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Paramètres de Paiement</h1>
                <p className="text-muted-foreground">
                  Gérer les passerelles de paiement et leurs configurations
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-6">
            {/* Sélection de la passerelle */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Passerelles de Paiement
                </CardTitle>
                <CardDescription>
                  Sélectionnez une passerelle pour la configurer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {gateways.map((gateway) => (
                    <div
                      key={gateway.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedGateway === gateway.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedGateway(gateway.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{gateway.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {gateway.supported_currencies.join(', ')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {gateway.is_active && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Actif
                            </span>
                          )}
                          {gateway.test_mode && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              Test
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Configuration de la passerelle sélectionnée */}
            {currentGateway && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Configuration - {currentGateway.name}
                  </CardTitle>
                  <CardDescription>
                    Configurer les clés API et paramètres pour {currentGateway.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="api_key">Clé API</Label>
                      <Input
                        id="api_key"
                        type="password"
                        value={formData.api_key}
                        onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                        placeholder="Entrez votre clé API"
                      />
                    </div>
                    
                    {currentGateway.type === 'stripe' && (
                      <div>
                        <Label htmlFor="api_secret">Clé secrète</Label>
                        <Input
                          id="api_secret"
                          type="password"
                          value={formData.api_secret}
                          onChange={(e) => setFormData(prev => ({ ...prev, api_secret: e.target.value }))}
                          placeholder="Entrez votre clé secrète"
                        />
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="webhook_secret">Secret Webhook</Label>
                      <Input
                        id="webhook_secret"
                        type="password"
                        value={formData.webhook_secret}
                        onChange={(e) => setFormData(prev => ({ ...prev, webhook_secret: e.target.value }))}
                        placeholder="Secret pour vérifier les webhooks"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="test_mode"
                        checked={formData.test_mode}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, test_mode: checked }))}
                      />
                      <Label htmlFor="test_mode">Mode test</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                      />
                      <Label htmlFor="is_active">Passerelle active</Label>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={handleSave} disabled={loading} className="gap-2">
                      <Save className="h-4 w-4" />
                      {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Informations sur les devises supportées */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Devises Supportées
                </CardTitle>
                <CardDescription>
                  Devises prises en charge par les différentes passerelles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {gateways.map((gateway) => (
                    <div key={gateway.id} className="p-3 border rounded">
                      <h4 className="font-medium">{gateway.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {gateway.supported_currencies.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}