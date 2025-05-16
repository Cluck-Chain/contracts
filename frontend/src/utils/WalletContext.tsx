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

  // 连接钱包
  const connect = async () => {
    if (connecting) return;
    
    setConnecting(true);
    setError(null);
    
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        // 请求用户连接钱包
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const address = await getCurrentUserAddress();
        const authority = await isUserAuthority();
        
        setAccount(address);
        setIsConnected(true);
        setIsAuthority(authority);
      } else {
        throw new Error('请安装MetaMask或其他以太坊钱包');
      }
    } catch (err) {
      console.error('钱包连接错误:', err);
      setError(err instanceof Error ? err.message : '连接钱包时出错');
    } finally {
      setConnecting(false);
    }
  };

  // 断开钱包连接
  const disconnect = () => {
    setAccount(null);
    setIsConnected(false);
    setIsAuthority(false);
  };

  // 监听账户变化
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          // 用户断开了连接
          disconnect();
        } else if (accounts[0] !== account) {
          // 账户已更改
          setAccount(accounts[0]);
          setIsConnected(true);
          
          // 检查新账户的权限
          try {
            const authority = await isUserAuthority();
            setIsAuthority(authority);
          } catch (err) {
            console.error('检查权限时出错:', err);
          }
        }
      };

      const handleChainChanged = () => {
        // 当链改变时，我们需要刷新页面
        window.location.reload();
      };

      // 订阅事件
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // 检查是否已经连接
      if (window.ethereum.selectedAddress) {
        connect();
      }

      // 清理函数
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