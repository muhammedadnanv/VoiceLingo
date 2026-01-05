import React from 'react';
import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  days: number;
}

const StreakBadge: React.FC<StreakBadgeProps> = ({ days }) => {
  if (days < 2) return null;

  const getStreakColor = () => {
    if (days >= 30) return 'from-orange-500 to-red-500';
    if (days >= 14) return 'from-amber-500 to-orange-500';
    if (days >= 7) return 'from-yellow-500 to-amber-500';
    return 'from-primary to-primary-glow';
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r ${getStreakColor()} text-white text-sm font-semibold shadow-lg`}
    >
      <Flame className="w-4 h-4" />
      <span>{days} day streak</span>
    </div>
  );
};

export default StreakBadge;
