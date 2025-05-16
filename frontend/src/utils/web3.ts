import { ethers } from 'ethers';
import { AUTHORITY_CENTER_ADDRESS, AUTHORITY_CENTER_ABI, FARM_ABI, FARM_BYTECODE } from './constants';

// 定义Window和Ethereum类型
declare global {
  interface Window {
    ethereum?: any;
  }
}

// 获取Web3提供者
export const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  throw new Error('No Web3 Provider found');
};

// 获取签名者
export const getSigner = async () => {
  const provider = getProvider();
  return await provider.getSigner();
};

// 获取AuthorityCenter合约实例
export const getAuthorityCenterContract = async (signer?: ethers.Signer) => {
  if (signer) {
    return new ethers.Contract(AUTHORITY_CENTER_ADDRESS, AUTHORITY_CENTER_ABI, signer);
  }
  const provider = getProvider();
  return new ethers.Contract(AUTHORITY_CENTER_ADDRESS, AUTHORITY_CENTER_ABI, provider);
};

// 获取Farm合约实例
export const getFarmContract = async (farmAddress: string, signer?: ethers.Signer) => {
  if (signer) {
    return new ethers.Contract(farmAddress, FARM_ABI, signer);
  }
  const provider = getProvider();
  return new ethers.Contract(farmAddress, FARM_ABI, provider);
};

// 部署Farm合约
export const deployFarmContract = async (name: string, metadataURI: string) => {
  const signer = await getSigner();
  const factory = new ethers.ContractFactory(FARM_ABI, FARM_BYTECODE, signer);
  const farm = await factory.deploy(name, metadataURI);
  await farm.waitForDeployment();
  return farm;
};

// 注册Farm合约到AuthorityCenter
export const registerFarm = async (farmAddress: string) => {
  const signer = await getSigner();
  const authorityCenter = await getAuthorityCenterContract(signer);
  const tx = await authorityCenter.registerFarm(farmAddress);
  await tx.wait();
  return tx;
};

// 获取账户地址
export const getAccount = async (): Promise<string> => {
  try {
    if (typeof window !== 'undefined' && window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      return accounts[0];
    }
    throw new Error('No Ethereum provider found');
  } catch (error) {
    console.error('Error getting account:', error);
    throw error;
  }
};

// 检查是否为认证农场
export const isCertifiedFarm = async (farmAddress: string): Promise<boolean> => {
  const authorityCenter = await getAuthorityCenterContract();
  return await authorityCenter.isCertifiedFarm(farmAddress);
};

// 获取所有农场的地址（通过事件）
export const getAllFarms = async (): Promise<string[]> => {
  const provider = getProvider();
  const authorityCenter = await getAuthorityCenterContract();
  
  const filter = authorityCenter.filters.FarmRegistered();
  const events = await authorityCenter.queryFilter(filter);
  
  // 获取所有已注册的农场
  const registeredFarms = events.map(event => {
    if (event && 'args' in event && event.args) {
      return event.args[0];
    }
    return null;
  }).filter(Boolean) as string[];
  
  // 过滤出当前仍被认证的农场
  const certifiedFarms = [];
  for (const farm of registeredFarms) {
    const isCertified = await authorityCenter.isCertifiedFarm(farm);
    if (isCertified) {
      certifiedFarms.push(farm);
    }
  }
  
  return certifiedFarms;
}; 