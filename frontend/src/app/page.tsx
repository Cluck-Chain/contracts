"use client";
//import Image from "next/image";
import styles from "./page.module.css";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
// 合约 ABI 和类型导入（从shared目录获取）
import FarmArtifact from "../../artifacts/contracts/Farm.sol/Farm.json";
import type { Farm } from "../../typechain-types/Farm";

// 获取合约地址
async function fetchDeployedAddress(): Promise<string | null> {
  try {
    // 优先使用public目录的deployed.json
    const res = await fetch("../../shared/deployed.json");
    if (res.ok) {
      const deployed = await res.json();
      return deployed.Farm;
    }
    return null;
  } catch {
    return null;
  }
}

export default function Home() {
  // 钱包连接相关
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [account, setAccount] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [backendData, setBackendData] = useState("");
  const [farmAddress, setFarmAddress] = useState<string>("");
  
  // 合约数据
  const [farmName, setFarmName] = useState("");
  const [farmLocation, setFarmLocation] = useState("");
  const [farmIpfsHash, setFarmIpfsHash] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 钱包连接
  const connectWallet = async () => {
    setIsActivating(true);
    if (typeof window !== "undefined" && (window as { ethereum?: unknown }).ethereum) {
      try {
        // @ts-expect-error: ethereum injected by MetaMask
        await window.ethereum.request({ method: "eth_requestAccounts" });
        // @ts-expect-error: ethereum injected by MetaMask
        const ethersProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(ethersProvider);
        const signer = await ethersProvider.getSigner();
        setAccount(await signer.getAddress());
        setIsActive(true);
      } catch {
        alert("钱包连接失败");
      }
    } else {
      alert("未检测到MetaMask");
    }
    setIsActivating(false);
  };

  // 调用后端API示例及获取合约地址
  useEffect(() => {
    // 获取后端API数据
    fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/hello")
      .then((res) => res.text())
      .then(setBackendData)
      .catch(() => setBackendData("后端不可访问"));
    
    // 获取合约地址
    fetchDeployedAddress().then(addr => { 
      if (addr) {
        console.log("获取Farm合约地址:", addr);
        setFarmAddress(addr); 
      } else {
        console.warn("无法获取deployed.json中的Farm合约地址，使用备用地址");
      }
    });
  }, []);

  // 合约交互示例
  const readFarmContract = async () => {
    if (!provider || !farmAddress) {
      alert("请先连接钱包或确认合约地址");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        farmAddress,
        FarmArtifact.abi,
        signer
      ) as unknown as Farm;
      
      // 读取所有Farm信息
      const [name, location, ipfsHash, isAuth] = await Promise.all([
        contract.name(),
        contract.location(),
        contract.ipfsHash(),
        contract.isAuthorized()
      ]);
      
      setFarmName(name);
      setFarmLocation(location);
      setFarmIpfsHash(ipfsHash);
      setIsAuthorized(isAuth);
    } catch (err) {
      console.error("合约读取错误:", err);
      alert("读取合约信息失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>农场管理系统</h1>
        
        <div className={styles.connectWallet}>
          <button onClick={connectWallet} disabled={isActive || isActivating}>
            {isActive ? `已连接: ${account.slice(0, 6)}...${account.slice(-4)}` : isActivating ? "连接中..." : "连接钱包"}
          </button>
        </div>
        
        <div className={styles.contractInfo}>
          <h2>合约信息</h2>
          <p>合约地址: {farmAddress || "未加载"}</p>
          <button onClick={readFarmContract} disabled={!isActive || isLoading}>
            {isLoading ? "加载中..." : "读取农场信息"}
          </button>
          
          {farmName && (
            <div className={styles.farmDetails}>
              <h3>农场详情</h3>
              <p>名称: {farmName}</p>
              <p>位置: {farmLocation}</p>
              <p>IPFS数据: {farmIpfsHash}</p>
              <p>授权状态: {isAuthorized ? "已授权" : "未授权"}</p>
            </div>
          )}
        </div>
        
        <div className={styles.backendInfo}>
          <h2>后端连接</h2>
          <p>后端API响应: {backendData || "未连接"}</p>
        </div>
      </main>
      <footer className={styles.footer}>
        <p>农场区块链管理系统 © 2023</p>
      </footer>
    </div>
  );
}
