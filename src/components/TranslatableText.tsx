import { useState, useEffect } from 'react';
import { TranslateButton } from './TranslateButton';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

interface TranslatableTextProps {
  children: React.ReactNode;
  originalText: string;
  sourceLanguage?: string;
  className?: string;
  showTranslateButton?: boolean;
  autoTranslate?: boolean;
}

export function TranslatableText({
  children,
  originalText,
  sourceLanguage = 'auto',
  className,
  showTranslateButton = true,
  autoTranslate = false
}: TranslatableTextProps) {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslated, setIsTranslated] = useState(false);

  // Reset translation when language changes
  useEffect(() => {
    setTranslatedText(null);
    setIsTranslated(false);
  }, [language]);

  const handleTranslated = (translated: string) => {
    setTranslatedText(translated);
    setIsTranslated(true);
  };

  const displayText = isTranslated && translatedText ? translatedText : originalText;

  return (
    <div className={cn("group relative", className)}>
      <div className={cn(
        "transition-opacity duration-200",
        isTranslated && "opacity-90"
      )}>
        {typeof children === 'string' ? (
          <span dangerouslySetInnerHTML={{ __html: displayText }} />
        ) : (
          children
        )}
      </div>
      
      {showTranslateButton && originalText.trim() && (
        <div className="inline-flex items-center ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <TranslateButton
            text={originalText}
            sourceLanguage={sourceLanguage}
            onTranslated={handleTranslated}
            variant="ghost"
            size="sm"
            showText={false}
          />
        </div>
      )}
      
      {isTranslated && (
        <div className="text-xs text-muted-foreground mt-1 opacity-70">
          Traduit automatiquement
        </div>
      )}
    </div>
  );
}