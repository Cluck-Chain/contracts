import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ChickenEggTrackerABI from '../abis/ChickenEggTracker.json';
import FarmABI from '../abis/Farm.json';
import AuthorityCenterABI from '../abis/AuthorityCenter.json';

// Create the context
const Web3Context = createContext();

// Define the provider RPC URL
const RPC_URL = process.env.REACT_APP_RPC_URL || 'http://localhost:8545';

// Define contract addresses (these should come from environment variables)
const CHICKEN_EGG_TRACKER_ADDRESS = process.env.REACT_APP_CHICKEN_EGG_TRACKER_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const FARM_ADDRESS = process.env.REACT_APP_FARM_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const AUTHORITY_CENTER_ADDRESS = process.env.REACT_APP_AUTHORITY_CENTER_ADDRESS || '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chickenEggTracker, setChickenEggTracker] = useState(null);
  const [farm, setFarm] = useState(null);
  const [authorityCenter, setAuthorityCenter] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to initialize contracts with a provider
  const initializeWithProvider = async () => {
    try {
      const newProvider = new ethers.JsonRpcProvider(RPC_URL);
      setProvider(newProvider);

      // Initialize contract instances
      const chickenEggContract = new ethers.Contract(
        CHICKEN_EGG_TRACKER_ADDRESS,
        ChickenEggTrackerABI.abi,
        newProvider
      );

      const farmContract = new ethers.Contract(
        FARM_ADDRESS,
        FarmABI.abi,
        newProvider
      );

      const authorityCenterContract = new ethers.Contract(
        AUTHORITY_CENTER_ADDRESS,
        AuthorityCenterABI.abi,
        newProvider
      );

      setChickenEggTracker(chickenEggContract);
      setFarm(farmContract);
      setAuthorityCenter(authorityCenterContract);

      setLoading(false);
    } catch (error) {
      console.error('Failed to initialize Web3 provider:', error);
      setError('Failed to connect to blockchain');
      setLoading(false);
    }
  };

  // Function to connect wallet with MetaMask
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        setAccount(account);

        // Create Web3Provider from window.ethereum
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(web3Provider);

        // Get signer for transactions
        const web3Signer = await web3Provider.getSigner();
        setSigner(web3Signer);

        // Initialize contract instances with signer
        const chickenEggContract = new ethers.Contract(
          CHICKEN_EGG_TRACKER_ADDRESS,
          ChickenEggTrackerABI.abi,
          web3Signer
        );

        const farmContract = new ethers.Contract(
          FARM_ADDRESS,
          FarmABI.abi,
          web3Signer
        );

        const authorityCenterContract = new ethers.Contract(
          AUTHORITY_CENTER_ADDRESS,
          AuthorityCenterABI.abi,
          web3Signer
        );

        setChickenEggTracker(chickenEggContract);
        setFarm(farmContract);
        setAuthorityCenter(authorityCenterContract);

        return true;
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
        setError('Error connecting to MetaMask');
        return false;
      }
    } else {
      setError('MetaMask not found. Please install MetaMask extension');
      return false;
    }
  };

  // Initialize provider on first load
  useEffect(() => {
    initializeWithProvider();

    // Set up listeners for account changes and chain changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0] || null);
        if (!accounts[0]) {
          setSigner(null);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      // Clean up listeners
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const value = {
    provider,
    signer,
    chickenEggTracker,
    farm,
    authorityCenter,
    account,
    loading,
    error,
    connectWallet
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

export default Web3Context; 