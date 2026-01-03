import React from 'react';

interface VoiceLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const VoiceLogo: React.FC<VoiceLogoProps> = ({ className = '', size = 'md' }) => {
  const sizes = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizes[size]} aspect-square relative`}>
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
          {/* Background circle */}
          <circle cx="24" cy="24" r="22" className="fill-primary" />
          
          {/* Voice waves */}
          <g className="fill-primary-foreground">
            <rect x="14" y="18" width="3" height="12" rx="1.5" className="wave-animation" style={{ animationDelay: '0s' }} />
            <rect x="20" y="14" width="3" height="20" rx="1.5" className="wave-animation" style={{ animationDelay: '0.2s' }} />
            <rect x="26" y="16" width="3" height="16" rx="1.5" className="wave-animation" style={{ animationDelay: '0.4s' }} />
            <rect x="32" y="20" width="3" height="8" rx="1.5" className="wave-animation" style={{ animationDelay: '0.6s' }} />
          </g>
        </svg>
      </div>
      <span className={`font-display font-bold ${size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-xl' : 'text-lg'}`}>
        <span className="text-primary">Voice</span>
        <span className="text-secondary">Lingo</span>
      </span>
    </div>
  );
};

export default VoiceLogo;
