import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Farm", function () {
    let authorityCenter: Contract;
    let farm: Contract;
    let owner: SignerWithAddress;
    let authority: SignerWithAddress;
    let other: SignerWithAddress;

    const farmName = "Test Farm";
    const farmLocation = "Test Location";
    const ipfsHash = "QmTestHash";

    beforeEach(async function () {
        [owner, authority, other] = await ethers.getSigners();

        // Deploy AuthorityCenter
        const AuthorityCenter = await ethers.getContractFactory("AuthorityCenter");
        authorityCenter = await AuthorityCenter.deploy();
        await authorityCenter.deployed();

        // Add authority
        await authorityCenter.addAuthority(authority.address);

        // Deploy Farm
        const Farm = await ethers.getContractFactory("Farm");
        farm = await Farm.deploy(
            authorityCenter.address,
            farmName,
            farmLocation,
            ipfsHash
        );
        await farm.deployed();

        // Register farm
        await authorityCenter.connect(authority).registerFarm(
            farm.address,
            farmName,
            farmLocation,
            ipfsHash
        );
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await farm.owner()).to.equal(owner.address);
        });

        it("Should set the right authority center", async function () {
            expect(await farm.authorityCenter()).to.equal(authorityCenter.address);
        });

        it("Should set the right farm info", async function () {
            expect(await farm.name()).to.equal(farmName);
            expect(await farm.location()).to.equal(farmLocation);
            expect(await farm.ipfsHash()).to.equal(ipfsHash);
        });
    });

    describe("Farm Info Management", function () {
        it("Should allow owner to update farm info", async function () {
            const newName = "New Farm Name";
            const newLocation = "New Location";
            const newIpfsHash = "QmNewHash";

            await farm.updateInfo(newName, newLocation, newIpfsHash);

            expect(await farm.name()).to.equal(newName);
            expect(await farm.location()).to.equal(newLocation);
            expect(await farm.ipfsHash()).to.equal(newIpfsHash);
        });

        it("Should not allow non-owner to update farm info", async function () {
            const newName = "New Farm Name";
            const newLocation = "New Location";
            const newIpfsHash = "QmNewHash";

            await expect(
                farm.connect(other).updateInfo(newName, newLocation, newIpfsHash)
            ).to.be.revertedWith("Only owner can call this function");
        });
    });

    describe("Authorization", function () {
        it("Should return correct authorization status", async function () {
            expect(await farm.isAuthorized()).to.be.true;

            // Remove farm from authority center
            await authorityCenter.connect(authority).removeFarm(farm.address);
            expect(await farm.isAuthorized()).to.be.false;
        });
    });
}); 