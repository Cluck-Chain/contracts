// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 导入接口
import "./interfaces.sol";

/**
 * @title 瑞士鸡蛋链认证中心合约
 * @dev 用于管理和认证鸡蛋生产农场
 */
contract AuthCenter is IAuthCenter {
    // 管理员地址
    address public admin;
    
    // 农场信息结构
    struct Farm {
        string name;            // 农场名称
        string location;        // 农场位置
        bool isRegistered;      // 是否已注册
        uint256 registeredDate; // 注册日期
        string certificationId; // 认证ID
    }
    
    // 农场地址到农场信息的映射
    mapping(address => Farm) private registeredFarms;
    
    // 已注册农场地址数组
    address[] public farmAddresses;
    
    // 事件
    event FarmRegistered(address indexed farmAddress, string name, string location);
    event FarmRevoked(address indexed farmAddress);
    event FarmUpdated(address indexed farmAddress);
    
    // 修饰器：仅管理员可调用
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    // 构造函数
    constructor() {
        admin = msg.sender;
    }
    
    /**
     * @dev 转移管理员权限
     * @param _newAdmin 新的管理员地址
     */
    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "New admin cannot be zero address");
        admin = _newAdmin;
    }
    
    /**
     * @dev 注册新农场
     * @param _farmAddress 农场地址
     * @param _name 农场名称
     * @param _location 农场位置
     * @param _certificationId 认证ID
     */
    function registerFarm(
        address _farmAddress,
        string memory _name,
        string memory _location,
        string memory _certificationId
    ) 
        external 
        onlyAdmin 
    {
        require(_farmAddress != address(0), "Farm address cannot be zero");
        require(!registeredFarms[_farmAddress].isRegistered, "Farm already registered");
        require(bytes(_name).length > 0, "Farm name cannot be empty");
        require(bytes(_location).length > 0, "Farm location cannot be empty");
        
        Farm memory newFarm = Farm({
            name: _name,
            location: _location,
            isRegistered: true,
            registeredDate: block.timestamp,
            certificationId: _certificationId
        });
        
        registeredFarms[_farmAddress] = newFarm;
        farmAddresses.push(_farmAddress);
        
        emit FarmRegistered(_farmAddress, _name, _location);
    }
    
    /**
     * @dev 吊销农场注册
     * @param _farmAddress 农场地址
     */
    function revokeFarm(address _farmAddress) external onlyAdmin {
        require(registeredFarms[_farmAddress].isRegistered, "Farm not registered");
        
        registeredFarms[_farmAddress].isRegistered = false;
        
        emit FarmRevoked(_farmAddress);
    }
    
    /**
     * @dev 更新农场信息
     * @param _farmAddress 农场地址
     * @param _name 新的农场名称
     * @param _location 新的农场位置
     * @param _certificationId 新的认证ID
     */
    function updateFarmInfo(
        address _farmAddress,
        string memory _name,
        string memory _location,
        string memory _certificationId
    ) 
        external 
        onlyAdmin 
    {
        require(registeredFarms[_farmAddress].isRegistered, "Farm not registered");
        require(bytes(_name).length > 0, "Farm name cannot be empty");
        require(bytes(_location).length > 0, "Farm location cannot be empty");
        
        registeredFarms[_farmAddress].name = _name;
        registeredFarms[_farmAddress].location = _location;
        registeredFarms[_farmAddress].certificationId = _certificationId;
        
        emit FarmUpdated(_farmAddress);
    }
    
    /**
     * @dev 检查农场是否已注册
     * @param _farmAddress 农场地址
     * @return 如果农场已注册则返回true
     */
    function isRegisteredFarm(address _farmAddress) external view returns (bool) {
        return registeredFarms[_farmAddress].isRegistered;
    }
    
    /**
     * @dev 获取农场详细信息
     * @param _farmAddress 农场地址
     * @return name 农场名称
     * @return location 农场位置
     * @return isRegistered 是否已注册
     */
    function getFarmDetails(address _farmAddress) 
        external 
        view 
        returns (
            string memory name,
            string memory location,
            bool isRegistered
        ) 
    {
        Farm memory farm = registeredFarms[_farmAddress];
        return (farm.name, farm.location, farm.isRegistered);
    }
    
    /**
     * @dev 获取所有注册农场地址
     * @return 所有注册农场地址数组
     */
    function getAllFarms() external view returns (address[] memory) {
        return farmAddresses;
    }
    
    /**
     * @dev 获取注册农场总数
     * @return 注册农场总数
     */
    function getFarmCount() external view returns (uint256) {
        return farmAddresses.length;
    }
} 