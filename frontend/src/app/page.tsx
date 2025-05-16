'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  getProvider, 
  getSigner, 
  deployFarm, 
  getFarmContract, 
  registerFarmToAuthority,
  isFarmRegistered,
  isUserAuthority
} from '../utils/contract';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  // Wallet status
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthority, setIsAuthority] = useState(false);
  const [contractReady, setContractReady] = useState(false);
  
  // Farm status
  const [farms, setFarms] = useState<{address: string, name: string, isRegistered: boolean}[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);
  
  // Form state
  const [farmName, setFarmName] = useState('');
  const [farmMetadata, setFarmMetadata] = useState('');
  const [farmAddress, setFarmAddress] = useState('');
  const [autoRegister, setAutoRegister] = useState(true);
  const [ownerAddress, setOwnerAddress] = useState('');
  
  // Loading state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize and check contract status
  useEffect(() => {
    async function checkContract() {
      try {
        // Check if contract is deployed and available
        const provider = await getProvider();
        const code = await provider.getCode("0x5FbDB2315678afecb367f032d93F642f64180aa3");
        
        // If the returned code is not "0x", the contract is deployed
        if (code !== "0x") {
          setContractReady(true);
        } else {
          setError("AuthorityCenter contract is not deployed or the address is incorrect. Please verify the contract deployment status.");
        }
      } catch (err) {
        console.error("Failed to check contract:", err);
        setError("Unable to connect to the blockchain network. Please ensure MetaMask is connected to the correct network.");
      }
    }
    
    checkContract();
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        setLoading(true);
        setError(null);
        
        // Request user to connect wallet
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const provider = await getProvider();
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        setAccount(address);
        setIsConnected(true);
        
        // Only check permissions if contract is ready
        if (contractReady) {
          try {
            // Check if user is an authority
            const authority = await isUserAuthority();
            setIsAuthority(authority);
          } catch (err) {
            console.error("Failed to check permissions:", err);
            // Continue even if failed, treat user as regular user
          }
        }
        
        // Load user's farms
        await loadUserFarms(address);
        
        // Set account change listener
        window.ethereum.on('accountsChanged', handleAccountsChanged);
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setIsAuthority(false);
    setFarms([]);
    
    // If using MetaMask, try to remove listeners
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    }
  };
  
  // Listen for account changes
  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected
      setAccount(null);
      setIsConnected(false);
      setIsAuthority(false);
    } else {
      setAccount(accounts[0]);
      
      // Check new account permissions
      if (contractReady) {
        try {
          const authority = await isUserAuthority();
          setIsAuthority(authority);
        } catch (err) {
          console.error('Error checking permissions:', err);
        }
      }
      
      // Load user's farms
      loadUserFarms(accounts[0]);
    }
  };
  
  // Load user's farms from local storage
  const loadUserFarms = async (userAddress: string) => {
    setLoading(true);
    try {
      const storedFarms = localStorage.getItem(`farms_${userAddress}`);
      if (storedFarms) {
        const farmAddresses = JSON.parse(storedFarms) as string[];
        
        const farmData = [];
        for (const address of farmAddresses) {
          try {
            const signer = await getSigner();
            const farm = getFarmContract(address, signer);
            const name = await farm.name();
            
            let registered = false;
            if (contractReady) {
              try {
                registered = await isFarmRegistered(address);
              } catch (err) {
                console.error(`Error checking farm ${address} registration status:`, err);
              }
            }
            
            farmData.push({
              address,
              name,
              isRegistered: registered
            });
          } catch (err) {
            console.error(`Error loading farm ${address}:`, err);
          }
        }
        
        setFarms(farmData);
      }
    } catch (err) {
      console.error('Error loading farm data:', err);
      setError('Failed to load farm data');
    } finally {
      setLoading(false);
    }
  };
  
  // Create new Farm contract
  const createFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName || !farmMetadata || !account) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Show creating notification
      setError("Deploying farm contract, please wait and confirm the transaction in MetaMask...");
      
      // Determine farm owner address
      const ownerAddr = ownerAddress && ethers.isAddress(ownerAddress) 
        ? ownerAddress 
        : account;
      
      // Deploy Farm contract
      const farm = await deployFarm(ownerAddr, farmName, farmMetadata);
      const farmAddress = await farm.getAddress();
      
      // Clear processing notification
      setError(null);
      
      // If auto-register is selected and user is an authority
      if (autoRegister && isAuthority) {
        try {
          setError("Registering farm with authority, please confirm transaction in MetaMask...");
          await registerFarmToAuthority(farmAddress);
        } catch (regErr) {
          console.error('Error auto-registering farm:', regErr);
          setError('Farm created, but automatic registration failed: ' +
            (regErr instanceof Error ? regErr.message : 'Unknown error'));
        }
      }
      
      // Save to local storage
      const storedFarms = localStorage.getItem(`farms_${account}`) || '[]';
      const farmAddresses = JSON.parse(storedFarms) as string[];
      
      if (!farmAddresses.includes(farmAddress)) {
        farmAddresses.push(farmAddress);
        localStorage.setItem(`farms_${account}`, JSON.stringify(farmAddresses));
      }
      
      // Show success message
      setError(`Farm created successfully! Address: ${farmAddress.slice(0,6)}...${farmAddress.slice(-4)}`);
      
      // Reload farm list
      loadUserFarms(account);
      
      // Reset form
      setFarmName('');
      setFarmMetadata('');
      setOwnerAddress('');
    } catch (err) {
      console.error('Error creating farm:', err);
      setError('Failed to create farm: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  // Register Farm with AuthorityCenter
  const registerFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmAddress || !isConnected || !isAuthority) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await registerFarmToAuthority(farmAddress);
      
      // If registering user's own Farm, update status
      const farmIndex = farms.findIndex(f => f.address.toLowerCase() === farmAddress.toLowerCase());
      if (farmIndex >= 0) {
        const updatedFarms = [...farms];
        updatedFarms[farmIndex] = { ...updatedFarms[farmIndex], isRegistered: true };
        setFarms(updatedFarms);
      }
      
      // Clear input
      setFarmAddress('');
    } catch (err) {
      console.error('Error registering farm:', err);
      setError('Failed to register farm: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // View farm details
  const viewFarmDetails = (farmAddress: string) => {
    setSelectedFarm(farmAddress);
    router.push(`/farm/${farmAddress}`);
  };

  return (
    <div className="container">
      <header>
        <h1>Blockchain Farm Management System</h1>
        <div className="wallet-section">
          <button 
            onClick={isConnected ? disconnectWallet : connectWallet} 
            disabled={loading || !contractReady}
            className={`wallet-btn ${isConnected ? 'disconnect-btn' : 'connect-btn'}`}
          >
            {loading ? 'Processing...' : isConnected ? 
              `Disconnect (${account?.slice(0,6)}...${account?.slice(-4)})` : 
              'Connect Wallet'}
          </button>
          {isConnected && isAuthority && <span className="authority-badge">Authority Admin</span>}
        </div>
      </header>
      
      {error && (
        <div className={`message-box ${
          error.startsWith('Deploying') ? 'info-message' : 
          error.startsWith('Farm created successfully') ? 'success-message' : 
          'error-message'
        }`}>
          {error}
        </div>
      )}
      
      {!contractReady && (
        <div className="contract-warning">
          <h2>Contract Not Deployed or Inaccessible</h2>
          <p>Please ensure that the AuthorityCenter contract is correctly deployed and you are connected to the correct network.</p>
          <p>You can temporarily use the create farm feature, but you cannot perform registration or other operations.</p>
        </div>
      )}
      
      {isConnected && (
        <div className="main-content">
          <div className="card">
            <h2>Create New Farm</h2>
            <form onSubmit={createFarm}>
              <div className="form-group">
                <label>Farm Name</label>
                <input 
                  type="text" 
                  value={farmName} 
                  onChange={(e) => setFarmName(e.target.value)}
                  placeholder="Enter farm name" 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Metadata URI</label>
                <input 
                  type="text" 
                  value={farmMetadata} 
                  onChange={(e) => setFarmMetadata(e.target.value)}
                  placeholder="Enter metadata URI" 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Owner Address (Optional, defaults to current account)</label>
                <input 
                  type="text" 
                  value={ownerAddress} 
                  onChange={(e) => setOwnerAddress(e.target.value)}
                  placeholder="Enter owner address" 
                />
              </div>
              
              {isAuthority && contractReady && (
                <div className="form-group checkbox-group">
                  <input 
                    type="checkbox" 
                    id="autoRegister"
                    checked={autoRegister} 
                    onChange={(e) => setAutoRegister(e.target.checked)}
                  />
                  <label htmlFor="autoRegister">Auto-register farm</label>
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={loading || !farmName || !farmMetadata}
                className="submit-btn"
              >
                {loading ? 'Creating...' : 'Create Farm'}
              </button>
            </form>
          </div>
          
          {isAuthority && contractReady && (
            <div className="card">
              <h2>Register Farm</h2>
              <form onSubmit={registerFarm}>
                <div className="form-group">
                  <label>Farm Contract Address</label>
                  <input 
                    type="text" 
                    value={farmAddress} 
                    onChange={(e) => setFarmAddress(e.target.value)}
                    placeholder="Enter farm contract address" 
                    required 
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading || !farmAddress}
                  className="submit-btn"
                >
                  {loading ? 'Registering...' : 'Register Farm'}
                </button>
              </form>
            </div>
          )}
          
          <div className="card">
            <h2>My Farms</h2>
            {loading ? (
              <p>Loading...</p>
            ) : farms.length > 0 ? (
              <div className="farms-list">
                {farms.map(farm => (
                  <div key={farm.address} className="farm-item">
                    <div>
                      <h3>{farm.name}</h3>
                      <p className="farm-address">{farm.address}</p>
                    </div>
                    <div className="farm-actions">
                      <div className={`farm-status ${farm.isRegistered ? 'registered' : 'unregistered'}`}>
                        {farm.isRegistered ? 'Registered' : 'Unregistered'}
                      </div>
                      <button 
                        onClick={() => viewFarmDetails(farm.address)} 
                        className="view-btn"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>You haven't created any farms yet</p>
            )}
          </div>
        </div>
      )}
      
      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        
        h1 {
          font-size: 24px;
          color: #333;
          margin: 0;
        }
        
        .wallet-btn {
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .connect-btn {
          background-color: #3498db;
          color: white;
        }
        
        .connect-btn:hover {
          background-color: #2980b9;
        }
        
        .disconnect-btn {
          background-color: #e74c3c;
          color: white;
        }
        
        .disconnect-btn:hover {
          background-color: #c0392b;
        }
        
        .account-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .authority-badge {
          background-color: #27ae60;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .message-box {
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .error-message {
          background-color: #f8d7da;
          color: #721c24;
        }
        
        .info-message {
          background-color: #d1ecf1;
          color: #0c5460;
        }
        
        .success-message {
          background-color: #d4edda;
          color: #155724;
        }
        
        .contract-warning {
          background-color: #fff3cd;
          color: #856404;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .main-content {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }
        
        .card {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 20px;
        }
        
        h2 {
          margin-top: 0;
          margin-bottom: 20px;
          font-size: 18px;
          color: #333;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        
        input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .farms-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .farm-item {
          padding: 15px;
          border-radius: 4px;
          background-color: #f8f9fa;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .farm-item h3 {
          margin: 0 0 5px 0;
          font-size: 16px;
        }
        
        .farm-address {
          margin: 0;
          font-size: 12px;
          color: #7f8c8d;
          font-family: monospace;
        }
        
        .farm-status {
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .registered {
          background-color: #27ae60;
          color: white;
        }
        
        .unregistered {
          background-color: #e74c3c;
          color: white;
        }
        
        .farm-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-end;
        }
        
        .view-btn {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 6px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .view-btn:hover {
          background-color: #2980b9;
        }
        
        .submit-btn {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .submit-btn:hover {
          background-color: #2980b9;
        }
        
        button:disabled {
          background-color: #95a5a6;
          cursor: not-allowed;
        }
        
        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .checkbox-group input[type="checkbox"] {
          width: auto;
        }
        
        .checkbox-group label {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
} 