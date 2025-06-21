"use client";

import { useState, useEffect, useCallback } from 'react';
import { Provider } from 'koilib';
import * as kondor from 'kondor-js';

// Declare kondor on window object
declare global {
  interface Window {
    kondor?: {
      isKondor: boolean;
      getAccounts(): Promise<string[]>;
      signer: {
        prepareTransaction(transaction: unknown): Promise<unknown>;
        signTransaction(transaction: unknown): Promise<unknown>;
        sendTransaction(transaction: unknown): Promise<unknown>;
      };
      provider: {
        call(method: string, params?: unknown): Promise<unknown>;
        wait(txId: string, type?: string, timeout?: number): Promise<unknown>;
      };
    };
  }
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  isKondorInstalled: boolean;
  isConnecting: boolean;
  error: string | null;
}

export function useKondorWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    isKondorInstalled: false,
    isConnecting: false,
    error: null,
  });

  // Check if Kondor is installed
  const checkKondorInstallation = useCallback(() => {
    const isInstalled = typeof window !== 'undefined' && 
                       typeof kondor !== 'undefined' &&
                       typeof kondor.getAccounts === 'function';
    
    setWalletState(prev => ({
      ...prev,
      isKondorInstalled: isInstalled,
    }));
    
    return isInstalled;
  }, []);

  // Connect to Kondor wallet
  const connect = useCallback(async () => {
    if (!checkKondorInstallation()) {
      setWalletState(prev => ({
        ...prev,
        error: 'Kondor wallet not found. Please install the Kondor browser extension.',
      }));
      return;
    }

    setWalletState(prev => ({
      ...prev,
      isConnecting: true,
      error: null,
    }));

    try {
      const accounts = await kondor.getAccounts();
      
      if (accounts && accounts.length > 0) {
        setWalletState(prev => ({
          ...prev,
          isConnected: true,
          address: accounts[0].address,
          isConnecting: false,
          error: null,
        }));
      } else {
        setWalletState(prev => ({
          ...prev,
          isConnecting: false,
          error: 'No accounts found. Please check your Kondor wallet.',
        }));
      }
    } catch (error) {
      console.error('Failed to connect to Kondor:', error);
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Failed to connect to Kondor wallet',
      }));
    }
  }, [checkKondorInstallation]);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setWalletState({
      isConnected: false,
      address: null,
      isKondorInstalled: checkKondorInstallation(),
      isConnecting: false,
      error: null,
    });
  }, [checkKondorInstallation]);

  // Get Kondor provider for contract interactions
  const getKondorProvider = useCallback(() => {
    if (!walletState.isConnected) {
      throw new Error('Kondor wallet not connected');
    }

    // Use the working testnet RPC directly since harbinger-api.koinos.io is down
    return new Provider(['https://rpc.koinos-testnet.com']);
  }, [walletState.isConnected]);

  // Get Kondor signer for transactions  
  const getKondorSigner = useCallback(async () => {
    if (!walletState.isConnected || !walletState.address) {
      throw new Error('Kondor wallet not connected');
    }

    try {
      // Get signer for testnet  
      return kondor.getSigner(walletState.address);
    } catch (error) {
      console.error('Error getting Kondor signer:', error);
      throw error;
    }
  }, [walletState.isConnected, walletState.address]);

  // Sign and send transaction using Kondor
  const signAndSendTransaction = useCallback(async (transaction: unknown) => {
    if (!walletState.isConnected || !walletState.address) {
      throw new Error('Kondor wallet not available');
    }

    try {
      const signer = await getKondorSigner();
      
      // Use Kondor's transaction signing
      const result = await signer.sendTransaction(transaction as Record<string, unknown>);
      
      return result;
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }, [walletState.isConnected, walletState.address, getKondorSigner, getKondorProvider]);

  // Initialize on mount
  useEffect(() => {
    checkKondorInstallation();
  }, [checkKondorInstallation]);

  return {
    ...walletState,
    connect,
    disconnect,
    getKondorProvider,
    getKondorSigner,
    signAndSendTransaction,
    checkKondorInstallation,
  };
} 