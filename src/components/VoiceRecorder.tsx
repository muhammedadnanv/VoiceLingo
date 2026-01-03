import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Square } from 'lucide-react';

// Extend window with speech recognition types
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      [index: number]: { transcript: string };
      isFinal: boolean;
    };
  };
}

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  sourceLanguage: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscript,
  isListening,
  setIsListening,
  sourceLanguage,
}) => {
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        const recognitionInstance = new SpeechRecognitionAPI();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = sourceLanguage;

        recognitionInstance.onresult = (event) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            }
          }
          if (finalTranscript) {
            onTranscript(finalTranscript);
          }
        };

        recognitionInstance.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognitionInstance.onend = () => {
          if (isListening) {
            recognitionInstance.start();
          }
        };

        setRecognition(recognitionInstance);
      } else {
        setIsSupported(false);
      }
    }
  }, [sourceLanguage]);

  useEffect(() => {
    if (recognition) {
      recognition.lang = sourceLanguage;
    }
  }, [sourceLanguage, recognition]);

  const toggleListening = useCallback(() => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  }, [recognition, isListening, setIsListening]);

  if (!isSupported) {
    return (
      <div className="text-center p-4 bg-destructive/10 rounded-xl">
        <p className="text-destructive font-medium">
          Speech recognition is not supported in your browser.
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Please try Chrome, Edge, or Safari.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {isListening && (
          <>
            <div className="absolute inset-0 rounded-full gradient-hero opacity-30 animate-ping" />
            <div className="absolute inset-0 rounded-full gradient-hero opacity-20 scale-125 animate-pulse" />
          </>
        )}
        <Button
          variant="voice"
          size="voice"
          onClick={toggleListening}
          className={`relative z-10 ${isListening ? 'voice-pulse' : ''}`}
        >
          {isListening ? (
            <Square className="w-8 h-8 fill-current" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </Button>
      </div>
      <p className="text-muted-foreground font-medium">
        {isListening ? 'Listening... Tap to stop' : 'Tap to speak'}
      </p>
    </div>
  );
};

export default VoiceRecorder;
