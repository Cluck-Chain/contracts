import { ethers } from 'ethers';
import { 
  AuthorityCenter__factory, 
  Farm__factory, 
  AuthorityCenter,
  Farm
} from '../typechain';

// 预先设定的AuthorityCenter合约地址
// 这个地址应该根据实际部署的合约地址来修改
const AUTHORITY_CENTER_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // 请替换为实际部署的地址

export async function getProvider() {
  // 检查是否有以太坊提供者
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  throw new Error("No ethereum provider found. Please install MetaMask.");
}

export async function getSigner() {
  const provider = await getProvider();
  return provider.getSigner();
}

// 连接到AuthorityCenter合约
export async function getAuthorityCenterContract(): Promise<AuthorityCenter> {
  const provider = await getProvider();
  return AuthorityCenter__factory.connect(AUTHORITY_CENTER_ADDRESS, provider);
}

// 获取AuthorityCenter合约与Signer连接（用于发送交易）
export async function getAuthorityCenterWithSigner(): Promise<AuthorityCenter> {
  const signer = await getSigner();
  return AuthorityCenter__factory.connect(AUTHORITY_CENTER_ADDRESS, signer);
}

// 部署新的Farm合约
export async function deployFarm(owner: string, name: string, metadataURI: string): Promise<Farm> {
  try {
    const signer = await getSigner();
    const farmFactory = new Farm__factory(signer);
    
    // 添加部署选项，增加gas限制
    const deployOptions = {
      gasLimit: 3000000 // 提供足够的gas来部署合约
    };
    
    console.log("开始部署Farm合约...", { owner, name, metadataURI });
    const farm = await farmFactory.deploy(owner, name, metadataURI, deployOptions);
    console.log("等待交易确认...");
    await farm.waitForDeployment();
    
    const farmAddress = await farm.getAddress();
    console.log("Farm合约已部署，地址:", farmAddress);
    return farm;
  } catch (error: any) {
    console.error("部署Farm合约失败:", error);
    // 检查特定错误类型并提供更具体的错误信息
    if (error.error.code === -32603) {
      throw new Error("区块链节点内部错误，可能是gas不足或网络拥塞。请尝试增加MetaMask中的gas限制或稍后再试。");
    } else if (error.error.code === 4001) {
      throw new Error("用户取消了交易。");
    } else {
      throw new Error("部署Farm合约失败: " + (error.message || "未知错误"));
    }
  }
}

// 连接到现有的Farm合约
export function getFarmContract(farmAddress: string, provider: ethers.ContractRunner): Farm {
  return Farm__factory.connect(farmAddress, provider);
}

// 注册Farm到AuthorityCenter
export async function registerFarmToAuthority(farmAddress: string): Promise<void> {
  try {
    const authorityWithSigner = await getAuthorityCenterWithSigner();
    const tx = await authorityWithSigner.registerFarm(farmAddress);
    await tx.wait();
  } catch (error) {
    console.error("registerFarmToAuthority error:", error);
    throw new Error("注册农场失败，请确认合约已正确部署");
  }
}

// 检查Farm是否已注册
export async function isFarmRegistered(farmAddress: string): Promise<boolean> {
  try {
    const authority = await getAuthorityCenterContract();
    return await authority.isCertifiedFarm(farmAddress);
  } catch (error) {
    console.error("isFarmRegistered error:", error);
    return false; // 出错时默认为未注册
  }
}

// 获取当前用户地址
export async function getCurrentUserAddress(): Promise<string> {
  const provider = await getProvider();
  const signer = await provider.getSigner();
  return signer.getAddress();
}

// 检查用户是否为权限中心的authority
export async function isUserAuthority(): Promise<boolean> {
  try {
    const authority = await getAuthorityCenterContract();
    const userAddress = await getCurrentUserAddress();
    return await authority.isAuthority(userAddress);
  } catch (error) {
    console.error("isUserAuthority error:", error);
    return false; // 出错时默认为非权限用户
  }
}

// 声明window.ethereum类型扩展
declare global {
  interface Window {
    ethereum?: any;
  }
} 