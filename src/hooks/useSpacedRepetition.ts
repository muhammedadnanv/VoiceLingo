import { useState, useEffect, useCallback } from 'react';

export interface PracticeItem {
  id: string;
  original: string;
  translated: string;
  phonetic: string;
  sourceLang: string;
  targetLang: string;
  // Spaced repetition fields
  easeFactor: number; // 2.5 is default
  interval: number; // days until next review
  repetitions: number; // number of successful reviews
  nextReview: string; // ISO date string
  lastReview?: string;
}

interface PracticeSession {
  itemId: string;
  quality: number; // 0-5 rating
  timestamp: string;
}

interface SpacedRepetitionState {
  items: PracticeItem[];
  sessions: PracticeSession[];
  totalSessions: number;
  correctAnswers: number;
  currentStreak: number;
  bestStreak: number;
}

const STORAGE_KEY = 'voicelingo_spaced_repetition';

// SM-2 Algorithm implementation
const calculateNextReview = (item: PracticeItem, quality: number): Partial<PracticeItem> => {
  let { easeFactor, interval, repetitions } = item;

  // Quality: 0-2 = fail, 3-5 = pass
  if (quality < 3) {
    // Reset on failure
    repetitions = 0;
    interval = 1;
  } else {
    // Success
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    easeFactor,
    interval,
    repetitions,
    nextReview: nextReview.toISOString(),
    lastReview: new Date().toISOString(),
  };
};

export const useSpacedRepetition = () => {
  const [state, setState] = useState<SpacedRepetitionState>({
    items: [],
    sessions: [],
    totalSessions: 0,
    correctAnswers: 0,
    currentStreak: 0,
    bestStreak: 0,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setState(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load spaced repetition data:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  const saveState = useCallback((newState: SpacedRepetitionState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, []);

  // Import items from translation history
  const importFromHistory = useCallback((historyItems: Array<{
    id: string;
    original: string;
    translated: string;
    phonetic: string;
    sourceLang: string;
    targetLang: string;
  }>) => {
    setState(prev => {
      const existingIds = new Set(prev.items.map(i => i.id));
      const newItems = historyItems
        .filter(h => !existingIds.has(h.id))
        .map(h => ({
          ...h,
          easeFactor: 2.5,
          interval: 0,
          repetitions: 0,
          nextReview: new Date().toISOString(),
        }));

      const updatedState = {
        ...prev,
        items: [...prev.items, ...newItems],
      };
      saveState(updatedState);
      return updatedState;
    });
  }, [saveState]);

  // Get items due for review
  const getDueItems = useCallback(() => {
    const now = new Date();
    return state.items
      .filter(item => new Date(item.nextReview) <= now)
      .sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime());
  }, [state.items]);

  // Get upcoming items (not due yet)
  const getUpcomingItems = useCallback(() => {
    const now = new Date();
    return state.items
      .filter(item => new Date(item.nextReview) > now)
      .sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime());
  }, [state.items]);

  // Submit a practice answer
  const submitAnswer = useCallback((itemId: string, quality: number) => {
    setState(prev => {
      const items = prev.items.map(item => {
        if (item.id === itemId) {
          return { ...item, ...calculateNextReview(item, quality) };
        }
        return item;
      });

      const isCorrect = quality >= 3;
      const newStreak = isCorrect ? prev.currentStreak + 1 : 0;

      const newSession: PracticeSession = {
        itemId,
        quality,
        timestamp: new Date().toISOString(),
      };

      const updatedState = {
        ...prev,
        items,
        sessions: [...prev.sessions.slice(-99), newSession], // Keep last 100 sessions
        totalSessions: prev.totalSessions + 1,
        correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
        currentStreak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
      };

      saveState(updatedState);
      return updatedState;
    });
  }, [saveState]);

  // Remove an item
  const removeItem = useCallback((itemId: string) => {
    setState(prev => {
      const updatedState = {
        ...prev,
        items: prev.items.filter(i => i.id !== itemId),
      };
      saveState(updatedState);
      return updatedState;
    });
  }, [saveState]);

  // Get accuracy percentage
  const getAccuracy = useCallback(() => {
    if (state.totalSessions === 0) return 0;
    return Math.round((state.correctAnswers / state.totalSessions) * 100);
  }, [state.totalSessions, state.correctAnswers]);

  // Get mastery level for an item
  const getMasteryLevel = useCallback((item: PracticeItem) => {
    if (item.repetitions >= 5) return 'mastered';
    if (item.repetitions >= 3) return 'learning';
    if (item.repetitions >= 1) return 'reviewing';
    return 'new';
  }, []);

  return {
    items: state.items,
    totalSessions: state.totalSessions,
    correctAnswers: state.correctAnswers,
    currentStreak: state.currentStreak,
    bestStreak: state.bestStreak,
    isLoaded,
    importFromHistory,
    getDueItems,
    getUpcomingItems,
    submitAnswer,
    removeItem,
    getAccuracy,
    getMasteryLevel,
  };
};
