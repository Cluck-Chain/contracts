"use client";
import { Button } from './shared/Button';
import { formatAddress } from '../utils/format';
import styles from '../page.module.css';

interface NavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isWalletConnected: boolean;
  walletAddress: string;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  isConnecting: boolean;
}

export default function NavBar({
  activeTab,
  onTabChange,
  isWalletConnected,
  walletAddress,
  onConnectWallet,
  onDisconnectWallet,
  isConnecting
}: NavBarProps) {
  const tabs = [
    { id: 'farm', name: 'Farm Management' },
    { id: 'authority', name: 'Authority Center' },
    { id: 'tracker', name: 'Egg Tracking' },
  ];

  return (
    <div className={styles.navbar}>
      <div className={styles.navbarBrand}>
        <h1>Blockchain Farm System</h1>
      </div>
      
      <div className={styles.navbarTabs}>
        {tabs.map(tab => (
          <button 
            key={tab.id} 
            className={`${styles.navbarTab} ${activeTab === tab.id ? styles.navbarTabActive : ''}`} 
            onClick={() => onTabChange(tab.id)}
          >
            {tab.name}
          </button>
        ))}
      </div>
      
      <div className={styles.navbarWallet}>
        {isWalletConnected ? (
          <Button 
            onClick={onDisconnectWallet}
            className={styles.connectedWallet}
            title="Click to disconnect"
          >
            {formatAddress(walletAddress)}
          </Button>
        ) : (
          <Button 
            onClick={onConnectWallet} 
            disabled={isConnecting}
            loadingText="Connecting..."
            isLoading={isConnecting}
          >
            Connect Wallet
          </Button>
        )}
      </div>
    </div>
  );
} 