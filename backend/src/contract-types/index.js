// Import and re-export typechain types from the shared volume
const ChickenEggTrackerArtifact = require('../contract-artifacts/contracts/ChickenEggTracker.sol/ChickenEggTracker.json');
const FarmArtifact = require('../contract-artifacts/contracts/Farm.sol/Farm.json');
const AuthorityCenterArtifact = require('../contract-artifacts/contracts/AuthorityCenter.sol/AuthorityCenter.json');

// Export ABIs for contracts
module.exports = {
  ChickenEggTrackerABI: ChickenEggTrackerArtifact,
  FarmABI: FarmArtifact,
  AuthorityCenterABI: AuthorityCenterArtifact
}; 