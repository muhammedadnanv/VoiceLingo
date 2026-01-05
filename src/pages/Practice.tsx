import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { usePersonalization } from '@/hooks/usePersonalization';
import { useSpacedRepetition, PracticeItem } from '@/hooks/useSpacedRepetition';
import { useAchievements } from '@/hooks/useAchievements';
import { ArrowLeft, Brain, CheckCircle, XCircle, Volume2, RotateCcw, Sparkles, Trophy, Clock } from 'lucide-react';

const Practice = () => {
  const { toast } = useToast();
  const { preferences } = usePersonalization();
  const {
    items,
    isLoaded,
    importFromHistory,
    getDueItems,
    submitAnswer,
    getAccuracy,
    currentStreak,
    bestStreak,
    totalSessions,
  } = useSpacedRepetition();
  const { checkAchievements } = useAchievements();

  const [currentItem, setCurrentItem] = useState<PracticeItem | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [practiceQueue, setPracticeQueue] = useState<PracticeItem[]>([]);

  // Import history items on first load
  useEffect(() => {
    if (isLoaded && preferences.translationHistory.length > 0) {
      importFromHistory(preferences.translationHistory);
    }
  }, [isLoaded, preferences.translationHistory, importFromHistory]);

  // Load practice queue
  useEffect(() => {
    if (isLoaded) {
      const dueItems = getDueItems();
      setPracticeQueue(dueItems);
      if (dueItems.length > 0 && !currentItem) {
        setCurrentItem(dueItems[0]);
      }
    }
  }, [isLoaded, getDueItems, items]);

  const speakText = (text: string, lang: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.8;
    speechSynthesis.speak(utterance);
  };

  const handleAnswer = useCallback((quality: number) => {
    if (!currentItem) return;

    submitAnswer(currentItem.id, quality);
    
    const isCorrect = quality >= 3;
    setSessionTotal(prev => prev + 1);
    if (isCorrect) {
      setSessionCorrect(prev => prev + 1);
    }

    // Check achievements
    checkAchievements({ practiceSessions: totalSessions + 1 });

    // Move to next item
    const remaining = practiceQueue.filter(i => i.id !== currentItem.id);
    setPracticeQueue(remaining);
    
    if (remaining.length > 0) {
      setCurrentItem(remaining[0]);
      setShowAnswer(false);
    } else {
      setCurrentItem(null);
      toast({
        title: "Session Complete! 🎉",
        description: `You reviewed ${sessionTotal + 1} items with ${Math.round(((sessionCorrect + (isCorrect ? 1 : 0)) / (sessionTotal + 1)) * 100)}% accuracy.`,
      });
    }
  }, [currentItem, submitAnswer, practiceQueue, sessionTotal, sessionCorrect, checkAchievements, totalSessions, toast]);

  const restartSession = () => {
    const dueItems = getDueItems();
    setPracticeQueue(dueItems);
    setCurrentItem(dueItems[0] || null);
    setShowAnswer(false);
    setSessionCorrect(0);
    setSessionTotal(0);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Brain className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  const dueCount = getDueItems().length;
  const accuracy = getAccuracy();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold">Practice Mode</h1>
            <p className="text-muted-foreground text-sm">Spaced repetition for better retention</p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <p className="text-xl font-bold text-primary">{dueCount}</p>
            <p className="text-xs text-muted-foreground">Due</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <p className="text-xl font-bold text-primary">{accuracy}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <p className="text-xl font-bold text-primary">{currentStreak}</p>
            <p className="text-xs text-muted-foreground">Streak</p>
          </div>
          <div className="bg-card rounded-xl p-3 text-center border border-border">
            <p className="text-xl font-bold text-primary">{items.length}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>

        {/* Session Progress */}
        {sessionTotal > 0 && (
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Session Progress</span>
              <span className="text-sm text-muted-foreground">
                {sessionCorrect}/{sessionTotal} correct
              </span>
            </div>
            <Progress value={(sessionCorrect / Math.max(sessionTotal, 1)) * 100} className="h-2" />
          </div>
        )}

        {/* Practice Card */}
        {currentItem ? (
          <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
            <div className="p-6 space-y-6">
              {/* Question */}
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Translate this phrase:</p>
                <div className="flex items-center justify-center gap-3">
                  <p className="text-2xl font-display font-bold text-foreground">
                    {currentItem.original}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => speakText(currentItem.original, currentItem.sourceLang)}
                  >
                    <Volume2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Answer */}
              {showAnswer ? (
                <div className="bg-primary/5 rounded-xl p-6 text-center space-y-3 slide-up">
                  <div className="flex items-center justify-center gap-3">
                    <p className="text-2xl font-semibold text-primary">
                      {currentItem.translated}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => speakText(currentItem.translated, currentItem.targetLang)}
                    >
                      <Volume2 className="w-5 h-5 text-primary" />
                    </Button>
                  </div>
                  {currentItem.phonetic && (
                    <p className="text-sm text-primary/70 italic">/{currentItem.phonetic}/</p>
                  )}
                </div>
              ) : (
                <Button
                  onClick={() => setShowAnswer(true)}
                  className="w-full py-6 text-lg"
                  variant="outline"
                >
                  Show Answer
                </Button>
              )}

              {/* Rating Buttons */}
              {showAnswer && (
                <div className="space-y-3 slide-up">
                  <p className="text-center text-sm text-muted-foreground">How well did you know it?</p>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      className="flex-col py-4 h-auto border-destructive/50 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleAnswer(1)}
                    >
                      <XCircle className="w-5 h-5 mb-1" />
                      <span className="text-xs">Again</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-col py-4 h-auto border-secondary/50 hover:bg-secondary hover:text-secondary-foreground"
                      onClick={() => handleAnswer(3)}
                    >
                      <Clock className="w-5 h-5 mb-1" />
                      <span className="text-xs">Hard</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-col py-4 h-auto border-primary/50 hover:bg-primary hover:text-primary-foreground"
                      onClick={() => handleAnswer(5)}
                    >
                      <CheckCircle className="w-5 h-5 mb-1" />
                      <span className="text-xs">Easy</span>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className="px-6 py-3 bg-muted/30 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {practiceQueue.length} items remaining
              </span>
              <span className="text-xs text-muted-foreground">
                Best streak: {bestStreak}
              </span>
            </div>
          </div>
        ) : dueCount === 0 && items.length > 0 ? (
          /* All caught up */
          <div className="bg-card rounded-2xl p-8 shadow-card border border-border text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-display font-bold">All Caught Up!</h2>
            <p className="text-muted-foreground">
              You've reviewed all due items. Come back later for more practice.
            </p>
            {sessionTotal > 0 && (
              <div className="bg-muted/50 rounded-xl p-4 mt-4">
                <p className="text-sm font-medium">Session Summary</p>
                <p className="text-2xl font-bold text-primary mt-1">
                  {Math.round((sessionCorrect / sessionTotal) * 100)}% Accuracy
                </p>
                <p className="text-xs text-muted-foreground">
                  {sessionCorrect} correct out of {sessionTotal}
                </p>
              </div>
            )}
            <Button variant="outline" onClick={restartSession} className="mt-4">
              <RotateCcw className="w-4 h-4 mr-2" />
              Review Again
            </Button>
          </div>
        ) : (
          /* No items to practice */
          <div className="bg-card rounded-2xl p-8 shadow-card border border-border text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Brain className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-display font-bold">No Items to Practice</h2>
            <p className="text-muted-foreground">
              Start translating to build your practice library. Your translations will automatically appear here for review.
            </p>
            <Button asChild className="mt-4">
              <Link to="/">
                Start Translating
              </Link>
            </Button>
          </div>
        )}

        {/* Best Streak Card */}
        {bestStreak >= 5 && (
          <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/20 flex items-center gap-4">
            <Trophy className="w-8 h-8 text-amber-500" />
            <div>
              <p className="font-semibold text-foreground">Best Streak: {bestStreak}</p>
              <p className="text-sm text-muted-foreground">Keep going to beat your record!</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Practice;
