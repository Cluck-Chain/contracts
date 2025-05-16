'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { getProvider, getCurrentUserAddress, isUserAuthority } from './contract';

interface WalletContextType {
  account: string | null;
  isConnected: boolean;
  isAuthority: boolean;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthority, setIsAuthority] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Connect wallet
  const connect = async () => {
    if (connecting) return;
    
    setConnecting(true);
    setError(null);
    
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        // Request user to connect wallet
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const address = await getCurrentUserAddress();
        const authority = await isUserAuthority();
        
        setAccount(address);
        setIsConnected(true);
        setIsAuthority(authority);
      } else {
        throw new Error('Please install MetaMask or another Ethereum wallet');
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError(err instanceof Error ? err.message : 'Error connecting wallet');
    } finally {
      setConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    setAccount(null);
    setIsConnected(false);
    setIsAuthority(false);
  };

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected
          disconnect();
        } else if (accounts[0] !== account) {
          // Account has changed
          setAccount(accounts[0]);
          setIsConnected(true);
          
          // Check new account permissions
          try {
            const authority = await isUserAuthority();
            setIsAuthority(authority);
          } catch (err) {
            console.error('Error checking permissions:', err);
          }
        }
      };

      const handleChainChanged = () => {
        // When chain changes, we need to refresh the page
        window.location.reload();
      };

      // Subscribe to events
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Check if already connected
      if (window.ethereum.selectedAddress) {
        connect();
      }

      // Cleanup function
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [account]);

  const value = {
    account,
    isConnected,
    isAuthority,
    connecting,
    error,
    connect,
    disconnect
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
} 