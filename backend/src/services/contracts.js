const { ethers } = require('ethers');
const chickenEggTrackerABI = require('../../abis/ChickenEggTracker.json');
const farmABI = require('../../abis/Farm.json');
const authorityCenterABI = require('../../abis/AuthorityCenter.json');

// Connect to blockchain
const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_URL || 'http://hardhat:8545');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', provider);

// Contract addresses (these should be in .env file)
const CHICKEN_EGG_TRACKER_ADDRESS = process.env.CHICKEN_EGG_TRACKER_ADDRESS;
const FARM_ADDRESS = process.env.FARM_ADDRESS;
const AUTHORITY_CENTER_ADDRESS = process.env.AUTHORITY_CENTER_ADDRESS;

// Contract instances
const chickenEggTrackerContract = new ethers.Contract(
  CHICKEN_EGG_TRACKER_ADDRESS,
  chickenEggTrackerABI.abi,
  wallet
);

const farmContract = new ethers.Contract(
  FARM_ADDRESS,
  farmABI.abi,
  wallet
);

const authorityCenterContract = new ethers.Contract(
  AUTHORITY_CENTER_ADDRESS,
  authorityCenterABI.abi,
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