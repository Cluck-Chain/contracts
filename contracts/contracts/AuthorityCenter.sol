// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './Farm.sol';

contract AuthorityCenter {
  address public owner;
  // authority is the address of the contract that can register farms
  mapping(address => bool) public isAuthority;
  // isCertifiedFarm is the address of the farm contract that is certified by the authority
  mapping(address => bool) public isCertifiedFarm;

  event AuthorityAdded(address indexed authority);
  event AuthorityRemoved(address indexed authority);
  event FarmRegistered(address indexed farm);
  event FarmRemoved(address indexed farm);

  modifier onlyAuthority() {
    require(
      msg.sender == owner || isAuthority[msg.sender],
      'Only authority or owner can call this function'
    );
    _;
  }

  constructor() {
    owner = msg.sender;
    isAuthority[msg.sender] = true;
  }

  function addAuthority(address _authority) external onlyAuthority {
    require(_authority != address(0), 'Invalid authority address');
    require(!isAuthority[_authority], 'Already an authority');
    isAuthority[_authority] = true;
    emit AuthorityAdded(_authority);
  }

  function removeAuthority(address _authority) external onlyAuthority {
    require(isAuthority[_authority], 'Not an authority');
    isAuthority[_authority] = false;
    emit AuthorityRemoved(_authority);
  }

  function registerFarm(address _farm) external onlyAuthority {
    require(!isCertifiedFarm[_farm], 'Farm already registered');
    require(Farm(_farm).chickenCount() == 0, 'Farm already has chickens');

    isCertifiedFarm[_farm] = true;
    emit FarmRegistered(_farm);
  }

  function removeFarm(address _farm) external onlyAuthority {
    require(isCertifiedFarm[_farm], 'Farm not registered');
    isCertifiedFarm[_farm] = false;
    emit FarmRemoved(_farm);
  }
}
