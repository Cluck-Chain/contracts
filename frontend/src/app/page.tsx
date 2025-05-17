'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  getProvider, 
  getSigner,
  isUserAuthority
} from '../utils/contract';
import { useToast } from './hooks/useToast';

import NavBar from './components/NavBar';
import FarmComponent from './components/FarmComponent';
import AuthorityCenterComponent from './components/AuthorityCenterComponent';
import EggTrackingComponent from './components/EggTrackingComponent';
import RegisterNewFarm from './components/RegisterNewFarm';
import styles from './page.module.css';

// Authority center contract address - should be environment variable in production
const AUTHORITY_CENTER_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default function Home() {
  // Active tab
  const [activeTab, setActiveTab] = useState('farm'); // Default tab: farm, authority, tracker
  
  // Selected farm address for FarmComponent
  const [selectedFarmAddress, setSelectedFarmAddress] = useState('');
  
  // Wallet status
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthority, setIsAuthority] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize provider
  useEffect(() => {
    async function initProvider() {
      try {
        if (typeof window !== 'undefined' && window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);
          
          // Check if already connected
          try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
              await handleAccountConnection(accounts[0], provider);
            }
          } catch (err) {
            console.error("Failed to check initial connection status:", err);
          }
          
          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts: string[]) => {
            if (accounts.length === 0) {
              // User disconnected
              handleDisconnect();
            } else {
              handleAccountConnection(accounts[0], provider);
            }
          });
        }
      } catch (err) {
        console.error("Failed to initialize provider:", err);
        setError("Failed to connect to blockchain. Please ensure MetaMask is installed.");
      }
    }
    
    initProvider();
    
    // Cleanup listener
    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleDisconnect);
      }
    };
  }, []);
  
  // Handle account connection
  const handleAccountConnection = async (address: string, provider: ethers.BrowserProvider) => {
    setAccount(address);
    setIsConnected(true);
    
    // Check if user is an authority
    try {
      const authority = await isUserAuthority();
      setIsAuthority(authority);
    } catch (err) {
      console.error("Failed to check authority status:", err);
    }
  };
  
  // Connect wallet
  const connectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        setIsConnecting(true);
        setError(null);
        
        // Request user to connect wallet
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Handle the connection
        if (accounts.length > 0 && provider) {
          await handleAccountConnection(accounts[0], provider);
        }
      } else {
        setError("No Ethereum provider found. Please install MetaMask.");
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Disconnect wallet (local state only)
  const handleDisconnect = () => {
    setAccount(null);
    setIsConnected(false);
    setIsAuthority(false);
  };
  
  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Handle viewing farm from egg tracking
  const handleViewFarm = (farmAddress: string) => {
    setSelectedFarmAddress(farmAddress);
    setActiveTab('farm');
  };

  return (
    <div className={styles.page}>
      <NavBar 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        isWalletConnected={isConnected}
        walletAddress={account || ''}
        onConnectWallet={connectWallet}
        onDisconnectWallet={handleDisconnect}
        isConnecting={isConnecting}
      />
      
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
      
      <main className={styles.main}>
        {activeTab === 'farm' && (
          <FarmComponent provider={provider} farmAddress={selectedFarmAddress} />
        )}
        
        {activeTab === 'authority' && (
          <>
            <AuthorityCenterComponent 
              provider={provider} 
              authorityAddress={AUTHORITY_CENTER_ADDRESS} 
            />
            {isAuthority && (
              <RegisterNewFarm 
                provider={provider} 
                authorityAddress={AUTHORITY_CENTER_ADDRESS} 
              />
            )}
          </>
        )}
        
        {activeTab === 'tracker' && (
          <EggTrackingComponent 
            provider={provider} 
            onViewFarm={handleViewFarm}
          />
        )}
      </main>
      
      <footer className={styles.footer}>
        <p>Blockchain Farm Management System © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
} 