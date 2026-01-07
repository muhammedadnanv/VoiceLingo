import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import VoiceLogo from './VoiceLogo';
import { Button } from '@/components/ui/button';
import { Settings, Trophy, BookOpen, Home } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 gradient-glass border-b border-border/50">
      <div className="container max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <VoiceLogo size="sm" />
        </Link>

        <nav className="flex items-center gap-1">
          <Button
            variant={isActive('/') ? 'default' : 'ghost'}
            size="sm"
            asChild
            className={`hidden sm:flex transition-all duration-200 ${
              isActive('/') ? 'shadow-brand' : 'hover:bg-primary/10'
            }`}
          >
            <Link to="/">
              <Home className="w-4 h-4 mr-1.5" />
              Home
            </Link>
          </Button>
          
          <Button
            variant={isActive('/practice') ? 'default' : 'ghost'}
            size="sm"
            asChild
            className={`transition-all duration-200 ${
              isActive('/practice') ? 'shadow-brand' : 'hover:bg-primary/10'
            }`}
          >
            <Link to="/practice">
              <BookOpen className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Practice</span>
            </Link>
          </Button>
          
          <Button
            variant={isActive('/achievements') ? 'default' : 'ghost'}
            size="sm"
            asChild
            className={`transition-all duration-200 ${
              isActive('/achievements') ? 'shadow-brand' : 'hover:bg-primary/10'
            }`}
          >
            <Link to="/achievements">
              <Trophy className="w-4 h-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Badges</span>
            </Link>
          </Button>
          
          <Button
            variant={isActive('/settings') ? 'default' : 'ghost'}
            size="icon"
            asChild
            className={`transition-all duration-200 ${
              isActive('/settings') ? 'shadow-brand' : 'hover:bg-primary/10'
            }`}
          >
            <Link to="/settings">
              <Settings className="w-4 h-4" />
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
