import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, Copy, Check, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TranslationCardProps {
  originalText: string;
  translatedText: string;
  phonetic: string;
  targetLanguage: string;
  isLoading?: boolean;
}

const TranslationCard: React.FC<TranslationCardProps> = ({
  originalText,
  translatedText,
  phonetic,
  targetLanguage,
  isLoading = false,
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);

  const speakTranslation = () => {
    if (!translatedText || isSpeaking) return;

    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = targetLanguage;
    utterance.rate = 0.8;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthesis.speak(utterance);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Translation copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  if (!originalText && !isLoading) {
    return (
      <div className="bg-card rounded-2xl p-8 shadow-card border border-border text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <BookOpen className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground font-medium">
          Your translation will appear here
        </p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Start speaking to translate
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden slide-up">
      {/* Original text */}
      <div className="p-6 border-b border-border bg-muted/30">
        <p className="text-sm text-muted-foreground mb-1 font-medium">Original</p>
        <p className="text-foreground text-lg">
          {isLoading ? (
            <span className="inline-block w-32 h-6 bg-muted animate-pulse rounded" />
          ) : (
            originalText
          )}
        </p>
      </div>

      {/* Translated text */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground font-medium">Translation</p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={speakTranslation}
              disabled={!translatedText || isSpeaking}
              className={`h-8 w-8 ${isSpeaking ? 'text-primary' : ''}`}
            >
              <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={copyToClipboard}
              disabled={!translatedText}
              className="h-8 w-8"
            >
              {copied ? (
                <Check className="w-4 h-4 text-primary" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <p className="text-foreground text-xl font-semibold mb-4">
          {isLoading ? (
            <span className="inline-block w-48 h-7 bg-muted animate-pulse rounded" />
          ) : (
            translatedText
          )}
        </p>

        {/* Phonetic */}
        {(phonetic || isLoading) && (
          <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
            <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">
              Pronunciation Guide
            </p>
            <p className="text-foreground font-medium italic">
              {isLoading ? (
                <span className="inline-block w-40 h-5 bg-muted animate-pulse rounded" />
              ) : (
                `/${phonetic}/`
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationCard;
