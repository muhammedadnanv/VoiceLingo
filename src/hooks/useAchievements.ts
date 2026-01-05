import { useState, useEffect, useCallback, useMemo } from 'react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'milestone' | 'streak' | 'explorer' | 'mastery' | 'special';
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementState {
  achievements: Achievement[];
  totalPoints: number;
  lastChecked: string;
}

const STORAGE_KEY = 'voicelingo_achievements';

const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'progress' | 'unlocked' | 'unlockedAt'>[] = [
  // Milestone achievements
  { id: 'first_translation', title: 'First Words', description: 'Complete your first translation', icon: 'Baby', category: 'milestone', requirement: 1, rarity: 'common' },
  { id: 'ten_translations', title: 'Getting Started', description: 'Complete 10 translations', icon: 'Rocket', category: 'milestone', requirement: 10, rarity: 'common' },
  { id: 'fifty_translations', title: 'Dedicated Learner', description: 'Complete 50 translations', icon: 'BookOpen', category: 'milestone', requirement: 50, rarity: 'rare' },
  { id: 'hundred_translations', title: 'Century Club', description: 'Complete 100 translations', icon: 'Award', category: 'milestone', requirement: 100, rarity: 'rare' },
  { id: 'five_hundred_translations', title: 'Language Enthusiast', description: 'Complete 500 translations', icon: 'Star', category: 'milestone', requirement: 500, rarity: 'epic' },
  { id: 'thousand_translations', title: 'Polyglot Master', description: 'Complete 1000 translations', icon: 'Crown', category: 'milestone', requirement: 1000, rarity: 'legendary' },
  
  // Streak achievements
  { id: 'streak_3', title: 'Consistent', description: 'Maintain a 3-day streak', icon: 'Flame', category: 'streak', requirement: 3, rarity: 'common' },
  { id: 'streak_7', title: 'Week Warrior', description: 'Maintain a 7-day streak', icon: 'Flame', category: 'streak', requirement: 7, rarity: 'rare' },
  { id: 'streak_14', title: 'Fortnight Fighter', description: 'Maintain a 14-day streak', icon: 'Flame', category: 'streak', requirement: 14, rarity: 'rare' },
  { id: 'streak_30', title: 'Monthly Master', description: 'Maintain a 30-day streak', icon: 'Flame', category: 'streak', requirement: 30, rarity: 'epic' },
  { id: 'streak_100', title: 'Unstoppable', description: 'Maintain a 100-day streak', icon: 'Flame', category: 'streak', requirement: 100, rarity: 'legendary' },
  
  // Explorer achievements
  { id: 'explorer_2', title: 'Curious Mind', description: 'Learn 2 different languages', icon: 'Globe', category: 'explorer', requirement: 2, rarity: 'common' },
  { id: 'explorer_5', title: 'World Traveler', description: 'Learn 5 different languages', icon: 'Globe', category: 'explorer', requirement: 5, rarity: 'rare' },
  { id: 'explorer_10', title: 'Global Citizen', description: 'Learn 10 different languages', icon: 'Globe', category: 'explorer', requirement: 10, rarity: 'epic' },
  
  // Mastery achievements
  { id: 'daily_goal_1', title: 'Goal Getter', description: 'Complete your daily goal once', icon: 'Target', category: 'mastery', requirement: 1, rarity: 'common' },
  { id: 'daily_goal_7', title: 'Goal Crusher', description: 'Complete your daily goal 7 times', icon: 'Target', category: 'mastery', requirement: 7, rarity: 'rare' },
  { id: 'daily_goal_30', title: 'Goal Legend', description: 'Complete your daily goal 30 times', icon: 'Target', category: 'mastery', requirement: 30, rarity: 'epic' },
  
  // Special achievements
  { id: 'night_owl', title: 'Night Owl', description: 'Practice after midnight', icon: 'Moon', category: 'special', requirement: 1, rarity: 'rare' },
  { id: 'early_bird', title: 'Early Bird', description: 'Practice before 6 AM', icon: 'Sunrise', category: 'special', requirement: 1, rarity: 'rare' },
  { id: 'practice_master', title: 'Practice Master', description: 'Complete 50 practice sessions', icon: 'Brain', category: 'special', requirement: 50, rarity: 'epic' },
];

const RARITY_POINTS = {
  common: 10,
  rare: 25,
  epic: 50,
  legendary: 100,
};

export const useAchievements = () => {
  const [state, setState] = useState<AchievementState>({
    achievements: ACHIEVEMENT_DEFINITIONS.map(def => ({
      ...def,
      progress: 0,
      unlocked: false,
    })),
    totalPoints: 0,
    lastChecked: new Date().toISOString(),
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with definitions to handle new achievements
        const mergedAchievements = ACHIEVEMENT_DEFINITIONS.map(def => {
          const existing = parsed.achievements?.find((a: Achievement) => a.id === def.id);
          return existing ? { ...def, ...existing } : { ...def, progress: 0, unlocked: false };
        });
        setState({
          ...parsed,
          achievements: mergedAchievements,
        });
      }
    } catch (e) {
      console.error('Failed to load achievements:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  const saveState = useCallback((newState: AchievementState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, []);

  // Update achievement progress
  const updateProgress = useCallback((achievementId: string, progress: number) => {
    setState(prev => {
      const achievements = prev.achievements.map(a => {
        if (a.id === achievementId) {
          const newProgress = Math.max(a.progress, progress);
          const wasUnlocked = a.unlocked;
          const isNowUnlocked = newProgress >= a.requirement;
          
          if (isNowUnlocked && !wasUnlocked) {
            setNewlyUnlocked(current => [...current, { ...a, progress: newProgress, unlocked: true, unlockedAt: new Date().toISOString() }]);
          }
          
          return {
            ...a,
            progress: newProgress,
            unlocked: isNowUnlocked,
            unlockedAt: isNowUnlocked && !wasUnlocked ? new Date().toISOString() : a.unlockedAt,
          };
        }
        return a;
      });

      const totalPoints = achievements
        .filter(a => a.unlocked)
        .reduce((sum, a) => sum + RARITY_POINTS[a.rarity], 0);

      const newState = { ...prev, achievements, totalPoints };
      saveState(newState);
      return newState;
    });
  }, [saveState]);

  // Batch update multiple achievements
  const checkAchievements = useCallback((data: {
    totalTranslations?: number;
    streak?: number;
    languagesUsed?: number;
    dailyGoalsCompleted?: number;
    practiceSessions?: number;
  }) => {
    const { totalTranslations, streak, languagesUsed, dailyGoalsCompleted, practiceSessions } = data;

    // Check time-based achievements
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 5) updateProgress('night_owl', 1);
    if (hour >= 4 && hour < 6) updateProgress('early_bird', 1);

    // Milestone achievements
    if (totalTranslations !== undefined) {
      updateProgress('first_translation', totalTranslations);
      updateProgress('ten_translations', totalTranslations);
      updateProgress('fifty_translations', totalTranslations);
      updateProgress('hundred_translations', totalTranslations);
      updateProgress('five_hundred_translations', totalTranslations);
      updateProgress('thousand_translations', totalTranslations);
    }

    // Streak achievements
    if (streak !== undefined) {
      updateProgress('streak_3', streak);
      updateProgress('streak_7', streak);
      updateProgress('streak_14', streak);
      updateProgress('streak_30', streak);
      updateProgress('streak_100', streak);
    }

    // Explorer achievements
    if (languagesUsed !== undefined) {
      updateProgress('explorer_2', languagesUsed);
      updateProgress('explorer_5', languagesUsed);
      updateProgress('explorer_10', languagesUsed);
    }

    // Mastery achievements
    if (dailyGoalsCompleted !== undefined) {
      updateProgress('daily_goal_1', dailyGoalsCompleted);
      updateProgress('daily_goal_7', dailyGoalsCompleted);
      updateProgress('daily_goal_30', dailyGoalsCompleted);
    }

    // Practice achievements
    if (practiceSessions !== undefined) {
      updateProgress('practice_master', practiceSessions);
    }
  }, [updateProgress]);

  // Clear newly unlocked queue
  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked([]);
  }, []);

  // Get achievements by category
  const getByCategory = useMemo(() => {
    const grouped: Record<string, Achievement[]> = {};
    state.achievements.forEach(a => {
      if (!grouped[a.category]) grouped[a.category] = [];
      grouped[a.category].push(a);
    });
    return grouped;
  }, [state.achievements]);

  // Get unlocked count
  const unlockedCount = useMemo(() => 
    state.achievements.filter(a => a.unlocked).length
  , [state.achievements]);

  return {
    achievements: state.achievements,
    totalPoints: state.totalPoints,
    isLoaded,
    newlyUnlocked,
    unlockedCount,
    totalCount: state.achievements.length,
    getByCategory,
    updateProgress,
    checkAchievements,
    clearNewlyUnlocked,
  };
};
