import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Globe, Shield, CheckCircle, AlertCircle, Copy, RefreshCw, Link, Share2 } from 'lucide-react';
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
        description: `Votre boutique sera accessible via ${finalSlug}.gstartup.pro`
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
      description: "L'URL a été copiée dans le presse-papiers"
    });
  };

  const shareUrl = () => {
    const fullUrl = `https://${generatedUrl}.gstartup.pro`;
    if (navigator.share) {
      navigator.share({
        title: `Boutique ${formData.business_name}`,
        url: fullUrl
      });
    } else {
      copyToClipboard(fullUrl);
    }
  };

  const fullUrl = generatedUrl ? `https://${generatedUrl}.gstartup.pro` : '';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          URL de votre Boutique
        </CardTitle>
        <CardDescription>
          Nous générons automatiquement une adresse courte et mémorable pour votre boutique
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* URL générée automatiquement */}
        <div className="space-y-4">
          <div className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Globe className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Votre URL Boutique</h3>
                <p className="text-sm text-muted-foreground">Adresse générée automatiquement</p>
              </div>
            </div>
            
            {generatedUrl ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
                  <Badge variant="secondary" className="shrink-0">HTTPS</Badge>
                  <code className="text-lg font-mono text-primary flex-1 truncate">
                    {generatedUrl}.gstartup.pro
                  </code>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyToClipboard(fullUrl)}
                      className="shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={shareUrl}
                      className="shrink-0"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">URL prête à utiliser</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={generateUniqueUrl}
                    disabled={isGenerating}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    {isGenerating ? 'Génération...' : 'Régénérer'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Globe className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-3">
                  Ajoutez un nom commercial pour générer votre URL
                </p>
                <Button 
                  onClick={generateUniqueUrl}
                  disabled={!formData.business_name || isGenerating}
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Génération...' : 'Générer mon URL'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* URL personnalisée (optionnelle) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="custom_subdomain">URL personnalisée (optionnel)</Label>
            <Badge variant="outline" className="text-xs">Avancé</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              id="custom_subdomain"
              value={formData.subdomain}
              onChange={(e) => onInputChange('subdomain', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="mon-nom-personnalise"
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground whitespace-nowrap">.gstartup.pro</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Vous pouvez personnaliser votre URL si vous le souhaitez
          </p>
        </div>

        {/* Configuration DNS */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 dark:text-blue-100">Configuration DNS</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                Pour activer votre sous-domaine, ajoutez cet enregistrement DNS :
              </p>
              <div className="space-y-2">
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
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Configuration à faire une seule fois chez votre hébergeur DNS
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Aperçu de la boutique */}
        {generatedUrl && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900 dark:text-green-100">
                URL de boutique active
              </span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mb-3">
              Votre boutique sera accessible directement via cette adresse une fois la configuration DNS terminée.
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(fullUrl, '_blank')}
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              Prévisualiser la boutique
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}