import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Globe, 
  ExternalLink, 
  Loader2, 
  RefreshCw, 
  Image as ImageIcon,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface SiteData {
  url: string;
  title: string;
  description: string;
  image?: string;
  content: string;
  keywords: string[];
  scrapedAt: string;
  success: boolean;
  error?: string;
}

export default function Portfolio() {
  const [siteData, setSiteData] = useState<SiteData[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const websites = [
    { url: 'https://gfinances.pro', name: 'G-Finances' },
    { url: 'https://gsmoney.pro', name: 'G-Money' },
    { url: 'https://iziwap.com', name: 'IziWap' },
    { url: 'https://gboost.click', name: 'G-Boost' },
    { url: 'https://gphoto.pro', name: 'G-Photo' },
    { url: 'https://gtransfert.pro', name: 'G-Transfert' },
    { url: 'https://money.gstartup.pro', name: 'Money G-Startup' },
    { url: 'https://masteryafrica.pro', name: 'Mastery Africa' },
    { url: 'https://easyropvisa.com', name: 'Easy ROP Visa' }
  ];

  const scrapeSite = async (url: string): Promise<SiteData> => {
    try {
      const { data, error } = await supabase.functions.invoke('scrape-website', {
        body: { url }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Échec du scraping');
      }

      return data.data;
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
      return {
        url,
        title: 'Erreur de chargement',
        description: 'Impossible de récupérer les données',
        content: '',
        keywords: [],
        scrapedAt: new Date().toISOString(),
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  };

  const scrapeAllSites = async () => {
    setLoading(true);
    setProgress(0);
    setSiteData([]);

    try {
      const results: SiteData[] = [];
      
      for (let i = 0; i < websites.length; i++) {
        const website = websites[i];
        console.log(`Scraping ${website.name}...`);
        
        const result = await scrapeSite(website.url);
        results.push(result);
        
        setProgress(((i + 1) / websites.length) * 100);
        setSiteData([...results]);
        
        // Petite pause entre les requêtes
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const successCount = results.filter(r => r.success).length;
      toast({
        title: "Scraping terminé",
        description: `${successCount}/${websites.length} sites récupérés avec succès`,
      });

    } catch (error) {
      console.error('Error during scraping:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du scraping des sites",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <Globe className="h-3 w-3 mr-1" />
            Portfolio Digital
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Nos Réalisations
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Découvrez notre écosystème de solutions digitales innovantes 
            développées pour répondre aux besoins du marché africain.
          </p>
          <Button 
            onClick={scrapeAllSites} 
            disabled={loading} 
            size="lg"
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Récupération en cours...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Actualiser les données
              </>
            )}
          </Button>
        </div>

        {/* Progress Bar */}
        {loading && (
          <div className="mb-8">
            <Progress value={progress} className="w-full" />
            <p className="text-center text-sm text-muted-foreground mt-2">
              {Math.round(progress)}% - Récupération des données...
            </p>
          </div>
        )}

        {/* Sites Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {websites.map((website, index) => {
            const siteInfo = siteData.find(s => s.url === website.url);
            const isLoaded = !!siteInfo;
            const isSuccess = siteInfo?.success;

            return (
              <Card key={website.url} className={`transition-all duration-300 hover:shadow-lg ${
                isLoaded ? (isSuccess ? 'border-green-200' : 'border-red-200') : ''
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {isLoaded && (
                          isSuccess ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )
                        )}
                        {siteInfo?.title || website.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Globe className="h-3 w-3" />
                        {extractDomain(website.url)}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={website.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  {!isLoaded && loading && index <= Math.floor((progress / 100) * websites.length) && (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}

                  {isLoaded && isSuccess && siteInfo && (
                    <div className="space-y-4">
                      {siteInfo.image && (
                        <div className="w-full h-32 bg-muted rounded-lg overflow-hidden">
                          <img 
                            src={siteInfo.image} 
                            alt={siteInfo.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {truncateText(siteInfo.description, 120)}
                        </p>
                        
                        {siteInfo.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {siteInfo.keywords.slice(0, 3).map((keyword, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Mis à jour: {new Date(siteInfo.scrapedAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  )}

                  {isLoaded && !isSuccess && siteInfo && (
                    <div className="text-center py-8">
                      <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <p className="text-sm text-red-600 mb-1">Erreur de chargement</p>
                      <p className="text-xs text-muted-foreground">
                        {siteInfo.error}
                      </p>
                    </div>
                  )}

                  {!isLoaded && !loading && (
                    <div className="text-center py-8">
                      <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Cliquez sur "Actualiser" pour charger
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Summary */}
        {siteData.length > 0 && (
          <div className="mt-16 text-center">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Résumé du Portfolio</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {siteData.filter(s => s.success).length}
                    </p>
                    <p className="text-muted-foreground">Sites actifs</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {websites.length}
                    </p>
                    <p className="text-muted-foreground">Total projets</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}