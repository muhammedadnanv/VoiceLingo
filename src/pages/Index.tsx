import React, { useState, useCallback, useEffect } from 'react';
import Header from '@/components/Header';
import VoiceLogo from '@/components/VoiceLogo';
import LanguageSelector from '@/components/LanguageSelector';
import VoiceRecorder from '@/components/VoiceRecorder';
import TranslationCard from '@/components/TranslationCard';
import WaveVisualizer from '@/components/WaveVisualizer';
import HistoryPanel, { HistoryItem } from '@/components/HistoryPanel';
import ContextualTip from '@/components/ContextualTip';
import RecommendationCard from '@/components/RecommendationCard';
import LevelSelector from '@/components/LevelSelector';
import StreakBadge from '@/components/StreakBadge';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, Sparkles, Target, Settings2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { usePersonalization } from '@/hooks/usePersonalization';
import { useHyperPersonalization } from '@/hooks/useHyperPersonalization';
import { useAchievements } from '@/hooks/useAchievements';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

const Index = () => {
  const { toast } = useToast();
  const { translate, isLoading } = useTranslation();
  const {
    preferences,
    isLoaded,
    setSourceLanguage,
    setTargetLanguage,
    incrementTranslations,
    addToHistory,
    clearHistory: clearStoredHistory,
    getWelcomeMessage,
    getProgressPercentage,
    getMilestoneMessage,
  } = usePersonalization();

  const {
    learningLevel,
    behavior,
    onboardingComplete,
    isLoaded: hyperLoaded,
    updateLearningLevel,
    trackFeatureUsage,
    trackTranslation,
    trackLanguageUsage,
    completeOnboarding,
    markTipShown,
    dismissRecommendation,
    getContextualTips,
    getRecommendations,
    getPersonalizedCopy,
    getUIVisibility,
    getSmartGreeting,
  } = useHyperPersonalization();

  const { checkAchievements, newlyUnlocked, clearNewlyUnlocked } = useAchievements();

  const [isListening, setIsListening] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [displayHistory, setDisplayHistory] = useState<HistoryItem[]>([]);
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [dailyGoalsCompleted, setDailyGoalsCompleted] = useState(0);

  // Show onboarding for new users
  useEffect(() => {
    if (hyperLoaded && !onboardingComplete) {
      setShowLevelSelector(true);
    }
  }, [hyperLoaded, onboardingComplete]);

  // Sync history from preferences on load
  useEffect(() => {
    if (isLoaded && preferences.translationHistory) {
      setDisplayHistory(
        preferences.translationHistory.map(item => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }))
      );
    }
  }, [isLoaded, preferences.translationHistory]);

  // Track language usage
  useEffect(() => {
    if (preferences.recentLanguages.length > 0) {
      trackLanguageUsage(preferences.recentLanguages);
    }
  }, [preferences.recentLanguages, trackLanguageUsage]);

  // Show milestone toasts
  useEffect(() => {
    if (preferences.totalTranslations > 0) {
      const milestones = [10, 25, 50, 100, 250, 500, 1000];
      if (milestones.includes(preferences.totalTranslations)) {
        toast({
          title: "🎉 Milestone Reached!",
          description: `Congratulations! You've completed ${preferences.totalTranslations} translations!`,
        });
      }
      // Check achievements on translation count change
      checkAchievements({
        totalTranslations: preferences.totalTranslations,
        streak: behavior.consecutiveDays,
        languagesUsed: behavior.uniqueLanguagesUsed,
        dailyGoalsCompleted,
      });
    }
  }, [preferences.totalTranslations, behavior.consecutiveDays, behavior.uniqueLanguagesUsed, dailyGoalsCompleted, checkAchievements, toast]);

  // Daily goal completion toast
  useEffect(() => {
    if (preferences.todayTranslations === preferences.dailyGoal && preferences.todayTranslations > 0) {
      toast({
        title: "🏆 Daily Goal Complete!",
        description: `Amazing work! You've reached your goal of ${preferences.dailyGoal} translations today.`,
      });
      setDailyGoalsCompleted(prev => prev + 1);
    }
  }, [preferences.todayTranslations, preferences.dailyGoal, toast]);

  // Show achievement unlock toasts
  useEffect(() => {
    if (newlyUnlocked.length > 0) {
      newlyUnlocked.forEach(achievement => {
        toast({
          title: `🏅 Achievement Unlocked!`,
          description: `${achievement.title} - ${achievement.description}`,
        });
      });
      clearNewlyUnlocked();
    }
  }, [newlyUnlocked, clearNewlyUnlocked, toast]);

  const handleTranscript = useCallback(
    async (text: string) => {
      setOriginalText(text);
      
      const result = await translate(text, preferences.sourceLanguage, preferences.targetLanguage);
      
      if (result) {
        setTranslatedText(result.translatedText);
        setPhonetic(result.phonetic);
        incrementTranslations();
        trackTranslation(true, preferences.targetLanguage);

        // Add to persistent history
        addToHistory({
          original: text,
          translated: result.translatedText,
          phonetic: result.phonetic,
          sourceLang: preferences.sourceLanguage,
          targetLang: preferences.targetLanguage,
        });

        // Update display history
        const historyItem: HistoryItem = {
          id: Date.now().toString(),
          original: text,
          translated: result.translatedText,
          phonetic: result.phonetic,
          sourceLang: preferences.sourceLanguage,
          targetLang: preferences.targetLanguage,
          timestamp: new Date(),
        };
        setDisplayHistory(prev => [historyItem, ...prev.slice(0, 9)]);
      } else {
        trackTranslation(false, preferences.targetLanguage);
      }
    },
    [preferences.sourceLanguage, preferences.targetLanguage, translate, incrementTranslations, addToHistory, trackTranslation]
  );

  const swapLanguages = () => {
    const temp = preferences.sourceLanguage;
    setSourceLanguage(preferences.targetLanguage);
    setTargetLanguage(temp);
    trackFeatureUsage('swap');
    toast({
      title: "Languages swapped",
      description: "Source and target languages have been exchanged.",
    });
  };

  const handleSpeak = (text: string, lang: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
    trackFeatureUsage('speak');
  };

  const handleClearHistory = () => {
    setDisplayHistory([]);
    clearStoredHistory();
    trackFeatureUsage('history');
    toast({
      title: "History cleared",
      description: "Your translation history has been cleared.",
    });
  };

  const handleOnboardingComplete = () => {
    completeOnboarding();
    setShowLevelSelector(false);
    toast({
      title: `Welcome, ${learningLevel} learner!`,
      description: "Your experience has been personalized just for you.",
    });
  };

  if (!isLoaded || !hyperLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <VoiceLogo size="lg" className="animate-pulse" />
      </div>
    );
  }

  const progressPercent = getProgressPercentage();
  const uiVisibility = getUIVisibility;
  const contextualTips = getContextualTips;
  const recommendations = getRecommendations;

  return (
    <div className="min-h-screen bg-background">
      {/* Level Selector Modal */}
      {showLevelSelector && (
        <LevelSelector
          currentLevel={learningLevel}
          onSelectLevel={updateLearningLevel}
          onComplete={handleOnboardingComplete}
        />
      )}

      <Header />

      <main className="container max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Welcome Section */}
        <section className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>{getSmartGreeting()}</span>
            </div>
            {uiVisibility.showStreakBadge && (
              <StreakBadge days={behavior.consecutiveDays} />
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold">
            {getPersonalizedCopy('welcomeTitle') || 'Speak &'} <span className="text-gradient">Learn</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            {uiVisibility.simplifiedLayout
              ? 'Tap the microphone and speak to translate instantly!'
              : 'Translate your voice instantly with pronunciation guides to help you speak like a native.'}
          </p>
          
          {/* Level Settings Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLevelSelector(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings2 className="w-4 h-4 mr-1" />
            {learningLevel.charAt(0).toUpperCase() + learningLevel.slice(1)} level
          </Button>
        </section>

        {/* Contextual Tips */}
        {contextualTips.length > 0 && (
          <section className="space-y-3">
            {contextualTips.slice(0, 1).map((tip) => (
              <ContextualTip
                key={tip.id}
                tip={tip}
                onDismiss={(tipId) => markTipShown(tipId)}
              />
            ))}
          </section>
        )}

        {/* Smart Recommendations */}
        {recommendations.length > 0 && !uiVisibility.simplifiedLayout && (
          <section className="space-y-3">
            {recommendations.slice(0, 1).map((rec, index) => (
              <RecommendationCard
                key={`${rec.type}_${index}`}
                recommendation={rec}
                onDismiss={dismissRecommendation}
              />
            ))}
          </section>
        )}

        {/* Daily Progress */}
        <section className="bg-card rounded-2xl p-4 shadow-card border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Target className="w-4 h-4 text-primary" />
              <span>Daily Goal</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {preferences.todayTranslations}/{preferences.dailyGoal} translations
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {getPersonalizedCopy('progressMessage') || getMilestoneMessage()}
          </p>
        </section>

        {/* Language Selectors */}
        <section className="bg-card rounded-2xl p-6 shadow-card border border-border">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <LanguageSelector
                value={preferences.sourceLanguage}
                onChange={setSourceLanguage}
                label="I speak"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={swapLanguages}
              className="h-12 w-12 rounded-xl mb-0"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <LanguageSelector
                value={preferences.targetLanguage}
                onChange={setTargetLanguage}
                label="Translate to"
              />
            </div>
          </div>
        </section>

        {/* Voice Recorder */}
        <section className="bg-card rounded-2xl p-8 shadow-card border border-border">
          <WaveVisualizer isActive={isListening} />
          <div className="mt-6">
            <VoiceRecorder
              onTranscript={handleTranscript}
              isListening={isListening}
              setIsListening={setIsListening}
              sourceLanguage={preferences.sourceLanguage}
            />
          </div>
          {uiVisibility.showTutorialHints && !translatedText && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              {getPersonalizedCopy('recordPrompt') || 'Tap to speak'}
            </p>
          )}
        </section>

        {/* Translation Result */}
        <TranslationCard
          originalText={originalText}
          translatedText={translatedText}
          phonetic={phonetic}
          targetLanguage={preferences.targetLanguage}
          isLoading={isLoading}
        />

        {/* Empty State for beginners */}
        {!translatedText && !isLoading && uiVisibility.simplifiedLayout && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">{getPersonalizedCopy('emptyState')}</p>
          </div>
        )}

        {/* History - conditionally shown based on behavior */}
        {uiVisibility.showHistoryPanel && displayHistory.length > 0 && (
          <HistoryPanel
            history={displayHistory}
            onClear={handleClearHistory}
            onSpeak={handleSpeak}
          />
        )}

        {/* Stats - shown for non-beginners */}
        {uiVisibility.showDetailedStats && preferences.totalTranslations > 0 && (
          <section className="bg-card/50 rounded-2xl p-6 border border-border/50">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{preferences.totalTranslations}</p>
                <p className="text-xs text-muted-foreground">Total Translations</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{behavior.consecutiveDays}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{behavior.uniqueLanguagesUsed}</p>
                <p className="text-xs text-muted-foreground">Languages Used</p>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center py-8 border-t border-border">
          <VoiceLogo size="sm" className="justify-center mb-4" />
          <p className="text-sm text-muted-foreground">
            Learn languages naturally through voice.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2">
            © {new Date().getFullYear()} VoiceLingo. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
