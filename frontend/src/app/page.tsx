'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  getProvider, 
  getSigner, 
  deployFarm, 
  getFarmContract, 
  getAuthorityCenterContract, 
  getAuthorityCenterWithSigner,
  registerFarmToAuthority,
  isFarmRegistered,
  isUserAuthority
} from '../utils/contract';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  // 钱包状态
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthority, setIsAuthority] = useState(false);
  const [contractReady, setContractReady] = useState(false);
  
  // Farm状态
  const [farms, setFarms] = useState<{address: string, name: string, isRegistered: boolean}[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);
  
  // 表单状态
  const [farmName, setFarmName] = useState('');
  const [farmMetadata, setFarmMetadata] = useState('');
  const [farmAddress, setFarmAddress] = useState('');
  const [autoRegister, setAutoRegister] = useState(true);
  const [ownerAddress, setOwnerAddress] = useState('');
  
  // 加载状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初始化检查合约状态
  useEffect(() => {
    async function checkContract() {
      try {
        // 检查合约是否部署和可用
        const provider = await getProvider();
        const code = await provider.getCode("0x5FbDB2315678afecb367f032d93F642f64180aa3");
        
        // 如果返回的不是"0x"，说明合约已部署
        if (code !== "0x") {
          setContractReady(true);
        } else {
          setError("AuthorityCenter 合约未部署或地址错误，请确认合约部署情况");
        }
      } catch (err) {
        console.error("检查合约失败:", err);
        setError("无法连接到区块链网络，请确认 MetaMask 已连接到正确网络");
      }
    }
    
    checkContract();
  }, []);

  // 连接钱包
  const connectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        setLoading(true);
        setError(null);
        
        // 请求用户连接钱包
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const provider = await getProvider();
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        setAccount(address);
        setIsConnected(true);
        
        // 如果合约已准备就绪，才检查权限
        if (contractReady) {
          try {
            // 检查是否为authority
            const authority = await isUserAuthority();
            setIsAuthority(authority);
          } catch (err) {
            console.error("检查权限失败:", err);
            // 即使失败也继续，把用户当作普通用户
          }
        }
        
        // 加载用户的农场
        await loadUserFarms(address);
        
        // 设置账户变化监听
        window.ethereum.on('accountsChanged', handleAccountsChanged);
      }
    } catch (err) {
      console.error('连接钱包出错:', err);
      setError('连接钱包失败：' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };
  
  // 断开钱包连接
  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setIsAuthority(false);
    setFarms([]);
    
    // 如果使用MetaMask，尝试移除监听器
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    }
  };
  
  // 监听账户变化
  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      // 用户断开连接
      setAccount(null);
      setIsConnected(false);
      setIsAuthority(false);
    } else {
      setAccount(accounts[0]);
      
      // 检查新账户的权限
      if (contractReady) {
        try {
          const authority = await isUserAuthority();
          setIsAuthority(authority);
        } catch (err) {
          console.error('检查权限出错:', err);
        }
      }
      
      // 加载用户的农场
      loadUserFarms(accounts[0]);
    }
  };
  
  // 从本地存储加载用户的农场
  const loadUserFarms = async (userAddress: string) => {
    setLoading(true);
    try {
      const storedFarms = localStorage.getItem(`farms_${userAddress}`);
      if (storedFarms) {
        const farmAddresses = JSON.parse(storedFarms) as string[];
        
        const farmData = [];
        for (const address of farmAddresses) {
          try {
            const signer = await getSigner();
            const farm = getFarmContract(address, signer);
            const name = await farm.name();
            
            let registered = false;
            if (contractReady) {
              try {
                registered = await isFarmRegistered(address);
              } catch (err) {
                console.error(`检查农场 ${address} 注册状态出错:`, err);
              }
            }
            
            farmData.push({
              address,
              name,
              isRegistered: registered
            });
          } catch (err) {
            console.error(`加载农场 ${address} 出错:`, err);
          }
        }
        
        setFarms(farmData);
      }
    } catch (err) {
      console.error('加载农场数据出错:', err);
      setError('加载农场数据失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 创建新的Farm合约
  const createFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName || !farmMetadata || !account) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 显示正在创建的提示
      setError("正在部署农场合约，请稍候并在MetaMask中确认交易...");
      
      // 确定农场的所有者地址
      const owner = ownerAddress || account;
      
      // 部署Farm合约
      const farm = await deployFarm(owner, farmName, farmMetadata);
      const farmAddress = await farm.getAddress();
      
      // 清除处理中的提示
      setError(null);
      
      // 如果选择了自动认证且用户是权限管理员
      if (autoRegister && isAuthority && contractReady) {
        try {
          setError("正在认证农场，请在MetaMask中确认交易...");
          await registerFarmToAuthority(farmAddress);
          setError(null);
        } catch (regErr) {
          console.error('自动注册农场出错:', regErr);
          setError('农场已创建，但自动认证失败: ' + 
                   (regErr instanceof Error ? regErr.message : '未知错误'));
        }
      }
      
      // 保存到本地存储
      const storedFarms = localStorage.getItem(`farms_${account}`) || '[]';
      const farmAddresses = JSON.parse(storedFarms) as string[];
      
      if (!farmAddresses.includes(farmAddress)) {
        farmAddresses.push(farmAddress);
        localStorage.setItem(`farms_${account}`, JSON.stringify(farmAddresses));
      }
      
      // 显示成功消息
      setError(`农场创建成功! 地址: ${farmAddress.slice(0,6)}...${farmAddress.slice(-4)}`);
      
      // 重新加载农场列表
      loadUserFarms(account);
      
      // 清空表单
      setFarmName('');
      setFarmMetadata('');
      setOwnerAddress('');
      
      // 3秒后清除成功消息
      setTimeout(() => {
        if (error && error.startsWith('农场创建成功')) {
          setError(null);
        }
      }, 3000);
      
    } catch (err) {
      console.error('创建农场出错:', err);
      setError('创建农场失败: ' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };
  
  // 注册Farm到AuthorityCenter
  const registerFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmAddress || !contractReady) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await registerFarmToAuthority(farmAddress);
      
      // 如果注册的是用户自己的Farm，更新状态
      if (farms.some(farm => farm.address === farmAddress)) {
        loadUserFarms(account || '');
      }
      
      // 清空输入
      setFarmAddress('');
      
    } catch (err) {
      console.error('注册农场出错:', err);
      setError('注册农场失败: ' + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  // 查看农场详情
  const viewFarmDetails = (farmAddress: string) => {
    router.push(`/farm/${farmAddress}`);
  };

  return (
    <div className="container">
      <header>
        <h1>区块链农场管理系统</h1>
        <div className="wallet-section">
          <button 
            onClick={isConnected ? disconnectWallet : connectWallet} 
            disabled={loading || !contractReady}
            className={`wallet-btn ${isConnected ? 'disconnect-btn' : 'connect-btn'}`}
          >
            {loading ? '处理中...' : isConnected ? 
              `断开连接 (${account?.slice(0,6)}...${account?.slice(-4)})` : 
              '连接钱包'}
          </button>
          {isConnected && isAuthority && <span className="authority-badge">权限管理员</span>}
        </div>
      </header>
      
      {error && (
        <div className={`message-box ${
          error.startsWith('正在') ? 'info-message' : 
          error.startsWith('农场创建成功') ? 'success-message' : 
          'error-message'
        }`}>
          {error}
        </div>
      )}
      
      {!contractReady && (
        <div className="contract-warning">
          <h2>合约未部署或无法访问</h2>
          <p>请确保 AuthorityCenter 合约已经正确部署，并且您已连接到正确的网络。</p>
          <p>您可以暂时使用创建农场功能，但无法进行注册等操作。</p>
        </div>
      )}
      
      {isConnected && (
        <div className="main-content">
          <div className="card">
            <h2>创建新农场</h2>
            <form onSubmit={createFarm}>
              <div className="form-group">
                <label>农场名称</label>
                <input 
                  type="text" 
                  value={farmName} 
                  onChange={(e) => setFarmName(e.target.value)}
                  placeholder="输入农场名称" 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>元数据URI</label>
                <input 
                  type="text" 
                  value={farmMetadata} 
                  onChange={(e) => setFarmMetadata(e.target.value)}
                  placeholder="输入元数据URI" 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>所有者地址 (可选，默认为当前账户)</label>
                <input 
                  type="text" 
                  value={ownerAddress} 
                  onChange={(e) => setOwnerAddress(e.target.value)}
                  placeholder="输入所有者地址" 
                />
              </div>
              
              {isAuthority && contractReady && (
                <div className="form-group checkbox-group">
                  <input 
                    type="checkbox" 
                    id="autoRegister"
                    checked={autoRegister} 
                    onChange={(e) => setAutoRegister(e.target.checked)}
                  />
                  <label htmlFor="autoRegister">自动认证农场</label>
                </div>
              )}
              
              <button 
                type="submit" 
                disabled={loading || !farmName || !farmMetadata}
                className="submit-btn"
              >
                {loading ? '创建中...' : '创建农场'}
              </button>
            </form>
          </div>
          
          {isAuthority && contractReady && (
            <div className="card">
              <h2>注册农场</h2>
              <form onSubmit={registerFarm}>
                <div className="form-group">
                  <label>农场合约地址</label>
                  <input 
                    type="text" 
                    value={farmAddress} 
                    onChange={(e) => setFarmAddress(e.target.value)}
                    placeholder="输入农场合约地址" 
                    required 
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading || !farmAddress}
                  className="submit-btn"
                >
                  {loading ? '注册中...' : '注册农场'}
                </button>
              </form>
            </div>
          )}
          
          <div className="card">
            <h2>我的农场</h2>
            {loading ? (
              <p>加载中...</p>
            ) : farms.length > 0 ? (
              <div className="farms-list">
                {farms.map(farm => (
                  <div key={farm.address} className="farm-item">
                    <div>
                      <h3>{farm.name}</h3>
                      <p className="farm-address">{farm.address}</p>
                    </div>
                    <div className="farm-actions">
                      <div className={`farm-status ${farm.isRegistered ? 'registered' : 'unregistered'}`}>
                        {farm.isRegistered ? '已认证' : '未认证'}
                      </div>
                      <button 
                        onClick={() => viewFarmDetails(farm.address)} 
                        className="view-btn"
                      >
                        查看详情
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>您还没有创建任何农场</p>
            )}
          </div>
        </div>
      )}
      
      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        
        h1 {
          font-size: 24px;
          color: #333;
          margin: 0;
        }
        
        .wallet-btn {
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .connect-btn {
          background-color: #3498db;
          color: white;
        }
        
        .connect-btn:hover {
          background-color: #2980b9;
        }
        
        .disconnect-btn {
          background-color: #e74c3c;
          color: white;
        }
        
        .disconnect-btn:hover {
          background-color: #c0392b;
        }
        
        .account-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .authority-badge {
          background-color: #27ae60;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .message-box {
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .error-message {
          background-color: #f8d7da;
          color: #721c24;
        }
        
        .info-message {
          background-color: #d1ecf1;
          color: #0c5460;
        }
        
        .success-message {
          background-color: #d4edda;
          color: #155724;
        }
        
        .contract-warning {
          background-color: #fff3cd;
          color: #856404;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .main-content {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }
        
        .card {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 20px;
        }
        
        h2 {
          margin-top: 0;
          margin-bottom: 20px;
          font-size: 18px;
          color: #333;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        
        input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .farms-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .farm-item {
          padding: 15px;
          border-radius: 4px;
          background-color: #f8f9fa;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .farm-item h3 {
          margin: 0 0 5px 0;
          font-size: 16px;
        }
        
        .farm-address {
          margin: 0;
          font-size: 12px;
          color: #7f8c8d;
          font-family: monospace;
        }
        
        .farm-status {
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .registered {
          background-color: #27ae60;
          color: white;
        }
        
        .unregistered {
          background-color: #e74c3c;
          color: white;
        }
        
        .farm-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-end;
        }
        
        .view-btn {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 6px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .view-btn:hover {
          background-color: #2980b9;
        }
        
        .submit-btn {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .submit-btn:hover {
          background-color: #2980b9;
        }
        
        button:disabled {
          background-color: #95a5a6;
          cursor: not-allowed;
        }
        
        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .checkbox-group input[type="checkbox"] {
          width: auto;
        }
        
        .checkbox-group label {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
} 