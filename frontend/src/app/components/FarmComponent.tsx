"use client";
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Link from 'next/link'; 
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

interface MyFarmData {
  address: string;
  name: string;
  owner: string;
  isOwner: boolean;
}

interface ChickenData {
  id: number;
  birthTime: string;
  metadataURI: string;
  isAlive: boolean;
  eggCount: number;
}

interface EggData {
  id: number;
  chickenId: number;
  birthTime: string;
  metadataURI: string;
}

interface FarmComponentProps {
  provider: ethers.BrowserProvider | null;
  farmAddress: string;
}

export default function FarmComponent({ provider, farmAddress }: FarmComponentProps) {
  // Current Farm Management states
  const [farmInfo, setFarmInfo] = useState<FarmInfo | null>(null);
  const [formValues, setFormValues] = useState({
    name: '',
    metadataURI: ''
  });
  
  // My Farms states
  const [myFarms, setMyFarms] = useState<MyFarmData[]>([]);
  const [newFarmAddress, setNewFarmAddress] = useState('');
  const [isLoadingFarms, setIsLoadingFarms] = useState(false);
  const [isAddingFarm, setIsAddingFarm] = useState(false);
  const [currentAccount, setCurrentAccount] = useState('');

  // Farm View Mode
  const [viewMode, setViewMode] = useState<'myFarms' | 'farmDetail' | 'chickenManagement'>('myFarms');
  const [selectedFarmAddress, setSelectedFarmAddress] = useState('');
  
  // Chicken & Egg Management states
  const [chickens, setChickens] = useState<ChickenData[]>([]);
  const [eggs, setEggs] = useState<EggData[]>([]);
  const [isLoadingChickens, setIsLoadingChickens] = useState(false);
  const [isLoadingEggs, setIsLoadingEggs] = useState(false);
  const [selectedChicken, setSelectedChicken] = useState<number | null>(null);
  const [newChickenMetadata, setNewChickenMetadata] = useState('');
  const [newEggMetadata, setNewEggMetadata] = useState('');
  const [isUserOwner, setIsUserOwner] = useState(false);
  
  const toast = useToast();
  
  // Initial load - get wallet account and farms
  useEffect(() => {
    const initWallet = async () => {
      if (provider) {
        try {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setCurrentAccount(address);
          
          // Load saved farms from localStorage
          loadSavedFarms(provider, address);
        } catch (error) {
          console.error('Failed to get signer or account:', error);
        }
      }
    };
    
    initWallet();
  }, [provider]);

  // When farmAddress is provided, select that farm
  useEffect(() => {
    if (farmAddress && farmAddress !== '' && provider) {
      // Check if this farm is already in our list
      const farmExists = myFarms.some(farm => 
        farm.address.toLowerCase() === farmAddress.toLowerCase()
      );
      
      if (farmExists) {
        // If the farm is in our list, just select it
        selectFarm(farmAddress);
      } else {
        // Otherwise, try to add this farm first
        const addAndSelectFarm = async () => {
          try {
            // Get current account
            const signer = await provider.getSigner();
            const currentAccount = await signer.getAddress();
            
            // Verify and get farm data
            const farmData = await getFarmData(farmAddress, provider, currentAccount);
            
            // Add farm to list
            setMyFarms(prev => [...prev, farmData]);
            
            // Save to localStorage
            const savedFarms = localStorage.getItem('userFarms');
            const farmAddresses = savedFarms ? JSON.parse(savedFarms) as string[] : [];
            
            if (!farmAddresses.includes(farmAddress)) {
              farmAddresses.push(farmAddress);
              localStorage.setItem('userFarms', JSON.stringify(farmAddresses));
            }
            
            // Select the farm
            selectFarm(farmAddress);
          } catch (error) {
            console.error('Failed to add and select farm:', error);
            toast.showError('Failed to load specified farm. Please confirm the address is correct');
          }
        };
        
        addAndSelectFarm();
      }
    }
  }, [farmAddress, provider, myFarms]);

  // Load saved farms from localStorage
  const loadSavedFarms = async (
    provider: ethers.BrowserProvider, 
    currentAccount: string
  ) => {
    try {
      setIsLoadingFarms(true);
      
      // Get saved farms from localStorage
      const savedFarms = localStorage.getItem('userFarms');
      if (!savedFarms) {
        setMyFarms([]);
        return;
      }
      
      const farmAddresses = JSON.parse(savedFarms) as string[];
      const farmDataPromises = farmAddresses.map(address => 
        getFarmData(address, provider, currentAccount)
      );
      
      const farmDataResults = await Promise.allSettled(farmDataPromises);
      const validFarms = farmDataResults
        .filter((result): result is PromiseFulfilledResult<MyFarmData> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value);
      
      setMyFarms(validFarms);
    } catch (error) {
      console.error('Failed to load farms', error);
      toast.showError('Failed to load saved farms');
    } finally {
      setIsLoadingFarms(false);
    }
  };
  
  // Get farm data from blockchain
  const getFarmData = async (
    address: string,
    provider: ethers.BrowserProvider,
    currentAccount: string
  ): Promise<MyFarmData> => {
    try {
      // Create contract instance
      const farmContract = new ethers.Contract(
        address,
        FarmArtifact.abi,
        provider
      );
      
      // Get farm info
      const [name, owner] = await Promise.all([
        farmContract.name(),
        farmContract.owner()
      ]);
      
      // Check if current user is owner
      const isOwner = currentAccount.toLowerCase() === owner.toLowerCase();
      
      return {
        address,
        name,
        owner,
        isOwner
      };
    } catch (error) {
      console.error(`Failed to get farm data for ${address}`, error);
      throw error;
    }
  };
  
  // Add new farm to my list
  const addFarm = async () => {
    if (!ethers.isAddress(newFarmAddress)) {
      toast.showError('Please enter a valid farm contract address');
      return;
    }
    
    if (!provider) {
      toast.showError('Please connect your wallet');
      return;
    }
    
    try {
      setIsAddingFarm(true);
      
      // Check if farm already exists in the list
      const exists = myFarms.some(farm => 
        farm.address.toLowerCase() === newFarmAddress.toLowerCase()
      );
      
      if (exists) {
        toast.showWarning('This farm is already in your list');
        return;
      }
      
      // Get current account
      const signer = await provider.getSigner();
      const currentAccount = await signer.getAddress();
      
      // Verify farm contract
      const farmData = await getFarmData(newFarmAddress, provider, currentAccount);
      
      // Add farm to list
      setMyFarms(prev => [...prev, farmData]);
      
      // Save to localStorage
      const savedFarms = localStorage.getItem('userFarms');
      const farmAddresses = savedFarms ? JSON.parse(savedFarms) as string[] : [];
      farmAddresses.push(newFarmAddress);
      localStorage.setItem('userFarms', JSON.stringify(farmAddresses));
      
      toast.showSuccess('Farm added successfully');
      setNewFarmAddress('');
    } catch (error) {
      console.error('Failed to add farm', error);
      toast.showError('Failed to add farm. Please verify the address is a valid farm contract.');
    } finally {
      setIsAddingFarm(false);
    }
  };
  
  // Remove farm from my list
  const removeFarm = (address: string) => {
    // Remove from state
    setMyFarms(prev => prev.filter(farm => farm.address !== address));
    
    // Remove from localStorage
    const savedFarms = localStorage.getItem('userFarms');
    if (savedFarms) {
      const farmAddresses = JSON.parse(savedFarms) as string[];
      const updatedAddresses = farmAddresses.filter(
        farmAddress => farmAddress !== address
      );
      localStorage.setItem('userFarms', JSON.stringify(updatedAddresses));
    }
    
    toast.showSuccess('Farm removed from your list');
  };

  // Select a farm to view details
  const selectFarm = (address: string) => {
    setSelectedFarmAddress(address);
    setViewMode('farmDetail');
  };

  // Back to my farms list
  const backToFarmsList = () => {
    setViewMode('myFarms');
    setSelectedFarmAddress('');
    setFarmInfo(null);
  };
  
  // Contract call to read farm information
  const { execute: fetchFarmInfo, isLoading } = useContractCall(async () => {
    if (!provider || !selectedFarmAddress) {
      toast.showError('Please connect your wallet and confirm the contract address');
      return null;
    }
    
    const contract = await getSignerContract<any>(selectedFarmAddress, FarmArtifact.abi, provider);
    if (!contract) {
      toast.showError('Unable to get contract instance');
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
    if (!provider || !selectedFarmAddress) {
      toast.showError('Please connect your wallet and confirm the contract address');
      return null;
    }
    
    const { name, metadataURI } = formValues;
    
    if (!name || !metadataURI) {
      toast.showError('Please fill in all farm information');
      return null;
    }
    
    const contract = await getSignerContract<any>(selectedFarmAddress, FarmArtifact.abi, provider);
    if (!contract) {
      toast.showError('Unable to get contract instance');
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
      toast.showError('Failed to load farm information');
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
    if (!provider || !selectedFarmAddress || !farmInfo) return false;
    
    try {
      const signer = await provider.getSigner();
      const currentUser = await signer.getAddress();
      return currentUser.toLowerCase() === farmInfo.owner.toLowerCase();
    } catch (error) {
      return false;
    }
  };

  // Effect to load farm details when switching to farm detail view
  useEffect(() => {
    if (viewMode === 'farmDetail' && selectedFarmAddress) {
      loadFarmInfo();
    }
  }, [viewMode, selectedFarmAddress]);

  // Switch to chicken management view
  const showChickenManagement = () => {
    setViewMode('chickenManagement');
    loadChickens();
  };
  
  // Back to farm detail
  const backToFarmDetail = () => {
    setViewMode('farmDetail');
    setSelectedChicken(null);
  };
  
  // Check if current user is farm owner
  const checkOwnership = async () => {
    if (!provider || !farmInfo) return false;
    
    try {
      const signer = await provider.getSigner();
      const currentUser = await signer.getAddress();
      const isOwner = currentUser.toLowerCase() === farmInfo.owner.toLowerCase();
      setIsUserOwner(isOwner);
      return isOwner;
    } catch (error) {
      console.error('Failed to check ownership:', error);
      return false;
    }
  };
  
  // Load chickens from contract
  const { execute: loadChickensData, isLoading: isLoadingChickenData } = useContractCall(async () => {
    if (!provider || !selectedFarmAddress) {
      toast.showError('Please connect your wallet and select a farm');
      return null;
    }
    
    setIsLoadingChickens(true);
    
    try {
      const contract = await getSignerContract<any>(selectedFarmAddress, FarmArtifact.abi, provider);
      if (!contract) {
        throw new Error('Unable to get contract instance');
      }
      
      // Get chicken count
      const chickenCount = await contract.chickenCount();
      
      if (chickenCount === 0) {
        setChickens([]);
        return [];
      }
      
      // Get all chickens
      const chickenDataPromises = [];
      for (let i = 1; i <= chickenCount; i++) {
        chickenDataPromises.push(contract.chickens(i));
      }
      
      const chickenResults = await Promise.all(chickenDataPromises);
      
      // Format chicken data
      const formattedChickens: ChickenData[] = chickenResults.map((chicken, index) => ({
        id: index + 1,
        birthTime: new Date(Number(chicken.birthTime) * 1000).toLocaleString(),
        metadataURI: chicken.metadataURI,
        isAlive: chicken.isAlive,
        eggCount: 0 // Will be updated later
      }));
      
      // 获取总蛋数
      const totalEggs = await contract.eggCount();
      
      // 如果有蛋，计算每只鸡的蛋数量
      if (totalEggs > 0) {
        // 创建计数器对象记录每只鸡的蛋数量
        const chickenEggCounts: Record<number, number> = {};
        
        // 遍历所有蛋，统计每只鸡的蛋数量
        for (let i = 1; i <= totalEggs; i++) {
          const egg = await contract.eggs(i);
          const chickenId = Number(egg.chickenId);
          
          // 初始化或增加计数
          if (!chickenEggCounts[chickenId]) {
            chickenEggCounts[chickenId] = 1;
          } else {
            chickenEggCounts[chickenId]++;
          }
        }
        
        // 更新鸡的蛋数量
        for (let i = 0; i < formattedChickens.length; i++) {
          const chickenId = formattedChickens[i].id;
          formattedChickens[i].eggCount = chickenEggCounts[chickenId] || 0;
        }
      }
      
      setChickens(formattedChickens);
      return formattedChickens;
    } catch (err) {
      console.error('Failed to load chickens:', err);
      throw new Error('Failed to load chicken list');
    } finally {
      setIsLoadingChickens(false);
    }
  });
  
  // Load eggs for a specific chicken
  const { execute: loadEggsForChicken, isLoading: isLoadingEggData } = useContractCall(async (chickenId: number) => {
    if (!provider || !selectedFarmAddress) {
      toast.showError('Please connect your wallet and select a farm');
      return null;
    }
    
    if (!chickenId) {
      toast.showError('Please select a chicken');
      return null;
    }
    
    setIsLoadingEggs(true);
    
    try {
      const contract = await getSignerContract<any>(selectedFarmAddress, FarmArtifact.abi, provider);
      if (!contract) {
        throw new Error('Unable to get contract instance');
      }
      
      // 获取总的蛋数量
      const totalEggs = await contract.eggCount();
      let chickenEggs = [];
      
      // 遍历所有蛋，找出属于指定鸡的蛋
      for (let i = 1; i <= totalEggs; i++) {
        const egg = await contract.eggs(i);
        if (Number(egg.chickenId) === chickenId) {
          chickenEggs.push({
            id: i,
            egg: egg
          });
        }
      }
      
      if (chickenEggs.length === 0) {
        setEggs([]);
        return [];
      }
      
      // 格式化蛋数据
      const formattedEggs: EggData[] = chickenEggs.map(item => ({
        id: item.id,
        chickenId: Number(item.egg.chickenId),
        birthTime: new Date(Number(item.egg.birthTime) * 1000).toLocaleString(),
        metadataURI: item.egg.metadataURI
      }));
      
      setEggs(formattedEggs);
      return formattedEggs;
    } catch (err) {
      console.error('Failed to load eggs:', err);
      throw new Error('Failed to load egg list');
    } finally {
      setIsLoadingEggs(false);
    }
  });
  
  // Add new chicken
  const { execute: addChicken, isLoading: isAddingChicken } = useContractCall(async () => {
    if (!provider || !selectedFarmAddress) {
      toast.showError('Please connect your wallet and select a farm');
      return null;
    }
    
    if (!newChickenMetadata) {
      toast.showError('Please enter chicken metadata URI');
      return null;
    }
    
    // Check ownership
    const isOwner = await checkOwnership();
    if (!isOwner) {
      toast.showError('Only farm owner can add chickens');
      return null;
    }
    
    try {
      const contract = await getSignerContract<any>(selectedFarmAddress, FarmArtifact.abi, provider);
      if (!contract) {
        throw new Error('Unable to get contract instance');
      }
      
      // Add chicken
      const tx = await contract.registerChicken(newChickenMetadata);
      await tx.wait();
      
      toast.showSuccess('Chicken added successfully');
      
      // Reset input and reload chickens
      setNewChickenMetadata('');
      loadChickensData();
      
      return true;
    } catch (err) {
      console.error('Failed to add chicken:', err);
      throw new Error('Failed to add chicken');
    }
  });
  
  // Register new egg for a chicken
  const { execute: registerEgg, isLoading: isRegisteringEgg } = useContractCall(async () => {
    if (!provider || !selectedFarmAddress) {
      toast.showError('Please connect your wallet and select a farm');
      return null;
    }
    
    if (!selectedChicken) {
      toast.showError('Please select a chicken');
      return null;
    }
    
    if (!newEggMetadata) {
      toast.showError('Please enter egg metadata URI');
      return null;
    }
    
    // Check ownership
    const isOwner = await checkOwnership();
    if (!isOwner) {
      toast.showError('Only farm owner can register eggs');
      return null;
    }
    
    // Check if selected chicken is active
    const selectedChickenData = chickens.find(chicken => chicken.id === selectedChicken);
    if (!selectedChickenData || !selectedChickenData.isAlive) {
      toast.showError('Eggs can only be registered for active chickens');
      return null;
    }
    
    try {
      const contract = await getSignerContract<any>(selectedFarmAddress, FarmArtifact.abi, provider);
      if (!contract) {
        throw new Error('Unable to get contract instance');
      }
      
      // Register egg
      const tx = await contract.registerEgg(selectedChicken, newEggMetadata);
      await tx.wait();
      
      toast.showSuccess('Egg registered successfully');
      
      // Reset input and reload eggs
      setNewEggMetadata('');
      loadEggsForChicken(selectedChicken);
      
      // Update chicken data
      loadChickensData();
      
      return true;
    } catch (err) {
      console.error('Failed to register egg:', err);
      throw new Error('Failed to register egg');
    }
  });
  
  // Remove chicken
  const { execute: removeChicken, isLoading: isRemovingChicken } = useContractCall(async (chickenId: number) => {
    if (!provider || !selectedFarmAddress) {
      toast.showError('Please connect your wallet and select a farm');
      return null;
    }
    
    if (!chickenId) {
      toast.showError('Please select a chicken');
      return null;
    }
    
    // Check ownership
    const isOwner = await checkOwnership();
    if (!isOwner) {
      toast.showError('Only farm owner can remove chickens');
      return null;
    }
    
    try {
      const contract = await getSignerContract<any>(selectedFarmAddress, FarmArtifact.abi, provider);
      if (!contract) {
        throw new Error('Unable to get contract instance');
      }
      
      // Remove chicken
      const tx = await contract.removeChicken(chickenId);
      await tx.wait();
      
      toast.showSuccess('Chicken removed successfully');
      
      // Reload chickens
      loadChickensData();
      
      // If viewing eggs of this chicken, clear the selection
      if (selectedChicken === chickenId) {
        setSelectedChicken(null);
        setEggs([]);
      }
      
      return true;
    } catch (err) {
      console.error('Failed to remove chicken:', err);
      throw new Error('Failed to remove chicken');
    }
  });
  
  // Load chickens
  const loadChickens = () => {
    loadChickensData();
    // Reset egg selection
    setSelectedChicken(null);
    setEggs([]);
  };
  
  // Select chicken to view eggs
  const selectChicken = (chickenId: number) => {
    // Check if chicken exists and is active
    const chickenData = chickens.find(chicken => chicken.id === chickenId);
    if (!chickenData) {
      toast.showError('Chicken not found');
      return;
    }
    
    // If chicken is not active, only allow viewing existing eggs
    if (!chickenData.isAlive) {
      toast.showWarning('This chicken has been removed, you can only view historical egg data');
    }
    
    setSelectedChicken(chickenId);
    loadEggsForChicken(chickenId);
  };
  
  // Effect to check ownership when farm info changes
  useEffect(() => {
    if (farmInfo) {
      checkOwnership();
    }
  }, [farmInfo]);

  return (
    <div className={styles.moduleContainer}>
      <h2>Farm Management</h2>
      
      {viewMode === 'myFarms' ? (
        <>
          <SectionCard title="Add New Farm">
            <FormField
              id="farmAddress"
              label="Farm Contract Address"
              type="text"
              value={newFarmAddress}
              onChange={(e) => setNewFarmAddress(e.target.value)}
              placeholder="Enter farm contract address (0x...)"
            />
            <Button
              onClick={addFarm}
              isLoading={isAddingFarm}
              loadingText="Adding..."
              variant="submit"
              className={styles.fullWidthButton}
            >
              Add Farm
            </Button>
          </SectionCard>
          
          <SectionCard title="My Farm List">
            {isLoadingFarms ? (
              <div className={styles.loadingText}>Loading farms...</div>
            ) : myFarms.length === 0 ? (
              <div className={styles.emptyState}>
                <p>You don't have any farms yet</p>
                <p>Add a farm using the form above or deploy a new farm from Authority Center</p>
              </div>
            ) : (
              <div className={styles.farmList}>
                {myFarms.map(farm => (
                  <div key={farm.address} className={styles.farmItem}>
                    <div className={styles.farmItemContent}>
                      <h3 className={styles.farmName}>{farm.name}</h3>
                      <p className={styles.farmAddress}>
                        Address: {farm.address.slice(0, 8)}...{farm.address.slice(-6)}
                      </p>
                      {farm.isOwner && (
                        <span className={styles.ownerTag}>Owner</span>
                      )}
                    </div>
                    <div className={styles.farmItemActions}>
                      <Button 
                        onClick={() => selectFarm(farm.address)} 
                        variant="action"
                      >
                        View Details
                      </Button>
                      <button 
                        className={styles.removeButton}
                        onClick={() => removeFarm(farm.address)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </>
      ) : viewMode === 'farmDetail' ? (
        <>
          <div className={styles.farmDetailHeader}>
            <Button 
              onClick={backToFarmsList} 
              variant="secondary"
              className={styles.backButton}
            >
              Back to Farm List
            </Button>
            <p className={styles.addressInfo}>Contract Address: {selectedFarmAddress}</p>
          </div>

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
              <SectionCard title="Farm Information">
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
                  placeholder="Enter farm name"
                />
                <FormField
                  id="metadataURI"
                  label="Metadata URI" 
                  type="text"
                  value={formValues.metadataURI}
                  onChange={handleInputChange}
                  placeholder="Enter metadata URI"
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

              <SectionCard title="Manage Chickens and Eggs">
                <p className={styles.infoText}>
                  Manage your farm's chickens and eggs here:
                </p>
                <Button 
                  onClick={showChickenManagement}
                  variant="action"
                  className={styles.farmDetailLink}
                >
                  Open Chicken & Egg Management
                </Button>
              </SectionCard>
            </>
          )}
        </>
      ) : (
        <>
          <div className={styles.farmDetailHeader}>
            <Button 
              onClick={backToFarmDetail} 
              variant="secondary"
              className={styles.backButton}
            >
              Back to Farm Details
            </Button>
            <p className={styles.addressInfo}>
              Farm: {farmInfo?.name} - Chicken & Egg Management
            </p>
          </div>
          
          <div className={styles.chickenManagementContainer}>
            <div className={styles.chickenListSection}>
              <SectionCard title="Chicken List">
                {isLoadingChickenData ? (
                  <div className={styles.loadingText}>Loading chickens...</div>
                ) : chickens.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>This farm doesn't have any chickens yet</p>
                    {isUserOwner && (
                      <p>Use the form below to add new chickens</p>
                    )}
                  </div>
                ) : (
                  <div className={styles.chickenList}>
                    {chickens.map(chicken => (
                      <div 
                        key={chicken.id} 
                        className={`${styles.chickenItem} ${!chicken.isAlive ? styles.inactiveChicken : ''} ${selectedChicken === chicken.id ? styles.selectedChicken : ''}`}
                        onClick={() => chicken.isAlive ? selectChicken(chicken.id) : null}
                      >
                        <div className={styles.chickenItemContent}>
                          <h3 className={styles.chickenId}>Chicken #{chicken.id}</h3>
                          <p className={styles.chickenBirthTime}>Birth Time: {chicken.birthTime}</p>
                          <p className={styles.chickenEggCount}>
                            Eggs Laid: {chicken.eggCount}
                            {chicken.eggCount > 0 && (
                              <span 
                                className={styles.viewEggsLink}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  selectChicken(chicken.id);
                                }}
                              >
                                (View Eggs)
                              </span>
                            )}
                          </p>
                          <p className={styles.chickenStatus}>
                            Status: {chicken.isAlive ? 'Active' : 'Removed'}
                          </p>
                        </div>
                        {isUserOwner && chicken.isAlive && (
                          <div className={styles.chickenActions}>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                // If current chicken is selected, scroll to add egg form
                                if (selectedChicken === chicken.id) {
                                  document.getElementById('addEggForm')?.scrollIntoView({ behavior: 'smooth' });
                                } else {
                                  // Otherwise select chicken first, then focus add egg form
                                  selectChicken(chicken.id);
                                  setTimeout(() => {
                                    document.getElementById('addEggForm')?.scrollIntoView({ behavior: 'smooth' });
                                    document.getElementById('newEggMetadata')?.focus();
                                  }, 300);
                                }
                              }}
                              variant="action"
                              className={styles.addEggButton}
                            >
                              Add Egg
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeChicken(chicken.id);
                              }}
                              isLoading={isRemovingChicken}
                              variant="danger"
                              className={styles.removeButton}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {isUserOwner && (
                  <div className={styles.addChickenForm}>
                    <h4>Add New Chicken</h4>
                    <FormField
                      id="newChickenMetadata"
                      label="Chicken Metadata URI"
                      type="text"
                      value={newChickenMetadata}
                      onChange={(e) => setNewChickenMetadata(e.target.value)}
                      placeholder="Enter chicken metadata URI"
                    />
                    <Button
                      onClick={addChicken}
                      isLoading={isAddingChicken}
                      loadingText="Adding..."
                      variant="submit"
                    >
                      Add Chicken
                    </Button>
                  </div>
                )}
              </SectionCard>
            </div>
            
            {selectedChicken && (
              <div className={styles.eggSection}>
                <SectionCard title={`Eggs for Chicken #${selectedChicken}`}>
                  {isLoadingEggData ? (
                    <div className={styles.loadingText}>Loading eggs...</div>
                  ) : eggs.length === 0 ? (
                    <div className={styles.emptyState}>
                      <p>This chicken hasn't laid any eggs yet</p>
                      {isUserOwner && chickens.find(c => c.id === selectedChicken)?.isAlive && (
                        <p>Use the form below to register eggs</p>
                      )}
                    </div>
                  ) : (
                    <div className={styles.eggList}>
                      {eggs.map(egg => (
                        <div key={egg.id} className={styles.eggItem}>
                          <div className={styles.eggItemHeader}>
                            <h4 className={styles.eggId}>Egg #{egg.id}</h4>
                            <span className={styles.eggChickenRef}>From Chicken #{egg.chickenId}</span>
                          </div>
                          <div className={styles.eggDetails}>
                            <p className={styles.eggBirthTime}>
                              <span className={styles.eggDetailLabel}>Laid Time:</span> 
                              {egg.birthTime}
                            </p>
                            <p className={styles.eggMetadata}>
                              <span className={styles.eggDetailLabel}>Metadata:</span> 
                              <a 
                                href={egg.metadataURI.startsWith('http') ? egg.metadataURI : `https://ipfs.io/ipfs/${egg.metadataURI}`} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.metadataLink}
                              >
                                {egg.metadataURI}
                              </a>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {isUserOwner && selectedChicken && chickens.find(c => c.id === selectedChicken)?.isAlive && (
                    <div id="addEggForm" className={styles.addEggForm}>
                      <h4>Register New Egg for Chicken #{selectedChicken}</h4>
                      <FormField
                        id="newEggMetadata"
                        label="Egg Metadata URI"
                        type="text"
                        value={newEggMetadata}
                        onChange={(e) => setNewEggMetadata(e.target.value)}
                        placeholder="Enter egg metadata URI (e.g., IPFS CID or URL)"
                      />
                      <div className={styles.formHelp}>
                        Metadata URI can be an IPFS CID or URL pointing to a JSON file with egg information
                      </div>
                      <Button
                        onClick={registerEgg}
                        isLoading={isRegisteringEgg}
                        loadingText="Registering..."
                        variant="submit"
                      >
                        Register Egg
                      </Button>
                    </div>
                  )}
                </SectionCard>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}