import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Key, Lock, Globe, Shield, ExternalLink, CheckCircle, Link, Mail, ArrowLeftRight, Power } from 'lucide-react';

interface VendorPaymentSectionProps {
  formData: {
    moneroo_api_key: string;
    moneroo_secret_key: string;
    moneyfusion_api_url: string;
    moneroo_enabled: boolean;
    moneyfusion_enabled: boolean;
    success_url: string;
    cancel_url: string;
    webhook_url: string;
    notification_email: string;
  };
  onInputChange: (field: string, value: string | boolean) => void;
}

export function VendorPaymentSection({ formData, onInputChange }: VendorPaymentSectionProps) {
  const monerooConfigured = formData.moneroo_api_key && formData.moneroo_secret_key;
  const moneyfusionConfigured = formData.moneyfusion_api_url;

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
            
            <div className="flex items-center gap-3">
              {monerooConfigured ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Configuré
                </Badge>
              ) : (
                <Badge variant="secondary">Non configuré</Badge>
              )}
              
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.moneroo_enabled}
                  onCheckedChange={(checked) => onInputChange('moneroo_enabled', checked)}
                  disabled={!monerooConfigured}
                />
                <Label className="text-sm">
                  {formData.moneroo_enabled ? 'Activé' : 'Désactivé'}
                </Label>
              </div>
            </div>
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
                value={formData.moneroo_api_key}
                onChange={(e) => onInputChange('moneroo_api_key', e.target.value)}
                placeholder="Votre clé API Moneroo"
              />
            </div>
            
            <div>
              <Label htmlFor="moneroo_secret" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Clé secrète Moneroo
              </Label>
              <Input
                id="moneroo_secret"
                type="password"
                value={formData.moneroo_secret_key}
                onChange={(e) => onInputChange('moneroo_secret_key', e.target.value)}
                placeholder="Votre clé secrète Moneroo"
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
            
            <div className="flex items-center gap-3">
              {moneyfusionConfigured ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Configuré
                </Badge>
              ) : (
                <Badge variant="secondary">Non configuré</Badge>
              )}
              
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.moneyfusion_enabled}
                  onCheckedChange={(checked) => onInputChange('moneyfusion_enabled', checked)}
                  disabled={!moneyfusionConfigured}
                />
                <Label className="text-sm">
                  {formData.moneyfusion_enabled ? 'Activé' : 'Désactivé'}
                </Label>
              </div>
            </div>
          </div>
          
          <div>
            <Label htmlFor="moneyfusion_api_url" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              URL API MoneyFusion
            </Label>
            <Input
              id="moneyfusion_api_url"
              type="url"
              value={formData.moneyfusion_api_url}
              onChange={(e) => onInputChange('moneyfusion_api_url', e.target.value)}
              placeholder="https://votre-api-url-moneyfusion.com"
            />
            <p className="text-sm text-muted-foreground mt-1">
              L'URL de votre API MoneyFusion (fournie par MoneyFusion)
            </p>
          </div>
          
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <a href="https://moneyfusion.net" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Contactez MoneyFusion
            </a>
          </Button>
        </div>

        {/* Configuration des URLs et notifications */}
        <div className="p-4 border rounded-lg space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <ArrowLeftRight className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-medium">URLs de redirection et Webhooks</h4>
              <p className="text-sm text-muted-foreground">Configurez les URLs pour la gestion des paiements</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="success_url" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                URL de succès
              </Label>
              <Input
                id="success_url"
                type="url"
                value={formData.success_url}
                onChange={(e) => onInputChange('success_url', e.target.value)}
                placeholder="https://monsite.com/paiement-reussi"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Page où rediriger après un paiement réussi
              </p>
            </div>
            
            <div>
              <Label htmlFor="cancel_url" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                URL d'annulation
              </Label>
              <Input
                id="cancel_url"
                type="url"
                value={formData.cancel_url}
                onChange={(e) => onInputChange('cancel_url', e.target.value)}
                placeholder="https://monsite.com/paiement-annule"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Page où rediriger si le paiement est annulé
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="webhook_url" className="flex items-center gap-2">
                <Link className="h-4 w-4" />
                URL Webhook personnalisée
              </Label>
              <Input
                id="webhook_url"
                type="url"
                value={formData.webhook_url}
                onChange={(e) => onInputChange('webhook_url', e.target.value)}
                placeholder="https://monsite.com/webhook/paiement"
              />
              <p className="text-xs text-muted-foreground mt-1">
                URL pour recevoir les notifications de paiement
              </p>
            </div>
            
            <div>
              <Label htmlFor="notification_email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email de notification
              </Label>
              <Input
                id="notification_email"
                type="email"
                value={formData.notification_email}
                onChange={(e) => onInputChange('notification_email', e.target.value)}
                placeholder="admin@monsite.com"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email pour les notifications de paiement
              </p>
            </div>
          </div>
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
                  <p>4. Configurez vos URLs de redirection dans leur tableau de bord</p>
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
                  <p>2. Récupérez votre <strong>URL API personnalisée</strong></p>
                  <p>3. Configurez vos URLs de redirection dans leur interface</p>
                  <p>4. Activez la passerelle avec le switch ci-dessus</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Power className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-purple-900 dark:text-purple-100">Activation des Passerelles</h4>
                <div className="text-sm text-purple-800 dark:text-purple-200 mt-1 space-y-1">
                  <p>• <strong>Activé</strong>: La passerelle sera proposée aux clients lors du paiement</p>
                  <p>• <strong>Désactivé</strong>: La passerelle ne sera pas disponible</p>
                  <p>• Vous devez d'abord configurer les clés/URL avant d'activer</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <div className="flex items-start gap-3">
              <ArrowLeftRight className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-purple-900 dark:text-purple-100">URLs et Webhooks</h4>
                <div className="text-sm text-purple-800 dark:text-purple-200 mt-1 space-y-1">
                  <p>• <strong>URL de succès</strong>: Redirection automatique après paiement réussi</p>
                  <p>• <strong>URL d'annulation</strong>: Redirection si le client annule</p>
                  <p>• <strong>Webhook personnalisé</strong>: Pour recevoir les notifications en temps réel</p>
                  <p>• <strong>Email</strong>: Notifications par email des transactions</p>
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