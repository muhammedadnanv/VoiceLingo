import { useState, useEffect, useCallback, useMemo } from 'react';

// Learning levels
export type LearningLevel = 'beginner' | 'intermediate' | 'advanced';

// User behavior tracking
interface BehaviorMetrics {
  avgSessionDuration: number; // in minutes
  translationsPerSession: number;
  uniqueLanguagesUsed: number;
  consecutiveDays: number;
  lastActiveDate: string;
  featuresUsed: string[];
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  totalTimeSpent: number; // in minutes
  errorRate: number; // percentage of failed translations
  speakFeatureUsage: number;
  historyFeatureUsage: number;
  swapFeatureUsage: number;
}

// Contextual tips based on user state
interface ContextualTip {
  id: string;
  title: string;
  message: string;
  trigger: string;
  priority: number;
  shown?: boolean;
}

// Smart recommendations
interface Recommendation {
  type: 'language' | 'feature' | 'goal' | 'practice';
  title: string;
  description: string;
  action?: string;
  priority: number;
}

interface HyperPersonalizationState {
  learningLevel: LearningLevel;
  behavior: BehaviorMetrics;
  onboardingComplete: boolean;
  tipsShown: string[];
  dismissedRecommendations: string[];
  adaptiveUIMode: 'simple' | 'standard' | 'advanced';
  preferredTone: 'friendly' | 'professional' | 'encouraging';
  lastLevelAssessment: string;
}

const DEFAULT_BEHAVIOR: BehaviorMetrics = {
  avgSessionDuration: 0,
  translationsPerSession: 0,
  uniqueLanguagesUsed: 0,
  consecutiveDays: 0,
  lastActiveDate: '',
  featuresUsed: [],
  preferredTimeOfDay: 'morning',
  deviceType: 'desktop',
  totalTimeSpent: 0,
  errorRate: 0,
  speakFeatureUsage: 0,
  historyFeatureUsage: 0,
  swapFeatureUsage: 0,
};

const DEFAULT_STATE: HyperPersonalizationState = {
  learningLevel: 'beginner',
  behavior: DEFAULT_BEHAVIOR,
  onboardingComplete: false,
  tipsShown: [],
  dismissedRecommendations: [],
  adaptiveUIMode: 'simple',
  preferredTone: 'friendly',
  lastLevelAssessment: '',
};

const STORAGE_KEY = 'voicelingo_hyper_personalization';

// Detect device type
const detectDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// Detect time of day
const detectTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

export const useHyperPersonalization = () => {
  const [state, setState] = useState<HyperPersonalizationState>(DEFAULT_STATE);
  const [sessionStart] = useState(Date.now());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Check consecutive days
        const today = new Date().toDateString();
        const lastActive = parsed.behavior?.lastActiveDate || '';
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        let consecutiveDays = parsed.behavior?.consecutiveDays || 0;
        if (lastActive === yesterday) {
          consecutiveDays += 1;
        } else if (lastActive !== today) {
          consecutiveDays = 1;
        }

        const updatedState: HyperPersonalizationState = {
          ...DEFAULT_STATE,
          ...parsed,
          behavior: {
            ...DEFAULT_BEHAVIOR,
            ...parsed.behavior,
            deviceType: detectDeviceType(),
            preferredTimeOfDay: detectTimeOfDay(),
            lastActiveDate: today,
            consecutiveDays,
          },
        };

        setState(updatedState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState));
      } else {
        const initialState: HyperPersonalizationState = {
          ...DEFAULT_STATE,
          behavior: {
            ...DEFAULT_BEHAVIOR,
            deviceType: detectDeviceType(),
            preferredTimeOfDay: detectTimeOfDay(),
            lastActiveDate: new Date().toDateString(),
            consecutiveDays: 1,
          },
        };
        setState(initialState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
      }
    } catch (e) {
      console.error('Failed to load hyper-personalization state:', e);
    }
    setIsLoaded(true);
  }, []);

  // Track session duration on unload
  useEffect(() => {
    const handleUnload = () => {
      const sessionDuration = (Date.now() - sessionStart) / 60000; // in minutes
      setState(prev => {
        const sessions = prev.behavior.avgSessionDuration > 0 ? 
          Math.round((prev.behavior.avgSessionDuration + sessionDuration) / 2) : 
          sessionDuration;
        const updated = {
          ...prev,
          behavior: {
            ...prev.behavior,
            avgSessionDuration: sessions,
            totalTimeSpent: prev.behavior.totalTimeSpent + sessionDuration,
          },
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [sessionStart]);

  // Auto-assess learning level based on behavior
  const assessLearningLevel = useCallback((): LearningLevel => {
    const { behavior } = state;
    let score = 0;

    // Scoring based on behavior
    if (behavior.totalTimeSpent > 120) score += 2; // 2+ hours
    else if (behavior.totalTimeSpent > 30) score += 1;

    if (behavior.uniqueLanguagesUsed >= 4) score += 2;
    else if (behavior.uniqueLanguagesUsed >= 2) score += 1;

    if (behavior.translationsPerSession > 20) score += 2;
    else if (behavior.translationsPerSession > 10) score += 1;

    if (behavior.consecutiveDays >= 7) score += 2;
    else if (behavior.consecutiveDays >= 3) score += 1;

    if (behavior.featuresUsed.length >= 5) score += 1;

    if (score >= 7) return 'advanced';
    if (score >= 3) return 'intermediate';
    return 'beginner';
  }, [state]);

  // Update learning level
  const updateLearningLevel = useCallback((level: LearningLevel) => {
    setState(prev => {
      const adaptiveMode: 'simple' | 'standard' | 'advanced' = 
        level === 'beginner' ? 'simple' : level === 'intermediate' ? 'standard' : 'advanced';
      const updated: HyperPersonalizationState = { 
        ...prev, 
        learningLevel: level,
        lastLevelAssessment: new Date().toISOString(),
        adaptiveUIMode: adaptiveMode,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Track feature usage
  const trackFeatureUsage = useCallback((feature: string) => {
    setState(prev => {
      const featuresUsed = prev.behavior.featuresUsed.includes(feature)
        ? prev.behavior.featuresUsed
        : [...prev.behavior.featuresUsed, feature];

      const updated = {
        ...prev,
        behavior: {
          ...prev.behavior,
          featuresUsed,
          speakFeatureUsage: feature === 'speak' ? prev.behavior.speakFeatureUsage + 1 : prev.behavior.speakFeatureUsage,
          historyFeatureUsage: feature === 'history' ? prev.behavior.historyFeatureUsage + 1 : prev.behavior.historyFeatureUsage,
          swapFeatureUsage: feature === 'swap' ? prev.behavior.swapFeatureUsage + 1 : prev.behavior.swapFeatureUsage,
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Track translation metrics
  const trackTranslation = useCallback((success: boolean, languageCode: string) => {
    setState(prev => {
      const translationsPerSession = prev.behavior.translationsPerSession + 1;
      const errorRate = success 
        ? prev.behavior.errorRate * 0.9 
        : Math.min(prev.behavior.errorRate + 10, 100);

      const updated = {
        ...prev,
        behavior: {
          ...prev.behavior,
          translationsPerSession,
          errorRate,
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Update unique languages used
  const trackLanguageUsage = useCallback((languages: string[]) => {
    setState(prev => {
      const updated = {
        ...prev,
        behavior: {
          ...prev.behavior,
          uniqueLanguagesUsed: languages.length,
        },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Complete onboarding
  const completeOnboarding = useCallback(() => {
    setState(prev => {
      const updated = { ...prev, onboardingComplete: true };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Mark tip as shown
  const markTipShown = useCallback((tipId: string) => {
    setState(prev => {
      if (prev.tipsShown.includes(tipId)) return prev;
      const updated = {
        ...prev,
        tipsShown: [...prev.tipsShown, tipId],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Dismiss recommendation
  const dismissRecommendation = useCallback((recommendationId: string) => {
    setState(prev => {
      const updated = {
        ...prev,
        dismissedRecommendations: [...prev.dismissedRecommendations, recommendationId],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Get contextual tips based on current state
  const getContextualTips = useMemo((): ContextualTip[] => {
    const tips: ContextualTip[] = [];
    const { behavior, learningLevel, tipsShown, onboardingComplete } = state;

    // Beginner tips
    if (learningLevel === 'beginner' && !tipsShown.includes('first_translation')) {
      tips.push({
        id: 'first_translation',
        title: 'Getting Started',
        message: 'Tap the microphone and speak clearly. VoiceLingo will translate your words instantly!',
        trigger: 'first_visit',
        priority: 1,
      });
    }

    if (behavior.speakFeatureUsage === 0 && !tipsShown.includes('speak_feature')) {
      tips.push({
        id: 'speak_feature',
        title: 'Listen & Learn',
        message: 'Tap the speaker icon on any translation to hear the correct pronunciation.',
        trigger: 'after_first_translation',
        priority: 2,
      });
    }

    if (behavior.swapFeatureUsage === 0 && behavior.translationsPerSession > 3 && !tipsShown.includes('swap_feature')) {
      tips.push({
        id: 'swap_feature',
        title: 'Quick Swap',
        message: 'Use the swap button to quickly reverse your language pair!',
        trigger: 'multiple_translations',
        priority: 3,
      });
    }

    if (behavior.consecutiveDays >= 3 && !tipsShown.includes('streak_tip')) {
      tips.push({
        id: 'streak_tip',
        title: 'Keep It Up!',
        message: `You're on a ${behavior.consecutiveDays}-day streak! Consistency is key to language learning.`,
        trigger: 'streak',
        priority: 2,
      });
    }

    if (learningLevel === 'intermediate' && !tipsShown.includes('advanced_features')) {
      tips.push({
        id: 'advanced_features',
        title: 'Level Up',
        message: 'Try practicing with longer sentences to improve your fluency!',
        trigger: 'intermediate_level',
        priority: 3,
      });
    }

    // Time-based tips
    const timeOfDay = behavior.preferredTimeOfDay;
    if (timeOfDay === 'night' && !tipsShown.includes('night_study')) {
      tips.push({
        id: 'night_study',
        title: 'Night Owl Mode',
        message: 'Studies show learning before sleep helps retention. Great time to practice!',
        trigger: 'night_session',
        priority: 4,
      });
    }

    return tips.sort((a, b) => a.priority - b.priority);
  }, [state]);

  // Get smart recommendations
  const getRecommendations = useMemo((): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    const { behavior, learningLevel, dismissedRecommendations } = state;

    // Language recommendations
    if (behavior.uniqueLanguagesUsed < 2 && !dismissedRecommendations.includes('try_new_language')) {
      recommendations.push({
        type: 'language',
        title: 'Explore New Languages',
        description: 'Try translating to a different language to expand your horizons!',
        priority: 1,
      });
    }

    // Goal recommendations
    if (behavior.translationsPerSession < 5 && !dismissedRecommendations.includes('set_goal')) {
      recommendations.push({
        type: 'goal',
        title: 'Set a Daily Goal',
        description: 'Challenge yourself with 10 translations per day to build a habit.',
        priority: 2,
      });
    }

    // Practice recommendations based on level
    if (learningLevel === 'beginner' && !dismissedRecommendations.includes('practice_basics')) {
      recommendations.push({
        type: 'practice',
        title: 'Start with Common Phrases',
        description: 'Try greetings like "Hello", "Thank you", and "Goodbye" to build confidence.',
        priority: 1,
      });
    }

    if (learningLevel === 'intermediate' && !dismissedRecommendations.includes('practice_sentences')) {
      recommendations.push({
        type: 'practice',
        title: 'Practice Full Sentences',
        description: 'Move beyond words to complete sentences for better fluency.',
        priority: 2,
      });
    }

    if (learningLevel === 'advanced' && !dismissedRecommendations.includes('practice_complex')) {
      recommendations.push({
        type: 'practice',
        title: 'Master Complex Expressions',
        description: 'Try idioms and complex phrases to sound like a native speaker.',
        priority: 2,
      });
    }

    // Feature recommendations
    if (behavior.historyFeatureUsage === 0 && behavior.translationsPerSession > 5 && !dismissedRecommendations.includes('use_history')) {
      recommendations.push({
        type: 'feature',
        title: 'Review Your History',
        description: 'Check your translation history to reinforce what you\'ve learned.',
        priority: 3,
      });
    }

    // Streak recommendations
    if (behavior.consecutiveDays === 0 && !dismissedRecommendations.includes('start_streak')) {
      recommendations.push({
        type: 'goal',
        title: 'Start a Learning Streak',
        description: 'Visit daily to build a streak and accelerate your learning!',
        priority: 2,
      });
    }

    return recommendations.sort((a, b) => a.priority - b.priority);
  }, [state]);

  // Get personalized copy based on level and tone
  const getPersonalizedCopy = useCallback((key: string): string => {
    const { learningLevel, preferredTone, behavior } = state;
    
    const copy: Record<string, Record<LearningLevel, string>> = {
      welcomeTitle: {
        beginner: 'Start Your Journey',
        intermediate: 'Keep Growing',
        advanced: 'Master New Languages',
      },
      recordPrompt: {
        beginner: 'Tap to speak (try simple words first!)',
        intermediate: 'Tap to speak your sentence',
        advanced: 'Tap to translate complex phrases',
      },
      emptyState: {
        beginner: 'Say "Hello" to get started!',
        intermediate: 'Try a full sentence like "How are you?"',
        advanced: 'Challenge yourself with idioms or technical terms',
      },
      progressMessage: {
        beginner: 'You\'re doing great! Every word counts.',
        intermediate: 'Solid progress! Keep pushing your limits.',
        advanced: 'Impressive dedication! You\'re almost fluent.',
      },
    };

    return copy[key]?.[learningLevel] || '';
  }, [state]);

  // Get adaptive UI visibility
  const getUIVisibility = useMemo(() => {
    const { adaptiveUIMode, behavior } = state;
    
    return {
      showAdvancedOptions: adaptiveUIMode === 'advanced',
      showTutorialHints: adaptiveUIMode === 'simple',
      showDetailedStats: adaptiveUIMode !== 'simple',
      showRecommendations: true,
      showStreakBadge: behavior.consecutiveDays >= 2,
      showProgressRing: true,
      simplifiedLayout: adaptiveUIMode === 'simple',
      showHistoryPanel: behavior.historyFeatureUsage > 0 || behavior.translationsPerSession > 3,
    };
  }, [state]);

  // Get greeting based on time and behavior
  const getSmartGreeting = useCallback((): string => {
    const { behavior, learningLevel } = state;
    const timeOfDay = behavior.preferredTimeOfDay;
    const streak = behavior.consecutiveDays;

    const timeGreetings = {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening',
      night: 'Burning the midnight oil',
    };

    let greeting = timeGreetings[timeOfDay] || 'Hello';

    if (streak >= 7) {
      greeting += `! 🔥 ${streak}-day streak!`;
    } else if (streak >= 3) {
      greeting += `! ${streak} days strong!`;
    } else if (learningLevel === 'beginner') {
      greeting += '! Ready to learn?';
    } else {
      greeting += '!';
    }

    return greeting;
  }, [state]);

  return {
    state,
    isLoaded,
    learningLevel: state.learningLevel,
    behavior: state.behavior,
    adaptiveUIMode: state.adaptiveUIMode,
    onboardingComplete: state.onboardingComplete,
    
    // Actions
    updateLearningLevel,
    trackFeatureUsage,
    trackTranslation,
    trackLanguageUsage,
    completeOnboarding,
    markTipShown,
    dismissRecommendation,
    assessLearningLevel,
    
    // Getters
    getContextualTips,
    getRecommendations,
    getPersonalizedCopy,
    getUIVisibility,
    getSmartGreeting,
  };
};

export type { ContextualTip, Recommendation, HyperPersonalizationState, BehaviorMetrics };
