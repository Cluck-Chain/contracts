import { ethers } from 'ethers';

// 格式化地址为短格式
export function formatAddress(address?: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// 格式化日期时间戳
export function formatTimestamp(timestamp: ethers.BigNumberish): string {
  try {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  } catch (e) {
    console.error('格式化时间戳错误', e);
    return 'Invalid date';
  }
}

// 格式化布尔值状态
export function formatStatus(status: boolean, positiveText = '活跃', negativeText = '已移除'): string {
  return status ? positiveText : negativeText;
}

// 验证地址格式
export function isValidAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch (e) {
    return false;
  }
} 