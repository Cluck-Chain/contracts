'use client';

import React, { useState } from 'react';
import { useFarm } from '../utils/FarmContext';
import { useAuthority } from '../utils/AuthorityContext';
import { useWallet } from '../utils/WalletContext';
import { ethers } from 'ethers';

export function CreateFarm() {
  const { isConnected, account } = useWallet();
  const { createFarm, loading, error } = useFarm();
  const { registerFarm } = useAuthority();
  
  const [name, setName] = useState('');
  const [metadataURI, setMetadataURI] = useState('');
  const [owner, setOwner] = useState('');
  const [ownerError, setOwnerError] = useState('');
  const [farmAddress, setFarmAddress] = useState<string | null>(null);
  const [showRegister, setShowRegister] = useState(false);

  const validateOwnerAddress = (address: string) => {
    if (!address) return true; // Allow empty, meaning to use current account
    
    if (!ethers.isAddress(address)) {
      setOwnerError('Please enter a valid Ethereum address');
      return false;
    }
    
    setOwnerError('');
    return true;
  };

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !metadataURI) return;
    
    // Validate owner address
    if (!validateOwnerAddress(owner)) return;
    
    try {
      // Pass owner address, use current account if empty
      await createFarm(name, metadataURI, owner || undefined);
      // Reset form
      setName('');
      setMetadataURI('');
      setOwner('');
    } catch (err) {
      console.error('Error creating farm:', err);
    }
  };

  const handleRegisterFarm = async (farmAddressToRegister: string) => {
    try {
      await registerFarm(farmAddressToRegister);
      setShowRegister(false);
      setFarmAddress(null);
    } catch (err) {
      console.error('Error registering farm:', err);
    }
  };

  if (!isConnected) {
    return <p>Please connect your wallet to create a farm</p>;
  }

  return (
    <div className="create-farm">
      <h2>Create New Farm</h2>
      
      <form onSubmit={handleCreateFarm}>
        <div className="form-group">
          <label htmlFor="farm-name">Farm Name</label>
          <input
            id="farm-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter farm name"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="farm-metadata">Metadata URI</label>
          <input
            id="farm-metadata"
            type="text"
            value={metadataURI}
            onChange={(e) => setMetadataURI(e.target.value)}
            placeholder="Enter metadata URI (e.g., IPFS address)"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="farm-owner">Farm Owner (Optional)</label>
          <input
            id="farm-owner"
            type="text"
            value={owner}
            onChange={(e) => {
              setOwner(e.target.value);
              validateOwnerAddress(e.target.value);
            }}
            placeholder={`Leave empty to use current account (${account?.slice(0, 6)}...${account?.slice(-4)})`}
          />
          {ownerError && <p className="field-error">{ownerError}</p>}
        </div>
        
        <button 
          type="submit" 
          disabled={loading || !name || !metadataURI || !!ownerError}
          className="create-button"
        >
          {loading ? 'Creating...' : 'Create Farm'}
        </button>
      </form>
      
      {error && <p className="error-message">{error}</p>}
      
      <div className="register-section">
        <h3>Register Existing Farm</h3>
        <p>If you have already created a farm contract, you can register it with the Authority</p>
        
        <div className="form-group">
          <label htmlFor="farm-address">Farm Contract Address</label>
          <input
            id="farm-address"
            type="text"
            value={farmAddress || ''}
            onChange={(e) => setFarmAddress(e.target.value)}
            placeholder="Enter farm contract address"
          />
        </div>
        
        <button 
          onClick={() => farmAddress && handleRegisterFarm(farmAddress)}
          disabled={!farmAddress || loading}
          className="register-button"
        >
          Register with Authority
        </button>
      </div>
      
      <style jsx>{`
        .create-farm {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9f9f9;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        h2, h3 {
          margin-top: 0;
          color: #2c3e50;
        }
        
        .form-group {
          margin-bottom: 16px;
        }
        
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }
        
        .create-button, .register-button {
          padding: 10px 16px;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .create-button {
          background-color: #2ecc71;
          color: white;
        }
        
        .create-button:hover {
          background-color: #27ae60;
        }
        
        .register-button {
          background-color: #3498db;
          color: white;
        }
        
        .register-button:hover {
          background-color: #2980b9;
        }
        
        button:disabled {
          background-color: #95a5a6;
          cursor: not-allowed;
        }
        
        .error-message {
          color: #e74c3c;
          margin-top: 16px;
        }
        
        .field-error {
          color: #e74c3c;
          margin-top: 4px;
          font-size: 14px;
        }
        
        .register-section {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #ddd;
        }
      `}</style>
    </div>
  );
} 