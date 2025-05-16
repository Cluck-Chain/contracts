import { useState } from 'react';
import { ethers } from 'ethers';

export type ContractCallStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseContractCallResult<T> {
  data: T | null;
  status: ContractCallStatus;
  error: Error | null;
  isLoading: boolean;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useContractCall<T>(
  contractMethod: (...args: any[]) => Promise<T>,
  options?: {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  }
): UseContractCallResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<ContractCallStatus>('idle');
  const [error, setError] = useState<Error | null>(null);

  const reset = () => {
    setData(null);
    setStatus('idle');
    setError(null);
  };

  const execute = async (...args: any[]): Promise<T | null> => {
    setStatus('loading');
    setError(null);
    
    try {
      const result = await contractMethod(...args);
      setData(result);
      setStatus('success');
      options?.onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error 
        ? err 
        : new Error(err ? String(err) : 'Unknown error');
      
      setError(error);
      setStatus('error');
      options?.onError?.(error);
      return null;
    }
  };

  return {
    data,
    status,
    error,
    isLoading: status === 'loading',
    execute,
    reset
  };
} 