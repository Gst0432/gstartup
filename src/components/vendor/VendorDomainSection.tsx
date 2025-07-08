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
  const previewStore = () => {
    if (formData.subdomain) {
      // Utiliser l'URL courte basée sur le subdomain
      const shortUrl = `https://${formData.subdomain}.gstartup.pro`;
      window.open(shortUrl, '_blank');
    } else if (vendor?.id) {
      // Fallback vers l'URL longue si pas de subdomain
      const previewUrl = `${window.location.origin}/store/${vendor.id}`;
      window.open(previewUrl, '_blank');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Ma Boutique
        </CardTitle>
        <CardDescription>
          Accédez à votre boutique en ligne
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {formData.subdomain && (
          <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">URL de votre boutique</p>
                <code className="text-lg font-mono text-primary">
                  {formData.subdomain}.gstartup.pro
                </code>
              </div>
              <Button 
                onClick={previewStore}
                disabled={!vendor?.id}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Voir ma boutique
              </Button>
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