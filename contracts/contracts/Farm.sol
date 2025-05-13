// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./AuthorityCenter.sol";

contract Farm {
    AuthorityCenter public authorityCenter;
    address public owner;
    string public name;
    string public location;
    string public ipfsHash;
    
    event FarmInfoUpdated(string name, string location, string ipfsHash);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAuthorized() {
        require(authorityCenter.isFarm(address(this)), "Farm not authorized");
        _;
    }
    
    constructor(
        address _authorityCenter,
        string memory _name,
        string memory _location,
        string memory _ipfsHash
    ) {
        authorityCenter = AuthorityCenter(_authorityCenter);
        owner = msg.sender;
        name = _name;
        location = _location;
        ipfsHash = _ipfsHash;
    }
    
    function updateInfo(
        string memory _name,
        string memory _location,
        string memory _ipfsHash
    ) external onlyOwner {
        name = _name;
        location = _location;
        ipfsHash = _ipfsHash;
        emit FarmInfoUpdated(_name, _location, _ipfsHash);
    }
    
    function isAuthorized() external view returns (bool) {
        return authorityCenter.isFarm(address(this));
    }
} 