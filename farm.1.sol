// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title 农场合约
 * @dev 管理已认证的农场信息和鸡蛋注册
接口定义
ICertificationCenter：用于验证认证中心和农场的认证状态
IEgg：用于在鸡蛋溯源合约中注册鸡蛋信息
 */
 
interface ICertificationCenter {
    function isVerified(address centerAddress) external view returns (bool);
    function isFarmCertified(address farmAddress) external view returns (bool);
}
contract IEgg {
    // ...
}
    // 鸡蛋溯源合约接口
    interface IEgg {
        function registerEgg(
            string memory _id,
            uint256 _productionTime,
            string memory _feedInfo,
            string memory _batchNumber
        ) external returns (bool);
    }

    // 认证中心合约地址
    address certificationCenterAddress;
    // 鸡蛋溯源合约地址
    address eggContractAddress;

    // 农场数据结构体（存储农场的基本信息和认证状态）
    struct FarmInfo {
        string name;
        string location;
        string owner;
        string contactInfo;
        bool isRegistered;
        uint256 registrationTime;
        uint256 certificationCount; // 获得认证的数量
        address[] certifiedBy;      // 认证农场的认证中心地址列表
    }

    // 鸡蛋批次结构体（存储鸡蛋批次的信息）
    struct EggBatch {
        string batchId;
        uint256 productionTime;
        uint256 quantity;
        string feedInfo;
        bool registered;
    }

    // 农场地址映射到农场信息（通过地址快速查找农场信息）
    mapping(address => FarmInfo) public farms;
    // 注册的农场地址列表（记录所有已注册的农场地址）
    address[] public registeredFarms;
    // 农场的鸡蛋批次(每个农场拥有的鸡蛋批次列表)
    mapping(address => EggBatch[]) public farmEggBatches;

    // 事件
    event FarmRegistered(address indexed farmAddress, string name, string location);
    event FarmCertified(address indexed farmAddress, address indexed certificationCenter);
    event EggBatchRegistered(address indexed farmAddress, string batchId, uint256 productionTime, uint256 quantity);

    // 修饰符：仅允许认证中心调用(确保只有验证过的认证中心才能执行某些操作)
    modifier onlyCertificationCenter() {
        ICertificationCenter certCenter = ICertificationCenter(certificationCenterAddress);
        require(certCenter.isVerified(msg.sender), "Caller is not a verified certification center");
        _;
    }

    // 修饰符：仅允许已认证的农场调用
    modifier onlyCertifiedFarm() {
        require(isFarmCertified(msg.sender), "Farm is not certified");
        _;
    }

    /**
     * @dev 构造函数
     * @param _certificationCenterAddress 认证中心合约地址
     * @param _eggContractAddress 鸡蛋溯源合约地址
     */
    constructor(address _certificationCenterAddress, address _eggContractAddress) {
        certificationCenterAddress = _certificationCenterAddress;
        eggContractAddress = _eggContractAddress;
    }

    /**
     * @dev 注册农场
     * @param _name 农场名称
     * @param _location 农场位置
     * @param _owner 农场主姓名
     * @param _contactInfo 联系信息
     这个函数允许农场进行注册：
     检查农场是否已注册
     创建新的FarmInfo结构体
     添加到已注册农场列表
     触发注册事件
    */
    function registerFarm(
        string memory _name,
        string memory _location,
        string memory _owner,
        string memory _contactInfo
    ) external {
        require(!farms[msg.sender].isRegistered, "Farm already registered");
        
        farms[msg.sender] = FarmInfo({
            name: _name,
            location: _location,
            owner: _owner,
            contactInfo: _contactInfo,
            isRegistered: true,
            registrationTime: block.timestamp,
            certificationCount: 0,
            certifiedBy: new address[](0)
        });
        
        registeredFarms.push(msg.sender);
        
        emit FarmRegistered(msg.sender, _name, _location);
    }

    /**
     * @dev 认证中心认证农场
     * @param _farmAddress 待认证的农场地址
     */
    function certifyFarm(address _farmAddress) external onlyCertificationCenter {
        require(farms[_farmAddress].isRegistered, "Farm not registered");
        
        // 检查该认证中心是否已经认证过该农场
        bool alreadyCertified = false;
        for (uint i = 0; i < farms[_farmAddress].certifiedBy.length; i++) {
            if (farms[_farmAddress].certifiedBy[i] == msg.sender) {
                alreadyCertified = true;
                break;
            }
        }
        
        require(!alreadyCertified, "Farm already certified by this center");
        
        farms[_farmAddress].certifiedBy.push(msg.sender);
        farms[_farmAddress].certificationCount++;
        
        emit FarmCertified(_farmAddress, msg.sender);
    }

    /**
     * @dev 检查农场是否已被认证
     * @param _farmAddress 农场地址
     * @return 如果农场已被至少3个认证中心认证则返回true
     */
    function isFarmCertified(address _farmAddress) public view returns (bool) {
        return farms[_farmAddress].certificationCount >= 3;
    }

    /**
     * @dev 已认证农场注册鸡蛋批次
     * @param _batchId 批次ID
     * @param _productionTime 生产时间
     * @param _quantity 数量
     * @param _feedInfo 饲料信息
     */
    function registerEggBatch(
        string memory _batchId,
        uint256 _productionTime,
        uint256 _quantity,
        string memory _feedInfo
    ) external onlyCertifiedFarm {
        // 检查批次ID是否已存在
        for (uint i = 0; i < farmEggBatches[msg.sender].length; i++) {
            require(
                keccak256(bytes(farmEggBatches[msg.sender][i].batchId)) != keccak256(bytes(_batchId)),
                "Batch ID already exists"
            );
        }
        
        // 创建新的鸡蛋批次
        EggBatch memory newBatch = EggBatch({
            batchId: _batchId,
            productionTime: _productionTime,
            quantity: _quantity,
            feedInfo: _feedInfo,
            registered: true
        });
        
        // 添加到农场的批次列表
        farmEggBatches[msg.sender].push(newBatch);
        
        // 在鸡蛋合约中注册鸡蛋信息
        IEgg eggContract = IEgg(eggContractAddress);
        eggContract.registerEgg(_batchId, _productionTime, _feedInfo, _batchId);
        
        emit EggBatchRegistered(msg.sender, _batchId, _productionTime, _quantity);
    }

    /**
     * @dev 获取农场信息
     * @param _farmAddress 农场地址
     * @return 农场名称, 位置, 所有者, 联系信息, 注册时间, 认证数量
     */
    function getFarmInfo(address _farmAddress) external view returns (
        string memory name,
        string memory location,
        string memory owner,
        string memory contactInfo,
        uint256 registrationTime,
        uint256 certificationCount
    ) {
        require(farms[_farmAddress].isRegistered, "Farm not registered");
        
        FarmInfo memory farm = farms[_farmAddress];
        return (
            farm.name,
            farm.location,
            farm.owner,
            farm.contactInfo,
            farm.registrationTime,
            farm.certificationCount
        );
    }

    /**
     * @dev 获取农场的所有鸡蛋批次数量
     * @param _farmAddress 农场地址
     * @return 批次数量
     */
    function getEggBatchCount(address _farmAddress) external view returns (uint256) {
        return farmEggBatches[_farmAddress].length;
    }

    /**
     * @dev 获取特定批次的鸡蛋信息
     * @param _farmAddress 农场地址
     * @param _batchIndex 批次索引
     * @return 批次ID, 生产时间, 数量, 饲料信息
     */
    function getEggBatchInfo(address _farmAddress, uint256 _batchIndex) external view returns (
        string memory batchId,
        uint256 productionTime,
        uint256 quantity,
        string memory feedInfo
    ) {
        require(_batchIndex < farmEggBatches[_farmAddress].length, "Batch index out of bounds");
        
        EggBatch memory batch = farmEggBatches[_farmAddress][_batchIndex];
        return (
            batch.batchId,
            batch.productionTime,
            batch.quantity,
            batch.feedInfo
        );
    }

    /**
     * @dev 获取已注册农场的数量
     * @return 农场数量
     */
    function getRegisteredFarmCount() external view returns (uint256) {
        return registeredFarms.length;
    }

    /**
     * @dev 更新认证中心合约地址
     * @param _newCertificationCenterAddress 新的认证中心合约地址
     */
    function updateCertificationCenterAddress(address _newCertificationCenterAddress) external {
        // 此处可以添加管理员权限检查
        certificationCenterAddress = _newCertificationCenterAddress;
    }

    /**
     * @dev 更新鸡蛋溯源合约地址
     * @param _newEggContractAddress 新的鸡蛋溯源合约地址
     */
    function updateEggContractAddress(address _newEggContractAddress) external {
        // 此处可以添加管理员权限检查
        eggContractAddress = _newEggContractAddress;
    }
}
