import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { expect } from "chai";

describe("AuthorityCenter", function () {
    let authorityCenter: Contract;
    let owner: Signer;
    let authority: Signer;
    let farm: Signer;
    let other: Signer;

    beforeEach(async function () {
        [owner, authority, farm, other] = await ethers.getSigners();
        const AuthorityCenter = await ethers.getContractFactory("AuthorityCenter");
        authorityCenter = await AuthorityCenter.deploy();
    });

    describe("Authority Management", function () {
        it("should allow owner to add authority", async function () {
            await authorityCenter.connect(owner).addAuthority(await authority.getAddress());
            expect(await authorityCenter.isAuthority(await authority.getAddress())).to.be.true;
        });

        it("should not allow non-owner to add authority", async function () {
            await expect(
                authorityCenter.connect(other).addAuthority(await authority.getAddress())
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });

    describe("Farm Registration", function () {
        beforeEach(async function () {
            await authorityCenter.connect(owner).addAuthority(await authority.getAddress());
        });

        it("should allow authority to register farm", async function () {
            await authorityCenter.connect(authority).registerFarm(await farm.getAddress());
            expect(await authorityCenter.isRegisteredFarm(await farm.getAddress())).to.be.true;
        });

        it("should not allow non-authority to register farm", async function () {
            await expect(
                authorityCenter.connect(other).registerFarm(await farm.getAddress())
            ).to.be.revertedWith("Not authorized");
        });

        it("should not allow registering the same farm twice", async function () {
            await authorityCenter.connect(authority).registerFarm(await farm.getAddress());
            await expect(
                authorityCenter.connect(authority).registerFarm(await farm.getAddress())
            ).to.be.revertedWith("Farm already registered");
        });
    });

    describe("Farm Removal", function () {
        beforeEach(async function () {
            await authorityCenter.connect(owner).addAuthority(await authority.getAddress());
            await authorityCenter.connect(authority).registerFarm(await farm.getAddress());
        });

        it("should allow authority to remove farm", async function () {
            await authorityCenter.connect(authority).removeFarm(await farm.getAddress());
            expect(await authorityCenter.isRegisteredFarm(await farm.getAddress())).to.be.false;
        });

        it("should not allow removing non-registered farm", async function () {
            await expect(
                authorityCenter.connect(authority).removeFarm(await other.getAddress())
            ).to.be.revertedWith("Farm not registered");
        });
    });
}); 