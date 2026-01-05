import React from 'react';
import { X, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ContextualTip as TipType } from '@/hooks/useHyperPersonalization';

interface ContextualTipProps {
  tip: TipType;
  onDismiss: (tipId: string) => void;
}

const ContextualTip: React.FC<ContextualTipProps> = ({ tip, onDismiss }) => {
  return (
    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 slide-up">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/20 rounded-lg shrink-0">
          <Lightbulb className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-foreground text-sm">{tip.title}</h4>
          <p className="text-muted-foreground text-sm mt-1">{tip.message}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => onDismiss(tip.id)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ContextualTip;
