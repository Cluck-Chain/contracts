// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Farm {
  address public owner;
  string public name;
  string public metadataURI;
  uint32 public chickenCount;
  uint32 public eggCount;
  mapping(uint32 => Chicken) public chickens;
  mapping(uint32 => Egg) public eggs;

  struct Chicken {
    uint32 birthTime;
    string metadataURI;
    bool isAlive;
  }

  struct Egg {
    uint32 chickenId;
    uint32 birthTime;
    string metadataURI;
  }

  modifier onlyOwner() {
    require(msg.sender == owner, 'Only owner can call this function');
    _;
  }

  event ChickenAdded(uint32 indexed chickenId, uint32 birthTime, string metadataURI);
  event EggAdded(uint32 indexed eggId, uint32 chickenId, uint32 birthTime, string metadataURI);
  event ChickenRemoved(uint32 indexed chickenId);

  constructor(
    address _owner,
    string memory _name,
    string memory _metadataURI
  ) {
    owner = _owner;
    name = _name;
    metadataURI = _metadataURI;
  }

  function updateInfo(
    string memory _name,
    string memory _metadataURI
  ) external onlyOwner {
    name = _name;
    metadataURI = _metadataURI;
  }

  function registerChicken(
    string memory _metadataURI
  ) external onlyOwner {
    chickenCount++;
    chickens[chickenCount] = Chicken({
      birthTime: uint32(block.timestamp),
      metadataURI: _metadataURI,
      isAlive: true
    });
    emit ChickenAdded(chickenCount, uint32(block.timestamp), _metadataURI);
  }

  function registerEgg(
    uint32 chickenId,
    string memory _metadataURI
  ) external onlyOwner {
    require(chickens[chickenId].isAlive, 'Chicken is not alive');
    eggCount++;
    eggs[eggCount] = Egg({
      chickenId: chickenId,
      birthTime: uint32(block.timestamp),
      metadataURI: _metadataURI
    });
    emit EggAdded(eggCount, chickenId, uint32(block.timestamp), _metadataURI);
  }

  function removeChicken(uint32 chickenId) external onlyOwner {
    require(chickens[chickenId].isAlive, 'Chicken is not alive');
    chickens[chickenId].isAlive = false;
    emit ChickenRemoved(chickenId);
  }
  
}