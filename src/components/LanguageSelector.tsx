import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
];

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ value, onChange, label }) => {
  const selectedLang = languages.find(l => l.code === value);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full h-12 bg-card border-2 border-border hover:border-primary/50 transition-colors rounded-xl">
          <SelectValue>
            {selectedLang && (
              <span className="flex items-center gap-2">
                <span className="text-lg">{selectedLang.flag}</span>
                <span className="font-medium">{selectedLang.name}</span>
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-card border-2 border-border rounded-xl">
          {languages.map((lang) => (
            <SelectItem 
              key={lang.code} 
              value={lang.code}
              className="cursor-pointer hover:bg-muted rounded-lg"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export { languages };
export default LanguageSelector;
