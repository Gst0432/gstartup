import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranslateRequest {
  text: string;
  from: string; // Source language code (fr, en, etc.)
  to: string;   // Target language code
}

interface TranslationResponse {
  translatedText: string;
  originalText: string;
  sourceLanguage: string;
  targetLanguage: string;
  cached?: boolean;
}

// Simple in-memory cache for translations (resets on function restart)
const translationCache = new Map<string, string>();

function getCacheKey(text: string, from: string, to: string): string {
  return `${from}-${to}-${text.substring(0, 100)}`;
}

async function translateWithMyMemory(text: string, from: string, to: string): Promise<string> {
  try {
    // Check cache first
    const cacheKey = getCacheKey(text, from, to);
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    // MyMemory API - free translation service
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'G-STARTUP-Translator/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`MyMemory API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData) {
      const translatedText = data.responseData.translatedText;
      
      // Cache the translation
      translationCache.set(cacheKey, translatedText);
      
      return translatedText;
    } else {
      throw new Error('Translation failed: ' + (data.responseDetails || 'Unknown error'));
    }
  } catch (error) {
    console.error('MyMemory translation error:', error);
    throw error;
  }
}

async function translateWithLibreTranslate(text: string, from: string, to: string): Promise<string> {
  try {
    // Check cache first
    const cacheKey = getCacheKey(text, from, to);
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    // LibreTranslate public instance (backup option)
    const response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: from,
        target: to,
        format: 'text'
      })
    });

    if (!response.ok) {
      throw new Error(`LibreTranslate API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.translatedText) {
      // Cache the translation
      translationCache.set(cacheKey, data.translatedText);
      
      return data.translatedText;
    } else {
      throw new Error('Translation failed');
    }
  } catch (error) {
    console.error('LibreTranslate translation error:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestData: TranslateRequest = await req.json();
    const { text, from, to } = requestData;

    // Validate input
    if (!text || !from || !to) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: text, from, to' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If source and target languages are the same, return original text
    if (from === to) {
      return new Response(JSON.stringify({
        translatedText: text,
        originalText: text,
        sourceLanguage: from,
        targetLanguage: to,
        cached: false
      } as TranslationResponse), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Try MyMemory first, then LibreTranslate as fallback
    let translatedText: string;
    let cached = false;
    
    try {
      translatedText = await translateWithMyMemory(text, from, to);
      cached = translationCache.has(getCacheKey(text, from, to));
    } catch (error) {
      console.log('MyMemory failed, trying LibreTranslate...');
      try {
        translatedText = await translateWithLibreTranslate(text, from, to);
        cached = translationCache.has(getCacheKey(text, from, to));
      } catch (fallbackError) {
        console.error('All translation services failed:', fallbackError);
        return new Response(JSON.stringify({ 
          error: 'Translation services unavailable',
          originalText: text
        }), {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const response: TranslationResponse = {
      translatedText,
      originalText: text,
      sourceLanguage: from,
      targetLanguage: to,
      cached
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in translate-text function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});