'use client';

import React from 'react';
import { useWallet } from '../utils/WalletContext';

export function WalletConnect() {
  const { account, isConnected, connecting, error, connect, disconnect } = useWallet();

  return (
    <div className="wallet-connect">
      {!isConnected ? (
        <button 
          onClick={connect} 
          disabled={connecting}
          className="connect-button"
        >
          {connecting ? '连接中...' : '连接钱包'}
        </button>
      ) : (
        <div className="wallet-info">
          <span className="wallet-address">
            {account?.slice(0, 6)}...{account?.slice(-4)}
          </span>
          <button 
            onClick={disconnect}
            className="disconnect-button"
          >
            断开连接
          </button>
        </div>
      )}
      {error && <p className="error-message">{error}</p>}
      
      <style jsx>{`
        .wallet-connect {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        
        .connect-button, .disconnect-button {
          padding: 8px 16px;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .connect-button {
          background-color: #3498db;
          color: white;
          border: none;
        }
        
        .connect-button:hover {
          background-color: #2980b9;
        }
        
        .connect-button:disabled {
          background-color: #95a5a6;
          cursor: not-allowed;
        }
        
        .wallet-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .wallet-address {
          font-family: monospace;
          background-color: #f1f1f1;
          padding: 4px 8px;
          border-radius: 4px;
        }
        
        .disconnect-button {
          background-color: transparent;
          border: 1px solid #e74c3c;
          color: #e74c3c;
        }
        
        .disconnect-button:hover {
          background-color: #e74c3c;
          color: white;
        }
        
        .error-message {
          color: #e74c3c;
          font-size: 0.9rem;
          margin: 0;
        }
      `}</style>
    </div>
  );
} 