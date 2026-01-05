import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAchievements, Achievement } from '@/hooks/useAchievements';
import { usePersonalization } from '@/hooks/usePersonalization';
import { useHyperPersonalization } from '@/hooks/useHyperPersonalization';
import { ArrowLeft, Lock, Trophy, Star, Flame, Globe, Target, Moon, Sunrise, Baby, Rocket, BookOpen, Award, Crown, Brain } from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  Baby: <Baby className="w-6 h-6" />,
  Rocket: <Rocket className="w-6 h-6" />,
  BookOpen: <BookOpen className="w-6 h-6" />,
  Award: <Award className="w-6 h-6" />,
  Star: <Star className="w-6 h-6" />,
  Crown: <Crown className="w-6 h-6" />,
  Flame: <Flame className="w-6 h-6" />,
  Globe: <Globe className="w-6 h-6" />,
  Target: <Target className="w-6 h-6" />,
  Moon: <Moon className="w-6 h-6" />,
  Sunrise: <Sunrise className="w-6 h-6" />,
  Brain: <Brain className="w-6 h-6" />,
};

const RARITY_COLORS = {
  common: 'from-slate-400 to-slate-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-amber-400 to-orange-500',
};

const RARITY_BG = {
  common: 'bg-slate-100 dark:bg-slate-800',
  rare: 'bg-blue-50 dark:bg-blue-900/30',
  epic: 'bg-purple-50 dark:bg-purple-900/30',
  legendary: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30',
};

const CATEGORY_TITLES: Record<string, string> = {
  milestone: '🏆 Milestones',
  streak: '🔥 Streaks',
  explorer: '🌍 Explorer',
  mastery: '🎯 Mastery',
  special: '✨ Special',
};

const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
  const progressPercent = Math.min((achievement.progress / achievement.requirement) * 100, 100);

  return (
    <div
      className={`relative rounded-xl p-4 border transition-all ${
        achievement.unlocked
          ? `${RARITY_BG[achievement.rarity]} border-transparent shadow-md`
          : 'bg-muted/30 border-border opacity-60'
      }`}
    >
      {/* Rarity indicator */}
      {achievement.unlocked && (
        <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-gradient-to-r ${RARITY_COLORS[achievement.rarity]}`} />
      )}

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`p-3 rounded-xl ${
            achievement.unlocked
              ? `bg-gradient-to-br ${RARITY_COLORS[achievement.rarity]} text-white`
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {achievement.unlocked ? ICON_MAP[achievement.icon] || <Trophy className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={`font-semibold ${achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
              {achievement.title}
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
              achievement.unlocked
                ? `bg-gradient-to-r ${RARITY_COLORS[achievement.rarity]} text-white`
                : 'bg-muted text-muted-foreground'
            }`}>
              {achievement.rarity}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{achievement.description}</p>
          
          {/* Progress */}
          {!achievement.unlocked && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{achievement.progress}/{achievement.requirement}</span>
              </div>
              <Progress value={progressPercent} className="h-1.5" />
            </div>
          )}

          {/* Unlock date */}
          {achievement.unlocked && achievement.unlockedAt && (
            <p className="text-xs text-muted-foreground mt-2">
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const Achievements = () => {
  const { toast } = useToast();
  const {
    achievements,
    totalPoints,
    isLoaded,
    getByCategory,
    unlockedCount,
    totalCount,
    checkAchievements,
    newlyUnlocked,
    clearNewlyUnlocked,
  } = useAchievements();
  const { preferences } = usePersonalization();
  const { behavior } = useHyperPersonalization();

  // Check achievements on mount
  useEffect(() => {
    if (isLoaded) {
      checkAchievements({
        totalTranslations: preferences.totalTranslations,
        streak: behavior.consecutiveDays,
        languagesUsed: behavior.uniqueLanguagesUsed,
      });
    }
  }, [isLoaded, preferences.totalTranslations, behavior.consecutiveDays, behavior.uniqueLanguagesUsed, checkAchievements]);

  // Show toast for newly unlocked achievements
  useEffect(() => {
    if (newlyUnlocked.length > 0) {
      newlyUnlocked.forEach(achievement => {
        toast({
          title: `🎉 Achievement Unlocked!`,
          description: `${achievement.title} - ${achievement.description}`,
        });
      });
      clearNewlyUnlocked();
    }
  }, [newlyUnlocked, clearNewlyUnlocked, toast]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Trophy className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  const categories = getByCategory;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-2xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold">Achievements</h1>
            <p className="text-muted-foreground text-sm">Collect badges as you learn</p>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-foreground">{unlockedCount}/{totalCount}</p>
              <p className="text-muted-foreground">Achievements Unlocked</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">{totalPoints}</p>
              <p className="text-muted-foreground">Total Points</p>
            </div>
          </div>
          <Progress value={(unlockedCount / totalCount) * 100} className="mt-4 h-2" />
        </div>

        {/* Achievement Categories */}
        {Object.entries(categories).map(([category, categoryAchievements]) => (
          <section key={category} className="space-y-4">
            <h2 className="text-lg font-semibold">{CATEGORY_TITLES[category] || category}</h2>
            <div className="space-y-3">
              {categoryAchievements
                .sort((a, b) => {
                  // Sort by unlocked first, then by requirement
                  if (a.unlocked && !b.unlocked) return -1;
                  if (!a.unlocked && b.unlocked) return 1;
                  return a.requirement - b.requirement;
                })
                .map(achievement => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
};

export default Achievements;
