import { ethers } from 'ethers';
import { 
  AuthorityCenter__factory, 
  Farm__factory, 
  AuthorityCenter,
  Farm
} from '../typechain';

// Predefined AuthorityCenter contract address
// This address should be updated with the actual deployed contract address
const AUTHORITY_CENTER_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Please replace with the actual deployed address

export async function getProvider() {
  // Check if Ethereum provider exists
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  throw new Error("No ethereum provider found. Please install MetaMask.");
}

export async function getSigner() {
  const provider = await getProvider();
  return provider.getSigner();
}

// Connect to AuthorityCenter contract
export async function getAuthorityCenterContract(): Promise<AuthorityCenter> {
  const provider = await getProvider();
  return AuthorityCenter__factory.connect(AUTHORITY_CENTER_ADDRESS, provider);
}

// Get AuthorityCenter contract with Signer (for sending transactions)
export async function getAuthorityCenterWithSigner(): Promise<AuthorityCenter> {
  const signer = await getSigner();
  return AuthorityCenter__factory.connect(AUTHORITY_CENTER_ADDRESS, signer);
}

// Deploy new Farm contract
export async function deployFarm(owner: string, name: string, metadataURI: string): Promise<Farm> {
  try {
    const signer = await getSigner();
    const farmFactory = new Farm__factory(signer);
    
    // Add deployment options, increase gas limit
    const deployOptions = {
      gasLimit: 3000000 // Provide enough gas to deploy the contract
    };
    
    console.log("Starting Farm contract deployment...", { owner, name, metadataURI });
    const farm = await farmFactory.deploy(owner, name, metadataURI, deployOptions);
    console.log("Waiting for transaction confirmation...");
    await farm.waitForDeployment();
    
    const farmAddress = await farm.getAddress();
    console.log("Farm contract deployed, address:", farmAddress);
    return farm;
  } catch (error: any) {
    console.error("Failed to deploy Farm contract:", error);
    // Check specific error types and provide more detailed error messages
    if (error.error && error.error.code === -32603) {
      throw new Error("Blockchain node internal error, possibly due to insufficient gas or network congestion. Try increasing gas limit in MetaMask or try again later.");
    } else if (error.error && error.error.code === 4001) {
      throw new Error("User cancelled the transaction.");
    } else {
      throw new Error("Failed to deploy Farm contract: " + (error.message || "Unknown error"));
    }
  }
}

// Connect to existing Farm contract
export function getFarmContract(farmAddress: string, provider: ethers.ContractRunner): Farm {
  return Farm__factory.connect(farmAddress, provider);
}

// Register Farm to AuthorityCenter
export async function registerFarmToAuthority(farmAddress: string): Promise<void> {
  try {
    const authorityWithSigner = await getAuthorityCenterWithSigner();
    const tx = await authorityWithSigner.registerFarm(farmAddress);
    await tx.wait();
  } catch (error) {
    console.error("registerFarmToAuthority error:", error);
    throw new Error("Failed to register farm, please verify the contract is correctly deployed");
  }
}

// Check if Farm is registered
export async function isFarmRegistered(farmAddress: string): Promise<boolean> {
  try {
    const authority = await getAuthorityCenterContract();
    return await authority.isCertifiedFarm(farmAddress);
  } catch (error) {
    console.error("isFarmRegistered error:", error);
    return false; // Default to not registered on error
  }
}

// Get current user address
export async function getCurrentUserAddress(): Promise<string> {
  const provider = await getProvider();
  const signer = await provider.getSigner();
  return signer.getAddress();
}

// Check if user is an authority in the authority center
export async function isUserAuthority(): Promise<boolean> {
  try {
    const authority = await getAuthorityCenterContract();
    const userAddress = await getCurrentUserAddress();
    return await authority.isAuthority(userAddress);
  } catch (error) {
    console.error("isUserAuthority error:", error);
    return false; // Default to not an authority on error
  }
}

// Get all farm addresses (via events)
export async function getAllFarms(): Promise<string[]> {
  try {
    const authority = await getAuthorityCenterContract();
    
    const filter = authority.filters.FarmRegistered();
    const events = await authority.queryFilter(filter);
    
    // Get all registered farms
    const registeredFarms = events.map(event => {
      if (event && 'args' in event && event.args) {
        return event.args[0];
      }
      return null;
    }).filter(Boolean) as string[];
    
    // Filter for currently certified farms
    const certifiedFarms = [];
    for (const farm of registeredFarms) {
      const isCertified = await isFarmRegistered(farm);
      if (isCertified) {
        certifiedFarms.push(farm);
      }
    }
    
    return certifiedFarms;
  } catch (error) {
    console.error("getAllFarms error:", error);
    return []; // Return empty array on error
  }
}

// Declare window.ethereum type extension
declare global {
  interface Window {
    ethereum?: any;
  }
} 