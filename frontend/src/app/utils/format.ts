import { ethers } from 'ethers';

// Format address to short format
export function formatAddress(address?: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Format date timestamp
export function formatTimestamp(timestamp: ethers.BigNumberish): string {
  try {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  } catch (e) {
    console.error('Error formatting timestamp', e);
    return 'Invalid date';
  }
}

// Format boolean status
export function formatStatus(status: boolean, positiveText = 'Active', negativeText = 'Removed'): string {
  return status ? positiveText : negativeText;
}

// Validate address format
export function isValidAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch (e) {
    return false;
  }
} 