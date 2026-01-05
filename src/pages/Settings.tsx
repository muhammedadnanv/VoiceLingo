import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { usePersonalization } from '@/hooks/usePersonalization';
import { useHyperPersonalization, LearningLevel } from '@/hooks/useHyperPersonalization';
import { ArrowLeft, Target, GraduationCap, BookOpen, Trophy, Volume2, Bell, Trash2 } from 'lucide-react';

const Settings = () => {
  const { toast } = useToast();
  const { preferences, clearHistory } = usePersonalization();
  const {
    learningLevel,
    updateLearningLevel,
    isLoaded,
  } = useHyperPersonalization();

  const [dailyGoal, setDailyGoal] = useState(preferences.dailyGoal);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    setDailyGoal(preferences.dailyGoal);
  }, [preferences.dailyGoal]);

  const handleSaveDailyGoal = () => {
    // Update preferences through localStorage directly since hook may not expose this
    const stored = localStorage.getItem('voicelingo_preferences');
    if (stored) {
      const prefs = JSON.parse(stored);
      prefs.dailyGoal = dailyGoal;
      localStorage.setItem('voicelingo_preferences', JSON.stringify(prefs));
    }
    toast({
      title: "Goal Updated",
      description: `Your daily goal is now ${dailyGoal} translations.`,
    });
  };

  const handleClearAllData = () => {
    if (confirm('Are you sure? This will clear all your progress, history, and achievements.')) {
      localStorage.clear();
      toast({
        title: "Data Cleared",
        description: "All your data has been reset.",
      });
      window.location.reload();
    }
  };

  const levels: { id: LearningLevel; title: string; description: string; icon: React.ReactNode }[] = [
    { id: 'beginner', title: 'Beginner', description: 'Simple UI with helpful hints', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'intermediate', title: 'Intermediate', description: 'Standard features unlocked', icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'advanced', title: 'Advanced', description: 'All features and detailed stats', icon: <Trophy className="w-5 h-5" /> },
  ];

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-display font-bold">Settings</h1>
        </div>

        {/* Learning Level */}
        <section className="bg-card rounded-2xl p-6 shadow-card border border-border space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Learning Level
          </h2>
          <p className="text-sm text-muted-foreground">
            Adjust your experience based on your proficiency.
          </p>
          
          <div className="space-y-3 mt-4">
            {levels.map((level) => (
              <button
                key={level.id}
                onClick={() => {
                  updateLearningLevel(level.id);
                  toast({
                    title: "Level Updated",
                    description: `You're now set to ${level.title} mode.`,
                  });
                }}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                  learningLevel === level.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className={`p-2 rounded-lg ${learningLevel === level.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {level.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{level.title}</h3>
                  <p className="text-sm text-muted-foreground">{level.description}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Daily Goal */}
        <section className="bg-card rounded-2xl p-6 shadow-card border border-border space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Daily Translation Goal
          </h2>
          <p className="text-sm text-muted-foreground">
            Set how many translations you want to complete each day.
          </p>
          
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Translations per day</span>
              <span className="text-2xl font-bold text-primary">{dailyGoal}</span>
            </div>
            <Slider
              value={[dailyGoal]}
              onValueChange={(value) => setDailyGoal(value[0])}
              min={5}
              max={50}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 (Casual)</span>
              <span>25 (Regular)</span>
              <span>50 (Intensive)</span>
            </div>
            <Button onClick={handleSaveDailyGoal} className="w-full">
              Save Goal
            </Button>
          </div>
        </section>

        {/* Preferences */}
        <section className="bg-card rounded-2xl p-6 shadow-card border border-border space-y-4">
          <h2 className="text-lg font-semibold">Preferences</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label className="font-medium">Sound Effects</Label>
                  <p className="text-sm text-muted-foreground">Play sounds for actions</p>
                </div>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div>
                  <Label className="font-medium">Practice Reminders</Label>
                  <p className="text-sm text-muted-foreground">Get reminded to practice</p>
                </div>
              </div>
              <Switch checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="bg-card rounded-2xl p-6 shadow-card border border-border">
          <h2 className="text-lg font-semibold mb-4">Your Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-primary">{preferences.totalTranslations}</p>
              <p className="text-sm text-muted-foreground">Total Translations</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-primary">{preferences.sessionCount}</p>
              <p className="text-sm text-muted-foreground">Sessions</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-primary">{preferences.recentLanguages.length}</p>
              <p className="text-sm text-muted-foreground">Languages Used</p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-primary">{preferences.translationHistory.length}</p>
              <p className="text-sm text-muted-foreground">History Items</p>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-destructive/5 border border-destructive/20 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-destructive flex items-center gap-2">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </h2>
          <p className="text-sm text-muted-foreground">
            These actions are irreversible. Please be certain.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => {
                clearHistory();
                toast({ title: "History Cleared", description: "Your translation history has been deleted." });
              }}
            >
              Clear History
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearAllData}
            >
              Reset All Data
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Settings;
