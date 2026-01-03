import React from 'react';

interface WaveVisualizerProps {
  isActive: boolean;
}

const WaveVisualizer: React.FC<WaveVisualizerProps> = ({ isActive }) => {
  const bars = 12;

  return (
    <div className="flex items-center justify-center gap-1 h-16">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full transition-all duration-150 ${
            isActive ? 'bg-primary' : 'bg-muted'
          }`}
          style={{
            height: isActive ? `${Math.random() * 100}%` : '20%',
            minHeight: '8px',
            animation: isActive
              ? `wave 0.5s ease-in-out infinite alternate`
              : 'none',
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
};

export default WaveVisualizer;
