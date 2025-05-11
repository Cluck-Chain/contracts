// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Farm.sol";

contract ChickenEggTracker {
    struct Chicken {
        string chickenId;
        string breed;
        string birthDate;
        string ipfsHash; // 存储鸡的详细信息
        bool isActive;
        uint256 registrationDate;
    }
    
    struct Egg {
        string eggId;
        string chickenId;
        string productionDate;
        string ipfsHash; // 存储鸡蛋的详细信息
        bool isActive;
        uint256 registrationDate;
    }
    
    Farm public farm;
    mapping(string => Chicken) public chickens;
    mapping(string => Egg) public eggs;
    mapping(string => bool) public chickenExists;
    mapping(string => bool) public eggExists;
    
    event ChickenRegistered(string chickenId, string breed, string birthDate);
    event EggRegistered(string eggId, string chickenId, string productionDate);
    event ChickenRemoved(string chickenId);
    event EggRemoved(string eggId);
    
    modifier onlyFarm() {
        require(msg.sender == address(farm), "Only farm can call this function");
        _;
    }
    
    constructor(address _farm) {
        farm = Farm(_farm);
    }
    
    function registerChicken(
        string memory _chickenId,
        string memory _breed,
        string memory _birthDate,
        string memory _ipfsHash
    ) external onlyFarm {
        require(!chickenExists[_chickenId], "Chicken already registered");
        
        chickens[_chickenId] = Chicken({
            chickenId: _chickenId,
            breed: _breed,
            birthDate: _birthDate,
            ipfsHash: _ipfsHash,
            isActive: true,
            registrationDate: block.timestamp
        });
        
        chickenExists[_chickenId] = true;
        emit ChickenRegistered(_chickenId, _breed, _birthDate);
    }
    
    function registerEgg(
        string memory _eggId,
        string memory _chickenId,
        string memory _productionDate,
        string memory _ipfsHash
    ) external onlyFarm {
        require(!eggExists[_eggId], "Egg already registered");
        require(chickenExists[_chickenId], "Chicken not registered");
        
        eggs[_eggId] = Egg({
            eggId: _eggId,
            chickenId: _chickenId,
            productionDate: _productionDate,
            ipfsHash: _ipfsHash,
            isActive: true,
            registrationDate: block.timestamp
        });
        
        eggExists[_eggId] = true;
        emit EggRegistered(_eggId, _chickenId, _productionDate);
    }
    
    function removeChicken(string memory _chickenId) external onlyFarm {
        require(chickenExists[_chickenId], "Chicken not registered");
        chickens[_chickenId].isActive = false;
        emit ChickenRemoved(_chickenId);
    }
    
    function removeEgg(string memory _eggId) external onlyFarm {
        require(eggExists[_eggId], "Egg not registered");
        eggs[_eggId].isActive = false;
        emit EggRemoved(_eggId);
    }
    
    function updateChickenInfo(
        string memory _chickenId,
        string memory _ipfsHash
    ) external onlyFarm {
        require(chickenExists[_chickenId], "Chicken not registered");
        chickens[_chickenId].ipfsHash = _ipfsHash;
    }
    
    function updateEggInfo(
        string memory _eggId,
        string memory _ipfsHash
    ) external onlyFarm {
        require(eggExists[_eggId], "Egg not registered");
        eggs[_eggId].ipfsHash = _ipfsHash;
    }
    
    function getChickenInfo(string memory _chickenId) external view returns (
        string memory chickenId,
        string memory breed,
        string memory birthDate,
        string memory ipfsHash,
        bool isActive,
        uint256 registrationDate
    ) {
        require(chickenExists[_chickenId], "Chicken not registered");
        Chicken memory chicken = chickens[_chickenId];
        return (
            chicken.chickenId,
            chicken.breed,
            chicken.birthDate,
            chicken.ipfsHash,
            chicken.isActive,
            chicken.registrationDate
        );
    }
    
    function getEggInfo(string memory _eggId) external view returns (
        string memory eggId,
        string memory chickenId,
        string memory productionDate,
        string memory ipfsHash,
        bool isActive,
        uint256 registrationDate
    ) {
        require(eggExists[_eggId], "Egg not registered");
        Egg memory egg = eggs[_eggId];
        return (
            egg.eggId,
            egg.chickenId,
            egg.productionDate,
            egg.ipfsHash,
            egg.isActive,
            egg.registrationDate
        );
    }
} 