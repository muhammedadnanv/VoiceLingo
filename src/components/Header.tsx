import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import VoiceLogo from './VoiceLogo';
import { Button } from '@/components/ui/button';
import { Settings, Trophy, BookOpen, Home } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <VoiceLogo size="sm" />
        </Link>

        <nav className="flex items-center gap-1">
          <Button
            variant={isActive('/') ? 'secondary' : 'ghost'}
            size="sm"
            asChild
            className="hidden sm:flex"
          >
            <Link to="/">
              <Home className="w-4 h-4 mr-1" />
              Home
            </Link>
          </Button>
          
          <Button
            variant={isActive('/practice') ? 'secondary' : 'ghost'}
            size="sm"
            asChild
          >
            <Link to="/practice">
              <BookOpen className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Practice</span>
            </Link>
          </Button>
          
          <Button
            variant={isActive('/achievements') ? 'secondary' : 'ghost'}
            size="sm"
            asChild
          >
            <Link to="/achievements">
              <Trophy className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Badges</span>
            </Link>
          </Button>
          
          <Button
            variant={isActive('/settings') ? 'secondary' : 'ghost'}
            size="icon"
            asChild
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
