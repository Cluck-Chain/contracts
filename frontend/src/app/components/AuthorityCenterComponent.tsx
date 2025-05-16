"use client";
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
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
  // Account status
  const [isOwner, setIsOwner] = useState(false);
  const [isAuthority, setIsAuthority] = useState(false);
  const [account, setAccount] = useState('');
  
  // Form state
  const [farmAddress, setFarmAddress] = useState('');
  
  const [authorityForm, setAuthorityForm] = useState({
    newAuthority: '',
    removeAuthority: '',
    removeFarm: ''
  });
  
  const [queryFarmAddress, setQueryFarmAddress] = useState('');
  const [isFarmCertified, setIsFarmCertified] = useState(false);
  
  const toast = useToast();
  
  // Update form handler function
  const updateAuthorityForm = (field: string, value: string) => {
    setAuthorityForm(prev => ({ ...prev, [field]: value }));
  };

  // Load account information
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
        throw new Error('Contract loading failed');
      }
      
      // Check if user is the owner
      const owner = await contract.owner();
      const isAccountOwner = owner.toLowerCase() === userAccount.toLowerCase();
      
      // Check if user is an authority
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
      console.error('Failed to load account information:', err);
      throw new Error('Failed to load account information');
    }
  });
  
  // Register new farm
  const { execute: registerFarm, isLoading: isRegistering } = useContractCall(async () => {
    if (!provider || !authorityAddress || !isAuthority) {
      toast.showError('You do not have permission to perform this operation');
      return null;
    }
    
    if (!farmAddress) {
      toast.showError('Please enter the farm contract address');
      return null;
    }
    
    try {
      const contract = await getSignerContract<any>(
        authorityAddress,
        AuthorityCenterArtifact.abi,
        provider
      );
      
      if (!contract) {
        throw new Error('Contract loading failed');
      }
      
      // According to the contract, registerFarm only accepts one parameter: farm address
      const tx = await contract.registerFarm(farmAddress);
      await tx.wait();
      
      toast.showSuccess('Farm registered successfully');
      
      // Clear form
      setFarmAddress('');
      
      return true;
    } catch (err) {
      console.error('Failed to register farm:', err);
      throw new Error('Failed to register farm');
    }
  });
  
  // Add new authority
  const { execute: addAuthority, isLoading: isAddingAuthority } = useContractCall(async () => {
    if (!provider || !authorityAddress || !(isOwner || isAuthority)) {
      toast.showError('You do not have permission to perform this operation');
      return null;
    }
    
    if (!authorityForm.newAuthority) {
      toast.showError('Please enter the authority address');
      return null;
    }
    
    try {
      const contract = await getSignerContract<any>(
        authorityAddress,
        AuthorityCenterArtifact.abi,
        provider
      );
      
      if (!contract) {
        throw new Error('Contract loading failed');
      }
      
      const tx = await contract.addAuthority(authorityForm.newAuthority);
      await tx.wait();
      
      toast.showSuccess('Authority added successfully');
      
      // Clear input
      updateAuthorityForm('newAuthority', '');
      
      return true;
    } catch (err) {
      console.error('Failed to add authority:', err);
      throw new Error('Failed to add authority');
    }
  });
  
  // Remove authority
  const { execute: removeAuthority, isLoading: isRemovingAuthority } = useContractCall(async () => {
    if (!provider || !authorityAddress || !isOwner) {
      toast.showError('You do not have permission to perform this operation');
      return null;
    }
    
    if (!authorityForm.removeAuthority) {
      toast.showError('Please enter the authority address to remove');
      return null;
    }
    
    try {
      const contract = await getSignerContract<any>(
        authorityAddress,
        AuthorityCenterArtifact.abi,
        provider
      );
      
      if (!contract) {
        throw new Error('Contract loading failed');
      }
      
      const tx = await contract.removeAuthority(authorityForm.removeAuthority);
      await tx.wait();
      
      toast.showSuccess('Authority removed successfully');
      
      // Clear input
      updateAuthorityForm('removeAuthority', '');
      
      return true;
    } catch (err) {
      console.error('Failed to remove authority:', err);
      throw new Error('Failed to remove authority');
    }
  });
  
  // Remove farm
  const { execute: removeFarm, isLoading: isRemovingFarm } = useContractCall(async () => {
    if (!provider || !authorityAddress || !isAuthority) {
      toast.showError('You do not have permission to perform this operation');
      return null;
    }
    
    if (!authorityForm.removeFarm) {
      toast.showError('Please enter the farm address to remove');
      return null;
    }
    
    try {
      const contract = await getSignerContract<any>(
        authorityAddress,
        AuthorityCenterArtifact.abi,
        provider
      );
      
      if (!contract) {
        throw new Error('Contract loading failed');
      }
      
      const tx = await contract.removeFarm(authorityForm.removeFarm);
      await tx.wait();
      
      toast.showSuccess('Farm removed successfully');
      
      // Clear input
      updateAuthorityForm('removeFarm', '');
      
      return true;
    } catch (err) {
      console.error('Failed to remove farm:', err);
      throw new Error('Failed to remove farm');
    }
  });
  
  // Query farm information
  const { execute: queryFarmInfo, isLoading: isQueryingFarm } = useContractCall(async () => {
    if (!provider || !authorityAddress) {
      toast.showError('Please connect your wallet');
      return null;
    }
    
    if (!queryFarmAddress) {
      toast.showError('Please enter the farm address');
      return null;
    }
    
    try {
      const contract = await getSignerContract<any>(
        authorityAddress,
        AuthorityCenterArtifact.abi,
        provider
      );
      
      if (!contract) {
        throw new Error('Contract loading failed');
      }
      
      // Check if farm is registered
      const isRegistered = await contract.isCertifiedFarm(queryFarmAddress);
      setIsFarmCertified(isRegistered);
      
      if (!isRegistered) {
        toast.showInfo('This farm is not registered');
      } else {
        toast.showSuccess('This farm is certified');
      }
      
      return isRegistered;
    } catch (err) {
      console.error('Failed to query farm information:', err);
      throw new Error('Failed to query farm information');
    }
  });
  
  // Initialize account information
  useEffect(() => {
    if (provider) {
      loadAccountInfo();
    }
  }, [provider]);

  return (
    <div className={styles.moduleContainer}>
      <h2>Certification Center</h2>
      <p className={styles.addressInfo}>Contract address: {authorityAddress}</p>
      <p className={styles.accountInfo}>
        Current Account: {formatAddress(account)}
        {isOwner && <span className={styles.ownerTag}>Owner</span>}
        {isAuthority && <span className={styles.authorityTag}>Authority</span>}
      </p>
      
      {/* Query farm information section - everyone can see */}
      <SectionCard title="Query Farm Certification Status">
        <FormField
          id="queryFarmAddress"
          label="Farm Address"
          type="text"
          value={queryFarmAddress}
          onChange={(e) => setQueryFarmAddress(e.target.value)}
          placeholder="Enter the farm address to query"
        />
        <Button 
          onClick={() => queryFarmInfo()}
          isLoading={isQueryingFarm}
          loadingText="Querying..."
          variant="action"
        >
          Query Farm
        </Button>
        
        {queryFarmAddress && (
          <DataDisplay title="Farm Certification Status">
            <DataItem 
              label="Certification Status" 
              value={isFarmCertified ? 'Certified' : 'Not Certified'} 
            />
          </DataDisplay>
        )}
      </SectionCard>
      
      {/* Authority management section - both owner and authority can see */}
      {(isOwner || isAuthority) && (
        <SectionCard title="Authority Management">
          <div className={styles.formGroup}>
            <FormField
              id="newAuthority"
              label="Add Authority"
              type="text"
              value={authorityForm.newAuthority}
              onChange={(e) => updateAuthorityForm('newAuthority', e.target.value)}
              placeholder="Enter new authority address"
            />
            <Button 
              onClick={() => addAuthority()}
              isLoading={isAddingAuthority}
              loadingText="Adding..."
              variant="action"
            >
              Add Authority
            </Button>
          </div>
          
          {/* Only the owner can remove authority */}
          {isOwner && (
            <div className={styles.formGroup}>
              <FormField
                id="removeAuthority"
                label="Remove Authority"
                type="text"
                value={authorityForm.removeAuthority}
                onChange={(e) => updateAuthorityForm('removeAuthority', e.target.value)}
                placeholder="Enter the authority address to remove"
              />
              <Button 
                onClick={() => removeAuthority()}
                isLoading={isRemovingAuthority}
                loadingText="Removing..."
                variant="action"
              >
                Remove Authority
              </Button>
            </div>
          )}
        </SectionCard>
      )}
      
      {/* Farm management section - only authority can see */}
      {isAuthority && (
        <>
          {/* Register new farm section */}
          <SectionCard title="Register New Farm">
            <FormField
              id="farmAddress"
              label="Farm Contract Address"
              type="text"
              value={farmAddress}
              onChange={(e) => setFarmAddress(e.target.value)}
              placeholder="Enter farm contract address"
            />
            <Button 
              onClick={() => registerFarm()}
              isLoading={isRegistering}
              loadingText="Registering..."
              variant="submit"
            >
              Register Farm
            </Button>
          </SectionCard>
          
          {/* Remove farm section */}
          <SectionCard title="Remove Farm">
            <FormField
              id="removeFarm"
              label="Farm Address"
              type="text"
              value={authorityForm.removeFarm}
              onChange={(e) => updateAuthorityForm('removeFarm', e.target.value)}
              placeholder="Enter the farm address to remove"
            />
            <Button 
              onClick={() => removeFarm()}
              isLoading={isRemovingFarm}
              loadingText="Processing..."
              variant="action"
            >
              Remove Farm
            </Button>
          </SectionCard>
        </>
      )}
    </div>
  );
} 