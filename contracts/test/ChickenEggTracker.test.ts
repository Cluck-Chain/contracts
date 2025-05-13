import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("ChickenEggTracker", function () {
  let authorityCenter: Contract;
  let farm: Contract;
  let chickenEggTracker: Contract;
  let owner: HardhatEthersSigner;
  let authority: HardhatEthersSigner;
  let other: HardhatEthersSigner;

  const farmName = "Test Farm";
  const farmLocation = "Test Location";
  const farmIpfsHash = "QmFarmHash";
  const chickenId = "CH001";
  const chickenBreed = "Rhode Island Red";
  const chickenBirthDate = "2023-01-01";
  const chickenIpfsHash = "QmChickenHash";
  const eggId = "EGG001";
  const eggProductionDate = "2023-06-01";
  const eggIpfsHash = "QmEggHash";

  beforeEach(async function () {
    [owner, authority, other] = await ethers.getSigners();

    // Deploy AuthorityCenter
    const AuthorityCenter = await ethers.getContractFactory("AuthorityCenter");
    authorityCenter = await AuthorityCenter.deploy();
    await authorityCenter.waitForDeployment();

    // Add authority
    await authorityCenter.addAuthority(await authority.getAddress());

    // Deploy Farm
    const Farm = await ethers.getContractFactory("Farm");
    farm = await Farm.deploy(
      await authorityCenter.getAddress(),
      farmName,
      farmLocation,
      farmIpfsHash
    );
    await farm.waitForDeployment();

    // Register farm
    await authorityCenter
      .connect(authority)
      .registerFarm(
        await farm.getAddress(),
        farmName,
        farmLocation,
        farmIpfsHash
      );

    // Deploy ChickenEggTracker
    const ChickenEggTracker = await ethers.getContractFactory(
      "ChickenEggTracker"
    );
    chickenEggTracker = await ChickenEggTracker.deploy(await farm.getAddress());
    await chickenEggTracker.waitForDeployment();
  });

  describe("Chicken Management", function () {
    it("Should allow farm to register chicken", async function () {
      await chickenEggTracker
        .connect(owner)
        .registerChicken(
          chickenId,
          chickenBreed,
          chickenBirthDate,
          chickenIpfsHash
        );

      const chicken = await chickenEggTracker.getChickenInfo(chickenId);
      expect(chicken.chickenId).to.equal(chickenId);
      expect(chicken.breed).to.equal(chickenBreed);
      expect(chicken.birthDate).to.equal(chickenBirthDate);
      expect(chicken.ipfsHash).to.equal(chickenIpfsHash);
      expect(chicken.isActive).to.be.true;
    });

    it("Should not allow non-farm to register chicken", async function () {
      await expect(
        chickenEggTracker
          .connect(other)
          .registerChicken(
            chickenId,
            chickenBreed,
            chickenBirthDate,
            chickenIpfsHash
          )
      ).to.be.revertedWith("Only farm owner can call this function");
    });

    it("Should allow farm to remove chicken", async function () {
      await chickenEggTracker
        .connect(owner)
        .registerChicken(
          chickenId,
          chickenBreed,
          chickenBirthDate,
          chickenIpfsHash
        );
      await chickenEggTracker.connect(owner).removeChicken(chickenId);

      const chicken = await chickenEggTracker.getChickenInfo(chickenId);
      expect(chicken.isActive).to.be.false;
    });

    it("Should allow farm to update chicken info", async function () {
      await chickenEggTracker
        .connect(owner)
        .registerChicken(
          chickenId,
          chickenBreed,
          chickenBirthDate,
          chickenIpfsHash
        );

      const newIpfsHash = "QmNewChickenHash";
      await chickenEggTracker
        .connect(owner)
        .updateChickenInfo(chickenId, newIpfsHash);

      const chicken = await chickenEggTracker.getChickenInfo(chickenId);
      expect(chicken.ipfsHash).to.equal(newIpfsHash);
    });
  });

  describe("Egg Management", function () {
    beforeEach(async function () {
      // Register a chicken first
      await chickenEggTracker
        .connect(owner)
        .registerChicken(
          chickenId,
          chickenBreed,
          chickenBirthDate,
          chickenIpfsHash
        );
    });

    it("Should allow farm to register egg", async function () {
      await chickenEggTracker
        .connect(owner)
        .registerEgg(eggId, chickenId, eggProductionDate, eggIpfsHash);

      const egg = await chickenEggTracker.getEggInfo(eggId);
      expect(egg.eggId).to.equal(eggId);
      expect(egg.chickenId).to.equal(chickenId);
      expect(egg.productionDate).to.equal(eggProductionDate);
      expect(egg.ipfsHash).to.equal(eggIpfsHash);
      expect(egg.isActive).to.be.true;
    });

    it("Should not allow non-farm to register egg", async function () {
      await expect(
        chickenEggTracker
          .connect(other)
          .registerEgg(eggId, chickenId, eggProductionDate, eggIpfsHash)
      ).to.be.revertedWith("Only farm owner can call this function");
    });

    it("Should not allow registering egg for non-existent chicken", async function () {
      await expect(
        chickenEggTracker
          .connect(owner)
          .registerEgg(eggId, "NONEXISTENT", eggProductionDate, eggIpfsHash)
      ).to.be.revertedWith("Chicken not registered");
    });

    it("Should allow farm to remove egg", async function () {
      await chickenEggTracker
        .connect(owner)
        .registerEgg(eggId, chickenId, eggProductionDate, eggIpfsHash);
      await chickenEggTracker.connect(owner).removeEgg(eggId);

      const egg = await chickenEggTracker.getEggInfo(eggId);
      expect(egg.isActive).to.be.false;
    });

    it("Should allow farm to update egg info", async function () {
      await chickenEggTracker
        .connect(owner)
        .registerEgg(eggId, chickenId, eggProductionDate, eggIpfsHash);

      const newIpfsHash = "QmNewEggHash";
      await chickenEggTracker.connect(owner).updateEggInfo(eggId, newIpfsHash);

      const egg = await chickenEggTracker.getEggInfo(eggId);
      expect(egg.ipfsHash).to.equal(newIpfsHash);
    });
  });
});
