"use client";
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import type { Farm } from '../../typechain/Farm';
import FarmArtifact from '../../artifacts/contracts/Farm.sol/Farm.json';
import { Button } from './shared/Button';
import { FormField } from './shared/FormField';
import { DataDisplay, DataItem } from './shared/DataDisplay';
import { SectionCard } from './shared/SectionCard';
import { useContractCall } from '../hooks/useContractCall';
import { getSignerContract } from '../hooks/useContract';
import { useToast } from '../hooks/useToast';
import styles from '../page.module.css';

// 更新FarmInfo类型以匹配合约
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
  
  // 读取农场信息的合约调用
  const { execute: fetchFarmInfo, isLoading } = useContractCall(async () => {
    if (!provider || !farmAddress) {
      toast.showError('请先连接钱包并确认合约地址');
      return null;
    }
    
    const contract = await getSignerContract<any>(farmAddress, FarmArtifact.abi, provider);
    if (!contract) {
      toast.showError('获取合约实例失败');
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
      
      // 预填表单
      setFormValues({
        name,
        metadataURI
      });
      
      return info;
    } catch (err) {
      console.error('获取农场信息失败:', err);
      throw new Error('获取农场信息失败');
    }
  });
  
  // 更新农场信息的合约调用
  const { execute: updateFarm, isLoading: isUpdating } = useContractCall(async () => {
    if (!provider || !farmAddress) {
      toast.showError('请先连接钱包并确认合约地址');
      return null;
    }
    
    const { name, metadataURI } = formValues;
    
    if (!name || !metadataURI) {
      toast.showError('请填写完整的农场信息');
      return null;
    }
    
    const contract = await getSignerContract<any>(farmAddress, FarmArtifact.abi, provider);
    if (!contract) {
      toast.showError('获取合约实例失败');
      return null;
    }
    
    try {
      // 注意: updateInfo在合约中只接受两个参数: name和metadataURI
      const tx = await contract.updateInfo(name, metadataURI);
      await tx.wait();
      
      toast.showSuccess('农场信息更新成功');
      return true;
    } catch (err) {
      console.error('更新农场信息失败:', err);
      throw new Error('更新农场信息失败');
    }
  });
  
  // 加载农场信息
  const loadFarmInfo = async () => {
    try {
      const info = await fetchFarmInfo();
      if (info) {
        setFarmInfo(info);
      }
    } catch (error) {
      toast.showError('读取农场信息失败');
    }
  };
  
  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  // 处理更新信息
  const handleUpdateInfo = async () => {
    try {
      await updateFarm();
      // 重新加载信息
      loadFarmInfo();
    } catch (error) {
      toast.showError('更新农场信息失败');
    }
  };

  // 检查是否是农场所有者
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
      <h2>农场管理</h2>
      <p className={styles.addressInfo}>合约地址: {farmAddress}</p>

      <div className={styles.contractActions}>
        <Button 
          onClick={loadFarmInfo} 
          isLoading={isLoading}
          loadingText="加载中..."
          variant="action"
        >
          获取农场信息
        </Button>
      </div>

      {farmInfo && (
        <>
          <SectionCard title="当前农场信息">
            <DataDisplay>
              <DataItem label="名称" value={farmInfo.name} />
              <DataItem label="元数据URI" value={farmInfo.metadataURI} />
              <DataItem label="所有者" value={farmInfo.owner} />
            </DataDisplay>
          </SectionCard>

          <SectionCard title="更新农场信息">
            <FormField
              id="name"
              label="农场名称"
              type="text"
              value={formValues.name}
              onChange={handleInputChange}
              placeholder="请输入农场名称"
            />
            <FormField
              id="metadataURI"
              label="元数据URI"
              type="text"
              value={formValues.metadataURI}
              onChange={handleInputChange}
              placeholder="请输入元数据URI"
            />
            <Button
              onClick={handleUpdateInfo}
              isLoading={isUpdating}
              loadingText="更新中..."
              variant="submit"
            >
              更新信息
            </Button>
          </SectionCard>
        </>
      )}
    </div>
  );
} 