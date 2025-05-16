"use client";
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import type { AuthorityCenter } from '../../typechain/AuthorityCenter';
import AuthorityCenterArtifact from '../../artifacts/contracts/AuthorityCenter.sol/AuthorityCenter.json';
import { Button } from './shared/Button';
import { FormField } from './shared/FormField';
import { DataDisplay, DataItem } from './shared/DataDisplay';
import { SectionCard } from './shared/SectionCard';
import { useContractCall } from '../hooks/useContractCall';
import { getSignerContract } from '../hooks/useContract';
import { useToast } from '../hooks/useToast';
import { formatAddress } from '../utils/format';
import styles from '../page.module.css';

interface AuthorityCenterComponentProps {
  provider: ethers.BrowserProvider | null;
  authorityAddress: string;
}

export default function AuthorityCenterComponent({ 
  provider, 
  authorityAddress 
}: AuthorityCenterComponentProps) {
  // 账户状态
  const [isOwner, setIsOwner] = useState(false);
  const [isAuthority, setIsAuthority] = useState(false);
  const [account, setAccount] = useState('');
  
  // 表单状态
  const [farmAddress, setFarmAddress] = useState('');
  
  const [authorityForm, setAuthorityForm] = useState({
    newAuthority: '',
    removeAuthority: '',
    removeFarm: ''
  });
  
  const [queryFarmAddress, setQueryFarmAddress] = useState('');
  const [isFarmCertified, setIsFarmCertified] = useState(false);
  
  const toast = useToast();
  
  // 更新表单处理函数
  const updateAuthorityForm = (field: string, value: string) => {
    setAuthorityForm(prev => ({ ...prev, [field]: value }));
  };

  // 加载账户信息
  const { execute: loadAccountInfo, isLoading: isLoadingAccount } = useContractCall(async () => {
    if (!provider || !authorityAddress) return null;
    
    try {
      const signer = await provider.getSigner();
      const userAccount = await signer.getAddress();
      
      const contract = await getSignerContract<any>(
        authorityAddress, 
        AuthorityCenterArtifact.abi, 
        provider
      );
      
      if (!contract) {
        throw new Error('合约加载失败');
      }
      
      // 检查是否是所有者
      const owner = await contract.owner();
      const isAccountOwner = owner.toLowerCase() === userAccount.toLowerCase();
      
      // 检查是否是权限管理员
      const isAccountAuthority = await contract.isAuthority(userAccount);
      
      setAccount(userAccount);
      setIsOwner(isAccountOwner);
      setIsAuthority(isAccountAuthority);
      
      return {
        account: userAccount,
        isOwner: isAccountOwner,
        isAuthority: isAccountAuthority
      };
    } catch (err) {
      console.error('加载账户信息失败:', err);
      throw new Error('加载账户信息失败');
    }
  });
  
  // 注册新农场
  const { execute: registerFarm, isLoading: isRegistering } = useContractCall(async () => {
    if (!provider || !authorityAddress || !isAuthority) {
      toast.showError('您没有权限执行此操作');
      return null;
    }
    
    if (!farmAddress) {
      toast.showError('请填写农场合约地址');
      return null;
    }
    
    try {
      const contract = await getSignerContract<any>(
        authorityAddress,
        AuthorityCenterArtifact.abi,
        provider
      );
      
      if (!contract) {
        throw new Error('合约加载失败');
      }
      
      // 根据合约, registerFarm只接受一个参数: 农场地址
      const tx = await contract.registerFarm(farmAddress);
      await tx.wait();
      
      toast.showSuccess('农场注册成功');
      
      // 清空表单
      setFarmAddress('');
      
      return true;
    } catch (err) {
      console.error('注册农场失败:', err);
      throw new Error('注册农场失败');
    }
  });
  
  // 添加新的权限管理员
  const { execute: addAuthority, isLoading: isAddingAuthority } = useContractCall(async () => {
    if (!provider || !authorityAddress || !(isOwner || isAuthority)) {
      toast.showError('您没有权限执行此操作');
      return null;
    }
    
    if (!authorityForm.newAuthority) {
      toast.showError('请输入管理员地址');
      return null;
    }
    
    try {
      const contract = await getSignerContract<any>(
        authorityAddress,
        AuthorityCenterArtifact.abi,
        provider
      );
      
      if (!contract) {
        throw new Error('合约加载失败');
      }
      
      const tx = await contract.addAuthority(authorityForm.newAuthority);
      await tx.wait();
      
      toast.showSuccess('添加管理员成功');
      
      // 清空输入
      updateAuthorityForm('newAuthority', '');
      
      return true;
    } catch (err) {
      console.error('添加管理员失败:', err);
      throw new Error('添加管理员失败');
    }
  });
  
  // 移除权限管理员
  const { execute: removeAuthority, isLoading: isRemovingAuthority } = useContractCall(async () => {
    if (!provider || !authorityAddress || !isOwner) {
      toast.showError('您没有权限执行此操作');
      return null;
    }
    
    if (!authorityForm.removeAuthority) {
      toast.showError('请输入要移除的管理员地址');
      return null;
    }
    
    try {
      const contract = await getSignerContract<any>(
        authorityAddress,
        AuthorityCenterArtifact.abi,
        provider
      );
      
      if (!contract) {
        throw new Error('合约加载失败');
      }
      
      const tx = await contract.removeAuthority(authorityForm.removeAuthority);
      await tx.wait();
      
      toast.showSuccess('移除管理员成功');
      
      // 清空输入
      updateAuthorityForm('removeAuthority', '');
      
      return true;
    } catch (err) {
      console.error('移除管理员失败:', err);
      throw new Error('移除管理员失败');
    }
  });
  
  // 移除农场
  const { execute: removeFarm, isLoading: isRemovingFarm } = useContractCall(async () => {
    if (!provider || !authorityAddress || !isAuthority) {
      toast.showError('您没有权限执行此操作');
      return null;
    }
    
    if (!authorityForm.removeFarm) {
      toast.showError('请输入要移除的农场地址');
      return null;
    }
    
    try {
      const contract = await getSignerContract<any>(
        authorityAddress,
        AuthorityCenterArtifact.abi,
        provider
      );
      
      if (!contract) {
        throw new Error('合约加载失败');
      }
      
      const tx = await contract.removeFarm(authorityForm.removeFarm);
      await tx.wait();
      
      toast.showSuccess('移除农场成功');
      
      // 清空输入
      updateAuthorityForm('removeFarm', '');
      
      return true;
    } catch (err) {
      console.error('移除农场失败:', err);
      throw new Error('移除农场失败');
    }
  });
  
  // 查询农场信息
  const { execute: queryFarmInfo, isLoading: isQueryingFarm } = useContractCall(async () => {
    if (!provider || !authorityAddress) {
      toast.showError('请先连接钱包');
      return null;
    }
    
    if (!queryFarmAddress) {
      toast.showError('请输入农场地址');
      return null;
    }
    
    try {
      const contract = await getSignerContract<any>(
        authorityAddress,
        AuthorityCenterArtifact.abi,
        provider
      );
      
      if (!contract) {
        throw new Error('合约加载失败');
      }
      
      // 检查农场是否注册
      const isRegistered = await contract.isCertifiedFarm(queryFarmAddress);
      setIsFarmCertified(isRegistered);
      
      if (!isRegistered) {
        toast.showInfo('该农场未注册');
      } else {
        toast.showSuccess('该农场已认证');
      }
      
      return isRegistered;
    } catch (err) {
      console.error('查询农场信息失败:', err);
      throw new Error('查询农场信息失败');
    }
  });
  
  // 初始化时加载账户信息
  useEffect(() => {
    if (provider) {
      loadAccountInfo();
    }
  }, [provider]);

  return (
    <div className={styles.moduleContainer}>
      <h2>认证中心</h2>
      <p className={styles.addressInfo}>合约地址: {authorityAddress}</p>
      <p className={styles.accountInfo}>
        当前账户: {formatAddress(account)}
        {isOwner && <span className={styles.ownerTag}>所有者</span>}
        {isAuthority && <span className={styles.authorityTag}>管理员</span>}
      </p>
      
      {/* 查询农场信息部分 - 所有人可见 */}
      <SectionCard title="查询农场认证状态">
        <FormField
          id="queryFarmAddress"
          label="农场地址"
          type="text"
          value={queryFarmAddress}
          onChange={(e) => setQueryFarmAddress(e.target.value)}
          placeholder="输入要查询的农场地址"
        />
        <Button 
          onClick={() => queryFarmInfo()}
          isLoading={isQueryingFarm}
          loadingText="查询中..."
          variant="action"
        >
          查询农场
        </Button>
        
        {queryFarmAddress && (
          <DataDisplay title="农场认证状态">
            <DataItem 
              label="认证状态" 
              value={isFarmCertified ? '已认证' : '未认证'} 
            />
          </DataDisplay>
        )}
      </SectionCard>
      
      {/* 权限管理部分 - 所有者和管理员都可见 */}
      {(isOwner || isAuthority) && (
        <SectionCard title="管理员权限管理">
          <div className={styles.formGroup}>
            <FormField
              id="newAuthority"
              label="添加管理员"
              type="text"
              value={authorityForm.newAuthority}
              onChange={(e) => updateAuthorityForm('newAuthority', e.target.value)}
              placeholder="输入新管理员地址"
            />
            <Button 
              onClick={() => addAuthority()}
              isLoading={isAddingAuthority}
              loadingText="添加中..."
              variant="action"
            >
              添加管理员
            </Button>
          </div>
          
          {/* 只有所有者可以移除管理员 */}
          {isOwner && (
            <div className={styles.formGroup}>
              <FormField
                id="removeAuthority"
                label="移除管理员"
                type="text"
                value={authorityForm.removeAuthority}
                onChange={(e) => updateAuthorityForm('removeAuthority', e.target.value)}
                placeholder="输入要移除的管理员地址"
              />
              <Button 
                onClick={() => removeAuthority()}
                isLoading={isRemovingAuthority}
                loadingText="移除中..."
                variant="action"
              >
                移除管理员
              </Button>
            </div>
          )}
        </SectionCard>
      )}
      
      {/* 农场管理部分 - 只有管理员可见 */}
      {isAuthority && (
        <>
          {/* 注册新农场部分 */}
          <SectionCard title="注册新农场">
            <FormField
              id="farmAddress"
              label="农场合约地址"
              type="text"
              value={farmAddress}
              onChange={(e) => setFarmAddress(e.target.value)}
              placeholder="输入农场合约地址"
            />
            <Button 
              onClick={() => registerFarm()}
              isLoading={isRegistering}
              loadingText="注册中..."
              variant="submit"
            >
              注册农场
            </Button>
          </SectionCard>
          
          {/* 移除农场部分 */}
          <SectionCard title="移除农场">
            <FormField
              id="removeFarm"
              label="农场地址"
              type="text"
              value={authorityForm.removeFarm}
              onChange={(e) => updateAuthorityForm('removeFarm', e.target.value)}
              placeholder="输入要移除的农场地址"
            />
            <Button 
              onClick={() => removeFarm()}
              isLoading={isRemovingFarm}
              loadingText="处理中..."
              variant="action"
            >
              移除农场
            </Button>
          </SectionCard>
        </>
      )}
    </div>
  );
} 