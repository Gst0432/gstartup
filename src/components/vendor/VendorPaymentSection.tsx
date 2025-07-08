import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Key, Lock, Globe, Shield, ExternalLink, CheckCircle } from 'lucide-react';

interface VendorPaymentSectionProps {
  formData: {
    api_key: string;
    api_secret: string;
    webhook_secret: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export function VendorPaymentSection({ formData, onInputChange }: VendorPaymentSectionProps) {
  const monerooConfigured = formData.api_key && formData.api_secret;
  const moneyfusionConfigured = formData.webhook_secret;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Passerelles de Paiement
        </CardTitle>
        <CardDescription>
          Configurez vos passerelles de paiement pour accepter les paiements de vos clients
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Section Moneroo */}
        <div className="p-4 border rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">M</span>
              </div>
              <div>
                <h4 className="font-medium">Moneroo</h4>
                <p className="text-sm text-muted-foreground">Paiements Mobile Money (MTN, Orange)</p>
              </div>
            </div>
            
            {monerooConfigured ? (
              <Badge variant="default" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Configuré
              </Badge>
            ) : (
              <Badge variant="secondary">Non configuré</Badge>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="moneroo_api_key" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Clé API Moneroo
              </Label>
              <Input
                id="moneroo_api_key"
                type="password"
                value={formData.api_key}
                onChange={(e) => onInputChange('api_key', e.target.value)}
                placeholder="Votre clé API Moneroo"
              />
            </div>
            
            <div>
              <Label htmlFor="moneroo_secret" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Clé secrète
              </Label>
              <Input
                id="moneroo_secret"
                type="password"
                value={formData.api_secret}
                onChange={(e) => onInputChange('api_secret', e.target.value)}
                placeholder="Votre clé secrète"
              />
            </div>
          </div>
          
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <a href="https://moneroo.io/dashboard" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Tableau de bord Moneroo
            </a>
          </Button>
        </div>

        {/* Section MoneyFusion */}
        <div className="p-4 border rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">MF</span>
              </div>
              <div>
                <h4 className="font-medium">MoneyFusion</h4>
                <p className="text-sm text-muted-foreground">Paiements Mobile Money et Bancaires</p>
              </div>
            </div>
            
            {moneyfusionConfigured ? (
              <Badge variant="default" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Configuré
              </Badge>
            ) : (
              <Badge variant="secondary">Non configuré</Badge>
            )}
          </div>
          
          <div>
            <Label htmlFor="moneyfusion_webhook" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Clé webhook MoneyFusion
            </Label>
            <Input
              id="moneyfusion_webhook"
              type="password"
              value={formData.webhook_secret}
              onChange={(e) => onInputChange('webhook_secret', e.target.value)}
              placeholder="Votre clé webhook MoneyFusion"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Pour sécuriser les notifications de paiement
            </p>
          </div>
          
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <a href="https://moneyfusion.net" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Contactez MoneyFusion
            </a>
          </Button>
        </div>

        {/* Instructions détaillées */}
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Key className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Configuration Moneroo</h4>
                <div className="text-sm text-blue-800 dark:text-blue-200 mt-1 space-y-1">
                  <p>1. Créez un compte sur <a href="https://moneroo.io" className="underline" target="_blank">moneroo.io</a></p>
                  <p>2. Allez dans "API Keys" de votre tableau de bord</p>
                  <p>3. Copiez votre clé API et clé secrète</p>
                  <p>4. Collez-les dans les champs ci-dessus</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-green-900 dark:text-green-100">Configuration MoneyFusion</h4>
                <div className="text-sm text-green-800 dark:text-green-200 mt-1 space-y-1">
                  <p>1. Contactez MoneyFusion pour obtenir vos accès</p>
                  <p>2. Récupérez votre clé webhook</p>
                  <p>3. URL webhook: <code className="bg-white dark:bg-gray-800 px-1 rounded">https://gstartup.pro/api/moneyfusion-webhook</code></p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-orange-900 dark:text-orange-100">Sécurité importante</h4>
                <p className="text-sm text-orange-800 dark:text-orange-200 mt-1">
                  Ces clés donnent accès à vos comptes de paiement. Ne les partagez jamais et 
                  changez-les régulièrement pour maintenir la sécurité de votre boutique.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}