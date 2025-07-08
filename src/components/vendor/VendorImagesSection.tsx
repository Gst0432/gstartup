import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageUploader } from '@/components/ImageUploader';
import { Eye, ExternalLink, Shield } from 'lucide-react';

interface VendorImagesSectionProps {
  formData: {
    logo_url: string;
    cover_image_url: string;
    business_name: string;
    description: string;
  };
  vendor: {
    id: string;
    is_verified: boolean;
  } | null;
  onInputChange: (field: string, value: string) => void;
}

export function VendorImagesSection({ formData, vendor, onInputChange }: VendorImagesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Images de la Boutique</CardTitle>
        <CardDescription>
          Logo et image de couverture pour personnaliser votre boutique
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <ImageUploader
            label="Logo de la boutique"
            value={formData.logo_url}
            onChange={(url) => onInputChange('logo_url', url)}
            aspectRatio="square"
            description="Recommandé: 200x200px, format carré. Utilisé comme photo de profil."
          />
          
          <ImageUploader
            label="Image de couverture"
            value={formData.cover_image_url}
            onChange={(url) => onInputChange('cover_image_url', url)}
            aspectRatio="cover"
            description="Recommandé: 1200x400px. Image d'en-tête de votre boutique."
          />
        </div>
        
        {/* Aperçu de la boutique */}
        {(formData.logo_url || formData.cover_image_url || formData.business_name) && (
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Aperçu de votre boutique</h4>
              {vendor && (
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <a href={`/store/${vendor.id}`} target="_blank" rel="noopener noreferrer">
                    <Eye className="h-3 w-3" />
                    Voir la boutique
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              )}
            </div>
            
            {/* Mini aperçu */}
            <div className="p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg border">
              <div className="flex items-center gap-4">
                {formData.logo_url ? (
                  <img 
                    src={formData.logo_url} 
                    alt="Logo aperçu"
                    className="w-16 h-16 rounded-full object-cover border-2 border-background shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center border-2 border-background shadow-sm">
                    <span className="text-white font-bold text-lg">
                      {formData.business_name?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold truncate">
                    {formData.business_name || 'Nom de votre boutique'}
                  </h5>
                  <p className="text-sm text-muted-foreground truncate">
                    {formData.description || 'Description de votre boutique...'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {vendor?.is_verified ? 'Vérifié' : 'En attente'}
                    </Badge>
                    {vendor?.is_verified && (
                      <Shield className="h-3 w-3 text-green-500" />
                    )}
                  </div>
                </div>
              </div>
              
              {formData.cover_image_url && (
                <div className="mt-3 h-20 rounded overflow-hidden">
                  <img 
                    src={formData.cover_image_url} 
                    alt="Couverture aperçu"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}