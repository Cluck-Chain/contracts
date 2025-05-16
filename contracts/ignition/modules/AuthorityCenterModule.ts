import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const AuthorityCenterModule = buildModule("AuthorityCenterModule", (m) => {
  // Deploy AuthorityCenter first
  const authorityCenter = m.contract("AuthorityCenter");

  return {
    authorityCenter,
  };
});

export default AuthorityCenterModule;
