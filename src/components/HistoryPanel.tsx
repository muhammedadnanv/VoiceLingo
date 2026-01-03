import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Trash2, Volume2 } from 'lucide-react';

interface HistoryItem {
  id: string;
  original: string;
  translated: string;
  phonetic: string;
  sourceLang: string;
  targetLang: string;
  timestamp: Date;
}

interface HistoryPanelProps {
  history: HistoryItem[];
  onClear: () => void;
  onSpeak: (text: string, lang: string) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onClear, onSpeak }) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-foreground">Recent Translations</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground">
          <Trash2 className="w-4 h-4 mr-1" />
          Clear
        </Button>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {history.map((item) => (
          <div
            key={item.id}
            className="p-4 border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground truncate">{item.original}</p>
                <p className="text-foreground font-medium mt-1 truncate">{item.translated}</p>
                {item.phonetic && (
                  <p className="text-xs text-primary italic mt-0.5">/{item.phonetic}/</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => onSpeak(item.translated, item.targetLang)}
              >
                <Volume2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export type { HistoryItem };
export default HistoryPanel;
