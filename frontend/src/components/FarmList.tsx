'use client';

import React, { useEffect } from 'react';
import { useFarm } from '../utils/FarmContext';
import { useWallet } from '../utils/WalletContext';

export function FarmList() {
  const { isConnected } = useWallet();
  const { farms, selectedFarm, loading, selectFarm, loadFarms } = useFarm();

  useEffect(() => {
    if (isConnected) {
      loadFarms();
    }
  }, [isConnected, loadFarms]);

  if (!isConnected) {
    return <p>Please connect your wallet to view your farms</p>;
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (farms.length === 0) {
    return <p>You haven't created any farms yet</p>;
  }

  return (
    <div className="farm-list">
      <h2>Your Farms</h2>
      
      <div className="farms">
        {farms.map((farm) => (
          <div 
            key={farm.address} 
            className={`farm-card ${selectedFarm?.address === farm.address ? 'selected' : ''}`}
            onClick={() => selectFarm(farm.address)}
          >
            <h3>{farm.name}</h3>
            <p className="address">Address: {farm.address.slice(0, 8)}...{farm.address.slice(-6)}</p>
            <div className="stats">
              <div className="stat">
                <span className="label">Chickens:</span>
                <span className="value">{farm.chickenCount}</span>
              </div>
              <div className="stat">
                <span className="label">Eggs:</span>
                <span className="value">{farm.eggCount}</span>
              </div>
            </div>
            <div className="status">
              {farm.isRegistered ? 
                <span className="registered">Registered</span> : 
                <span className="unregistered">Unregistered</span>
              }
            </div>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .farm-list {
          margin-top: 32px;
        }
        
        h2 {
          margin-top: 0;
          color: #2c3e50;
        }
        
        .farms {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        
        .farm-card {
          padding: 20px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .farm-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        .farm-card.selected {
          border: 2px solid #3498db;
        }
        
        .farm-card h3 {
          margin-top: 0;
          margin-bottom: 8px;
          color: #2c3e50;
        }
        
        .address {
          color: #7f8c8d;
          font-family: monospace;
          font-size: 0.9rem;
          margin-bottom: 16px;
        }
        
        .stats {
          display: flex;
          gap: 20px;
          margin-bottom: 16px;
        }
        
        .stat {
          display: flex;
          flex-direction: column;
        }
        
        .label {
          font-size: 0.9rem;
          color: #7f8c8d;
        }
        
        .value {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2c3e50;
        }
        
        .status {
          margin-top: 16px;
        }
        
        .registered, .unregistered {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.9rem;
        }
        
        .registered {
          background-color: #2ecc71;
          color: white;
        }
        
        .unregistered {
          background-color: #e74c3c;
          color: white;
        }
      `}</style>
    </div>
  );
} 