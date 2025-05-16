// 农场类型定义
export interface FarmInfo {
  name: string;
  metadataURI: string;
  isAuthorized: boolean;
}

// 认证中心类型定义
export interface FarmRegistrationInfo {
  address: string; // 农场合约地址
  isRegistered: boolean;
  registrationDate?: string; // 可选字段，格式化后的日期字符串
}

// 鸡信息类型定义
export interface ChickenInfo {
  id: number; // chickenId
  birthTime: Date; // 从时间戳转换
  metadataURI: string;
  isAlive: boolean;
}

// 鸡蛋信息类型定义
export interface EggInfo {
  id: number; // eggId
  chickenId: number;
  birthTime: Date; // 从时间戳转换
  metadataURI: string;
} 