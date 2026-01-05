import React from 'react';
import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen, Trophy } from 'lucide-react';
import type { LearningLevel } from '@/hooks/useHyperPersonalization';

interface LevelSelectorProps {
  currentLevel: LearningLevel;
  onSelectLevel: (level: LearningLevel) => void;
  onComplete: () => void;
}

const LevelSelector: React.FC<LevelSelectorProps> = ({ currentLevel, onSelectLevel, onComplete }) => {
  const levels = [
    {
      id: 'beginner' as LearningLevel,
      title: 'Beginner',
      description: 'Just starting out with language learning',
      icon: BookOpen,
      features: ['Simple interface', 'Helpful hints', 'Basic phrases'],
    },
    {
      id: 'intermediate' as LearningLevel,
      title: 'Intermediate',
      description: 'Comfortable with basic conversations',
      icon: GraduationCap,
      features: ['Standard features', 'Progress tracking', 'Full sentences'],
    },
    {
      id: 'advanced' as LearningLevel,
      title: 'Advanced',
      description: 'Confident in multiple languages',
      icon: Trophy,
      features: ['All features', 'Detailed stats', 'Complex phrases'],
    },
  ];

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-elevated border border-border max-w-lg w-full p-6 slide-up">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-display font-bold text-foreground">Welcome to VoiceLingo!</h2>
          <p className="text-muted-foreground mt-2">
            Choose your learning level so we can personalize your experience.
          </p>
        </div>

        <div className="space-y-3">
          {levels.map((level) => {
            const Icon = level.icon;
            const isSelected = currentLevel === level.id;

            return (
              <button
                key={level.id}
                onClick={() => onSelectLevel(level.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{level.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{level.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {level.features.map((feature) => (
                        <span
                          key={feature}
                          className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <Button
          onClick={onComplete}
          className="w-full mt-6 gradient-primary text-primary-foreground shadow-primary"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default LevelSelector;
