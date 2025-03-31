// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// 导入接口
import "./interfaces.sol";

/**
 * @title 瑞士鸡蛋链农场合约
 * @dev 用于管理鸡蛋生产农场信息和操作
 */
contract Farm is IFarm {
    // 认证中心合约地址
    address public authCenterAddress;

    // 农场主地址
    address public owner;

    // 农场详细信息
    struct FarmInfo {
        string name; // 农场名称
        string location; // 农场位置
        uint256 certificateId; // 认证证书ID
        uint256 registrationDate; // 注册日期
        string description; // 农场描述
        string contactInfo; // 联系方式
        uint256 chickenCount; // 鸡的数量
        string feedType; // 饲料类型
        bool organicCertified; // 是否有机认证
    }

    // 农场信息
    FarmInfo public farmInfo;

    // 事件
    event FarmInfoUpdated();
    event ChickenCountUpdated(uint256 newCount);

    // 修饰器：仅农场主可调用
    modifier onlyOwner() {
        require(msg.sender == owner, "Only farm owner can call this function");
        _;
    }

    // 修饰器：仅认证中心可调用
    modifier onlyAuthCenter() {
        require(
            msg.sender == authCenterAddress,
            "Only auth center can call this function"
        );
        _;
    }

    // 修饰器：检查农场是否已通过认证
    modifier isRegistered() {
        require(
            IAuthCenter(authCenterAddress).isRegisteredFarm(address(this)),
            "Farm not registered with auth center"
        );
        _;
    }

    // 构造函数
    constructor(
        address _authCenterAddress,
        string memory _name,
        string memory _location,
        string memory _description,
        string memory _contactInfo,
        uint256 _chickenCount,
        string memory _feedType,
        bool _organicCertified
    ) {
        require(
            _authCenterAddress != address(0),
            "Auth center address cannot be zero"
        );

        authCenterAddress = _authCenterAddress;
        owner = msg.sender;

        farmInfo = FarmInfo({
            name: _name,
            location: _location,
            certificateId: 0, // 初始为0，等待认证中心分配
            registrationDate: block.timestamp,
            description: _description,
            contactInfo: _contactInfo,
            chickenCount: _chickenCount,
            feedType: _feedType,
            organicCertified: _organicCertified
        });
    }

    /**
     * @dev 转移农场所有权
     * @param _newOwner 新的农场主地址
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "New owner cannot be zero address");
        owner = _newOwner;
    }

    /**
     * @dev 更新农场信息
     * @param _description 新的农场描述
     * @param _contactInfo 新的联系方式
     * @param _chickenCount 新的鸡的数量
     * @param _feedType 新的饲料类型
     * @param _organicCertified 是否有机认证
     */
    function updateFarmInfo(
        string memory _description,
        string memory _contactInfo,
        uint256 _chickenCount,
        string memory _feedType,
        bool _organicCertified
    ) external onlyOwner {
        farmInfo.description = _description;
        farmInfo.contactInfo = _contactInfo;
        farmInfo.chickenCount = _chickenCount;
        farmInfo.feedType = _feedType;
        farmInfo.organicCertified = _organicCertified;

        emit FarmInfoUpdated();
    }

    /**
     * @dev 更新鸡的数量
     * @param _newCount 新的鸡的数量
     */
    function updateChickenCount(uint256 _newCount) external onlyOwner {
        farmInfo.chickenCount = _newCount;

        emit ChickenCountUpdated(_newCount);
    }

    /**
     * @dev 设置证书ID（只能由认证中心调用）
     * @param _certificateId 认证证书ID
     */
    function setCertificateId(uint256 _certificateId) external onlyAuthCenter {
        farmInfo.certificateId = _certificateId;
    }

    /**
     * @dev 获取农场信息
     * @return name 农场名称
     * @return location 农场位置
     * @return certificateId 认证证书ID
     */
    function getFarmInfo()
        external
        view
        returns (
            string memory name,
            string memory location,
            uint256 certificateId
        )
    {
        return (farmInfo.name, farmInfo.location, farmInfo.certificateId);
    }

    /**
     * @dev 获取农场完整信息
     * @return 完整的农场信息结构
     */
    function getFullFarmInfo() external view returns (FarmInfo memory) {
        return farmInfo;
    }

    /**
     * @dev 检查农场是否为有机认证
     */
    function isOrganicCertified() external view returns (bool) {
        return farmInfo.organicCertified;
    }

    /**
     * @dev 获取认证状态
     */
    function getRegistrationStatus() external view returns (bool) {
        return IAuthCenter(authCenterAddress).isRegisteredFarm(address(this));
    }
}
