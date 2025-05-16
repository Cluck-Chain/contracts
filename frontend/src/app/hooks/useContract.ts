import { useMemo } from 'react';
import { ethers } from 'ethers';
import type { Contract } from 'ethers';

export function useContract<T extends Contract>(
  address: string,
  abi: any,
  provider?: ethers.BrowserProvider | null
): T | null {
  return useMemo(() => {
    if (!address || !abi || !provider) return null;
    
    try {
      return new ethers.Contract(address, abi, provider) as unknown as T;
    } catch (error) {
      console.error('Failed to get contract', error);
      return null;
    }
  }, [address, abi, provider]);
}

export async function getSignerContract<T extends Contract>(
  address: string,
  abi: any,
  provider?: ethers.BrowserProvider | null
): Promise<T | null> {
  if (!address || !abi || !provider) return null;
  
  try {
    const signer = await provider.getSigner();
    return new ethers.Contract(address, abi, signer) as unknown as T;
  } catch (error) {
    console.error('Failed to get signer contract', error);
    return null;
  }
} 