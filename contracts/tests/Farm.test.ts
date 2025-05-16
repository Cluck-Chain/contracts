import { expect } from "chai";
import { ethers } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { Farm } from "../typechain";

describe("Farm", function () {
  let farm: Farm;
  let owner: HardhatEthersSigner;
  let other: HardhatEthersSigner;

  const farmName = "Test Farm";
  const metadataURI = "ipfs://QmTestHash";

  beforeEach(async function () {
    [owner, other] = await ethers.getSigners();

    // Deploy Farm
    const Farm = await ethers.getContractFactory("Farm");
    farm = await Farm.deploy(
      owner.address,
      farmName,
      metadataURI
    );
    await farm.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await farm.owner()).to.equal(await owner.getAddress());
    });

    it("Should set the right farm info", async function () {
      expect(await farm.name()).to.equal(farmName);
      expect(await farm.metadataURI()).to.equal(metadataURI);
    });
  });

  describe("Farm Info Management", function () {
    it("Should allow owner to update farm info", async function () {
      const newName = "New Farm Name";
      const newMetadataURI = "ipfs://QmNewHash";

      await farm.updateInfo(newName, newMetadataURI);

      expect(await farm.name()).to.equal(newName);
      expect(await farm.metadataURI()).to.equal(newMetadataURI);
    });

    it("Should not allow non-owner to update farm info", async function () {
      const newName = "New Farm Name";
      const newMetadataURI = "ipfs://QmNewHash";

      await expect(
        farm.connect(other).updateInfo(newName, newMetadataURI)
      ).to.be.revertedWith("Only owner can call this function");
    });
  });

  describe("Chicken Management", function () {
    const chickenMetadataURI = "ipfs://QmChickenHash";
    
    it("Should allow owner to register chicken", async function () {
      await farm.registerChicken(chickenMetadataURI);
      expect(await farm.chickenCount()).to.equal(1);
      
      const chicken = await farm.chickens(1);
      expect(chicken.isAlive).to.be.true;
      expect(chicken.metadataURI).to.equal(chickenMetadataURI);
    });

    it("Should not allow non-owner to register chicken", async function () {
      await expect(
        farm.connect(other).registerChicken(chickenMetadataURI)
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("Should allow owner to remove chicken", async function () {
      await farm.registerChicken(chickenMetadataURI);
      await farm.removeChicken(1);
      
      const chicken = await farm.chickens(1);
      expect(chicken.isAlive).to.be.false;
    });
  });

  describe("Egg Management", function () {
    const chickenMetadataURI = "ipfs://QmChickenHash";
    const eggMetadataURI = "ipfs://QmEggHash";
    
    beforeEach(async function () {
      await farm.registerChicken(chickenMetadataURI);
    });
    
    it("Should allow owner to register egg", async function () {
      await farm.registerEgg(1, eggMetadataURI);
      expect(await farm.eggCount()).to.equal(1);
      
      const egg = await farm.eggs(1);
      expect(egg.chickenId).to.equal(1);
      expect(egg.metadataURI).to.equal(eggMetadataURI);
    });

    it("Should not allow non-owner to register egg", async function () {
      await expect(
        farm.connect(other).registerEgg(1, eggMetadataURI)
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("Should not allow registering egg for dead chicken", async function () {
      await farm.removeChicken(1);
      await expect(
        farm.registerEgg(1, eggMetadataURI)
      ).to.be.revertedWith("Chicken is not alive");
    });
  });
});
