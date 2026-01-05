import React from 'react';
import { X, Sparkles, Languages, Target, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Recommendation } from '@/hooks/useHyperPersonalization';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onDismiss: (id: string) => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, onDismiss }) => {
  const getIcon = () => {
    switch (recommendation.type) {
      case 'language':
        return <Languages className="w-4 h-4" />;
      case 'goal':
        return <Target className="w-4 h-4" />;
      case 'practice':
        return <BookOpen className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getAccentColor = () => {
    switch (recommendation.type) {
      case 'language':
        return 'bg-accent/10 border-accent/20 text-accent';
      case 'goal':
        return 'bg-secondary/10 border-secondary/20 text-secondary';
      case 'practice':
        return 'bg-primary/10 border-primary/20 text-primary';
      default:
        return 'bg-muted border-border text-foreground';
    }
  };

  const recommendationId = `${recommendation.type}_${recommendation.title.toLowerCase().replace(/\s+/g, '_')}`;

  return (
    <div className={`${getAccentColor()} border rounded-xl p-4 slide-up`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg shrink-0 ${recommendation.type === 'language' ? 'bg-accent/20' : recommendation.type === 'goal' ? 'bg-secondary/20' : 'bg-primary/20'}`}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground text-sm">{recommendation.title}</h4>
          <p className="text-muted-foreground text-sm mt-1">{recommendation.description}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => onDismiss(recommendationId)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default RecommendationCard;
