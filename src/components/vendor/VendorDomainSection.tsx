import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink, Globe, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VendorDomainSectionProps {
  formData: {
    subdomain: string;
    business_name: string;
    custom_domain?: string;
  };
  vendor?: any;
  onInputChange: (field: string, value: string) => void;
}

export function VendorDomainSection({ formData, vendor, onInputChange }: VendorDomainSectionProps) {
  // Génération automatique de l'URL de preview
  const getPreviewUrl = () => {
    if (formData.subdomain) {
      return `https://${formData.subdomain}.gstartup.pro`;
    } else if (vendor?.id) {
      return `${window.location.origin}/store/${vendor.id}`;
    }
    return null;
  };

  const previewUrl = getPreviewUrl();
  
  // Version courte pour l'affichage
  const getShortUrl = () => {
    if (formData.subdomain) {
      return `${formData.subdomain}.gstartup.pro`;
    } else if (vendor?.id) {
      return `boutique/${vendor.id}`;
    }
    return null;
  };

  const shortDisplayUrl = getShortUrl();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Ma Boutique
        </CardTitle>
        <CardDescription>
          {previewUrl ? (
            <a 
              href={previewUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              {shortDisplayUrl}
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            'Votre lien de boutique sera généré automatiquement'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {previewUrl && (
          <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/20">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">Votre boutique est accessible via :</p>
              <a 
                href={previewUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-lg font-mono text-primary hover:underline"
              >
                {shortDisplayUrl}
              </a>
            </div>
          </div>
        )}

        {formData.subdomain && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Note importante :</strong> La propagation DNS peut prendre jusqu'à 48 heures avant que votre sous-domaine soit accessible partout dans le monde.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="custom_domain" className="text-sm font-medium">
              Domaine personnalisé (optionnel)
            </Label>
            <Input
              id="custom_domain"
              type="text"
              placeholder="votre-domaine.com"
              value={formData.custom_domain || ''}
              onChange={(e) => onInputChange('custom_domain', e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Connectez votre propre domaine pour une marque personnalisée
            </p>
          </div>

          {formData.custom_domain && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="space-y-3">
                <p><strong>Configuration DNS sur Hostinger :</strong></p>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Étapes à suivre :</p>
                  <ol className="text-xs space-y-1 list-decimal list-inside ml-2">
                    <li>Connectez-vous à votre compte Hostinger</li>
                    <li>Allez dans <strong>Domaines</strong> → Sélectionnez votre domaine</li>
                    <li>Cliquez sur <strong>Gérer</strong> puis <strong>Zone DNS</strong></li>
                    <li>Ajoutez/modifiez ces enregistrements :</li>
                  </ol>
                </div>

                <div className="bg-muted/50 p-3 rounded text-xs font-mono space-y-1">
                  <div><strong>Type:</strong> CNAME | <strong>Nom:</strong> @ | <strong>Pointe vers:</strong> 1fede4c8-7360-4c03-b899-417a8204f812.lovableproject.com</div>
                  <div><strong>Type:</strong> CNAME | <strong>Nom:</strong> www | <strong>Pointe vers:</strong> 1fede4c8-7360-4c03-b899-417a8204f812.lovableproject.com</div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs"><strong>Notes importantes :</strong></p>
                  <ul className="text-xs space-y-1 list-disc list-inside ml-2 text-muted-foreground">
                    <li>Supprimez tous les anciens enregistrements A ou AAAA pour @ et www</li>
                    <li>La propagation DNS prend généralement 2-24h sur Hostinger</li>
                    <li>Vous pouvez vérifier avec <code className="bg-muted px-1 rounded">nslookup {formData.custom_domain}</code></li>
                    <li>Contactez le support Hostinger si vous rencontrez des difficultés</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        {!formData.subdomain && (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Votre URL de boutique sera générée automatiquement</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}