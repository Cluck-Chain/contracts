// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title 认证中心接口
 * @dev 定义认证中心合约的接口
 */
interface IAuthCenter {
    function isRegisteredFarm(address farmAddress) external view returns (bool);
    function getFarmDetails(address farmAddress) external view returns (string memory name, string memory location, bool isRegistered);
}

/**
 * @title 农场接口
 * @dev 定义农场合约的接口
 */
interface IFarm {
    function getFarmInfo() external view returns (string memory name, string memory location, uint256 certificateId);
}

/**
 * @title 鸡蛋追踪接口
 * @dev 定义鸡蛋追踪合约的接口
 */
interface IEggTracker {
    struct Egg {
        uint256 id;              // 鸡蛋ID
        address farmAddress;     // 生产农场地址
        uint256 productionDate;  // 生产日期（Unix时间戳）
        uint256 expiryDate;      // 有效期（Unix时间戳）
        string batchNumber;      // 批次号
        string category;         // 鸡蛋类别（例如：有机、散养等）
        bool isRegistered;       // 是否已登记
        string additionalInfo;   // 额外信息（如饲养方式、鸡种等）
    }
       
    function registerEgg(
        uint256 _productionDate,
        uint256 _expiryDate,
        string memory _batchNumber,
        string memory _category,
        string memory _additionalInfo
    ) external returns (uint256 eggId);
    
    function getEggDetails(uint256 _eggId) external view returns (
        Egg memory egg,
        string memory farmName,
        string memory farmLocation
    );
    
    function isEggExpired(uint256 _eggId) external view returns (bool);
    function isAuthenticEgg(uint256 _eggId) external view returns (bool);
} 