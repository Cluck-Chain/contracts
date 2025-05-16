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

  // 从本地存储加载用户创建的农场地址
  useEffect(() => {
    if (isConnected && account) {
      const storedFarms = localStorage.getItem(`farms_${account}`);
      if (storedFarms) {
        const farmAddresses = JSON.parse(storedFarms) as string[];
        loadFarmsData(farmAddresses);
      }
    }
  }, [isConnected, account]);

  // 加载农场数据
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
          console.error(`加载农场 ${address} 出错:`, err);
        }
      }
      
      setFarms(loadedFarms);
    } catch (err) {
      console.error('加载农场数据出错:', err);
      setError('加载农场数据时出错');
    } finally {
      setLoading(false);
    }
  };

  // 加载单个农场的详细数据
  const loadFarmDetails = async (farmAddress: string) => {
    if (!isConnected) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const signer = await getSigner();
      const farmContract = getFarmContract(farmAddress, signer);
      
      // 加载鸡数据
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
          console.error(`加载鸡 ${i} 出错:`, err);
        }
      }
      
      setChickens(loadedChickens);
      
      // 加载蛋数据
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
          console.error(`加载蛋 ${i} 出错:`, err);
        }
      }
      
      setEggs(loadedEggs);
    } catch (err) {
      console.error('加载农场详情出错:', err);
      setError('加载农场详情时出错');
    } finally {
      setLoading(false);
    }
  };

  // 创建新农场
  const createFarm = async (name: string, metadataURI: string, owner?: string) => {
    if (!isConnected || !account) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 获取所有者地址，如果没提供则使用当前账户
      const signer = await getSigner();
      let ownerAddress = await signer.getAddress();
      
      // 如果提供了owner参数并且是有效的以太坊地址，则使用它
      if (owner && ethers.isAddress(owner)) {
        ownerAddress = owner;
      }
      
      // 部署新的Farm合约 - 根据合约要求传递三个参数：owner, name, metadataURI
      const farm = await deployFarm(ownerAddress, name, metadataURI);
      const farmAddress = await farm.getAddress();
      
      // 保存农场地址到本地存储
      const storedFarms = localStorage.getItem(`farms_${account}`) || '[]';
      const farmAddresses = JSON.parse(storedFarms) as string[];
      
      if (!farmAddresses.includes(farmAddress)) {
        farmAddresses.push(farmAddress);
        localStorage.setItem(`farms_${account}`, JSON.stringify(farmAddresses));
      }
      
      // 重新加载农场数据
      await loadFarmsData(farmAddresses);
      
    } catch (err) {
      console.error('创建农场出错:', err);
      setError(err instanceof Error ? err.message : '创建农场时出错');
    } finally {
      setLoading(false);
    }
  };

  // 选择农场
  const selectFarm = async (farmAddress: string) => {
    if (!isConnected) return;
    
    const farm = farms.find(f => f.address === farmAddress);
    if (farm) {
      setSelectedFarm(farm);
      await loadFarmDetails(farmAddress);
    }
  };

  // 更新农场信息
  const updateFarmInfo = async (name: string, metadataURI: string) => {
    if (!isConnected || !selectedFarm) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const signer = await getSigner();
      const farmContract = getFarmContract(selectedFarm.address, signer);
      
      // 根据合约只传递name和metadataURI两个参数
      const tx = await farmContract.updateInfo(name, metadataURI);
      await tx.wait();
      
      // 更新本地状态
      setSelectedFarm({
        ...selectedFarm,
        name,
        metadataURI
      });
      
      // 更新farms数组中的相应农场
      setFarms(farms.map(farm => 
        farm.address === selectedFarm.address 
          ? { ...farm, name, metadataURI } 
          : farm
      ));
      
    } catch (err) {
      console.error('更新农场信息出错:', err);
      setError(err instanceof Error ? err.message : '更新农场信息时出错');
    } finally {
      setLoading(false);
    }
  };

  // 注册鸡
  const registerChicken = async (metadataURI: string) => {
    if (!isConnected || !selectedFarm) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const signer = await getSigner();
      const farmContract = getFarmContract(selectedFarm.address, signer);
      
      // 根据合约只需要传递metadataURI参数
      const tx = await farmContract.registerChicken(metadataURI);
      await tx.wait();
      
      // 重新加载农场数据
      await loadFarmDetails(selectedFarm.address);
      
      // 更新选中的农场数据
      const updatedFarm = {
        ...selectedFarm,
        chickenCount: selectedFarm.chickenCount + 1
      };
      setSelectedFarm(updatedFarm);
      
      // 更新farms数组中的相应农场
      setFarms(farms.map(farm => 
        farm.address === selectedFarm.address ? updatedFarm : farm
      ));
      
    } catch (err) {
      console.error('注册鸡出错:', err);
      setError(err instanceof Error ? err.message : '注册鸡时出错');
    } finally {
      setLoading(false);
    }
  };

  // 注册蛋
  const registerEgg = async (chickenId: number, metadataURI: string) => {
    if (!isConnected || !selectedFarm) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const signer = await getSigner();
      const farmContract = getFarmContract(selectedFarm.address, signer);
      
      // 根据合约传递chickenId和metadataURI两个参数
      const tx = await farmContract.registerEgg(chickenId, metadataURI);
      await tx.wait();
      
      // 重新加载农场数据
      await loadFarmDetails(selectedFarm.address);
      
      // 更新选中的农场数据
      const updatedFarm = {
        ...selectedFarm,
        eggCount: selectedFarm.eggCount + 1
      };
      setSelectedFarm(updatedFarm);
      
      // 更新farms数组中的相应农场
      setFarms(farms.map(farm => 
        farm.address === selectedFarm.address ? updatedFarm : farm
      ));
      
    } catch (err) {
      console.error('注册蛋出错:', err);
      setError(err instanceof Error ? err.message : '注册蛋时出错');
    } finally {
      setLoading(false);
    }
  };

  // 移除鸡
  const removeChicken = async (chickenId: number) => {
    if (!isConnected || !selectedFarm) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const signer = await getSigner();
      const farmContract = getFarmContract(selectedFarm.address, signer);
      
      // 根据合约传递chickenId参数
      const tx = await farmContract.removeChicken(chickenId);
      await tx.wait();
      
      // 重新加载农场数据
      await loadFarmDetails(selectedFarm.address);
      
    } catch (err) {
      console.error('移除鸡出错:', err);
      setError(err instanceof Error ? err.message : '移除鸡时出错');
    } finally {
      setLoading(false);
    }
  };

  // 加载用户的农场
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