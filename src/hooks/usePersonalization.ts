import { useState, useEffect, useCallback } from 'react';

interface UserPreferences {
  sourceLanguage: string;
  targetLanguage: string;
  recentLanguages: string[];
  totalTranslations: number;
  sessionCount: number;
  lastVisit: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  sourceLanguage: 'en',
  targetLanguage: 'es',
  recentLanguages: [],
  totalTranslations: 0,
  sessionCount: 0,
  lastVisit: new Date().toISOString(),
};

const STORAGE_KEY = 'voicelingo_preferences';

export const usePersonalization = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Increment session count on new visit
        const lastVisit = new Date(parsed.lastVisit);
        const now = new Date();
        const hoursSinceLastVisit = (now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60);
        
        const updatedPrefs = {
          ...DEFAULT_PREFERENCES,
          ...parsed,
          sessionCount: hoursSinceLastVisit > 1 ? parsed.sessionCount + 1 : parsed.sessionCount,
          lastVisit: now.toISOString(),
        };
        
        setPreferences(updatedPrefs);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPrefs));
      } else {
        // First time user
        const initialPrefs = {
          ...DEFAULT_PREFERENCES,
          sessionCount: 1,
        };
        setPreferences(initialPrefs);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPrefs));
      }
    } catch (e) {
      console.error('Failed to load preferences:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save preferences whenever they change
  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences(prev => {
      const newPrefs = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
      } catch (e) {
        console.error('Failed to save preferences:', e);
      }
      return newPrefs;
    });
  }, []);

  const setSourceLanguage = useCallback((lang: string) => {
    updatePreferences({ sourceLanguage: lang });
  }, [updatePreferences]);

  const setTargetLanguage = useCallback((lang: string) => {
    updatePreferences({
      targetLanguage: lang,
      recentLanguages: [
        lang,
        ...preferences.recentLanguages.filter(l => l !== lang).slice(0, 4),
      ],
    });
  }, [preferences.recentLanguages, updatePreferences]);

  const incrementTranslations = useCallback(() => {
    updatePreferences({ totalTranslations: preferences.totalTranslations + 1 });
  }, [preferences.totalTranslations, updatePreferences]);

  const getWelcomeMessage = useCallback(() => {
    if (preferences.sessionCount <= 1) {
      return "Welcome to VoiceLingo! Start speaking to translate.";
    } else if (preferences.sessionCount <= 5) {
      return `Welcome back! You've translated ${preferences.totalTranslations} phrases so far.`;
    } else {
      return `Great to see you again! Keep up the learning streak!`;
    }
  }, [preferences.sessionCount, preferences.totalTranslations]);

  return {
    preferences,
    isLoaded,
    setSourceLanguage,
    setTargetLanguage,
    incrementTranslations,
    getWelcomeMessage,
  };
};
