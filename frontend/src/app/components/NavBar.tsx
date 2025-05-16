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
    { id: 'farm', name: '农场管理' },
    { id: 'authority', name: '认证中心' },
    { id: 'tracker', name: '鸡蛋追踪' },
  ];

  return (
    <div className={styles.navbar}>
      <div className={styles.navbarBrand}>
        <h1>区块链农场系统</h1>
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
            title="点击断开连接"
          >
            {formatAddress(walletAddress)}
          </Button>
        ) : (
          <Button 
            onClick={onConnectWallet} 
            disabled={isConnecting}
            loadingText="连接中..."
            isLoading={isConnecting}
          >
            连接钱包
          </Button>
        )}
      </div>
    </div>
  );
} 