'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from './WalletContext';
import { 
  getAuthorityCenterWithSigner, 
  getAuthorityCenterContract,
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

  // 添加新的权限持有者
  const addAuthority = async (address: string) => {
    if (!isConnected || !isAuthority) {
      setError('需要权限中心权限');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const authorityCenterWithSigner = await getAuthorityCenterWithSigner();
      const tx = await authorityCenterWithSigner.addAuthority(address);
      await tx.wait();
    } catch (err) {
      console.error('添加权限出错:', err);
      setError(err instanceof Error ? err.message : '添加权限时出错');
    } finally {
      setLoading(false);
    }
  };

  // 移除权限持有者
  const removeAuthority = async (address: string) => {
    if (!isConnected || !isAuthority) {
      setError('需要权限中心权限');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const authorityCenterWithSigner = await getAuthorityCenterWithSigner();
      const tx = await authorityCenterWithSigner.removeAuthority(address);
      await tx.wait();
    } catch (err) {
      console.error('移除权限出错:', err);
      setError(err instanceof Error ? err.message : '移除权限时出错');
    } finally {
      setLoading(false);
    }
  };

  // 注册农场
  const registerFarm = async (farmAddress: string) => {
    if (!isConnected || !isAuthority) {
      setError('需要权限中心权限');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const authorityCenterWithSigner = await getAuthorityCenterWithSigner();
      const tx = await authorityCenterWithSigner.registerFarm(farmAddress);
      await tx.wait();
    } catch (err) {
      console.error('注册农场出错:', err);
      setError(err instanceof Error ? err.message : '注册农场时出错');
    } finally {
      setLoading(false);
    }
  };

  // 移除农场
  const removeFarm = async (farmAddress: string) => {
    if (!isConnected || !isAuthority) {
      setError('需要权限中心权限');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const authorityCenterWithSigner = await getAuthorityCenterWithSigner();
      const tx = await authorityCenterWithSigner.removeFarm(farmAddress);
      await tx.wait();
    } catch (err) {
      console.error('移除农场出错:', err);
      setError(err instanceof Error ? err.message : '移除农场时出错');
    } finally {
      setLoading(false);
    }
  };

  // 检查农场是否已注册
  const checkFarmRegistration = async (farmAddress: string): Promise<boolean> => {
    if (!isConnected) return false;
    
    try {
      return await isFarmRegistered(farmAddress);
    } catch (err) {
      console.error('检查农场注册状态出错:', err);
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