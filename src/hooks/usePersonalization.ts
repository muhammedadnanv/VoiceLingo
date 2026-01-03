import { useState, useEffect, useCallback } from 'react';

interface HistoryItem {
  id: string;
  original: string;
  translated: string;
  phonetic: string;
  sourceLang: string;
  targetLang: string;
  timestamp: string;
}

interface UserPreferences {
  sourceLanguage: string;
  targetLanguage: string;
  recentLanguages: string[];
  totalTranslations: number;
  sessionCount: number;
  lastVisit: string;
  translationHistory: HistoryItem[];
  favoriteLanguages: string[];
  dailyGoal: number;
  todayTranslations: number;
  lastDayReset: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  sourceLanguage: 'en',
  targetLanguage: 'es',
  recentLanguages: [],
  totalTranslations: 0,
  sessionCount: 0,
  lastVisit: new Date().toISOString(),
  translationHistory: [],
  favoriteLanguages: [],
  dailyGoal: 10,
  todayTranslations: 0,
  lastDayReset: new Date().toDateString(),
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
        const lastVisit = new Date(parsed.lastVisit);
        const now = new Date();
        const hoursSinceLastVisit = (now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60);
        
        // Reset daily translations if new day
        const today = new Date().toDateString();
        const isNewDay = parsed.lastDayReset !== today;
        
        const updatedPrefs: UserPreferences = {
          ...DEFAULT_PREFERENCES,
          ...parsed,
          sessionCount: hoursSinceLastVisit > 1 ? (parsed.sessionCount || 0) + 1 : parsed.sessionCount || 0,
          lastVisit: now.toISOString(),
          todayTranslations: isNewDay ? 0 : parsed.todayTranslations || 0,
          lastDayReset: today,
        };
        
        setPreferences(updatedPrefs);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPrefs));
      } else {
        const initialPrefs: UserPreferences = {
          ...DEFAULT_PREFERENCES,
          sessionCount: 1,
          lastDayReset: new Date().toDateString(),
        };
        setPreferences(initialPrefs);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPrefs));
      }
    } catch (e) {
      console.error('Failed to load preferences:', e);
    }
    setIsLoaded(true);
  }, []);

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
    setPreferences(prev => {
      const newPrefs = {
        ...prev,
        targetLanguage: lang,
        recentLanguages: [
          lang,
          ...prev.recentLanguages.filter(l => l !== lang).slice(0, 4),
        ],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
      return newPrefs;
    });
  }, []);

  const incrementTranslations = useCallback(() => {
    setPreferences(prev => {
      const newPrefs = {
        ...prev,
        totalTranslations: prev.totalTranslations + 1,
        todayTranslations: prev.todayTranslations + 1,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
      return newPrefs;
    });
  }, []);

  const addToHistory = useCallback((item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    setPreferences(prev => {
      const historyItem: HistoryItem = {
        ...item,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
      };
      const newHistory = [historyItem, ...prev.translationHistory.slice(0, 49)];
      const newPrefs = { ...prev, translationHistory: newHistory };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
      return newPrefs;
    });
  }, []);

  const clearHistory = useCallback(() => {
    updatePreferences({ translationHistory: [] });
  }, [updatePreferences]);

  const addFavoriteLanguage = useCallback((lang: string) => {
    setPreferences(prev => {
      if (prev.favoriteLanguages.includes(lang)) return prev;
      const newPrefs = {
        ...prev,
        favoriteLanguages: [...prev.favoriteLanguages, lang].slice(0, 5),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
      return newPrefs;
    });
  }, []);

  const getWelcomeMessage = useCallback(() => {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    
    if (preferences.sessionCount <= 1) {
      return `${timeGreeting}! Welcome to VoiceLingo. Start speaking to translate.`;
    } else if (preferences.sessionCount <= 5) {
      return `${timeGreeting}! You've translated ${preferences.totalTranslations} phrases so far.`;
    } else if (preferences.todayTranslations >= preferences.dailyGoal) {
      return `Amazing! You've hit your daily goal of ${preferences.dailyGoal} translations!`;
    } else {
      const remaining = preferences.dailyGoal - preferences.todayTranslations;
      return `${timeGreeting}! ${remaining} more translations to reach today's goal.`;
    }
  }, [preferences.sessionCount, preferences.totalTranslations, preferences.todayTranslations, preferences.dailyGoal]);

  const getProgressPercentage = useCallback(() => {
    return Math.min((preferences.todayTranslations / preferences.dailyGoal) * 100, 100);
  }, [preferences.todayTranslations, preferences.dailyGoal]);

  const getMilestoneMessage = useCallback(() => {
    const milestones = [10, 25, 50, 100, 250, 500, 1000];
    const nextMilestone = milestones.find(m => m > preferences.totalTranslations);
    if (nextMilestone) {
      const remaining = nextMilestone - preferences.totalTranslations;
      return `${remaining} more to reach ${nextMilestone} translations!`;
    }
    return "You're a VoiceLingo master!";
  }, [preferences.totalTranslations]);

  return {
    preferences,
    isLoaded,
    setSourceLanguage,
    setTargetLanguage,
    incrementTranslations,
    addToHistory,
    clearHistory,
    addFavoriteLanguage,
    getWelcomeMessage,
    getProgressPercentage,
    getMilestoneMessage,
  };
};

export type { HistoryItem, UserPreferences };
