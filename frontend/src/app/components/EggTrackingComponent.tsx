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

interface EggTrackingComponentProps {
  provider: ethers.BrowserProvider | null;
  onViewFarm?: (farmAddress: string) => void;
}

export default function EggTrackingComponent({ provider, onViewFarm }: EggTrackingComponentProps) {
  const [farmAddress, setFarmAddress] = useState('');
  const [eggId, setEggId] = useState('');
  const [eggInfo, setEggInfo] = useState<any>(null);
  const [chickenInfo, setChickenInfo] = useState<any>(null);
  
  const toast = useToast();
  
  // Track egg information
  const { execute: trackEgg, isLoading: isTracking } = useContractCall(async () => {
    if (!provider) {
      toast.showError('Please connect your wallet');
      return null;
    }
    
    if (!farmAddress) {
      toast.showError('Please enter the farm address');
      return null;
    }
    
    if (!eggId || parseInt(eggId) <= 0) {
      toast.showError('Please enter a valid egg ID');
      return null;
    }
    
    try {
      // Reset previous data
      setEggInfo(null);
      setChickenInfo(null);
      
      const contract = await getSignerContract<any>(farmAddress, FarmArtifact.abi, provider);
      if (!contract) {
        throw new Error('Failed to connect to farm contract');
      }
      
      // Get egg information
      const egg = await contract.eggs(eggId);
      
      // Format egg data
      const eggData = {
        id: eggId,
        chickenId: egg.chickenId,
        birthTime: new Date(Number(egg.birthTime) * 1000).toLocaleString(),
        metadataURI: egg.metadataURI
      };
      
      setEggInfo(eggData);
      
      // Get parent chicken information
      try {
        const chicken = await contract.chickens(egg.chickenId);
        const chickenData = {
          id: egg.chickenId,
          birthTime: new Date(Number(chicken.birthTime) * 1000).toLocaleString(),
          metadataURI: chicken.metadataURI,
          isAlive: chicken.isAlive
        };
        
        setChickenInfo(chickenData);
      } catch (chickenErr) {
        console.error('Error fetching chicken information:', chickenErr);
        toast.showWarning('Found egg, but could not retrieve parent chicken information');
      }
      
      return { egg: eggData, chicken: chickenInfo };
    } catch (err) {
      console.error('Failed to track egg:', err);
      throw new Error('Failed to track egg. Please verify the farm address and egg ID.');
    }
  });
  
  // View farm details
  const viewFarmDetails = () => {
    if (farmAddress) {
      if (onViewFarm) {
        // 使用父组件传递的回调方法切换到Farm标签页
        onViewFarm(farmAddress);
      } else {
        // 如果没有提供回调，显示提示信息
        toast.showInfo('请在主页中查看农场详情');
      }
    }
  };

  return (
    <div className={styles.moduleContainer}>
      <h2>Egg Tracking System</h2>
      <p className={styles.description}>
        Track the origin and information of eggs by entering the farm address and egg ID.
      </p>
      
      <SectionCard title="Egg Tracking">
        <FormField
          id="farmAddress"
          label="Farm Contract Address"
          type="text"
          value={farmAddress}
          onChange={(e) => setFarmAddress(e.target.value)}
          placeholder="Enter the farm contract address"
        />
        
        <FormField
          id="eggId"
          label="Egg ID"
          type="number"
          value={eggId}
          onChange={(e) => setEggId(e.target.value)}
          placeholder="Enter the egg ID"
          min="1"
        />
        
        <Button
          onClick={() => trackEgg()}
          isLoading={isTracking}
          loadingText="Tracking..."
          variant="submit"
        >
          Track Egg
        </Button>
      </SectionCard>
      
      {eggInfo && (
        <>
          <SectionCard title="Egg Information">
            <DataDisplay>
              <DataItem label="Egg ID" value={eggInfo.id} />
              <DataItem label="Parent Chicken ID" value={eggInfo.chickenId.toString()} />
              <DataItem label="Laid Time" value={eggInfo.birthTime} />
              <DataItem label="Metadata URI" value={eggInfo.metadataURI} />
            </DataDisplay>
            
            <div className={styles.actionContainer}>
              <Button
                onClick={viewFarmDetails}
                variant="action"
              >
                View Farm Details
              </Button>
            </div>
          </SectionCard>
          
          {chickenInfo && (
            <SectionCard title="Parent Chicken Information">
              <DataDisplay>
                <DataItem label="Chicken ID" value={chickenInfo.id.toString()} />
                <DataItem label="Birth Time" value={chickenInfo.birthTime} />
                <DataItem label="Status" value={chickenInfo.isAlive ? 'Active' : 'Removed'} />
                <DataItem label="Metadata URI" value={chickenInfo.metadataURI} />
              </DataDisplay>
            </SectionCard>
          )}
        </>
      )}
    </div>
  );
} 