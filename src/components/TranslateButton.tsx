import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Languages, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface TranslateButtonProps {
  text: string;
  sourceLanguage?: string;
  onTranslated?: (translatedText: string) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
}

export function TranslateButton({
  text,
  sourceLanguage = 'auto',
  onTranslated,
  className,
  variant = 'ghost',
  size = 'sm',
  showText = true
}: TranslateButtonProps) {
  const { translateText, isTranslating } = useTranslation();
  const { language, t } = useLanguage();
  const [isTranslated, setIsTranslated] = useState(false);

  const handleTranslate = async () => {
    if (!text.trim() || isTranslating) return;

    try {
      const translatedText = await translateText(text, sourceLanguage);
      
      if (translatedText !== text) {
        setIsTranslated(true);
        onTranslated?.(translatedText);
      }
    } catch (error) {
      console.error('Translation failed:', error);
    }
  };

  // Don't show translate button if text is already in the current language
  const isSourceSameAsTarget = sourceLanguage === language || 
    (sourceLanguage === 'auto' && language === 'fr') ||
    (sourceLanguage === 'auto' && language === 'en' && text.match(/^[a-zA-Z0-9\s.,!?'-]+$/));

  if (isSourceSameAsTarget && !isTranslated) {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleTranslate}
      disabled={isTranslating || !text.trim()}
      className={cn(
        "gap-1.5 transition-colors",
        isTranslated && "text-green-600 hover:text-green-700",
        className
      )}
    >
      {isTranslating ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Languages className={cn(
          "h-3 w-3",
          isTranslated && "text-green-600"
        )} />
      )}
      {showText && (
        <span className="text-xs">
          {isTranslating 
            ? 'Traduction...' 
            : isTranslated 
              ? 'Traduit'
              : language === 'fr' ? 'Traduire' : 'Translate'
          }
        </span>
      )}
    </Button>
  );
}