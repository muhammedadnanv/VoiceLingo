import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

const DonateButton: React.FC = () => {
  return (
    <Button
      variant="donate"
      size="lg"
      asChild
      className="gap-2"
    >
      <a
        href="https://razorpay.me/@adnan4402"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Heart className="w-5 h-5" />
        <span>Support VoiceLingo</span>
      </a>
    </Button>
  );
};

export default DonateButton;
