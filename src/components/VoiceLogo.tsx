import React from 'react';

interface VoiceLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

const VoiceLogo: React.FC<VoiceLogoProps> = ({ className = '', size = 'md', showText = true }) => {
  const sizes = {
    sm: 'h-9',
    md: 'h-11',
    lg: 'h-14',
    xl: 'h-20',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`${sizes[size]} aspect-square relative`}>
        <svg viewBox="0 0 56 56" fill="none" className="w-full h-full drop-shadow-lg">
          {/* Outer glow ring */}
          <circle 
            cx="28" 
            cy="28" 
            r="26" 
            className="fill-primary/10 glow-pulse" 
          />
          
          {/* Main circle with gradient */}
          <defs>
            <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(168 80% 42%)" />
              <stop offset="100%" stopColor="hsl(168 85% 55%)" />
            </linearGradient>
            <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(12 90% 62%)" />
              <stop offset="100%" stopColor="hsl(12 95% 72%)" />
            </linearGradient>
            <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
              <feOffset dx="0" dy="2" />
              <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" />
              <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.15 0" />
              <feBlend in2="SourceGraphic" />
            </filter>
          </defs>
          
          <circle 
            cx="28" 
            cy="28" 
            r="24" 
            fill="url(#brandGradient)"
            filter="url(#innerShadow)"
          />
          
          {/* Voice waves with stagger animation */}
          <g className="fill-primary-foreground">
            <rect 
              x="15" 
              y="21" 
              width="3.5" 
              height="14" 
              rx="1.75" 
              className="wave-animation opacity-90" 
              style={{ animationDelay: '0s' }} 
            />
            <rect 
              x="22" 
              y="16" 
              width="3.5" 
              height="24" 
              rx="1.75" 
              className="wave-animation" 
              style={{ animationDelay: '0.15s' }} 
            />
            <rect 
              x="29" 
              y="19" 
              width="3.5" 
              height="18" 
              rx="1.75" 
              className="wave-animation" 
              style={{ animationDelay: '0.3s' }} 
            />
            <rect 
              x="36" 
              y="23" 
              width="3.5" 
              height="10" 
              rx="1.75" 
              className="wave-animation opacity-80" 
              style={{ animationDelay: '0.45s' }} 
            />
          </g>
          
          {/* Accent dot */}
          <circle 
            cx="44" 
            cy="12" 
            r="5" 
            fill="url(#accentGradient)"
            className="animate-bounce-gentle"
          />
        </svg>
      </div>
      
      {showText && (
        <span className={`font-display font-bold tracking-tight ${textSizes[size]}`}>
          <span className="text-gradient-brand">Voice</span>
          <span className="text-secondary">Lingo</span>
        </span>
      )}
    </div>
  );
};

export default VoiceLogo;
