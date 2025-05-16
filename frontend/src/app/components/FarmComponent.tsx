"use client";
import { useState } from 'react';
import { ethers } from 'ethers';
import FarmArtifact from '../../artifacts/contracts/Farm.sol/Farm.json';
import { Button } from './shared/Button';
import { FormField } from './shared/FormField';
import { DataDisplay, DataItem } from './shared/DataDisplay';
import { SectionCard } from './shared/SectionCard';
import { useContractCall } from '../hooks/useContractCall';
import { getSignerContract } from '../hooks/useContract';
import { useToast } from '../hooks/useToast';
import styles from '../page.module.css';

// Updated FarmInfo type to match the contract
interface FarmInfo {
  name: string;
  metadataURI: string;
  owner: string;
}

interface FarmComponentProps {
  provider: ethers.BrowserProvider | null;
  farmAddress: string;
}

export default function FarmComponent({ provider, farmAddress }: FarmComponentProps) {
  const [farmInfo, setFarmInfo] = useState<FarmInfo | null>(null);
  const [formValues, setFormValues] = useState({
    name: '',
    metadataURI: ''
  });
  
  const toast = useToast();
  
  // Contract call to read farm information
  const { execute: fetchFarmInfo, isLoading } = useContractCall(async () => {
    if (!provider || !farmAddress) {
      toast.showError('Please connect your wallet and confirm the contract address');
      return null;
    }
    
    const contract = await getSignerContract<any>(farmAddress, FarmArtifact.abi, provider);
    if (!contract) {
      toast.showError('Failed to get contract instance');
      return null;
    }
    
    try {
      const [name, metadataURI, owner] = await Promise.all([
        contract.name(),
        contract.metadataURI(),
        contract.owner()
      ]);
      
      const info: FarmInfo = {
        name,
        metadataURI,
        owner
      };
      
      // Pre-fill form
      setFormValues({
        name,
        metadataURI
      });
      
      return info;
    } catch (err) {
      console.error('Failed to get farm information:', err);
      throw new Error('Failed to get farm information');
    }
  });
  
  // Contract call to update farm information
  const { execute: updateFarm, isLoading: isUpdating } = useContractCall(async () => {
    if (!provider || !farmAddress) {
      toast.showError('Please connect your wallet and confirm the contract address');
      return null;
    }
    
    const { name, metadataURI } = formValues;
    
    if (!name || !metadataURI) {
      toast.showError('Please fill in all farm information');
      return null;
    }
    
    const contract = await getSignerContract<any>(farmAddress, FarmArtifact.abi, provider);
    if (!contract) {
      toast.showError('Failed to get contract instance');
      return null;
    }
    
    try {
      // Note: updateInfo in the contract only accepts two parameters: name and metadataURI
      const tx = await contract.updateInfo(name, metadataURI);
      await tx.wait();
      
      toast.showSuccess('Farm information updated successfully');
      return true;
    } catch (err) {
      console.error('Failed to update farm information:', err);
      throw new Error('Failed to update farm information');
    }
  });
  
  // Load farm information
  const loadFarmInfo = async () => {
    try {
      const info = await fetchFarmInfo();
      if (info) {
        setFarmInfo(info);
      }
    } catch (error) {
      toast.showError('Failed to read farm information');
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  // Handle information update
  const handleUpdateInfo = async () => {
    try {
      await updateFarm();
      // Reload information
      loadFarmInfo();
    } catch (error) {
      toast.showError('Failed to update farm information');
    }
  };
  // Check if user is the farm owner
  const isOwner = async (address: string): Promise<boolean> => {
    if (!provider || !farmAddress || !farmInfo) return false;
    
    try {
      const signer = await provider.getSigner();
      const currentUser = await signer.getAddress();
      return currentUser.toLowerCase() === farmInfo.owner.toLowerCase();
    } catch (error) {
      return false;
    }
  };

  return (
    <div className={styles.moduleContainer}>
      <h2>Farm Management</h2>
      <p className={styles.addressInfo}>Contract Address: {farmAddress}</p>

      <div className={styles.contractActions}>
        <Button 
          onClick={loadFarmInfo} 
          isLoading={isLoading}
          loadingText="Loading..."
          variant="action"
        >
          Get Farm Info
        </Button>
      </div>

      {farmInfo && (
        <>
          <SectionCard title="Current Farm Information">
            <DataDisplay>
              <DataItem label="Name" value={farmInfo.name} />
              <DataItem label="Metadata URI" value={farmInfo.metadataURI} />
              <DataItem label="Owner" value={farmInfo.owner} />
            </DataDisplay>
          </SectionCard>

          <SectionCard title="Update Farm Information">
            <FormField
              id="name"
              label="Farm Name"
              type="text"
              value={formValues.name}
              onChange={handleInputChange}
              placeholder="Please enter farm name"
            />
            <FormField
              id="metadataURI"
              label="Metadata URI" 
              type="text"
              value={formValues.metadataURI}
              onChange={handleInputChange}
              placeholder="Please enter metadata URI"
            />
            <Button
              onClick={handleUpdateInfo}
              isLoading={isUpdating}
              loadingText="Updating..."
              variant="submit"
            >
              Update Information
            </Button>
          </SectionCard>
        </>
      )}
    </div>
  );
}