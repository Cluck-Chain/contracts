const { ethers } = require('ethers');
const { ChickenEggTrackerABI, FarmABI, AuthorityCenterABI } = require('../contract-types');
const fs = require('fs');
const path = require('path');

// 读取合约地址
const deployedPath = path.resolve(__dirname, '../../../shared/deployed.json');
let deployed = {};
try {
  deployed = JSON.parse(fs.readFileSync(deployedPath, 'utf-8'));
} catch (e) {
  console.error('Failed to read deployed.json:', e);
}

// Connect to blockchain
const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_URL || 'http://hardhat:8545');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', provider);

// 合约地址从 deployed.json 获取
const CHICKEN_EGG_TRACKER_ADDRESS = deployed.ChickenEggTracker;
const FARM_ADDRESS = deployed.Farm;
const AUTHORITY_CENTER_ADDRESS = deployed.AuthorityCenter;

// Contract instances
const chickenEggTrackerContract = new ethers.Contract(
  CHICKEN_EGG_TRACKER_ADDRESS,
  ChickenEggTrackerABI.abi,
  wallet
);

const farmContract = new ethers.Contract(
  FARM_ADDRESS,
  FarmABI.abi,
  wallet
);

const authorityCenterContract = new ethers.Contract(
  AUTHORITY_CENTER_ADDRESS,
  AuthorityCenterABI.abi,
  wallet
);

// Chicken functions
const registerChicken = async (chickenId, breed, birthDate, ipfsHash) => {
  const tx = await chickenEggTrackerContract.registerChicken(chickenId, breed, birthDate, ipfsHash);
  return await tx.wait();
};

const getChickenInfo = async (chickenId) => {
  return await chickenEggTrackerContract.getChickenInfo(chickenId);
};

const updateChickenInfo = async (chickenId, ipfsHash) => {
  const tx = await chickenEggTrackerContract.updateChickenInfo(chickenId, ipfsHash);
  return await tx.wait();
};

const removeChicken = async (chickenId) => {
  const tx = await chickenEggTrackerContract.removeChicken(chickenId);
  return await tx.wait();
};

// Egg functions
const registerEgg = async (eggId, chickenId, productionDate, ipfsHash) => {
  const tx = await chickenEggTrackerContract.registerEgg(eggId, chickenId, productionDate, ipfsHash);
  return await tx.wait();
};

const getEggInfo = async (eggId) => {
  return await chickenEggTrackerContract.getEggInfo(eggId);
};

const updateEggInfo = async (eggId, ipfsHash) => {
  const tx = await chickenEggTrackerContract.updateEggInfo(eggId, ipfsHash);
  return await tx.wait();
};

const removeEgg = async (eggId) => {
  const tx = await chickenEggTrackerContract.removeEgg(eggId);
  return await tx.wait();
};

module.exports = {
  registerChicken,
  getChickenInfo,
  updateChickenInfo,
  removeChicken,
  registerEgg,
  getEggInfo,
  updateEggInfo,
  removeEgg,
  provider,
  wallet,
  chickenEggTrackerContract,
  farmContract,
  authorityCenterContract
}; 