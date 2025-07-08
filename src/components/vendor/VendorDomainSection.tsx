import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Globe } from 'lucide-react';

interface VendorDomainSectionProps {
  formData: {
    subdomain: string;
    business_name: string;
  };
  vendor?: any;
  onInputChange: (field: string, value: string) => void;
}

export function VendorDomainSection({ formData, vendor }: VendorDomainSectionProps) {
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
              {previewUrl}
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            'Votre lien de boutique sera généré automatiquement'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {previewUrl && (
          <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/20">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">Votre boutique est accessible via :</p>
              <a 
                href={previewUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-lg font-mono text-primary hover:underline break-all"
              >
                {previewUrl}
              </a>
            </div>
          </div>
        )}
        
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