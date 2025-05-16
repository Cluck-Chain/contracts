import { ethers } from "hardhat";
import { expect } from "chai";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { AuthorityCenter , Farm} from "../typechain";

describe("AuthorityCenter", function () {
  let authorityCenter: AuthorityCenter;
  let owner: HardhatEthersSigner;
  let authority: HardhatEthersSigner;
  let farmer: HardhatEthersSigner;
  let other: HardhatEthersSigner;
  let farm: Farm;

  beforeEach(async function () {
    [owner, authority, farmer, other] = await ethers.getSigners();
    const AuthorityCenter = await ethers.getContractFactory("AuthorityCenter");
    authorityCenter = await AuthorityCenter.connect(owner).deploy();
    await authorityCenter.waitForDeployment();
    
    // Deploy a Farm contract for testing
    const Farm = await ethers.getContractFactory("Farm");
    farm = await Farm.connect(owner).deploy(farmer.address, "Test Farm", "ipfs://QmTestHash");
    await farm.waitForDeployment();
  });

  describe("Authority Management", function () {
    it("should set owner as authority by default", async function () {
      expect(await authorityCenter.isAuthority(await owner.getAddress())).to.be.true;
    });
    
    it("should allow authority to add another authority", async function () {
      await authorityCenter
        .connect(owner)
        .addAuthority(await authority.getAddress());
      expect(await authorityCenter.isAuthority(await authority.getAddress())).to
        .be.true;
    });

    it("should not allow non-authority to add authority", async function () {
      await expect(
        authorityCenter
          .connect(other)
          .addAuthority(await authority.getAddress())
      ).to.be.revertedWith("Only authority or owner can call this function");
    });
    
    it("should allow authority to remove authority", async function () {
      await authorityCenter.addAuthority(await authority.getAddress());
      await authorityCenter.removeAuthority(await authority.getAddress());
      expect(await authorityCenter.isAuthority(await authority.getAddress())).to.be.false;
    });
    
    it("should not allow removing non-existent authority", async function () {
      await expect(
        authorityCenter.removeAuthority(await other.getAddress())
      ).to.be.revertedWith("Not an authority");
    });
  });

  describe("Farm Registration", function () {
    beforeEach(async function () {
      await authorityCenter
        .connect(owner)
        .addAuthority(await authority.getAddress());
    });

    it("should allow authority to register farm", async function () {
      await authorityCenter
        .connect(authority)
        .registerFarm(await farm.getAddress());
      expect(await authorityCenter.isCertifiedFarm(await farm.getAddress())).to.be.true;
    });

    it("should not allow non-authority to register farm", async function () {
      await expect(
        authorityCenter
          .connect(other)
          .registerFarm(await farm.getAddress())
      ).to.be.revertedWith("Only authority or owner can call this function");
    });

    it("should not allow registering the same farm twice", async function () {
      await authorityCenter
        .connect(authority)
        .registerFarm(await farm.getAddress());
      await expect(
        authorityCenter
          .connect(authority)
          .registerFarm(await farm.getAddress())
      ).to.be.revertedWith("Farm already registered");
    });
    
    it("should check that farm has no chickens when registering", async function () {
      // Register a chicken first
      await farm.connect(farmer).registerChicken("ipfs://QmChickenHash");
      
      await expect(
        authorityCenter
          .connect(authority)
          .registerFarm(await farm.getAddress())
      ).to.be.revertedWith("Farm already has chickens");
    });
  });

  describe("Farm Removal", function () {
    beforeEach(async function () {
      await authorityCenter
        .connect(owner)
        .addAuthority(await authority.getAddress());
      await authorityCenter
        .connect(authority)
        .registerFarm(await farm.getAddress());
    });

    it("should allow authority to remove farm", async function () {
      await authorityCenter
        .connect(authority)
        .removeFarm(await farm.getAddress());
      expect(await authorityCenter.isCertifiedFarm(await farm.getAddress())).to.be.false;
    });

    it("should not allow removing non-registered farm", async function () {
      const Farm = await ethers.getContractFactory("Farm");
      const anotherFarm = await Farm.deploy(farmer.address, "Another Farm", "ipfs://QmAnotherHash");
      await anotherFarm.waitForDeployment();
      
      await expect(
        authorityCenter.connect(authority).removeFarm(await anotherFarm.getAddress())
      ).to.be.revertedWith("Farm not registered");
    });
  });
});
