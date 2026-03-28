import React from 'react';
import { PortfolioPage } from '@/components/ui/starfall-portfolio-landing';

const defaultData = {
  logo: { initials: 'SL', name: 'Scholar Ledger' },
  hero: {
    titleLine1: 'Tokenized Academic',
    titleLine2Gradient: 'Credentials',
    subtitle: 'A demo configuration for the starfall landing component.',
  },
  ctaButtons: {
    primary: { label: 'Public Verify', onClick: undefined },
    secondary: { label: 'Dashboard', onClick: undefined },
  },
  stats: [
    { value: 'Immutable', label: 'Ledger-backed Proofs' },
    { value: 'Role-Aware', label: 'Admin and Issuer Controls' },
    { value: 'Global', label: 'Open Public Verification' },
  ],
};

const StarfallDemo = () => {
  return <PortfolioPage {...defaultData} showAnimatedBackground hideInternalNav />;
};

export { StarfallDemo };
