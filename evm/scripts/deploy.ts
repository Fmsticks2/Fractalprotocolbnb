import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const Factory = await ethers.getContractFactory("MarketFactory");
  const factory = await Factory.deploy();
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("MarketFactory deployed at:", factoryAddress);

  // Optional: create a sample market
  const question = "Will BTC price exceed $80k by Dec 31?";
  const outcomes = ["Yes", "No"];
  const expiry = Math.floor(Date.now() / 1000) + 30 * 24 * 3600;

  const tx = await factory.createMarket(question, outcomes, expiry, ethers.ZeroAddress);
  const receipt = await tx.wait();
  console.log("Sample market created. Tx:", receipt?.hash);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});