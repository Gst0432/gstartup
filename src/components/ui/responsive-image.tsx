import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  aspectRatio?: 'square' | 'landscape' | 'portrait' | 'banner' | 'hero';
  quality?: 'low' | 'medium' | 'high';
  onLoad?: () => void;
  onError?: () => void;
}

export const ResponsiveImage = ({
  src,
  alt,
  className,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  loading = 'lazy',
  aspectRatio = 'landscape',
  quality = 'medium',
  onLoad,
  onError,
}: ResponsiveImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const aspectRatioClasses = {
    square: 'aspect-square',
    landscape: 'aspect-[16/9]',
    portrait: 'aspect-[3/4]',
    banner: 'aspect-[3/1]',
    hero: 'aspect-[21/9]'
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  // Générer des URLs optimisées pour différentes tailles
  const generateSrcSet = (baseUrl: string) => {
    const widths = [320, 640, 768, 1024, 1280, 1920];
    return widths.map(width => `${baseUrl}?w=${width}&q=${quality === 'high' ? 90 : quality === 'medium' ? 75 : 60} ${width}w`).join(', ');
  };

  if (hasError) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-muted text-muted-foreground',
        aspectRatioClasses[aspectRatio],
        className
      )}>
        <div className="text-center">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xs">Image non disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', aspectRatioClasses[aspectRatio], className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={src}
        srcSet={generateSrcSet(src)}
        sizes={sizes}
        alt={alt}
        loading={priority ? 'eager' : loading}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

// Guide des tailles recommandées
export const ImageSizeGuide = {
  // Images publicitaires
  advertisement: {
    banner: { width: 1200, height: 400, aspectRatio: 'banner' as const, description: 'Bannière publicitaire principale' },
    hero: { width: 1920, height: 800, aspectRatio: 'hero' as const, description: 'Image héro grande taille' },
    card: { width: 600, height: 400, aspectRatio: 'landscape' as const, description: 'Carte publicitaire' }
  },
  // Images de produits
  product: {
    thumbnail: { width: 300, height: 300, aspectRatio: 'square' as const, description: 'Miniature de produit' },
    gallery: { width: 800, height: 600, aspectRatio: 'landscape' as const, description: 'Galerie de produit' },
    detail: { width: 1200, height: 900, aspectRatio: 'landscape' as const, description: 'Image détaillée' }
  },
  // Images de vendeurs
  vendor: {
    logo: { width: 200, height: 200, aspectRatio: 'square' as const, description: 'Logo du vendeur' },
    cover: { width: 1200, height: 400, aspectRatio: 'banner' as const, description: 'Image de couverture' },
    profile: { width: 400, height: 400, aspectRatio: 'square' as const, description: 'Photo de profil' }
  }
} as const;