import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ChickenEggTrackerModule = buildModule("ChickenEggTrackerModule", (m) => {
  // Deploy AuthorityCenter first
  const authorityCenter = m.contract("AuthorityCenter");

  // Deploy Farm with AuthorityCenter address
  const farm = m.contract("Farm", [
    authorityCenter,
    "Test Farm",
    "Test Location",
    "QmFarmHash",
  ]);

  // Deploy ChickenEggTracker with Farm address
  const chickenEggTracker = m.contract("ChickenEggTracker", [farm]);

  return {
    authorityCenter,
    farm,
    chickenEggTracker,
  };
});

export default ChickenEggTrackerModule;
