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
    if (!address) return true; // 允许为空，表示使用当前账户
    
    if (!ethers.isAddress(address)) {
      setOwnerError('请输入有效的以太坊地址');
      return false;
    }
    
    setOwnerError('');
    return true;
  };

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !metadataURI) return;
    
    // 验证所有者地址
    if (!validateOwnerAddress(owner)) return;
    
    try {
      // 传递所有者地址，如果为空则使用当前账户
      await createFarm(name, metadataURI, owner || undefined);
      // 重置表单
      setName('');
      setMetadataURI('');
      setOwner('');
    } catch (err) {
      console.error('创建农场出错:', err);
    }
  };

  const handleRegisterFarm = async (farmAddressToRegister: string) => {
    try {
      await registerFarm(farmAddressToRegister);
      setShowRegister(false);
      setFarmAddress(null);
    } catch (err) {
      console.error('注册农场出错:', err);
    }
  };

  if (!isConnected) {
    return <p>请先连接钱包以创建农场</p>;
  }

  return (
    <div className="create-farm">
      <h2>创建新农场</h2>
      
      <form onSubmit={handleCreateFarm}>
        <div className="form-group">
          <label htmlFor="farm-name">农场名称</label>
          <input
            id="farm-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="输入农场名称"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="farm-metadata">元数据URI</label>
          <input
            id="farm-metadata"
            type="text"
            value={metadataURI}
            onChange={(e) => setMetadataURI(e.target.value)}
            placeholder="输入元数据URI (如IPFS地址)"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="farm-owner">农场所有者（可选）</label>
          <input
            id="farm-owner"
            type="text"
            value={owner}
            onChange={(e) => {
              setOwner(e.target.value);
              validateOwnerAddress(e.target.value);
            }}
            placeholder={`留空使用当前账户 (${account?.slice(0, 6)}...${account?.slice(-4)})`}
          />
          {ownerError && <p className="field-error">{ownerError}</p>}
        </div>
        
        <button 
          type="submit" 
          disabled={loading || !name || !metadataURI || !!ownerError}
          className="create-button"
        >
          {loading ? '创建中...' : '创建农场'}
        </button>
      </form>
      
      {error && <p className="error-message">{error}</p>}
      
      <div className="register-section">
        <h3>注册现有农场</h3>
        <p>如果您已经创建了农场合约，可以将其注册到Authority中</p>
        
        <div className="form-group">
          <label htmlFor="farm-address">农场合约地址</label>
          <input
            id="farm-address"
            type="text"
            value={farmAddress || ''}
            onChange={(e) => setFarmAddress(e.target.value)}
            placeholder="输入农场合约地址"
          />
        </div>
        
        <button 
          onClick={() => farmAddress && handleRegisterFarm(farmAddress)}
          disabled={!farmAddress || loading}
          className="register-button"
        >
          注册到Authority
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