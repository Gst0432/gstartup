import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from './useLanguage';

interface TranslationResult {
  translatedText: string;
  originalText: string;
  sourceLanguage: string;
  targetLanguage: string;
  cached?: boolean;
}

interface UseTranslationReturn {
  translateText: (text: string, sourceLanguage?: string) => Promise<string>;
  isTranslating: boolean;
  error: string | null;
  lastTranslation: TranslationResult | null;
}

export const useTranslation = (): UseTranslationReturn => {
  const { language } = useLanguage();
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTranslation, setLastTranslation] = useState<TranslationResult | null>(null);

  // Cache translations in localStorage
  const getCacheKey = (text: string, from: string, to: string): string => {
    return `translation_${from}_${to}_${btoa(text.substring(0, 100))}`;
  };

  const getCachedTranslation = (text: string, from: string, to: string): string | null => {
    try {
      const cacheKey = getCacheKey(text, from, to);
      return localStorage.getItem(cacheKey);
    } catch {
      return null;
    }
  };

  const setCachedTranslation = (text: string, from: string, to: string, translation: string): void => {
    try {
      const cacheKey = getCacheKey(text, from, to);
      localStorage.setItem(cacheKey, translation);
    } catch {
      // Ignore cache errors
    }
  };

  const translateText = useCallback(async (
    text: string, 
    sourceLanguage: string = 'auto'
  ): Promise<string> => {
    if (!text.trim()) {
      return text;
    }

    // Auto-detect source language if not provided
    if (sourceLanguage === 'auto') {
      sourceLanguage = language === 'fr' ? 'en' : 'fr';
    }

    const targetLanguage = language;

    // If source and target are the same, return original
    if (sourceLanguage === targetLanguage) {
      return text;
    }

    // Check cache first
    const cached = getCachedTranslation(text, sourceLanguage, targetLanguage);
    if (cached) {
      return cached;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('translate-text', {
        body: {
          text,
          from: sourceLanguage,
          to: targetLanguage
        }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Translation failed');
      }

      if (!data || data.error) {
        throw new Error(data?.error || 'Translation service error');
      }

      const result: TranslationResult = data;
      setLastTranslation(result);

      // Cache the translation
      setCachedTranslation(text, sourceLanguage, targetLanguage, result.translatedText);

      return result.translatedText;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Translation failed';
      setError(errorMessage);
      console.error('Translation error:', err);
      
      // Return original text on error
      return text;
    } finally {
      setIsTranslating(false);
    }
  }, [language]);

  return {
    translateText,
    isTranslating,
    error,
    lastTranslation
  };
};