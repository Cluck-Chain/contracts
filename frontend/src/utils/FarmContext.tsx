'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './WalletContext';
import { 
  deployFarm, 
  registerFarmToAuthority, 
  getFarmContract, 
  isFarmRegistered,
  getSigner
} from './contract';
import { Farm } from '../typechain';

interface FarmData {
  address: string;
  name: string;
  metadataURI: string;
  chickenCount: number;
  eggCount: number;
  isRegistered: boolean;
}

interface ChickenData {
  id: number;
  birthTime: Date;
  metadataURI: string;
  isAlive: boolean;
}

interface EggData {
  id: number;
  chickenId: number;
  birthTime: Date;
  metadataURI: string;
}

interface FarmContextType {
  farms: FarmData[];
  selectedFarm: FarmData | null;
  chickens: ChickenData[];
  eggs: EggData[];
  loading: boolean;
  error: string | null;
  createFarm: (name: string, metadataURI: string, owner?: string) => Promise<void>;
  selectFarm: (farmAddress: string) => Promise<void>;
  updateFarmInfo: (name: string, metadataURI: string) => Promise<void>;
  registerChicken: (metadataURI: string) => Promise<void>;
  registerEgg: (chickenId: number, metadataURI: string) => Promise<void>;
  removeChicken: (chickenId: number) => Promise<void>;
  loadFarms: () => Promise<void>;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export function FarmProvider({ children }: { children: ReactNode }) {
  const { account, isConnected } = useWallet();
  const [farms, setFarms] = useState<FarmData[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<FarmData | null>(null);
  const [chickens, setChickens] = useState<ChickenData[]>([]);
  const [eggs, setEggs] = useState<EggData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load farm addresses from local storage
  useEffect(() => {
    if (isConnected && account) {
      const storedFarms = localStorage.getItem(`farms_${account}`);
      if (storedFarms) {
        const farmAddresses = JSON.parse(storedFarms) as string[];
        loadFarmsData(farmAddresses);
      }
    }
  }, [isConnected, account]);

  // Load farms data
  const loadFarmsData = async (farmAddresses: string[]) => {
    if (!isConnected) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const loadedFarms: FarmData[] = [];
      
      for (const address of farmAddresses) {
        try {
          const signer = await getSigner();
          const farmContract = getFarmContract(address, signer);
          const isRegistered = await isFarmRegistered(address);
          
          const name = await farmContract.name();
          const metadataURI = await farmContract.metadataURI();
          const chickenCount = Number(await farmContract.chickenCount());
          const eggCount = Number(await farmContract.eggCount());
          
          loadedFarms.push({
            address,
            name,
            metadataURI,
            chickenCount,
            eggCount,
            isRegistered
          });
        } catch (err) {
          console.error(`Error loading farm ${address}:`, err);
        }
      }
      
      setFarms(loadedFarms);
    } catch (err) {
      console.error('Error loading farm data:', err);
      setError('Error loading farm data');
    } finally {
      setLoading(false);
    }
  };

  // Load details for a single farm
  const loadFarmDetails = async (farmAddress: string) => {
    if (!isConnected) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const signer = await getSigner();
      const farmContract = getFarmContract(farmAddress, signer);
      
      // Load chicken data
      const chickenCount = Number(await farmContract.chickenCount());
      const loadedChickens: ChickenData[] = [];
      
      for (let i = 1; i <= chickenCount; i++) {
        try {
          const chicken = await farmContract.chickens(i);
          loadedChickens.push({
            id: i,
            birthTime: new Date(Number(chicken.birthTime) * 1000),
            metadataURI: chicken.metadataURI,
            isAlive: chicken.isAlive
          });
        } catch (err) {
          console.error(`Error loading chicken ${i}:`, err);
        }
      }
      
      setChickens(loadedChickens);
      
      // Load egg data
      const eggCount = Number(await farmContract.eggCount());
      const loadedEggs: EggData[] = [];
      
      for (let i = 1; i <= eggCount; i++) {
        try {
          const egg = await farmContract.eggs(i);
          loadedEggs.push({
            id: i,
            chickenId: Number(egg.chickenId),
            birthTime: new Date(Number(egg.birthTime) * 1000),
            metadataURI: egg.metadataURI
          });
        } catch (err) {
          console.error(`Error loading egg ${i}:`, err);
        }
      }
      
      setEggs(loadedEggs);
    } catch (err) {
      console.error('Error loading farm details:', err);
      setError('Error loading farm details');
    } finally {
      setLoading(false);
    }
  };

  // Create new farm
  const createFarm = async (name: string, metadataURI: string, owner?: string) => {
    if (!isConnected || !account) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get owner address, use current account if not provided
      const signer = await getSigner();
      let ownerAddress = await signer.getAddress();
      
      // If owner parameter is provided and is a valid Ethereum address, use it
      if (owner && ethers.isAddress(owner)) {
        ownerAddress = owner;
      }
      
      // Deploy new Farm contract - pass three parameters according to the contract: owner, name, metadataURI
      const farm = await deployFarm(ownerAddress, name, metadataURI);
      const farmAddress = await farm.getAddress();
      
      // Save farm address to local storage
      const storedFarms = localStorage.getItem(`farms_${account}`) || '[]';
      const farmAddresses = JSON.parse(storedFarms) as string[];
      
      if (!farmAddresses.includes(farmAddress)) {
        farmAddresses.push(farmAddress);
        localStorage.setItem(`farms_${account}`, JSON.stringify(farmAddresses));
      }
      
      // Reload farm data
      await loadFarmsData(farmAddresses);
      
    } catch (err) {
      console.error('Error creating farm:', err);
      setError(err instanceof Error ? err.message : 'Error creating farm');
    } finally {
      setLoading(false);
    }
  };

  // Select farm
  const selectFarm = async (farmAddress: string) => {
    if (!isConnected) return;
    
    const farm = farms.find(f => f.address === farmAddress);
    if (farm) {
      setSelectedFarm(farm);
      await loadFarmDetails(farmAddress);
    }
  };

  // Update farm info
  const updateFarmInfo = async (name: string, metadataURI: string) => {
    if (!isConnected || !selectedFarm) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const signer = await getSigner();
      const farmContract = getFarmContract(selectedFarm.address, signer);
      
      // Pass name and metadataURI to contract
      const tx = await farmContract.updateInfo(name, metadataURI);
      await tx.wait();
      
      // Update local state
      setSelectedFarm({
        ...selectedFarm,
        name,
        metadataURI
      });
      
      // Update farms array
      setFarms(farms.map(farm => 
        farm.address === selectedFarm.address 
          ? { ...farm, name, metadataURI } 
          : farm
      ));
      
    } catch (err) {
      console.error('Error updating farm info:', err);
      setError(err instanceof Error ? err.message : 'Error updating farm info');
    } finally {
      setLoading(false);
    }
  };

  // Register chicken
  const registerChicken = async (metadataURI: string) => {
    if (!isConnected || !selectedFarm) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const signer = await getSigner();
      const farmContract = getFarmContract(selectedFarm.address, signer);
      
      // Pass metadataURI to contract
      const tx = await farmContract.registerChicken(metadataURI);
      await tx.wait();
      
      // Reload farm data
      await loadFarmDetails(selectedFarm.address);
      
      // Update selected farm data
      const updatedFarm = {
        ...selectedFarm,
        chickenCount: selectedFarm.chickenCount + 1
      };
      setSelectedFarm(updatedFarm);
      
      // Update farms array
      setFarms(farms.map(farm => 
        farm.address === selectedFarm.address ? updatedFarm : farm
      ));
      
    } catch (err) {
      console.error('Error registering chicken:', err);
      setError(err instanceof Error ? err.message : 'Error registering chicken');
    } finally {
      setLoading(false);
    }
  };

  // Register egg
  const registerEgg = async (chickenId: number, metadataURI: string) => {
    if (!isConnected || !selectedFarm) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const signer = await getSigner();
      const farmContract = getFarmContract(selectedFarm.address, signer);
      
      // Pass chickenId and metadataURI to contract
      const tx = await farmContract.registerEgg(chickenId, metadataURI);
      await tx.wait();
      
      // Reload farm data
      await loadFarmDetails(selectedFarm.address);
      
      // Update selected farm data
      const updatedFarm = {
        ...selectedFarm,
        eggCount: selectedFarm.eggCount + 1
      };
      setSelectedFarm(updatedFarm);
      
      // Update farms array
      setFarms(farms.map(farm => 
        farm.address === selectedFarm.address ? updatedFarm : farm
      ));
      
    } catch (err) {
      console.error('Error registering egg:', err);
      setError(err instanceof Error ? err.message : 'Error registering egg');
    } finally {
      setLoading(false);
    }
  };

  // Remove chicken
  const removeChicken = async (chickenId: number) => {
    if (!isConnected || !selectedFarm) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const signer = await getSigner();
      const farmContract = getFarmContract(selectedFarm.address, signer);
      
      // Pass chickenId to contract
      const tx = await farmContract.removeChicken(chickenId);
      await tx.wait();
      
      // Reload farm data
      await loadFarmDetails(selectedFarm.address);
      
    } catch (err) {
      console.error('Error removing chicken:', err);
      setError(err instanceof Error ? err.message : 'Error removing chicken');
    } finally {
      setLoading(false);
    }
  };

  // Load user's farms
  const loadFarms = async () => {
    if (!isConnected || !account) return;
    
    const storedFarms = localStorage.getItem(`farms_${account}`);
    if (storedFarms) {
      const farmAddresses = JSON.parse(storedFarms) as string[];
      await loadFarmsData(farmAddresses);
    }
  };

  const value = {
    farms,
    selectedFarm,
    chickens,
    eggs,
    loading,
    error,
    createFarm,
    selectFarm,
    updateFarmInfo,
    registerChicken,
    registerEgg,
    removeChicken,
    loadFarms
  };

  return (
    <FarmContext.Provider value={value}>
      {children}
    </FarmContext.Provider>
  );
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (context === undefined) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
} 