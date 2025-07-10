import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChevronLeft, ChevronRight, ExternalLink, Info } from 'lucide-react';
import { ResponsiveImage, ImageSizeGuide } from './ui/responsive-image';
import { supabase } from '@/integrations/supabase/client';

interface AdvertisementImage {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  link_url?: string;
  is_active: boolean;
  sort_order: number;
}

export const AdvertisementSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [advertisements, setAdvertisements] = useState<AdvertisementImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const fetchAdvertisements = async () => {
    try {
      const { data, error } = await supabase
        .from('advertisement_images')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) {
        console.error('Error fetching advertisements:', error);
        return;
      }

      setAdvertisements(data || []);
    } catch (error) {
      console.error('Error fetching advertisements:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextAdvertisement = () => {
    setCurrentIndex((prev) => (prev + 1) % advertisements.length);
  };

  const prevAdvertisement = () => {
    setCurrentIndex((prev) => (prev - 1 + advertisements.length) % advertisements.length);
  };

  useEffect(() => {
    if (advertisements.length > 1) {
      const timer = setInterval(nextAdvertisement, 4000);
      return () => clearInterval(timer);
    }
  }, [advertisements.length]);

  const handleImageClick = (linkUrl?: string) => {
    if (linkUrl && linkUrl !== '#') {
      if (linkUrl.startsWith('#')) {
        // Scroll to section
        const element = document.querySelector(linkUrl);
        element?.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Open external link
        window.open(linkUrl, '_blank');
      }
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (advertisements.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Nos Promotions
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Découvrez nos dernières offres et promotions exclusives
          </p>
          
          {/* Guide des tailles recommandées */}
          <div className="mt-8 mx-auto max-w-2xl">
            <details className="group">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2">
                <Info className="h-4 w-4" />
                Guide des tailles d'images recommandées
              </summary>
              <div className="mt-4 p-4 bg-background rounded-lg border text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <h4 className="font-semibold mb-2">Images Publicitaires</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Bannière: 1200×400px (3:1)</li>
                      <li>• Héro: 1920×800px (21:9)</li>
                      <li>• Carte: 600×400px (16:9)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Images Produits</h4>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Miniature: 300×300px (1:1)</li>
                      <li>• Galerie: 800×600px (4:3)</li>
                      <li>• Détail: 1200×900px (4:3)</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <Badge variant="outline" className="text-xs">
                    💡 Conseil: Utilisez des images de haute qualité pour un meilleur rendu sur tous les écrans
                  </Badge>
                </div>
              </div>
            </details>
          </div>
        </div>

        {/* Advertisement Carousel */}
        <div className="relative max-w-6xl mx-auto">
          <div className="flex overflow-hidden rounded-lg">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {advertisements.map((ad, index) => (
                <div key={ad.id} className="w-full flex-shrink-0 px-2">
                  <Card 
                    className="overflow-hidden shadow-elegant hover:shadow-xl transition-all duration-300 cursor-pointer group"
                    onClick={() => handleImageClick(ad.link_url)}
                  >
                    <div className="relative overflow-hidden">
                      <ResponsiveImage
                        src={ad.image_url}
                        alt={ad.title}
                        aspectRatio="banner"
                        quality="high"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                        className="transition-transform duration-300 group-hover:scale-105 h-64 md:h-80 lg:h-96"
                        priority={index === 0}
                      />
                      
                      {/* Overlay avec titre et description */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                        <CardContent className="text-white p-4 md:p-6 w-full">
                          <h3 className="text-xl md:text-2xl font-bold mb-2">{ad.title}</h3>
                          {ad.description && (
                            <p className="text-sm md:text-lg opacity-90 mb-3 line-clamp-2">{ad.description}</p>
                          )}
                          {ad.link_url && (
                            <div className="flex items-center gap-2 text-xs md:text-sm font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                              <span>Voir plus</span>
                              <ExternalLink className="h-3 w-3 md:h-4 md:w-4" />
                            </div>
                          )}
                        </CardContent>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons - Only show if more than 1 image */}
          {advertisements.length > 1 && (
            <>
              <div className="flex justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevAdvertisement}
                  className="rounded-full hover-scale"
                  aria-label="Image précédente"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextAdvertisement}
                  className="rounded-full hover-scale"
                  aria-label="Image suivante"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-2 mt-6">
                {advertisements.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 hover-scale ${
                      index === currentIndex ? 'bg-primary scale-110' : 'bg-muted hover:bg-muted-foreground/50'
                    }`}
                    aria-label={`Aller à l'image ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};