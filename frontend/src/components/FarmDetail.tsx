'use client';

import React, { useState } from 'react';
import { useFarm } from '../utils/FarmContext';
import { useAuthority } from '../utils/AuthorityContext';
import { useWallet } from '../utils/WalletContext';

export function FarmDetail() {
  const { isConnected, isAuthority } = useWallet();
  const { selectedFarm, chickens, eggs, registerChicken, registerEgg, removeChicken, updateFarmInfo } = useFarm();
  const { registerFarm, loading: authorityLoading } = useAuthority();
  
  const [chickenURI, setChickenURI] = useState('');
  const [eggURI, setEggURI] = useState('');
  const [selectedChickenId, setSelectedChickenId] = useState<number | null>(null);
  const [showEditMode, setShowEditMode] = useState(false);
  const [farmName, setFarmName] = useState('');
  const [farmMetadataURI, setFarmMetadataURI] = useState('');

  if (!isConnected) {
    return <p>Please connect your wallet first</p>;
  }

  if (!selectedFarm) {
    return <p>Please select a farm</p>;
  }

  // Filter live chickens
  const aliveChickens = chickens.filter(chicken => chicken.isAlive);

  const handleRegisterFarm = async () => {
    try {
      await registerFarm(selectedFarm.address);
    } catch (err) {
      console.error('Error registering farm:', err);
    }
  };

  const handleAddChicken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chickenURI) return;
    
    try {
      await registerChicken(chickenURI);
      setChickenURI('');
    } catch (err) {
      console.error('Error adding chicken:', err);
    }
  };

  const handleAddEgg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eggURI || !selectedChickenId) return;
    
    try {
      await registerEgg(selectedChickenId, eggURI);
      setEggURI('');
      setSelectedChickenId(null);
    } catch (err) {
      console.error('Error adding egg:', err);
    }
  };

  const handleRemoveChicken = async (chickenId: number) => {
    try {
      await removeChicken(chickenId);
    } catch (err) {
      console.error('Error removing chicken:', err);
    }
  };

  const handleUpdateFarmInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName || !farmMetadataURI) return;
    
    try {
      await updateFarmInfo(farmName, farmMetadataURI);
      setShowEditMode(false);
    } catch (err) {
      console.error('Error updating farm info:', err);
    }
  };

  const startEditMode = () => {
    setFarmName(selectedFarm.name);
    setFarmMetadataURI(selectedFarm.metadataURI);
    setShowEditMode(true);
  };

  return (
    <div className="farm-detail">
      <div className="farm-header">
        <div>
          <h2>{selectedFarm.name}</h2>
          <p className="farm-address">Address: {selectedFarm.address}</p>
          <p className="farm-metadata">Metadata URI: {selectedFarm.metadataURI}</p>
          
          {!selectedFarm.isRegistered && isAuthority && (
            <button 
              onClick={handleRegisterFarm}
              disabled={authorityLoading}
              className="register-button"
            >
              {authorityLoading ? 'Registering...' : 'Register this Farm'}
            </button>
          )}
        </div>
        
        <button 
          onClick={startEditMode}
          className="edit-button"
        >
          Edit Farm Info
        </button>
      </div>
      
      {showEditMode && (
        <div className="edit-farm">
          <h3>Edit Farm Information</h3>
          <form onSubmit={handleUpdateFarmInfo}>
            <div className="form-group">
              <label htmlFor="edit-name">Farm Name</label>
              <input
                id="edit-name"
                type="text"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="edit-metadata">Metadata URI</label>
              <input
                id="edit-metadata"
                type="text"
                value={farmMetadataURI}
                onChange={(e) => setFarmMetadataURI(e.target.value)}
                required
              />
            </div>
            
            <div className="button-group">
              <button 
                type="submit" 
                className="save-button"
              >
                Save
              </button>
              <button 
                type="button" 
                onClick={() => setShowEditMode(false)}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="farm-sections">
        <div className="section">
          <h3>Chickens ({aliveChickens.length})</h3>
          
          <form onSubmit={handleAddChicken} className="add-form">
            <div className="form-row">
              <input
                type="text"
                value={chickenURI}
                onChange={(e) => setChickenURI(e.target.value)}
                placeholder="Metadata URI"
                className="form-input"
              />
              <button 
                type="submit"
                disabled={!chickenURI}
                className="add-button"
              >
                Add Chicken
              </button>
            </div>
          </form>
          
          <div className="list">
            {aliveChickens.length > 0 ? (
              aliveChickens.map((chicken) => (
                <div key={chicken.id} className="list-item">
                  <div>
                    <span className="item-id">#{chicken.id}</span>
                    <span className="item-date">Birth: {chicken.birthTime.toLocaleDateString()}</span>
                    <span className="item-uri">{chicken.metadataURI}</span>
                  </div>
                  <button 
                    onClick={() => handleRemoveChicken(chicken.id)}
                    className="remove-button"
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <p className="empty-message">No chickens yet. Add your first chicken!</p>
            )}
          </div>
        </div>
        
        <div className="section">
          <h3>Eggs ({eggs.length})</h3>
          
          <form onSubmit={handleAddEgg} className="add-form">
            <div className="form-row">
              <select
                value={selectedChickenId || ''}
                onChange={(e) => setSelectedChickenId(Number(e.target.value) || null)}
                className="form-select"
                required
              >
                <option value="">Select Chicken</option>
                {aliveChickens.map(chicken => (
                  <option key={chicken.id} value={chicken.id}>
                    Chicken #{chicken.id}
                  </option>
                ))}
              </select>
              
              <input
                type="text"
                value={eggURI}
                onChange={(e) => setEggURI(e.target.value)}
                placeholder="Metadata URI"
                className="form-input"
                required
              />
              
              <button 
                type="submit"
                disabled={!eggURI || !selectedChickenId}
                className="add-button"
              >
                Add Egg
              </button>
            </div>
          </form>
          
          <div className="list">
            {eggs.length > 0 ? (
              eggs.map((egg) => (
                <div key={egg.id} className="list-item">
                  <div>
                    <span className="item-id">#{egg.id}</span>
                    <span className="item-relation">From Chicken #{egg.chickenId}</span>
                    <span className="item-date">Laid: {egg.birthTime.toLocaleDateString()}</span>
                    <span className="item-uri">{egg.metadataURI}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-message">No eggs yet.</p>
            )}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .farm-detail {
          margin-top: 32px;
          padding: 24px;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .farm-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
        }
        
        h2 {
          margin-top: 0;
          margin-bottom: 8px;
          color: #2c3e50;
        }
        
        h3 {
          margin-top: 0;
          color: #2c3e50;
        }
        
        .farm-address, .farm-metadata {
          margin: 4px 0;
          color: #7f8c8d;
          font-family: monospace;
          word-break: break-all;
        }
        
        .edit-button, .register-button {
          padding: 8px 16px;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .edit-button {
          background-color: #3498db;
          color: white;
          border: none;
        }
        
        .edit-button:hover {
          background-color: #2980b9;
        }
        
        .register-button {
          background-color: #2ecc71;
          color: white;
          border: none;
          margin-top: 8px;
        }
        
        .register-button:hover {
          background-color: #27ae60;
        }
        
        .edit-farm {
          padding: 16px;
          background-color: #f5f5f5;
          border-radius: 8px;
          margin-bottom: 24px;
        }
        
        .form-group {
          margin-bottom: 16px;
        }
        
        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        input, select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }
        
        .button-group {
          display: flex;
          gap: 16px;
        }
        
        .save-button, .cancel-button {
          padding: 10px 16px;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
        }
        
        .save-button {
          background-color: #2ecc71;
          color: white;
          border: none;
        }
        
        .cancel-button {
          background-color: transparent;
          border: 1px solid #e74c3c;
          color: #e74c3c;
        }
        
        .farm-sections {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }
        
        .section {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 16px;
        }
        
        .add-form {
          margin-bottom: 16px;
        }
        
        .form-row {
          display: flex;
          gap: 8px;
        }
        
        .form-input {
          flex: 1;
        }
        
        .add-button {
          padding: 10px 16px;
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
        }
        
        .list {
          margin-top: 16px;
        }
        
        .list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background-color: #fff;
          border-radius: 4px;
          margin-bottom: 8px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        
        .list-item > div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .item-id {
          font-weight: 600;
          color: #2c3e50;
        }
        
        .item-relation, .item-date {
          font-size: 0.9rem;
          color: #7f8c8d;
        }
        
        .item-uri {
          font-size: 0.9rem;
          color: #7f8c8d;
          word-break: break-all;
        }
        
        .remove-button {
          padding: 6px 12px;
          background-color: #e74c3c;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
        }
        
        .empty-message {
          color: #7f8c8d;
          text-align: center;
          padding: 16px;
        }
      `}</style>
    </div>
  );
} 