import { useState, useCallback } from 'react';

// Simple phonetic conversion (basic approximation)
const generatePhonetic = (text: string, lang: string): string => {
  // This is a simplified phonetic representation
  // In production, you'd use a proper phonetics library
  const phoneticMap: Record<string, Record<string, string>> = {
    es: {
      'hola': 'OH-lah',
      'gracias': 'GRAH-syahs',
      'buenos días': 'BWEH-nohs DEE-ahs',
      'por favor': 'pohr fah-VOHR',
      'cómo estás': 'KOH-moh ehs-TAHS',
    },
    fr: {
      'bonjour': 'bohn-ZHOOR',
      'merci': 'mehr-SEE',
      'au revoir': 'oh ruh-VWAHR',
      "s'il vous plaît": 'seel voo PLEH',
    },
    de: {
      'hallo': 'HAH-loh',
      'danke': 'DAHN-kuh',
      'guten tag': 'GOO-ten TAHK',
      'bitte': 'BIT-tuh',
    },
    ja: {
      'こんにちは': 'kon-ni-chi-wa',
      'ありがとう': 'a-ri-ga-tou',
      'さようなら': 'sa-yo-u-na-ra',
    },
    zh: {
      '你好': 'nǐ hǎo',
      '谢谢': 'xiè xie',
      '再见': 'zài jiàn',
    },
  };

  const langMap = phoneticMap[lang];
  if (langMap) {
    const lowerText = text.toLowerCase();
    for (const [phrase, phonetic] of Object.entries(langMap)) {
      if (lowerText.includes(phrase)) {
        return phonetic;
      }
    }
  }

  // Generic phonetic approximation for unknown phrases
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.toUpperCase())
    .join(' ');
};

interface TranslationResult {
  translatedText: string;
  phonetic: string;
}

export const useTranslation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translate = useCallback(
    async (text: string, sourceLang: string, targetLang: string): Promise<TranslationResult | null> => {
      if (!text.trim()) return null;

      setIsLoading(true);
      setError(null);

      try {
        // Using MyMemory Translation API (free tier)
        const langPair = `${sourceLang}|${targetLang}`;
        const response = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`
        );

        if (!response.ok) {
          throw new Error('Translation failed');
        }

        const data = await response.json();
        
        if (data.responseStatus !== 200) {
          throw new Error(data.responseDetails || 'Translation failed');
        }

        const translatedText = data.responseData.translatedText;
        const phonetic = generatePhonetic(translatedText, targetLang);

        return {
          translatedText,
          phonetic,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Translation failed';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    translate,
    isLoading,
    error,
  };
};
