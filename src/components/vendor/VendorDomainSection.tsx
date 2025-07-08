import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink, Globe, Copy, Share, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface VendorDomainSectionProps {
  formData: {
    business_name: string;
    store_slug?: string;
  };
  vendor?: any;
  onInputChange: (field: string, value: string) => void;
}

export function VendorDomainSection({ formData, vendor, onInputChange }: VendorDomainSectionProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Génération de l'URL de la boutique
  const getStoreUrl = () => {
    const baseUrl = window.location.origin;
    
    if (formData.store_slug) {
      return `${baseUrl}/boutique/${formData.store_slug}`;
    } else if (vendor?.id) {
      return `${baseUrl}/store/${vendor.id}`;
    }
    return null;
  };

  const storeUrl = getStoreUrl();

  // Génération du slug automatique basé sur le nom de l'entreprise
  const generateSlugFromBusinessName = () => {
    if (!formData.business_name) return '';
    
    return formData.business_name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Supprimer les caractères spéciaux
      .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
      .replace(/-+/g, '-') // Supprimer les tirets multiples
      .replace(/^-|-$/g, ''); // Supprimer les tirets en début/fin
  };

  const handleGenerateSlug = () => {
    const newSlug = generateSlugFromBusinessName();
    if (newSlug) {
      onInputChange('store_slug', newSlug);
      toast({
        title: "Slug généré",
        description: `Nouveau slug: ${newSlug}`,
      });
    }
  };

  const handleCopyUrl = async () => {
    if (storeUrl) {
      try {
        await navigator.clipboard.writeText(storeUrl);
        setCopied(true);
        toast({
          title: "Copié !",
          description: "L'URL a été copiée dans le presse-papiers",
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast({
          title: "Erreur",
          description: "Impossible de copier l'URL",
          variant: "destructive"
        });
      }
    }
  };

  const handleShare = async () => {
    if (storeUrl && navigator.share) {
      try {
        await navigator.share({
          title: `Boutique ${formData.business_name}`,
          text: `Découvrez ma boutique en ligne : ${formData.business_name}`,
          url: storeUrl,
        });
      } catch (err) {
        // Fallback si le partage n'est pas supporté
        handleCopyUrl();
      }
    } else {
      handleCopyUrl();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          URL de votre Boutique
        </CardTitle>
        <CardDescription>
          Créez une URL personnalisée que vous pouvez partager avec vos clients
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* URL de la boutique générée */}
        {storeUrl && (
          <div className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/20">
            <div className="space-y-3">
              <p className="text-sm font-medium text-center">Votre boutique est accessible via :</p>
              
              <div className="flex items-center gap-2 p-3 bg-background rounded border">
                <a 
                  href={storeUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 text-sm font-mono text-primary hover:underline break-all"
                >
                  {storeUrl}
                </a>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyUrl}
                  className="shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleShare}
                  className="flex-1 gap-2"
                >
                  <Share className="h-4 w-4" />
                  Partager
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(storeUrl, '_blank')}
                  className="flex-1 gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visiter
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Personnalisation du slug */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="store_slug" className="text-sm font-medium">
              Nom personnalisé de votre boutique (optionnel)
            </Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="store_slug"
                type="text"
                placeholder="mon-entreprise"
                value={formData.store_slug || ''}
                onChange={(e) => onInputChange('store_slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="flex-1"
              />
              <Button 
                type="button"
                variant="outline" 
                onClick={handleGenerateSlug}
                disabled={!formData.business_name}
              >
                Générer
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formData.store_slug 
                ? `Votre boutique sera accessible via: ${window.location.origin}/boutique/${formData.store_slug}`
                : 'Personnalisez l\'URL de votre boutique (uniquement lettres, chiffres et tirets)'
              }
            </p>
          </div>
        </div>

        {/* Information sur le système */}
        <Alert>
          <Globe className="h-4 w-4" />
          <AlertDescription>
            <strong>Avantages du nouveau système :</strong>
            <ul className="text-xs space-y-1 list-disc list-inside ml-2 mt-2">
              <li>✅ Aucune configuration DNS requise</li>
              <li>✅ SSL automatique et sécurisé</li>
              <li>✅ Fonctionnel immédiatement</li>
              <li>✅ URL facile à partager</li>
              <li>✅ Compatible avec tous les appareils</li>
            </ul>
          </AlertDescription>
        </Alert>

        {!storeUrl && (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Votre URL de boutique sera générée automatiquement une fois votre profil sauvegardé</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}