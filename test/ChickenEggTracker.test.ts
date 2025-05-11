import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("ChickenEggTracker", function () {
    let authorityCenter: Contract;
    let farm: Contract;
    let chickenEggTracker: Contract;
    let owner: SignerWithAddress;
    let authority: SignerWithAddress;
    let other: SignerWithAddress;

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
        await authorityCenter.deployed();

        // Add authority
        await authorityCenter.addAuthority(authority.address);

        // Deploy Farm
        const Farm = await ethers.getContractFactory("Farm");
        farm = await Farm.deploy(
            authorityCenter.address,
            farmName,
            farmLocation,
            farmIpfsHash
        );
        await farm.deployed();

        // Register farm
        await authorityCenter.connect(authority).registerFarm(
            farm.address,
            farmName,
            farmLocation,
            farmIpfsHash
        );

        // Deploy ChickenEggTracker
        const ChickenEggTracker = await ethers.getContractFactory("ChickenEggTracker");
        chickenEggTracker = await ChickenEggTracker.deploy(farm.address);
        await chickenEggTracker.deployed();
    });

    describe("Chicken Management", function () {
        it("Should allow farm to register chicken", async function () {
            await chickenEggTracker.connect(farm).registerChicken(
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
                chickenEggTracker.connect(other).registerChicken(
                    chickenId,
                    chickenBreed,
                    chickenBirthDate,
                    chickenIpfsHash
                )
            ).to.be.revertedWith("Only farm can call this function");
        });

        it("Should allow farm to remove chicken", async function () {
            await chickenEggTracker.connect(farm).registerChicken(
                chickenId,
                chickenBreed,
                chickenBirthDate,
                chickenIpfsHash
            );
            await chickenEggTracker.connect(farm).removeChicken(chickenId);

            const chicken = await chickenEggTracker.getChickenInfo(chickenId);
            expect(chicken.isActive).to.be.false;
        });

        it("Should allow farm to update chicken info", async function () {
            await chickenEggTracker.connect(farm).registerChicken(
                chickenId,
                chickenBreed,
                chickenBirthDate,
                chickenIpfsHash
            );

            const newIpfsHash = "QmNewChickenHash";
            await chickenEggTracker.connect(farm).updateChickenInfo(
                chickenId,
                newIpfsHash
            );

            const chicken = await chickenEggTracker.getChickenInfo(chickenId);
            expect(chicken.ipfsHash).to.equal(newIpfsHash);
        });
    });

    describe("Egg Management", function () {
        beforeEach(async function () {
            // Register a chicken first
            await chickenEggTracker.connect(farm).registerChicken(
                chickenId,
                chickenBreed,
                chickenBirthDate,
                chickenIpfsHash
            );
        });

        it("Should allow farm to register egg", async function () {
            await chickenEggTracker.connect(farm).registerEgg(
                eggId,
                chickenId,
                eggProductionDate,
                eggIpfsHash
            );

            const egg = await chickenEggTracker.getEggInfo(eggId);
            expect(egg.eggId).to.equal(eggId);
            expect(egg.chickenId).to.equal(chickenId);
            expect(egg.productionDate).to.equal(eggProductionDate);
            expect(egg.ipfsHash).to.equal(eggIpfsHash);
            expect(egg.isActive).to.be.true;
        });

        it("Should not allow non-farm to register egg", async function () {
            await expect(
                chickenEggTracker.connect(other).registerEgg(
                    eggId,
                    chickenId,
                    eggProductionDate,
                    eggIpfsHash
                )
            ).to.be.revertedWith("Only farm can call this function");
        });

        it("Should not allow registering egg for non-existent chicken", async function () {
            await expect(
                chickenEggTracker.connect(farm).registerEgg(
                    eggId,
                    "NONEXISTENT",
                    eggProductionDate,
                    eggIpfsHash
                )
            ).to.be.revertedWith("Chicken not registered");
        });

        it("Should allow farm to remove egg", async function () {
            await chickenEggTracker.connect(farm).registerEgg(
                eggId,
                chickenId,
                eggProductionDate,
                eggIpfsHash
            );
            await chickenEggTracker.connect(farm).removeEgg(eggId);

            const egg = await chickenEggTracker.getEggInfo(eggId);
            expect(egg.isActive).to.be.false;
        });

        it("Should allow farm to update egg info", async function () {
            await chickenEggTracker.connect(farm).registerEgg(
                eggId,
                chickenId,
                eggProductionDate,
                eggIpfsHash
            );

            const newIpfsHash = "QmNewEggHash";
            await chickenEggTracker.connect(farm).updateEggInfo(
                eggId,
                newIpfsHash
            );

            const egg = await chickenEggTracker.getEggInfo(eggId);
            expect(egg.ipfsHash).to.equal(newIpfsHash);
        });
    });
}); 