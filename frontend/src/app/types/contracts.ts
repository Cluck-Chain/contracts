// Farm type definition
export interface FarmInfo {
  name: string;
  metadataURI: string;
  isAuthorized: boolean;
}

// Registration center type definition
export interface FarmRegistrationInfo {
  address: string; // Farm contract address
  isRegistered: boolean;
  registrationDate?: string; // Optional field, formatted date string
}

// Chicken information type definition
export interface ChickenInfo {
  id: number; // chickenId
  birthTime: Date; // Converted from timestamp
  metadataURI: string;
  isAlive: boolean;
}

// Egg information type definition
export interface EggInfo {
  id: number; // eggId
  chickenId: number;
  birthTime: Date; // Converted from timestamp
  metadataURI: string;
} 