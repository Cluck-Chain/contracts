// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AuthorityCenter {
    address public owner;
    mapping(address => bool) public isAuthority;
    mapping(address => bool) public isFarm;
    mapping(address => FarmInfo) public farmInfo;
    
    struct FarmInfo {
        string name;
        string location;
        string ipfsHash; // 存储农场详细信息的IPFS哈希
        uint256 registrationDate;
        bool isActive;
    }
    
    event AuthorityAdded(address indexed authority);
    event AuthorityRemoved(address indexed authority);
    event FarmRegistered(address indexed farm, string name, string location);
    event FarmRemoved(address indexed farm);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAuthority() {
        require(isAuthority[msg.sender], "Only authority can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        isAuthority[msg.sender] = true;
    }
    
    function addAuthority(address _authority) external onlyOwner {
        require(_authority != address(0), "Invalid authority address");
        require(!isAuthority[_authority], "Already an authority");
        isAuthority[_authority] = true;
        emit AuthorityAdded(_authority);
    }
    
    function removeAuthority(address _authority) external onlyOwner {
        require(isAuthority[_authority], "Not an authority");
        isAuthority[_authority] = false;
        emit AuthorityRemoved(_authority);
    }
    
    function registerFarm(
        address _farm,
        string memory _name,
        string memory _location,
        string memory _ipfsHash
    ) external onlyAuthority {
        require(_farm != address(0), "Invalid farm address");
        require(!isFarm[_farm], "Farm already registered");
        
        farmInfo[_farm] = FarmInfo({
            name: _name,
            location: _location,
            ipfsHash: _ipfsHash,
            registrationDate: block.timestamp,
            isActive: true
        });
        
        isFarm[_farm] = true;
        emit FarmRegistered(_farm, _name, _location);
    }
    
    function removeFarm(address _farm) external onlyAuthority {
        require(isFarm[_farm], "Farm not registered");
        isFarm[_farm] = false;
        farmInfo[_farm].isActive = false;
        emit FarmRemoved(_farm);
    }
    
    function updateFarmInfo(
        address _farm,
        string memory _ipfsHash
    ) external onlyAuthority {
        require(isFarm[_farm], "Farm not registered");
        farmInfo[_farm].ipfsHash = _ipfsHash;
    }
} 