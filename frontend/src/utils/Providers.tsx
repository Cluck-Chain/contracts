'use client';

import React, { ReactNode } from 'react';
import { WalletProvider } from './WalletContext';
import { FarmProvider } from './FarmContext';
import { AuthorityProvider } from './AuthorityContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <WalletProvider>
      <AuthorityProvider>
        <FarmProvider>
          {children}
        </FarmProvider>
      </AuthorityProvider>
    </WalletProvider>
  );
} 