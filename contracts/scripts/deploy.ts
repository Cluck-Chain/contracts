import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  // 部署 AuthorityCenter - 无参数
  const AuthorityCenter = await ethers.getContractFactory("AuthorityCenter");
  const authorityCenter = await AuthorityCenter.deploy();
  await authorityCenter.waitForDeployment();
  console.log("AuthorityCenter deployed to:", authorityCenter.target);

  // 部署 Farm - 需要 4 个参数
  const Farm = await ethers.getContractFactory("Farm");
  const farm = await Farm.deploy(
    authorityCenter.target,
    "Blockchain Farm",
    "Digital Valley",
    "QmInitialFarmHash"
  );
  await farm.waitForDeployment();
  console.log("Farm deployed to:", farm.target);

  // 部署 ChickenEggTracker - 只需要 Farm 地址
  const ChickenEggTracker = await ethers.getContractFactory("ChickenEggTracker");
  const chickenEggTracker = await ChickenEggTracker.deploy(farm.target);
  await chickenEggTracker.waitForDeployment();
  console.log("ChickenEggTracker deployed to:", chickenEggTracker.target);

  // 保存地址到 shared/deployed.json
  const deployed = {
    AuthorityCenter: authorityCenter.target,
    Farm: farm.target,
    ChickenEggTracker: chickenEggTracker.target,
  };
  
  // 确保 shared 目录存在
  const sharedDir = path.resolve(__dirname, "../shared");
  if (!fs.existsSync(sharedDir)) {
    fs.mkdirSync(sharedDir, { recursive: true });
  }
  
  const outPath = path.resolve(__dirname, "../shared/deployed.json");
  fs.writeFileSync(outPath, JSON.stringify(deployed, null, 2));
  console.log("Deployed addresses saved to shared/deployed.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 