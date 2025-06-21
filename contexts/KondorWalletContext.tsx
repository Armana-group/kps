"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useKondorWallet, WalletState } from '@/hooks/useKondorWallet';

interface KondorWalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  getKondorProvider: () => unknown;
  getKondorSigner: () => Promise<unknown>;
  signAndSendTransaction: (transaction: unknown) => Promise<unknown>;
  checkKondorInstallation: () => boolean;
}

const KondorWalletContext = createContext<KondorWalletContextType | undefined>(undefined);

interface KondorWalletProviderProps {
  children: ReactNode;
}

export function KondorWalletProvider({ children }: KondorWalletProviderProps) {
  const walletState = useKondorWallet();

  return (
    <KondorWalletContext.Provider value={walletState}>
      {children}
    </KondorWalletContext.Provider>
  );
}

export function useKondorWalletContext() {
  const context = useContext(KondorWalletContext);
  if (context === undefined) {
    throw new Error('useKondorWalletContext must be used within a KondorWalletProvider');
  }
  return context;
} 