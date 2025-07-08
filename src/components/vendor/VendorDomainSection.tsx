import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, CheckCircle, Copy, RefreshCw, Link, Share2, ExternalLink, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VendorDomainSectionProps {
  formData: {
    subdomain: string;
    business_name: string;
  };
  vendor?: any;
  onInputChange: (field: string, value: string) => void;
}

export function VendorDomainSection({ formData, vendor, onInputChange }: VendorDomainSectionProps) {
  const { toast } = useToast();
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Fonction pour générer un slug à partir du nom commercial
  const generateSlug = (businessName: string) => {
    return businessName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Supprimer caractères spéciaux
      .replace(/\s+/g, '-') // Remplacer espaces par tirets
      .replace(/-+/g, '-') // Supprimer tirets multiples
      .trim()
      .substring(0, 20); // Limiter à 20 caractères
  };

  // Fonction pour vérifier l'unicité du sous-domaine
  const checkSubdomainUniqueness = async (subdomain: string) => {
    const { data, error } = await supabase
      .from('vendors')
      .select('id')
      .eq('subdomain', subdomain)
      .neq('id', vendor?.id || '');
    
    return !error && data.length === 0;
  };

  // Générer automatiquement l'URL
  const generateUniqueUrl = async () => {
    if (!formData.business_name) return;
    
    setIsGenerating(true);
    
    try {
      let baseSlug = generateSlug(formData.business_name);
      
      // Si le slug est vide ou trop court, utiliser un préfixe
      if (!baseSlug || baseSlug.length < 3) {
        baseSlug = 'boutique';
      }
      
      let finalSlug = baseSlug;
      let counter = 1;
      
      // Vérifier l'unicité et ajouter un numéro si nécessaire
      while (!(await checkSubdomainUniqueness(finalSlug))) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
        
        // Éviter les boucles infinies
        if (counter > 100) {
          finalSlug = `shop-${Date.now().toString().slice(-6)}`;
          break;
        }
      }
      
      setGeneratedUrl(finalSlug);
      onInputChange('subdomain', finalSlug);
      
      toast({
        title: "URL générée !",
        description: `Votre boutique est maintenant accessible via une URL personnalisée`
      });
      
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer l'URL automatiquement",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Générer automatiquement l'URL quand le nom commercial change
  useEffect(() => {
    if (formData.business_name && !formData.subdomain) {
      generateUniqueUrl();
    }
  }, [formData.business_name]);

  // Mettre à jour l'URL générée quand le sous-domaine change
  useEffect(() => {
    if (formData.subdomain) {
      setGeneratedUrl(formData.subdomain);
    }
  }, [formData.subdomain]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié !",
      description: "L'URL de votre boutique a été copiée"
    });
  };

  const shareUrl = () => {
    const fullUrl = `https://${generatedUrl}.gstartup.pro`;
    if (navigator.share) {
      navigator.share({
        title: `Boutique ${formData.business_name}`,
        url: fullUrl,
        text: `Découvrez ma boutique ${formData.business_name}`
      });
    } else {
      copyToClipboard(fullUrl);
    }
  };

  const previewStore = () => {
    if (generatedUrl) {
      // Utiliser l'URL courte générée
      const shortUrl = `https://${generatedUrl}.gstartup.pro`;
      window.open(shortUrl, '_blank');
    } else if (vendor?.id) {
      // Fallback vers l'URL longue si pas d'URL courte
      const previewUrl = `${window.location.origin}/store/${vendor.id}`;
      window.open(previewUrl, '_blank');
    }
  };

  const fullUrl = generatedUrl ? `https://${generatedUrl}.gstartup.pro` : '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          URL de Partage
        </CardTitle>
        <CardDescription>
          Nous créons automatiquement une adresse web unique pour votre boutique
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* URL générée automatiquement */}
        <div className="space-y-4">
          <div className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/20">
            
            {generatedUrl ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                    <Globe className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Votre Boutique en Ligne</h3>
                    <p className="text-sm text-muted-foreground">Adresse web générée automatiquement</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-4 bg-background rounded-lg border shadow-sm">
                  <Badge variant="secondary" className="shrink-0">🔒 HTTPS</Badge>
                  <code className="text-lg font-mono text-primary flex-1 truncate">
                    {generatedUrl}.gstartup.pro
                  </code>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(fullUrl)}
                      className="shrink-0"
                      title="Copier l'URL"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={shareUrl}
                      className="shrink-0"
                      title="Partager"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Prêt à partager</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={generateUniqueUrl}
                    disabled={isGenerating}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    {isGenerating ? 'Génération...' : 'Nouvelle URL'}
                  </Button>
                </div>

                {/* Actions principales */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    onClick={previewStore}
                    disabled={!vendor?.id}
                    className="flex-1 gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Voir ma boutique
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={shareUrl}
                    className="gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Partager
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">URL en cours de génération</h3>
                <p className="text-muted-foreground mb-4">
                  Ajoutez un nom commercial pour créer votre adresse web
                </p>
                <Button 
                  onClick={generateUniqueUrl}
                  disabled={!formData.business_name || isGenerating}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'Génération...' : 'Créer mon URL'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Informations techniques (repliées) */}
        {generatedUrl && (
          <details className="group">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 py-2">
              <span>Configuration technique (optionnel)</span>
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Globe className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Domaine personnalisé</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                    Pour utiliser votre propre domaine, ajoutez cet enregistrement DNS :
                  </p>
                  <div className="p-3 bg-white dark:bg-gray-900 rounded border font-mono text-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <strong>Type:</strong> CNAME<br/>
                        <strong>Nom:</strong> *<br/>
                        <strong>Valeur:</strong> 1fede4c8-7360-4c03-b899-417a8204f812.lovableproject.com
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard('CNAME * 1fede4c8-7360-4c03-b899-417a8204f812.lovableproject.com')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}