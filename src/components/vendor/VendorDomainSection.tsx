import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Globe, Shield, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VendorDomainSectionProps {
  formData: {
    subdomain: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export function VendorDomainSection({ formData, onInputChange }: VendorDomainSectionProps) {
  const { toast } = useToast();
  const [customDomain, setCustomDomain] = useState('');
  const [domainStatus, setDomainStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié !",
      description: "L'enregistrement DNS a été copié dans le presse-papiers"
    });
  };

  const checkDomain = async () => {
    if (!customDomain) return;
    
    setDomainStatus('checking');
    
    // Simulation de vérification de domaine (vous devriez implémenter une vraie vérification)
    setTimeout(() => {
      const isValid = customDomain.includes('.') && !customDomain.includes(' ');
      setDomainStatus(isValid ? 'valid' : 'invalid');
    }, 2000);
  };

  const connectDomain = () => {
    if (domainStatus === 'valid') {
      toast({
        title: "Domaine en cours de connexion",
        description: "Votre domaine sera activé dans quelques minutes"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Domaine Personnalisé
        </CardTitle>
        <CardDescription>
          Configurez votre sous-domaine ou connectez votre domaine personnalisé
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sous-domaine */}
        <div>
          <Label htmlFor="subdomain">Sous-domaine gratuit</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="subdomain"
              value={formData.subdomain}
              onChange={(e) => onInputChange('subdomain', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="votre-nom"
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground whitespace-nowrap">.gstartup.pro</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Votre boutique sera accessible via: <span className="font-mono text-primary">
              {formData.subdomain || 'votre-nom'}.gstartup.pro
            </span>
          </p>
        </div>
        
        {/* Domaine personnalisé */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="custom_domain">Votre domaine personnalisé</Label>
            <div className="flex gap-2">
              <Input
                id="custom_domain"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="votre-domaine.com"
                className="flex-1"
              />
              <Button 
                onClick={checkDomain} 
                disabled={!customDomain || domainStatus === 'checking'}
                variant="outline"
              >
                {domainStatus === 'checking' ? 'Vérification...' : 'Vérifier'}
              </Button>
            </div>
            
            {domainStatus === 'valid' && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 text-green-700 rounded">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Domaine valide et disponible</span>
              </div>
            )}
            
            {domainStatus === 'invalid' && (
              <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 text-red-700 rounded">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Domaine invalide ou indisponible</span>
              </div>
            )}
          </div>

          {domainStatus === 'valid' && (
            <Button onClick={connectDomain} className="w-full">
              Connecter ce domaine
            </Button>
          )}
        </div>

        {/* Instructions Hostinger */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Globe className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Domaine Hostinger</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                Vous avez un domaine chez Hostinger ? Voici comment le connecter
              </p>
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  1. Connectez-vous à votre panel Hostinger
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  2. Allez dans "Domaines" → "Gérer" → "Zone DNS"
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  3. Ajoutez cet enregistrement CNAME:
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration DNS */}
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-amber-900 dark:text-amber-100">Configuration DNS</h4>
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                Ajoutez cet enregistrement dans votre gestionnaire DNS:
              </p>
              <div className="space-y-2">
                <div className="p-3 bg-white dark:bg-gray-900 rounded border font-mono text-sm">
                  <div className="flex justify-between items-center">
                    <div>
                      <strong>Type:</strong> CNAME<br/>
                      <strong>Nom:</strong> www<br/>
                      <strong>Valeur:</strong> shop.gstartup.pro
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard('CNAME www shop.gstartup.pro')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  La propagation DNS peut prendre jusqu'à 24 heures
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status badge */}
        {customDomain && domainStatus === 'valid' && (
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium">Statut du domaine:</span>
            <Badge variant="outline" className="text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Prêt à connecter
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}