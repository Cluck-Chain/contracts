'use client';

import React, { useState } from 'react';
import { useAuthority } from '../utils/AuthorityContext';
import { useWallet } from '../utils/WalletContext';

export function AuthorityManager() {
  const { isConnected, isAuthority } = useWallet();
  const { addAuthority, removeAuthority, loading, error } = useAuthority();
  
  const [authorityAddress, setAuthorityAddress] = useState('');
  const [removeAddress, setRemoveAddress] = useState('');

  const handleAddAuthority = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorityAddress) return;
    
    try {
      await addAuthority(authorityAddress);
      setAuthorityAddress('');
    } catch (err) {
      console.error('Error adding authority:', err);
    }
  };

  const handleRemoveAuthority = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!removeAddress) return;
    
    try {
      await removeAuthority(removeAddress);
      setRemoveAddress('');
    } catch (err) {
      console.error('Error removing authority:', err);
    }
  };

  if (!isConnected) {
    return <p>Please connect your wallet first</p>;
  }

  if (!isAuthority) {
    return <p>You do not have permission to manage authorities</p>;
  }

  return (
    <div className="authority-manager">
      <h2>Authority Management</h2>
      
      <div className="authority-sections">
        <div className="section">
          <h3>Add Authority</h3>
          <form onSubmit={handleAddAuthority}>
            <div className="form-group">
              <label htmlFor="authority-address">Address</label>
              <input
                id="authority-address"
                type="text"
                value={authorityAddress}
                onChange={(e) => setAuthorityAddress(e.target.value)}
                placeholder="Enter address to add authority"
                required
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading || !authorityAddress}
              className="add-button"
            >
              {loading ? 'Adding...' : 'Add Authority'}
            </button>
          </form>
        </div>
        
        <div className="section">
          <h3>Remove Authority</h3>
          <form onSubmit={handleRemoveAuthority}>
            <div className="form-group">
              <label htmlFor="remove-address">Address</label>
              <input
                id="remove-address"
                type="text"
                value={removeAddress}
                onChange={(e) => setRemoveAddress(e.target.value)}
                placeholder="Enter address to remove authority"
                required
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading || !removeAddress}
              className="remove-button"
            >
              {loading ? 'Removing...' : 'Remove Authority'}
            </button>
          </form>
        </div>
      </div>
      
      {error && <p className="error-message">{error}</p>}
      
      <style jsx>{`
        .authority-manager {
          max-width: 1000px;
          margin: 32px auto;
          padding: 24px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        h2 {
          margin-top: 0;
          color: #2c3e50;
          margin-bottom: 24px;
        }
        
        h3 {
          margin-top: 0;
          color: #2c3e50;
          margin-bottom: 16px;
        }
        
        .authority-sections {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
        }
        
        .section {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 20px;
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
        
        .add-button, .remove-button {
          padding: 10px 16px;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
        }
        
        .add-button {
          background-color: #2ecc71;
          color: white;
        }
        
        .add-button:hover {
          background-color: #27ae60;
        }
        
        .remove-button {
          background-color: #e74c3c;
          color: white;
        }
        
        .remove-button:hover {
          background-color: #c0392b;
        }
        
        button:disabled {
          background-color: #95a5a6;
          cursor: not-allowed;
        }
        
        .error-message {
          color: #e74c3c;
          margin-top: 16px;
          text-align: center;
        }
      `}</style>
    </div>
  );
} 