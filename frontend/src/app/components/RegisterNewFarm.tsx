"use client";
import { useState } from 'react';
import { ethers } from 'ethers';
import { Button } from './shared/Button';
import { FormField } from './shared/FormField';
import { SectionCard } from './shared/SectionCard';
import { useContractCall } from '../hooks/useContractCall';
import { useToast } from '../hooks/useToast';
import styles from '../page.module.css';
import FarmArtifact from '../../artifacts/contracts/Farm.sol/Farm.json';
import AuthorityCenterArtifact from '../../artifacts/contracts/AuthorityCenter.sol/AuthorityCenter.json';

interface RegisterNewFarmProps {
  provider: ethers.BrowserProvider | null;
  authorityAddress: string;
}

export default function RegisterNewFarm({ provider, authorityAddress }: RegisterNewFarmProps) {
  const [formValues, setFormValues] = useState({
    ownerAddress: '',
    farmName: '',
    metadataURI: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [deployedFarmAddress, setDeployedFarmAddress] = useState('');
  const toast = useToast();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Check if an address is valid
  const isValidAddress = (address: string): boolean => {
    try {
      return ethers.isAddress(address);
    } catch (error) {
      return false;
    }
  };

  // Deploy and register farm in one operation
  const deployAndRegisterFarm = async () => {
    if (!provider) {
      toast.showError('Please connect your wallet');
      return;
    }

    const { ownerAddress, farmName, metadataURI } = formValues;
    
    // Validate inputs
    if (!isValidAddress(ownerAddress)) {
      toast.showError('Please enter a valid owner address');
      return;
    }
    
    if (!farmName || !metadataURI) {
      toast.showError('Please fill in all farm information');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Get signer
      const signer = await provider.getSigner();
      
      // First check if user is an authority
      const authority = new ethers.Contract(
        authorityAddress,
        AuthorityCenterArtifact.abi,
        signer
      );
      
      const userAddress = await signer.getAddress();
      const isAuthority = await authority.isAuthority(userAddress);
      
      if (!isAuthority) {
        toast.showError('You are not authorized to register farms. Only authorities can register farms.');
        setIsProcessing(false);
        return;
      }
      
      // Get the Factory class for the Farm contract
      const farmFactory = new ethers.ContractFactory(
        FarmArtifact.abi,
        FarmArtifact.bytecode,
        signer
      );
      
      toast.showInfo('Deploying farm contract...');
      
      // Deploy the contract with the constructor arguments
      const farmContract = await farmFactory.deploy(
        ownerAddress,
        farmName,
        metadataURI
      );
      
      // Wait for the contract to be deployed
      await farmContract.waitForDeployment();
      
      // Get the address of the deployed contract
      const farmAddress = await farmContract.getAddress();
      setDeployedFarmAddress(farmAddress);
      
      toast.showSuccess(`Farm contract deployed successfully at ${farmAddress}`);
      toast.showInfo('Registering farm with authority...');
      
      // Register the farm
      const tx = await authority.registerFarm(farmAddress);
      await tx.wait();
      
      toast.showSuccess('Farm registered with authority successfully');
      
      // Reset form after successful operation
      setFormValues({
        ownerAddress: '',
        farmName: '',
        metadataURI: ''
      });
      
      return true;
    } catch (error) {
      console.error('Failed to deploy and register farm:', error);
      toast.showError('Failed to deploy and register farm');
      return null;
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className={styles.moduleContainer}>
      <h2>Deploy New Farm</h2>
      
      <SectionCard title="Farm Details">
        <FormField
          id="ownerAddress"
          label="Farm Owner Address"
          type="text"
          value={formValues.ownerAddress}
          onChange={handleInputChange}
          placeholder="Enter farm owner address (0x...)"
        />
        <FormField
          id="farmName"
          label="Farm Name"
          type="text"
          value={formValues.farmName}
          onChange={handleInputChange}
          placeholder="Enter farm name"
        />
        <FormField
          id="metadataURI"
          label="Metadata URI"
          type="text"
          value={formValues.metadataURI}
          onChange={handleInputChange}
          placeholder="Enter metadata URI (e.g., IPFS URL)"
        />
        
        <p className={styles.infoText}>
          This will deploy a new farm contract and register it with the authority center in one operation.
        </p>
        
        <Button
          onClick={deployAndRegisterFarm}
          isLoading={isProcessing}
          loadingText="Processing..."
          variant="submit"
          className={styles.fullWidthButton}
        >
          Deploy & Register Farm
        </Button>
        
        {deployedFarmAddress && (
          <div className={styles.deploymentInfo}>
            <p>Recently deployed farm: <span className={styles.addressText}>{deployedFarmAddress}</span></p>
          </div>
        )}
      </SectionCard>
    </div>
  );
} 