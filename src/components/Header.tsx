import React from 'react';
import VoiceLogo from './VoiceLogo';
import DonateButton from './DonateButton';

const Header: React.FC = () => {
  return (
    <header className="w-full py-4 px-6 flex items-center justify-between bg-card/80 backdrop-blur-lg border-b border-border sticky top-0 z-50">
      <VoiceLogo size="md" />
      <DonateButton />
    </header>
  );
};

export default Header;
