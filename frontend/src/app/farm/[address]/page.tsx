'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ethers } from 'ethers';
import { 
  getSigner, 
  getFarmContract, 
  isFarmRegistered
} from '../../../utils/contract';

// 定义Params类型
type PageParams = {
  address: string;
};

export default function FarmPage({ params }: { params: PageParams | Promise<PageParams> }) {
  const router = useRouter();
  // 使用React.use()解包params
  const unwrappedParams = React.use(params as Promise<PageParams>) as PageParams;
  const farmAddress = unwrappedParams.address;
  
  // 农场信息状态
  const [farmName, setFarmName] = useState('');
  const [farmOwner, setFarmOwner] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  
  // 鸡和蛋的状态
  const [chickens, setChickens] = useState<{id: number, birthTime: bigint, metadataURI: string, isAlive: boolean}[]>([]);
  const [eggs, setEggs] = useState<{id: number, chickenId: bigint, birthTime: bigint, metadataURI: string}[]>([]);
  
  // 表单状态
  const [chickenMetadata, setChickenMetadata] = useState('');
  const [selectedChicken, setSelectedChicken] = useState<number | null>(null);
  const [eggMetadata, setEggMetadata] = useState('');
  
  // 加载状态
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // 加载农场信息
  useEffect(() => {
    async function loadFarmData() {
      try {
        setLoading(true);
        setError(null);
        
        const signer = await getSigner();
        const signerAddress = await signer.getAddress();
        const farm = getFarmContract(farmAddress, signer);
        
        // 加载基本信息
        const name = await farm.name();
        const owner = await farm.owner();
        
        setFarmName(name);
        setFarmOwner(owner);
        setIsOwner(owner.toLowerCase() === signerAddress.toLowerCase());
        
        // 检查注册状态
        try {
          const registered = await isFarmRegistered(farmAddress);
          setIsRegistered(registered);
        } catch (err) {
          console.error("检查注册状态出错:", err);
          // 继续执行，不中断加载流程
        }
        
        // 加载鸡的数据
        const chickenCount = await farm.chickenCount();
        const chickenPromises = [];
        
        for (let i = 1; i <= Number(chickenCount); i++) {
          chickenPromises.push(farm.chickens(i));
        }
        
        const chickenResults = await Promise.all(chickenPromises);
        const chickenData = chickenResults.map((chicken, index) => ({
          id: index + 1,
          birthTime: chicken.birthTime,
          metadataURI: chicken.metadataURI,
          isAlive: chicken.isAlive
        }));
        
        setChickens(chickenData);
        
        // 加载蛋的数据
        const eggCount = await farm.eggCount();
        const eggPromises = [];
        
        for (let i = 1; i <= Number(eggCount); i++) {
          eggPromises.push(farm.eggs(i));
        }
        
        const eggResults = await Promise.all(eggPromises);
        const eggData = eggResults.map((egg, index) => ({
          id: index + 1,
          chickenId: egg.chickenId,
          birthTime: egg.birthTime,
          metadataURI: egg.metadataURI
        }));
        
        setEggs(eggData);
        
      } catch (err) {
        console.error("加载农场数据出错:", err);
        setError("加载农场数据失败，请确认合约地址是否正确: " + (err instanceof Error ? err.message : '未知错误'));
      } finally {
        setLoading(false);
      }
    }
    
    if (farmAddress) {
      loadFarmData();
    }
  }, [farmAddress]);

  // 添加新鸡
  const addChicken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chickenMetadata || !isOwner) return;
    
    setActionLoading(true);
    setError(null);
    
    try {
      const signer = await getSigner();
      const farm = getFarmContract(farmAddress, signer);
      
      const tx = await farm.registerChicken(chickenMetadata);
      await tx.wait();
      
      // 刷新页面以显示新鸡
      window.location.reload();
    } catch (err) {
      console.error("添加鸡出错:", err);
      setError("添加鸡失败: " + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setActionLoading(false);
    }
  };

  // 添加鸡蛋
  const addEgg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eggMetadata || selectedChicken === null || !isOwner) return;
    
    setActionLoading(true);
    setError(null);
    
    try {
      const signer = await getSigner();
      const farm = getFarmContract(farmAddress, signer);
      
      const tx = await farm.registerEgg(selectedChicken, eggMetadata);
      await tx.wait();
      
      // 刷新页面以显示新蛋
      window.location.reload();
    } catch (err) {
      console.error("添加鸡蛋出错:", err);
      setError("添加鸡蛋失败: " + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setActionLoading(false);
    }
  };

  // 移除鸡
  const removeChicken = async (chickenId: number) => {
    if (!isOwner) return;
    
    setActionLoading(true);
    setError(null);
    
    try {
      const signer = await getSigner();
      const farm = getFarmContract(farmAddress, signer);
      
      const tx = await farm.removeChicken(chickenId);
      await tx.wait();
      
      // 刷新页面以更新鸡的状态
      window.location.reload();
    } catch (err) {
      console.error(`移除鸡 #${chickenId} 出错:`, err);
      setError(`移除鸡 #${chickenId} 失败: ` + (err instanceof Error ? err.message : '未知错误'));
    } finally {
      setActionLoading(false);
    }
  };
  
  // 格式化时间戳
  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };

  return (
    <div className="container">
      <header>
        <div className="header-content">
          <Link href="/" className="back-link">
            返回首页
          </Link>
          <h1>{farmName || "农场详情"}</h1>
          <div className="farm-info">
            <p className="farm-address">合约地址: {farmAddress}</p>
            <p className="farm-owner">所有者: {farmOwner?.slice(0,6)}...{farmOwner?.slice(-4)}</p>
            <div className={`farm-status ${isRegistered ? 'registered' : 'unregistered'}`}>
              {isRegistered ? '已认证' : '未认证'}
            </div>
            {isOwner && <div className="owner-badge">农场主</div>}
          </div>
        </div>
      </header>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">加载农场数据中...</div>
      ) : (
        <div className="main-content">
          {/* 鸡管理部分 */}
          <div className="card">
            <h2>鸡的管理</h2>
            
            {isOwner && (
              <form onSubmit={addChicken} className="add-form">
                <h3>添加新鸡</h3>
                <div className="form-group">
                  <label>鸡的元数据URI</label>
                  <input 
                    type="text" 
                    value={chickenMetadata} 
                    onChange={(e) => setChickenMetadata(e.target.value)}
                    placeholder="输入元数据URI" 
                    required 
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={actionLoading || !chickenMetadata}
                  className="submit-btn"
                >
                  {actionLoading ? '添加中...' : '添加鸡'}
                </button>
              </form>
            )}
            
            <div className="list-section">
              <h3>鸡列表</h3>
              {chickens.length > 0 ? (
                <div className="items-list">
                  {chickens.map(chicken => (
                    <div key={chicken.id} className={`item-card ${!chicken.isAlive ? 'inactive' : ''}`}>
                      <div className="item-info">
                        <h4>鸡 #{chicken.id}</h4>
                        <p>出生时间: {formatTime(chicken.birthTime)}</p>
                        <p className="metadata">元数据: {chicken.metadataURI}</p>
                        <p className="status">
                          状态: <span className={chicken.isAlive ? 'alive' : 'removed'}>
                            {chicken.isAlive ? '活跃' : '已移除'}
                          </span>
                        </p>
                      </div>
                      
                      {isOwner && chicken.isAlive && (
                        <button 
                          onClick={() => removeChicken(chicken.id)} 
                          disabled={actionLoading}
                          className="action-btn remove-btn"
                        >
                          移除
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-message">农场中还没有鸡</p>
              )}
            </div>
          </div>
          
          {/* 蛋管理部分 */}
          <div className="card">
            <h2>鸡蛋管理</h2>
            
            {isOwner && chickens.filter(c => c.isAlive).length > 0 && (
              <form onSubmit={addEgg} className="add-form">
                <h3>添加新鸡蛋</h3>
                <div className="form-group">
                  <label>选择鸡</label>
                  <select 
                    value={selectedChicken || ''} 
                    onChange={(e) => setSelectedChicken(Number(e.target.value))}
                    required
                  >
                    <option value="">请选择一只鸡</option>
                    {chickens
                      .filter(chicken => chicken.isAlive)
                      .map(chicken => (
                        <option key={chicken.id} value={chicken.id}>
                          鸡 #{chicken.id}
                        </option>
                      ))
                    }
                  </select>
                </div>
                
                <div className="form-group">
                  <label>鸡蛋元数据URI</label>
                  <input 
                    type="text" 
                    value={eggMetadata} 
                    onChange={(e) => setEggMetadata(e.target.value)}
                    placeholder="输入元数据URI" 
                    required 
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={actionLoading || !eggMetadata || selectedChicken === null}
                  className="submit-btn"
                >
                  {actionLoading ? '添加中...' : '添加鸡蛋'}
                </button>
              </form>
            )}
            
            <div className="list-section">
              <h3>鸡蛋列表</h3>
              {eggs.length > 0 ? (
                <div className="items-list">
                  {eggs.map(egg => (
                    <div key={egg.id} className="item-card">
                      <div className="item-info">
                        <h4>鸡蛋 #{egg.id}</h4>
                        <p>来自鸡 #{egg.chickenId}</p>
                        <p>产蛋时间: {formatTime(egg.birthTime)}</p>
                        <p className="metadata">元数据: {egg.metadataURI}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-message">农场中还没有鸡蛋</p>
              )}
            </div>
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
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        
        .header-content {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .back-link {
          color: #3498db;
          text-decoration: none;
          display: inline-block;
          margin-bottom: 10px;
        }
        
        .back-link:hover {
          text-decoration: underline;
        }
        
        h1 {
          font-size: 24px;
          color: #333;
          margin: 0;
        }
        
        .farm-info {
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }
        
        .farm-address {
          margin: 0;
          font-size: 14px;
          color: #7f8c8d;
          font-family: monospace;
        }
        
        .farm-owner {
          margin: 0;
          font-size: 14px;
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
        
        .owner-badge {
          background-color: #f39c12;
          color: white;
          padding: 5px 10px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        
        .loading {
          text-align: center;
          padding: 40px;
          font-size: 18px;
          color: #7f8c8d;
        }
        
        .main-content {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
          gap: 20px;
        }
        
        .card {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 20px;
          margin-bottom: 20px;
        }
        
        h2 {
          margin-top: 0;
          margin-bottom: 20px;
          font-size: 20px;
          color: #333;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        
        h3 {
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 18px;
          color: #333;
        }
        
        h4 {
          margin: 0 0 10px 0;
          font-size: 16px;
          color: #333;
        }
        
        .add-form {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        
        input, select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
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
        
        .list-section {
          margin-top: 20px;
        }
        
        .items-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .item-card {
          background-color: #f8f9fa;
          border-radius: 6px;
          padding: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .inactive {
          opacity: 0.6;
        }
        
        .item-info {
          flex: 1;
        }
        
        .item-info p {
          margin: 5px 0;
          font-size: 14px;
        }
        
        .metadata {
          font-size: 12px;
          font-family: monospace;
          word-break: break-all;
        }
        
        .status {
          font-weight: 500;
        }
        
        .alive {
          color: #27ae60;
        }
        
        .removed {
          color: #e74c3c;
        }
        
        .action-btn {
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .remove-btn {
          background-color: #e74c3c;
          color: white;
        }
        
        .remove-btn:hover {
          background-color: #c0392b;
        }
        
        .empty-message {
          text-align: center;
          color: #7f8c8d;
          font-style: italic;
          padding: 20px 0;
        }
      `}</style>
    </div>
  );
} 