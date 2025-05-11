import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract } from "ethers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("AuthorityCenter", function () {
  let authorityCenter: Contract;
  let owner: HardhatEthersSigner;
  let authority: HardhatEthersSigner;
  let farm: HardhatEthersSigner;
  let other: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, authority, farm, other] = await ethers.getSigners();
    const AuthorityCenter = await ethers.getContractFactory("AuthorityCenter");
    authorityCenter = await AuthorityCenter.deploy();
  });

  describe("Authority Management", function () {
    it("should allow owner to add authority", async function () {
      await authorityCenter
        .connect(owner)
        .addAuthority(await authority.getAddress());
      expect(await authorityCenter.isAuthority(await authority.getAddress())).to
        .be.true;
    });

    it("should not allow non-owner to add authority", async function () {
      await expect(
        authorityCenter
          .connect(other)
          .addAuthority(await authority.getAddress())
      ).to.be.revertedWith("Only owner can call this function");
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
        .registerFarm(
          await farm.getAddress(),
          "Test Farm",
          "Test Location",
          "QmTestHash"
        );
      expect(await authorityCenter.isFarm(await farm.getAddress())).to.be.true;
    });

    it("should not allow non-authority to register farm", async function () {
      await expect(
        authorityCenter
          .connect(other)
          .registerFarm(
            await farm.getAddress(),
            "Test Farm",
            "Test Location",
            "QmTestHash"
          )
      ).to.be.revertedWith("Only authority can call this function");
    });

    it("should not allow registering the same farm twice", async function () {
      await authorityCenter
        .connect(authority)
        .registerFarm(
          await farm.getAddress(),
          "Test Farm",
          "Test Location",
          "QmTestHash"
        );
      await expect(
        authorityCenter
          .connect(authority)
          .registerFarm(
            await farm.getAddress(),
            "Test Farm",
            "Test Location",
            "QmTestHash"
          )
      ).to.be.revertedWith("Farm already registered");
    });
  });

  describe("Farm Removal", function () {
    beforeEach(async function () {
      await authorityCenter
        .connect(owner)
        .addAuthority(await authority.getAddress());
      await authorityCenter
        .connect(authority)
        .registerFarm(
          await farm.getAddress(),
          "Test Farm",
          "Test Location",
          "QmTestHash"
        );
    });

    it("should allow authority to remove farm", async function () {
      await authorityCenter
        .connect(authority)
        .removeFarm(await farm.getAddress());
      expect(await authorityCenter.isFarm(await farm.getAddress())).to.be.false;
    });

    it("should not allow removing non-registered farm", async function () {
      await expect(
        authorityCenter.connect(authority).removeFarm(await other.getAddress())
      ).to.be.revertedWith("Farm not registered");
    });
  });
});
