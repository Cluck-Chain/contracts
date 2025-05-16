'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getSigner, 
  getFarmContract, 
  isFarmRegistered
} from '../../../utils/contract';

// Define Params type
type PageParams = {
  address: string;
};

export default function FarmPage({ params }: { params: PageParams | Promise<PageParams> }) {
  // Use React.use() to unwrap params
  const unwrappedParams = React.use(params as Promise<PageParams>) as PageParams;
  const farmAddress = unwrappedParams.address;
  
  // Farm information state
  const [farmName, setFarmName] = useState('');
  const [farmOwner, setFarmOwner] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  
  // Chicken and egg state
  const [chickens, setChickens] = useState<{id: number, birthTime: bigint, metadataURI: string, isAlive: boolean}[]>([]);
  const [eggs, setEggs] = useState<{id: number, chickenId: bigint, birthTime: bigint, metadataURI: string}[]>([]);
  
  // Form state
  const [chickenMetadata, setChickenMetadata] = useState('');
  const [selectedChicken, setSelectedChicken] = useState<number | null>(null);
  const [eggMetadata, setEggMetadata] = useState('');
  
  // Loading state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Load farm information
  useEffect(() => {
    async function loadFarmData() {
      try {
        setLoading(true);
        setError(null);
        
        const signer = await getSigner();
        const signerAddress = await signer.getAddress();
        const farm = getFarmContract(farmAddress, signer);
        
        // Load basic information
        const name = await farm.name();
        const owner = await farm.owner();
        
        setFarmName(name);
        setFarmOwner(owner);
        setIsOwner(owner.toLowerCase() === signerAddress.toLowerCase());
        
        // Check registration status
        try {
          const registered = await isFarmRegistered(farmAddress);
          setIsRegistered(registered);
        } catch (err) {
          console.error("Error checking registration status:", err);
          // Continue execution, don't interrupt loading process
        }
        
        // Load chicken data
        const chickenCount = await farm.chickenCount();
        const chickenPromises = [];
        
        for (let i = 1; i <= Number(chickenCount); i++) {
          chickenPromises.push(farm.chickens(i));
        }
        
        const chickenResults = await Promise.all(chickenPromises);
        const chickenData = chickenResults.map((chicken, index) => ({
          id: index + 1,
          birthTime: chicken.birthTime,
          metadataURI: chicken.metadataURI,
          isAlive: chicken.isAlive
        }));
        
        setChickens(chickenData);
        
        // Load egg data
        const eggCount = await farm.eggCount();
        const eggPromises = [];
        
        for (let i = 1; i <= Number(eggCount); i++) {
          eggPromises.push(farm.eggs(i));
        }
        
        const eggResults = await Promise.all(eggPromises);
        const eggData = eggResults.map((egg, index) => ({
          id: index + 1,
          chickenId: egg.chickenId,
          birthTime: egg.birthTime,
          metadataURI: egg.metadataURI
        }));
        
        setEggs(eggData);
        
      } catch (err) {
        console.error("Error loading farm data:", err);
        setError("Failed to load farm data, please confirm the contract address is correct: " + (err instanceof Error ? err.message : 'Unknown error'));
      } finally {
        setLoading(false);
      }
    }
    
    if (farmAddress) {
      loadFarmData();
    }
  }, [farmAddress]);

  // Add new chicken
  const addChicken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chickenMetadata || !isOwner) return;
    
    setActionLoading(true);
    setError(null);
    
    try {
      const signer = await getSigner();
      const farm = getFarmContract(farmAddress, signer);
      
      const tx = await farm.registerChicken(chickenMetadata);
      await tx.wait();
      
      // Refresh page to show new chicken
      window.location.reload();
    } catch (err) {
      console.error("Error adding chicken:", err);
      setError("Failed to add chicken: " + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  // Add egg
  const addEgg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eggMetadata || selectedChicken === null || !isOwner) return;
    
    setActionLoading(true);
    setError(null);
    
    try {
      const signer = await getSigner();
      const farm = getFarmContract(farmAddress, signer);
      
      const tx = await farm.registerEgg(selectedChicken, eggMetadata);
      await tx.wait();
      
      // Refresh page to show new egg
      window.location.reload();
    } catch (err) {
      console.error("Error adding egg:", err);
      setError("Failed to add egg: " + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  // Remove chicken
  const removeChicken = async (chickenId: number) => {
    if (!isOwner) return;
    
    setActionLoading(true);
    setError(null);
    
    try {
      const signer = await getSigner();
      const farm = getFarmContract(farmAddress, signer);
      
      const tx = await farm.removeChicken(chickenId);
      await tx.wait();
      
      // Refresh page to update chicken status
      window.location.reload();
    } catch (err) {
      console.error(`Error removing chicken #${chickenId}:`, err);
      setError(`Failed to remove chicken #${chickenId}: ` + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };
  
  // Format timestamp
  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };

  return (
    <div className="container">
      <header>
        <div className="header-content">
          <Link href="/" className="back-link">
            Back to Home
          </Link>
          <h1>{farmName || "Farm Details"}</h1>
          <div className="farm-info">
            <p className="farm-address">Contract Address: {farmAddress}</p>
            <p className="farm-owner">Owner: {farmOwner?.slice(0,6)}...{farmOwner?.slice(-4)}</p>
            <div className={`farm-status ${isRegistered ? 'registered' : 'unregistered'}`}>
              {isRegistered ? 'Registered' : 'Unregistered'}
            </div>
            {isOwner && <div className="owner-badge">Farm Owner</div>}
          </div>
        </div>
      </header>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">Loading farm data...</div>
      ) : (
        <div className="main-content">
          {/* Chicken Management Section */}
          <div className="card">
            <h2>Chicken Management</h2>
            
            {isOwner && (
              <form onSubmit={addChicken} className="add-form">
                <h3>Add New Chicken</h3>
                <div className="form-group">
                  <label>Chicken Metadata URI</label>
                  <input 
                    type="text" 
                    value={chickenMetadata} 
                    onChange={(e) => setChickenMetadata(e.target.value)}
                    placeholder="Enter metadata URI" 
                    required 
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={actionLoading || !chickenMetadata}
                  className="submit-btn"
                >
                  {actionLoading ? 'Adding...' : 'Add Chicken'}
                </button>
              </form>
            )}
            
            <div className="list-section">
              <h3>Chicken List</h3>
              {chickens.length > 0 ? (
                <div className="items-list">
                  {chickens.map(chicken => (
                    <div key={chicken.id} className={`item-card ${!chicken.isAlive ? 'inactive' : ''}`}>
                      <div className="item-info">
                        <h4>Chicken #{chicken.id}</h4>
                        <p>Birth Time: {formatTime(chicken.birthTime)}</p>
                        <p className="metadata">Metadata: {chicken.metadataURI}</p>
                        <p className="status">
                          Status: <span className={chicken.isAlive ? 'alive' : 'removed'}>
                            {chicken.isAlive ? 'Active' : 'Removed'}
                          </span>
                        </p>
                      </div>
                      
                      {isOwner && chicken.isAlive && (
                        <button 
                          onClick={() => removeChicken(chicken.id)} 
                          disabled={actionLoading}
                          className="action-btn remove-btn"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-message">No chickens in the farm yet</p>
              )}
            </div>
          </div>
          
          {/* Egg Management Section */}
          <div className="card">
            <h2>Egg Management</h2>
            
            {isOwner && chickens.filter(c => c.isAlive).length > 0 && (
              <form onSubmit={addEgg} className="add-form">
                <h3>Add New Egg</h3>
                <div className="form-group">
                  <label>Select Chicken</label>
                  <select 
                    value={selectedChicken || ''} 
                    onChange={(e) => setSelectedChicken(Number(e.target.value))}
                    required
                  >
                    <option value="">Please select a chicken</option>
                    {chickens
                      .filter(chicken => chicken.isAlive)
                      .map(chicken => (
                        <option key={chicken.id} value={chicken.id}>
                          Chicken #{chicken.id}
                        </option>
                      ))
                    }
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Egg Metadata URI</label>
                  <input 
                    type="text" 
                    value={eggMetadata} 
                    onChange={(e) => setEggMetadata(e.target.value)}
                    placeholder="Enter metadata URI" 
                    required 
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={actionLoading || !eggMetadata || selectedChicken === null}
                  className="submit-btn"
                >
                  {actionLoading ? 'Adding...' : 'Add Egg'}
                </button>
              </form>
            )}
            
            <div className="list-section">
              <h3>Egg List</h3>
              {eggs.length > 0 ? (
                <div className="items-list">
                  {eggs.map(egg => (
                    <div key={egg.id} className="item-card">
                      <div className="item-info">
                        <h4>Egg #{egg.id}</h4>
                        <p>From Chicken #{egg.chickenId}</p>
                        <p>Laid Time: {formatTime(egg.birthTime)}</p>
                        <p className="metadata">Metadata: {egg.metadataURI}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-message">No eggs in the farm yet</p>
              )}
            </div>
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
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        
        .header-content {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .back-link {
          color: #3498db;
          text-decoration: none;
          display: inline-block;
          margin-bottom: 10px;
        }
        
        .back-link:hover {
          text-decoration: underline;
        }
        
        h1 {
          font-size: 24px;
          color: #333;
          margin: 0;
        }
        
        .farm-info {
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }
        
        .farm-address {
          margin: 0;
          font-size: 14px;
          color: #7f8c8d;
          font-family: monospace;
        }
        
        .farm-owner {
          margin: 0;
          font-size: 14px;
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
        
        .owner-badge {
          background-color: #f39c12;
          color: white;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .loading {
          text-align: center;
          padding: 40px;
          font-size: 18px;
          color: #7f8c8d;
        }
        
        .main-content {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
          gap: 20px;
        }
        
        .card {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 20px;
          margin-bottom: 20px;
        }
        
        h2 {
          margin-top: 0;
          margin-bottom: 20px;
          font-size: 20px;
          color: #333;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        
        h3 {
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 18px;
          color: #333;
        }
        
        h4 {
          margin: 0 0 10px 0;
          font-size: 16px;
          color: #333;
        }
        
        .add-form {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        
        input, select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
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
        
        .list-section {
          margin-top: 20px;
        }
        
        .items-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .item-card {
          background-color: #f8f9fa;
          border-radius: 6px;
          padding: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .inactive {
          opacity: 0.6;
        }
        
        .item-info {
          flex: 1;
        }
        
        .item-info p {
          margin: 5px 0;
          font-size: 14px;
        }
        
        .metadata {
          font-size: 12px;
          font-family: monospace;
          word-break: break-all;
        }
        
        .status {
          font-weight: 500;
        }
        
        .alive {
          color: #27ae60;
        }
        
        .removed {
          color: #e74c3c;
        }
        
        .action-btn {
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .remove-btn {
          background-color: #e74c3c;
          color: white;
        }
        
        .remove-btn:hover {
          background-color: #c0392b;
        }
        
        .empty-message {
          text-align: center;
          color: #7f8c8d;
          font-style: italic;
          padding: 20px 0;
        }
      `}</style>
    </div>
  );
} 