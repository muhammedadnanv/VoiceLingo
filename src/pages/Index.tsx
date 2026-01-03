import React, { useState, useCallback } from 'react';
import Header from '@/components/Header';
import VoiceLogo from '@/components/VoiceLogo';
import LanguageSelector from '@/components/LanguageSelector';
import VoiceRecorder from '@/components/VoiceRecorder';
import TranslationCard from '@/components/TranslationCard';
import WaveVisualizer from '@/components/WaveVisualizer';
import HistoryPanel, { HistoryItem } from '@/components/HistoryPanel';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { usePersonalization } from '@/hooks/usePersonalization';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const { translate, isLoading } = useTranslation();
  const {
    preferences,
    isLoaded,
    setSourceLanguage,
    setTargetLanguage,
    incrementTranslations,
    getWelcomeMessage,
  } = usePersonalization();

  const [isListening, setIsListening] = useState(false);
  const [originalText, setOriginalText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const handleTranscript = useCallback(
    async (text: string) => {
      setOriginalText(text);
      
      const result = await translate(text, preferences.sourceLanguage, preferences.targetLanguage);
      
      if (result) {
        setTranslatedText(result.translatedText);
        setPhonetic(result.phonetic);
        incrementTranslations();

        // Add to history
        const historyItem: HistoryItem = {
          id: Date.now().toString(),
          original: text,
          translated: result.translatedText,
          phonetic: result.phonetic,
          sourceLang: preferences.sourceLanguage,
          targetLang: preferences.targetLanguage,
          timestamp: new Date(),
        };
        setHistory(prev => [historyItem, ...prev.slice(0, 9)]);
      }
    },
    [preferences.sourceLanguage, preferences.targetLanguage, translate, incrementTranslations]
  );

  const swapLanguages = () => {
    const temp = preferences.sourceLanguage;
    setSourceLanguage(preferences.targetLanguage);
    setTargetLanguage(temp);
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
  };

  const clearHistory = () => {
    setHistory([]);
    toast({
      title: "History cleared",
      description: "Your translation history has been cleared.",
    });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <VoiceLogo size="lg" className="animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <section className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>{getWelcomeMessage()}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold">
            Speak & <span className="text-gradient">Learn</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Translate your voice instantly with pronunciation guides to help you speak like a native.
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
        </section>

        {/* Translation Result */}
        <TranslationCard
          originalText={originalText}
          translatedText={translatedText}
          phonetic={phonetic}
          targetLanguage={preferences.targetLanguage}
          isLoading={isLoading}
        />

        {/* History */}
        <HistoryPanel
          history={history}
          onClear={clearHistory}
          onSpeak={handleSpeak}
        />

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
