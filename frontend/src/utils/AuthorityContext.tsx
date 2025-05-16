'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from './WalletContext';
import { 
  getAuthorityCenterWithSigner, 
  isFarmRegistered
} from './contract';

interface AuthorityContextType {
  loading: boolean;
  error: string | null;
  addAuthority: (address: string) => Promise<void>;
  removeAuthority: (address: string) => Promise<void>;
  registerFarm: (farmAddress: string) => Promise<void>;
  removeFarm: (farmAddress: string) => Promise<void>;
  checkFarmRegistration: (farmAddress: string) => Promise<boolean>;
}

const AuthorityContext = createContext<AuthorityContextType | undefined>(undefined);

export function AuthorityProvider({ children }: { children: ReactNode }) {
  const { isConnected, isAuthority } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add new authority holder
  const addAuthority = async (address: string) => {
    if (!isConnected || !isAuthority) {
      setError('Authority center permission required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const authorityCenterWithSigner = await getAuthorityCenterWithSigner();
      const tx = await authorityCenterWithSigner.addAuthority(address);
      await tx.wait();
    } catch (err) {
      console.error('Error adding authority:', err);
      setError(err instanceof Error ? err.message : 'Error adding authority');
    } finally {
      setLoading(false);
    }
  };

  // Remove authority holder
  const removeAuthority = async (address: string) => {
    if (!isConnected || !isAuthority) {
      setError('Authority center permission required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const authorityCenterWithSigner = await getAuthorityCenterWithSigner();
      const tx = await authorityCenterWithSigner.removeAuthority(address);
      await tx.wait();
    } catch (err) {
      console.error('Error removing authority:', err);
      setError(err instanceof Error ? err.message : 'Error removing authority');
    } finally {
      setLoading(false);
    }
  };

  // Register farm
  const registerFarm = async (farmAddress: string) => {
    if (!isConnected || !isAuthority) {
      setError('Authority center permission required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const authorityCenterWithSigner = await getAuthorityCenterWithSigner();
      const tx = await authorityCenterWithSigner.registerFarm(farmAddress);
      await tx.wait();
    } catch (err) {
      console.error('Error registering farm:', err);
      setError(err instanceof Error ? err.message : 'Error registering farm');
    } finally {
      setLoading(false);
    }
  };

  // Remove farm
  const removeFarm = async (farmAddress: string) => {
    if (!isConnected || !isAuthority) {
      setError('Authority center permission required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const authorityCenterWithSigner = await getAuthorityCenterWithSigner();
      const tx = await authorityCenterWithSigner.removeFarm(farmAddress);
      await tx.wait();
    } catch (err) {
      console.error('Error removing farm:', err);
      setError(err instanceof Error ? err.message : 'Error removing farm');
    } finally {
      setLoading(false);
    }
  };

  // Check if farm is registered
  const checkFarmRegistration = async (farmAddress: string): Promise<boolean> => {
    if (!isConnected) return false;
    
    try {
      return await isFarmRegistered(farmAddress);
    } catch (err) {
      console.error('Error checking farm registration status:', err);
      return false;
    }
  };

  const value = {
    loading,
    error,
    addAuthority,
    removeAuthority,
    registerFarm,
    removeFarm,
    checkFarmRegistration
  };

  return (
    <AuthorityContext.Provider value={value}>
      {children}
    </AuthorityContext.Provider>
  );
}

export function useAuthority() {
  const context = useContext(AuthorityContext);
  if (context === undefined) {
    throw new Error('useAuthority must be used within an AuthorityProvider');
  }
  return context;
} 